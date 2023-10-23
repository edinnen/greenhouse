package main

import (
	"context"
	"database/sql"
	"flag"
	"fmt"
	"net"
	"net/http"
	"os"
	"os/exec"
	"os/signal"
	"strconv"
	"strings"
	"sync"
	"syscall"
	"time"

	"github.com/dehaass/greenHouse/cmd/exploitBlock"
	"github.com/dehaass/greenHouse/cmd/greenhouse"
	"github.com/dehaass/greenHouse/cmd/irrigation"
	"github.com/dehaass/greenHouse/cmd/pb"
	"github.com/dgrijalva/jwt-go"
	"github.com/grandcat/zeroconf"
	_ "github.com/mattn/go-sqlite3"
	"github.com/sirupsen/logrus"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
)

var rpcPort = flag.Int("rpcPort", 50051, "The port to listen on for RPCs")
var appPort = flag.Int("appPort", 443, "The port to listen on for frontend connections")

var jwtKey = []byte(os.Getenv("JWT_SECRET"))
var validPassword = os.Getenv("GREENHOUSE_PASSWORD")

var (
	errMissingMetadata = status.Errorf(codes.InvalidArgument, "missing metadata")
	errInvalidToken    = status.Errorf(codes.Unauthenticated, "invalid token")
	errInvalidPassword = status.Errorf(codes.Unauthenticated, "invalid password")
)

// Create a struct to read the username and password from the request body
type Credentials struct {
	Password string `json:"password"`
}

// Create a struct that will be encoded to a JWT.
// We add jwt.StandardClaims as an embedded type, to provide fields like expiry time
type Claims struct {
	jwt.StandardClaims
}

type CommandControlServer struct {
	Context       context.Context
	ContextCancel context.CancelFunc
	WaitGroup     *sync.WaitGroup
	Shutdown      chan os.Signal
	pb.UnimplementedCommandControlServer
}

var server CommandControlServer

func main() {
	flag.Parse()

	server.Shutdown = make(chan os.Signal, 1)
	signal.Notify(server.Shutdown, syscall.SIGINT, syscall.SIGTERM)

	InitializeDB()

	envoy := startEnvoy()

	server.Context, server.ContextCancel = context.WithCancel(context.Background())
	server.WaitGroup = &sync.WaitGroup{}
	server.WaitGroup.Add(1)
	go searchForDevices(server.WaitGroup)

	devices, err := GetDevices()
	if err != nil {
		logrus.Fatalf("Failed to get devices: %v", err)
	}

	go rpcServer(devices, server.Context)

	server.WaitGroup.Add(1)
	go startFrontend(server.WaitGroup)

	<-server.Shutdown
	logrus.Info("Gracefully shutting down...")
	server.ContextCancel()
	// Shutdown envoy proxy
	envoy.Process.Signal(syscall.SIGINT)
}

func startEnvoy() *exec.Cmd {
	logrus.Info("Starting Envoy")
	cmd := exec.Command("envoy", "-c", "/etc/envoy/envoy.yaml")
	err := cmd.Start()
	if err != nil {
		logrus.Fatalf("Failed to start Envoy: %v", err)
	}
	return cmd
}

func searchForDevices(wg *sync.WaitGroup) {
	defer wg.Done()
	logrus.Info("Searching for orphaned devices on the network!")
	for {
		// Discover mDNS devices on the network
		resolver, err := zeroconf.NewResolver(nil)
		if err != nil {
			logrus.Fatalln("Failed to initialize resolver:", err.Error())
		}

		entries := make(chan *zeroconf.ServiceEntry)
		go func(results <-chan *zeroconf.ServiceEntry) {
			for entry := range results {
				if strings.Contains(entry.ServiceInstanceName(), "IoP") {
					var deviceType int
					var mac string
					for _, t := range entry.Text {
						if strings.Contains(t, "type") {
							deviceType, err = strconv.Atoi(strings.Split(t, "=")[1])
							if err != nil {
								logrus.Errorf("Failed to convert device type: %v", err)
							}
						}

						if strings.Contains(t, "mac") {
							mac = strings.Split(t, "=")[1]
						}
					}

					newDevice := &pb.Device{
						Name: entry.ServiceInstanceName(),
						Type: pb.Device_Type(deviceType),
						Ip:   entry.AddrIPv4[0].String(),
						Mac:  mac,
					}

					// Check if device already exists and create it if not
					device, err := GetDevice(newDevice.Name)
					if err != nil {
						if err == sql.ErrNoRows {
							created, err := CreateDevice(newDevice)
							if err != nil {
								logrus.Errorf("Failed to create device: %v", err)
								continue
							}

							if created {
								logrus.WithFields(logrus.Fields{"Name": newDevice.Name, "Type": newDevice.Type.String(), "Ip": newDevice.Ip, "Mac": newDevice.Mac}).Infof("Found new device")
							}
							return
						}
						logrus.Errorf("Failed to get device: %v", err)
					}

					// Update the device if any of the definiitonal fields have changed
					if (device.Type != newDevice.Type) || (device.Ip != newDevice.Ip) || (device.Mac != newDevice.Mac) {
						newDevice.Adopted = device.Adopted
						newDevice.Zone = device.Zone
						newDevice.Id = device.Id

						// Update the device
						_, err := UpdateDevice(newDevice)
						if err != nil {
							logrus.Errorf("Failed to update device: %v", err)
							continue
						}

						logrus.WithFields(logrus.Fields{"Name": newDevice.Name, "Type": newDevice.Type.String(), "Ip": newDevice.Ip, "Mac": newDevice.Mac}).Infof("Updated device")
					}
				}
			}
		}(entries)

		ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
		err = resolver.Browse(ctx, "_http._tcp", "local.", entries)
		if err != nil {
			logrus.Fatalln("Failed to browse:", err.Error())
		}

		<-ctx.Done()
		cancel()
	}
}

