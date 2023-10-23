package greenhouse

import (
	"bytes"
	"context"
	"encoding/base64"
	"fmt"
	"io/ioutil"
	"net/http"
	"sync"
	"time"

	"github.com/dehaass/greenHouse/cmd/pb"
	"github.com/sirupsen/logrus"
	"google.golang.org/protobuf/proto"
)

type Greenhouse struct {
	Mutex         *sync.Mutex
	DatabaseMutex *sync.Mutex
	Device        *pb.Device
	State         *pb.State
	Context       context.Context
	LastWatered   time.Time
}

type GreenhouseServer struct {
	pb.UnimplementedGreenhouseServer
}

var Greenhouses []*Greenhouse

func RecoverOnPanic(functionName string) {
	if r := recover(); r != nil {
		// Reset things here if you want
		logrus.Errorf("Panic recovered in %s! %v", functionName, r)
	}
}

func Initialize(device *pb.Device) {
	greenhouse := &Greenhouse{
		Device:        device,
		Mutex:         &sync.Mutex{},
		DatabaseMutex: &sync.Mutex{},
	}
	greenhouse.InitializeDB()
	Greenhouses = append(Greenhouses, greenhouse)
	logrus.Info("Initializing greenhouse!")
	go greenhouse.BackgroundUpdate()
}

func (greenhouse *Greenhouse) BackgroundUpdate() {
	// Ensure we restart the background update loop if we panic
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("Recovered from panic in backgroundUpdate! %v", r)
			logrus.Info("Restarting backgroundUpdate...")
			go greenhouse.BackgroundUpdate()
		}
	}()

	for {
		state, err := greenhouse.MakeGetStateRequest()
		if err != nil {
			logrus.Error("Failed to get background state update")
			time.Sleep(1 * time.Minute)
			continue
		}
		greenhouse.State = state
		greenhouse.StoreState(state)
		time.Sleep(15 * time.Second)
	}
}

func (greenhouse *Greenhouse) MakeGetStateRequest() (*pb.State, error) {
	greenhouse.Mutex.Lock()
	defer greenhouse.Mutex.Unlock()

	// Make a GET request to uC's /GetState endpoint
	req, err := http.NewRequest("GET", fmt.Sprintf("http://%s:6969/GetState", greenhouse.Device.Ip), nil)
	if err != nil {
		logrus.Errorf("Error creating request: %v", err)
		return nil, err
	}
	req.Header.Set("Content-Type", "application/grpc-web-text")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	body, _ := ioutil.ReadAll(resp.Body)

	// convert the body from base64 into bytes
	bodyBytes, err := base64.StdEncoding.DecodeString(string(body))
	if err != nil {
		logrus.Errorf("Error decoding base64: %v", err)
		return nil, err
	}

	// Unmarshal the response into a protobuf message
	state := &pb.State{}
	err = proto.Unmarshal(bodyBytes, state)
	if err != nil {
		logrus.Errorf("Error unmarshalling: %v", err)
		return nil, err
	}

	return state, nil
}

func (greenhouse *Greenhouse) MakeSetStateRequest(request *pb.State) (*pb.State, error) {
	defer RecoverOnPanic("makeSetStateRequest")
	greenhouse.Mutex.Lock()
	defer greenhouse.Mutex.Unlock()
	// Send request to greenhouse
	data, err := proto.Marshal(request)
	if err != nil {
		logrus.Errorf("Error marshalling: %v", err)
		return nil, err
	}

	req, err := http.NewRequest("POST", fmt.Sprintf("http://%s:6969/SetState", greenhouse.Device.Ip), bytes.NewBuffer(data))
	if err != nil {
		logrus.Errorf("Error creating request: %v", err)
		return nil, err
	}
	req.Header.Set("Content-Type", "application/grpc-web-text")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	body, _ := ioutil.ReadAll(resp.Body)

	// convert the body from base64 into bytes
	bodyBytes, err := base64.StdEncoding.DecodeString(string(body))
	if err != nil {
		logrus.Errorf("Error decoding base64: %v - %s", err, body)
		return nil, err
	}

	// Unmarshal response into protobuf message
	state := &pb.State{}
	err = proto.Unmarshal(bodyBytes, state)
	if err != nil {
		logrus.Errorf("Error unmarshalling: %v", err)
		return nil, err
	}

	greenhouse.StoreState(state)
	return state, nil
}

func findGreenhouse(id int32) *Greenhouse {
	for _, greenhouse := range Greenhouses {
		if greenhouse.Device.Id == id {
			return greenhouse
		}
	}
	return nil
}

func (greenhouse *GreenhouseServer) GetState(ctx context.Context, in *pb.State) (*pb.State, error) {
	defer RecoverOnPanic("GetState")

	gh := findGreenhouse(in.DeviceID)
	if gh == nil {
		return nil, fmt.Errorf("could not find greenhouse with id %d", in.DeviceID)
	}

	state, err := gh.MakeGetStateRequest()
	if err != nil {
		logrus.Errorf("Error getting state: %v", err)
		return nil, err
	}
	state.WateredToday, state.WateredLast = gh.CheckWateredToday()
	gh.State = state

	// Return the protobuf message
	return state, nil
}

func (greenhouse *GreenhouseServer) SetState(ctx context.Context, request *pb.State) (*pb.State, error) {
	defer RecoverOnPanic("SetState")

	gh := findGreenhouse(request.DeviceID)
	if gh == nil {
		return nil, fmt.Errorf("could not find greenhouse with id %d", request.DeviceID)
	}

	state, err := gh.MakeSetStateRequest(request)
	if err != nil {
		logrus.Errorf("Error making SetState request: %v", err)
		return nil, err
	}
	gh.State = state

	// Return protobuf message
	return state, nil
}

func (greenhouse *GreenhouseServer) GetTimeseries(ctx context.Context, request *pb.TimeseriesRequest) (*pb.Timeseries, error) {
	defer RecoverOnPanic("GetTimeseries")

	gh := findGreenhouse(request.DeviceID)
	if gh == nil {
		return nil, fmt.Errorf("could not find greenhouse with id %d", request.DeviceID)
	}

	gh.Mutex.Lock()
	defer gh.Mutex.Unlock()

	from := time.Unix(request.GetFrom(), 0)
	to := time.Unix(request.GetTo(), 0)

	logrus.WithFields(logrus.Fields{"From": from, "To": to}).Info("Getting timeseries")
	timeseries, err := gh.GetTimeseriesFromDB(from, to)
	logrus.WithFields(logrus.Fields{"Count": len(timeseries.States)}).Info("Found matching timeseries data")
	if err != nil {
		logrus.Errorf("Error getting timeseries: %v", err)
		return nil, err
	}

	return timeseries, nil
}

func (greenhouse *GreenhouseServer) Watered(ctx context.Context, request *pb.WaterRequest) (*pb.WaterRequest, error) {
	defer RecoverOnPanic("Watered")

	gh := findGreenhouse(request.DeviceID)
	if gh == nil {
		return nil, fmt.Errorf("could not find greenhouse with id %d", request.DeviceID)
	}

	gh.Mutex.Lock()
	defer gh.Mutex.Unlock()

	gh.SetWatered()
	gh.LastWatered = time.Now()
	return request, nil
}
