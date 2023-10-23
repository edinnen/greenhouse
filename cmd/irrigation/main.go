package irrigation

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/dehaass/greenHouse/cmd/pb"
	"github.com/sirupsen/logrus"
	"google.golang.org/protobuf/proto"
)

type Irrigator struct {
	Mutex         *sync.Mutex
	DatabaseMutex *sync.Mutex
	Device        *pb.Device
	State         *pb.Irrigator
	Context       context.Context
	pb.UnimplementedIrrigationServer
}

type IrrigationServer struct {
	pb.UnimplementedIrrigationServer
}

var Irrigators []*Irrigator

func RecoverOnPanic(functionName string) {
	if r := recover(); r != nil {
		// Reset things here if you want
		logrus.Errorf("Panic recovered in %s! %v", functionName, r)
	}
}

func Initialize(device *pb.Device) {
	ir := &Irrigator{
		Mutex:         &sync.Mutex{},
		DatabaseMutex: &sync.Mutex{},
		Device:        device,
	}
	state, err := ir.MakeGetStateRequest()
	if err != nil {
		logrus.Errorf("Failed to initialize irrigator: %v", err)
		return
	}
	ir.State = state
	ir.State.RainLockout = false
	Irrigators = append(Irrigators, ir)
	go ir.BackgroundUpdate()
	go ir.WeatherService()
}

func (ir *Irrigator) WeatherService() {
	for {
		weather, err := getWeather()
		if err != nil {
			logrus.Errorf("Error getting weather: %v", err)
		}

		// Print current temperature
		logrus.Infof("Current outside temperature for %s: %v", strings.Split(ir.Device.Name, ".")[0], weather["current"].(map[string]interface{})["temp"])

		// Check the total rain amounts over the next 30 minutes
		var rain float64
		for i, minutely := range weather["minutely"].([]interface{}) {
			rain += minutely.(map[string]interface{})["precipitation"].(float64)
			if i >= 30 {
				break
			}
		}

		var rainHourly float64
		for i, hourly := range weather["hourly"].([]interface{}) {
			if hourly.(map[string]interface{})["rain"] != nil {
				rainHourly += hourly.(map[string]interface{})["rain"].(map[string]interface{})["1h"].(float64)
			}
			if i >= 5 {
				break
			}
		}

		logrus.Infof("Total rain over the next 30 minutes for %s is %f", strings.Split(ir.Device.Name, ".")[0], rain)
		logrus.Infof("Total rain over the next 5 hours for %s is %f", strings.Split(ir.Device.Name, ".")[0], rainHourly)

		maxRainMillimeters := 2.0
		if rain >= maxRainMillimeters {
			logrus.Infof("It will rain more than 10mm in the next 30 minutes. Locking out irrigation on %s for 24 hours.", strings.Split(ir.Device.Name, ".")[0])
			ir.State.RainLockout = true
			ir.State.LastLockout = time.Now().Unix()
			_, err := ir.MakeSetStateRequest(ir.State)
			if err != nil {
				logrus.Errorf("Error making setState request: %v", err)
			}
		} else if rainHourly >= maxRainMillimeters {
			logrus.Infof("It will rain more than 10mm over the next 5 hours. Locking out irrigation on %s for 24 hours.", strings.Split(ir.Device.Name, ".")[0])
			ir.State.RainLockout = true
			ir.State.LastLockout = time.Now().Unix()
			_, err := ir.MakeSetStateRequest(ir.State)
			if err != nil {
				logrus.Errorf("Error making setState request: %v", err)
			}
		}

		// Check if any solenoids are on
		for _, solenoid := range ir.State.Solenoids {
			if solenoid.State == pb.Solenoid_ON {
				// Check if it is raining
				if weather["current"].(map[string]interface{})["weather"].([]interface{})[0].(map[string]interface{})["main"].(string) == "Rain" {
					logrus.Info("It is raining, turning off irrigation on %s", strings.Split(ir.Device.Name, ".")[0])

					// Loop over solenoids
					for _, solenoid := range ir.State.Solenoids {
						if solenoid.Override {
							continue
						}
						// Turn off solenoid
						solenoid.State = pb.Solenoid_OFF
					}
				}
				break
			}
		}

		// Update the irrigation state
		ir.State.Temperature = float32(weather["current"].(map[string]interface{})["temp"].(float64))
		_, err = ir.MakeSetStateRequest(ir.State)
		if err != nil {
			logrus.Errorf("Error making setState request: %v", err)
		}
		time.Sleep(15 * time.Minute)
	}
}

