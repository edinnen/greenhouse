package coop

import (
	"bytes"
	"context"
	"encoding/base64"
	"fmt"
	"io/ioutil"
	"net/http"
	"sync"
	"time"

	"github.com/edinnen/greenhouse/cmd/pb"
	"github.com/sirupsen/logrus"
	"google.golang.org/protobuf/proto"
)

type Coop struct {
	Mutex         *sync.Mutex
	DatabaseMutex *sync.Mutex
	Device        *pb.Device
	State         *pb.CoopState
	Context       context.Context
	LastWatered   time.Time
}

type CoopServer struct {
	pb.UnimplementedCoopServer
}

var Coops []*Coop

func RecoverOnPanic(functionName string) {
	if r := recover(); r != nil {
		// Reset things here if you want
		logrus.Errorf("Panic recovered in %s! %v", functionName, r)
	}
}

func Initialize(device *pb.Device) {
	coop := &Coop{
		Device:        device,
		Mutex:         &sync.Mutex{},
		DatabaseMutex: &sync.Mutex{},
	}
	coop.InitializeDB()
	Coops = append(Coops, coop)
	logrus.Info("Initializing coop!")
	go coop.BackgroundUpdate()
}

func (coop *Coop) BackgroundUpdate() {
	// Ensure we restart the background update loop if we panic
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("Recovered from panic in backgroundUpdate! %v", r)
			logrus.Info("Restarting backgroundUpdate...")
			go coop.BackgroundUpdate()
		}
	}()

	for {
		state, err := coop.MakeGetStateRequest()
		if err != nil {
			logrus.Error("Failed to get background state update")
			time.Sleep(1 * time.Minute)
			continue
		}
		coop.State = state
		coop.StoreState(state)
		time.Sleep(15 * time.Second)
	}
}

func (coop *Coop) MakeGetStateRequest() (*pb.CoopState, error) {
	coop.Mutex.Lock()
	defer coop.Mutex.Unlock()

	// Make a GET request to uC's /GetCoopState endpoint
	req, err := http.NewRequest("GET", fmt.Sprintf("http://%s:6969/GetCoopState", coop.Device.Ip), nil)
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
	state := &pb.CoopState{}
	err = proto.Unmarshal(bodyBytes, state)
	if err != nil {
		logrus.Errorf("Error unmarshalling: %v", err)
		return nil, err
	}

	return state, nil
}

func (coop *Coop) MakeSetStateRequest(request *pb.CoopState) (*pb.CoopState, error) {
	defer RecoverOnPanic("makeSetStateRequest")
	coop.Mutex.Lock()
	defer coop.Mutex.Unlock()
	// Send request to coop
	data, err := proto.Marshal(request)
	if err != nil {
		logrus.Errorf("Error marshalling: %v", err)
		return nil, err
	}

	req, err := http.NewRequest("POST", fmt.Sprintf("http://%s:6969/SetCoopState", coop.Device.Ip), bytes.NewBuffer(data))
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
	state := &pb.CoopState{}
	err = proto.Unmarshal(bodyBytes, state)
	if err != nil {
		logrus.Errorf("Error unmarshalling: %v", err)
		return nil, err
	}

	coop.StoreState(state)
	return state, nil
}

func findCoop(id int32) *Coop {
	for _, coop := range Coops {
		if coop.Device.Id == id {
			return coop
		}
	}
	return nil
}

func (coop *CoopServer) GetCoopState(ctx context.Context, in *pb.CoopState) (*pb.CoopState, error) {
	defer RecoverOnPanic("GetCoopState")

	gh := findCoop(in.DeviceID)
	if gh == nil {
		return nil, fmt.Errorf("could not find coop with id %d", in.DeviceID)
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

func (coop *CoopServer) SetCoopState(ctx context.Context, request *pb.CoopState) (*pb.CoopState, error) {
	defer RecoverOnPanic("SetState")

	gh := findCoop(request.DeviceID)
	if gh == nil {
		return nil, fmt.Errorf("could not find coop with id %d", request.DeviceID)
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

func (coop *CoopServer) GetCoopTimeseries(ctx context.Context, request *pb.CoopTimeseriesRequest) (*pb.CoopTimeseries, error) {
	defer RecoverOnPanic("GetTimeseries")

	return nil, nil
	// gh := findCoop(request.DeviceID)
	// if gh == nil {
	// 	return nil, fmt.Errorf("could not find coop with id %d", request.DeviceID)
	// }

	// gh.Mutex.Lock()
	// defer gh.Mutex.Unlock()

	// from := time.Unix(request.GetFrom(), 0)
	// to := time.Unix(request.GetTo(), 0)

	// logrus.WithFields(logrus.Fields{"From": from, "To": to}).Info("Getting timeseries")
	// timeseries, err := gh.GetTimeseriesFromDB(from, to)
	// logrus.WithFields(logrus.Fields{"Count": len(timeseries.States)}).Info("Found matching timeseries data")
	// if err != nil {
	// 	logrus.Errorf("Error getting timeseries: %v", err)
	// 	return nil, err
	// }

	// return timeseries, nil
}

func (coop *CoopServer) CoopWatered(ctx context.Context, request *pb.CoopWaterRequest) (*pb.CoopWaterRequest, error) {
	defer RecoverOnPanic("CoopWatered")

	return nil, nil
	// gh := findCoop(request.DeviceID)
	// if gh == nil {
	// 	return nil, fmt.Errorf("could not find coop with id %d", request.DeviceID)
	// }

	// gh.Mutex.Lock()
	// defer gh.Mutex.Unlock()

	// gh.SetWatered()
	// gh.LastWatered = time.Now()
	// return request, nil
}