func (s *CommandControlServer) Login(ctx context.Context, in *pb.LoginRequest) (*pb.LoginResponse, error) {
	if r := recover(); r != nil {
		// Reset things here if you want
		logrus.Errorf("Recovered from panic in Login! %v", r)
	}
	password := in.Password
	if password != validPassword {
		return &pb.LoginResponse{Success: false}, errInvalidPassword
	}
	// Declare the expiration time of the token
	// here, we have set it to 15 days
	expirationTime := time.Now().Add(360 * time.Hour)
	// Create the JWT claims, which includes the username and expiry time
	claims := &Claims{
		StandardClaims: jwt.StandardClaims{
			// In JWT, the expiry time is expressed as unix milliseconds
			ExpiresAt: expirationTime.Unix(),
		},
	}

	// Declare the token with the algorithm used for signing, and the claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	// Create the JWT string
	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		// If there is an error in creating the JWT return an internal server error
		return &pb.LoginResponse{Success: false}, err
	}

	return &pb.LoginResponse{Jwt: tokenString, Expiry: expirationTime.String(), Success: true}, nil
}

func (s *CommandControlServer) GetDevices(ctx context.Context, in *pb.None) (*pb.Devices, error) {
	if r := recover(); r != nil {
		// Reset things here if you want
		logrus.Errorf("Recovered from panic in GetDevices! %v", r)
	}
	return GetDevices()
}

func (s *CommandControlServer) UpdateDevice(ctx context.Context, in *pb.Device) (*pb.None, error) {
	if r := recover(); r != nil {
		// Reset things here if you want
		logrus.Errorf("Recovered from panic in UpdateDevice! %v", r)
	}
	_, err := UpdateDevice(in) // Update database row
	if err != nil {
		return &pb.None{}, err
	}

	switch in.Type {
	case pb.Device_GREENHOUSE:
		go greenhouse.Initialize(in)
	case pb.Device_IRRIGATION:
		go irrigation.Initialize(in)
	// case pb.Device_SENSOR:
	// 	s.WaitGroup.Add(1)
	// 	go sensor.Initialize(s.WaitGroup, in)
	case pb.Device_UNKNOWN:
		return &pb.None{}, fmt.Errorf("unknown device type")
	}

	return &pb.None{}, err
}

func (s *CommandControlServer) CreateZone(ctx context.Context, in *pb.Zone) (*pb.Zones, error) {
	if r := recover(); r != nil {
		// Reset things here if you want
		logrus.Errorf("Recovered from panic in CreateZone! %v", r)
	}
	_, err := CreateZone(in)
	if err != nil {
		return &pb.Zones{}, err
	}
	return GetZones()
}

func (s *CommandControlServer) UpdateZone(ctx context.Context, in *pb.Zone) (*pb.Zone, error) {
	if r := recover(); r != nil {
		// Reset things here if you want
		logrus.Errorf("Recovered from panic in UpdateZone! %v", r)
	}
	_, err := UpdateZone(in)
	if err != nil {
		return &pb.Zone{}, err
	}
	return in, nil
}

func (s *CommandControlServer) DeleteZone(ctx context.Context, in *pb.Zone) (*pb.None, error) {
	if r := recover(); r != nil {
		// Reset things here if you want
		logrus.Errorf("Recovered from panic in DeleteZone! %v", r)
	}
	_, err := DeleteZone(in)
	if err != nil {
		return &pb.None{}, err
	}
	return &pb.None{}, nil
}

func (s *CommandControlServer) GetZones(ctx context.Context, in *pb.None) (*pb.Zones, error) {
	if r := recover(); r != nil {
		// Reset things here if you want
		logrus.Errorf("Recovered from panic in GetZones! %v", r)
	}
	return GetZones()
}