func (ir *Irrigator) BackgroundUpdate() {
	// Ensure we restart the background update loop if we panic
	defer func() {
		if r := recover(); r != nil {
			logrus.Errorf("Recovered from panic in backgroundUpdate! %v", r)
			logrus.Info("Restarting backgroundUpdate...")
			go ir.BackgroundUpdate()
		}
	}()

	for {
		state, err := ir.MakeGetStateRequest()
		if err != nil {
			logrus.Errorf("Error making getState request: %v", err)
		}
		ir.State = state
		time.Sleep(time.Second * 5)
	}
}

func getWeather() (map[string]interface{}, error) {
	url := "https://api.openweathermap.org/data/2.5/onecall?lat=48.44552&lon=-123.33990&units=metric&appid=18f715ac974761a838ef80d66b60c7af"

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}

	var payload map[string]interface{}
	err = json.NewDecoder(resp.Body).Decode(&payload)
	if err != nil {
		return nil, err
	}

	return payload, nil
}

func (ir *Irrigator) MakeGetStateRequest() (*pb.Irrigator, error) {
	ir.Mutex.Lock()
	defer ir.Mutex.Unlock()

	req, err := http.NewRequest("GET", fmt.Sprintf("http://%s/GetState", ir.Device.Ip), nil)
	if err != nil {
		logrus.Errorf("Error making getState request: %v", err)
		return nil, err
	}
	req.Header.Set("Content-Type", "application/grpc-web-text")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		logrus.Errorf("Error making getState request: %v", err)
		return nil, err
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
	irrigator := &pb.Irrigator{}
	err = proto.Unmarshal(bodyBytes, irrigator)
	if err != nil {
		logrus.Errorf("Error unmarshalling: %v", err)
		return nil, err
	}

	return irrigator, nil
}

func (ir *Irrigator) MakeSetStateRequest(request *pb.Irrigator) (*pb.Irrigator, error) {
	defer RecoverOnPanic("makeSetStateRequest")
	ir.Mutex.Lock()
	defer ir.Mutex.Unlock()
	// Send request to greenhouse
	data, err := proto.Marshal(request)
	if err != nil {
		logrus.Errorf("Error marshalling: %v", err)
		return nil, err
	}

	req, err := http.NewRequest("POST", fmt.Sprintf("http://%s/SetState", ir.Device.Ip), bytes.NewBuffer(data))
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
	irrigator := &pb.Irrigator{}
	err = proto.Unmarshal(bodyBytes, irrigator)
	if err != nil {
		logrus.Errorf("Error unmarshalling: %v", err)
		return nil, err
	}

	return irrigator, nil
}

func findIrrigator(id int32) *Irrigator {
	for _, ir := range Irrigators {
		if ir.Device.Id == id {
			return ir
		}
	}
	return nil
}

func (is *IrrigationServer) GetState(ctx context.Context, request *pb.IrrigationRequest) (*pb.Irrigator, error) {
	defer RecoverOnPanic("GetState")
	irrigator := findIrrigator(request.Id)
	if irrigator == nil {
		return nil, fmt.Errorf("could not find irrigator with id %d", request.Id)
	}
	state, err := irrigator.MakeGetStateRequest()
	if err != nil {
		logrus.Errorf("Error making getState request: %v", err)
		return nil, err
	}
	irrigator.State = state

	return irrigator.State, nil
}

func (is *IrrigationServer) SetState(ctx context.Context, request *pb.Irrigator) (*pb.Irrigator, error) {
	defer RecoverOnPanic("SetState")
	irrigator := findIrrigator(request.Id)
	if irrigator == nil {
		return nil, fmt.Errorf("could not find irrigator with id %d", request.Id)
	}
	state, err := irrigator.MakeSetStateRequest(request)
	if err != nil {
		logrus.Errorf("Error making setState request: %v", err)
		return nil, err
	}
	irrigator.State = state

	return state, nil
}