func (s *CommandControlServer) GetZone(ctx context.Context, in *pb.ZoneRequest) (*pb.Zone, error) {
	if r := recover(); r != nil {
		// Reset things here if you want
		logrus.Errorf("Recovered from panic in GetZone! %v", r)
	}
	return GetZone(in.Zone)
}

// ensureValidToken ensures a valid token exists within a request's metadata. If
// the token is missing or invalid, the interceptor blocks execution of the
// handler and returns an error. Otherwise, the interceptor invokes the unary
// handler.
func passwordInterceptor(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
	md, ok := metadata.FromIncomingContext(ctx)
	if !ok {
		return nil, errMissingMetadata
	}

	// Allow requests to the login endpoint to be processed without a token
	if info.FullMethod == "/CommandControl/Login" {
		// if info.FullMethod == "/Greenhouse/Login" {
		return handler(ctx, req)
	}

	// The keys within metadata.MD are normalized to lowercase.
	// See: https://godoc.org/google.golang.org/grpc/metadata#New
	if !valid(md["authorization"]) {
		return nil, errInvalidToken
	}
	// Continue execution of handler after ensuring a valid token.
	return handler(ctx, req)
}

// valid validates the authorization.
func valid(authorization []string) bool {
	if len(authorization) < 1 {
		return false
	}
	token := strings.TrimPrefix(authorization[0], "Bearer ")

	// Initialize a new instance of `Claims`
	claims := &Claims{}

	tkn, err := jwt.ParseWithClaims(token, claims, func(token *jwt.Token) (interface{}, error) {
		return jwtKey, nil
	})
	if err != nil {
		return false
	}

	return tkn.Valid
}

func startFrontend(wg *sync.WaitGroup) {
	defer wg.Done()

	logrus.Infof("Starting frontend on port %d", *appPort)

	http.DefaultClient.Timeout = 10 * time.Second

	root := http.FileServer(http.Dir("/var/www/greenhouse"))
	http.Handle("/", exploitBlock.Protect(http.StripPrefix("/", root)))
	http.Handle("/login", exploitBlock.Protect(http.StripPrefix("/login", root)))
	logrus.Info("Frontend service initialized!")

	// frameChan := make(chan *bytes.Buffer)
	// go camera.InitializeCamera(frameChan)
	// http.Handle("/video", exploitBlock.CheckJWT(http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
	// 	//remove stale image
	// 	<-frameChan
	// 	const boundary = `frame`
	// 	w.Header().Set("Content-Type", `multipart/x-mixed-replace;boundary=`+boundary)
	// 	multipartWriter := multipart.NewWriter(w)
	// 	multipartWriter.SetBoundary(boundary)
	// 	for {
	// 		img := <-frameChan
	// 		image := img.Bytes()
	// 		iw, err := multipartWriter.CreatePart(textproto.MIMEHeader{
	// 			"Content-type":   []string{"image/jpeg"},
	// 			"Content-length": []string{strconv.Itoa(len(image))},
	// 		})
	// 		if err != nil {
	// 			// logrus.Errorf("CreatePart: %v", err)
	// 			return
	// 		}
	// 		_, err = iw.Write(image)
	// 		if err != nil {
	// 			// logrus.Errorf("Write: %v", err)
	// 			continue
	// 		}
	// 	}
	// })))
	// logrus.Info("Camera service initialized!")

	err := http.ListenAndServe(fmt.Sprintf(":%d", *appPort), nil)
	if err != nil {
		logrus.Fatal(err)
	}
}

func rpcServer(devices *pb.Devices, ctx context.Context) {
	opts := []grpc.ServerOption{
		grpc.UnaryInterceptor(passwordInterceptor),
	}
	s := grpc.NewServer(opts...)
	pb.RegisterCommandControlServer(s, &CommandControlServer{})
	greenhouseRegistered := false
	irrigationRegistered := false
	for _, device := range devices.Adopted {
		switch device.Type {
		case pb.Device_GREENHOUSE:
			go greenhouse.Initialize(device)
			if !greenhouseRegistered {
				pb.RegisterGreenhouseServer(s, &greenhouse.GreenhouseServer{})
			}
		case pb.Device_IRRIGATION:
			go irrigation.Initialize(device)
			if !irrigationRegistered {
				pb.RegisterIrrigationServer(s, &irrigation.IrrigationServer{})
			}
		}
	}

	lis, err := net.Listen("tcp", fmt.Sprintf(":%d", *rpcPort))
	if err != nil {
		logrus.Fatalf("Failed to serve gRPC: %v", err)
	}

	go func() {
		<-ctx.Done()
		s.GracefulStop()
	}()

	logrus.Infoln("gRPC service initialized!")
	if err := s.Serve(lis); err != nil {
		logrus.Fatalf("Failed to serve gRPC: %v", err)
	}
}
