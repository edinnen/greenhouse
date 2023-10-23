#include "Greenhouse.h"
#include <Adafruit_Sensor.h>
#include <DHT.h>
#include <DHT_U.h>
#include <time.h>
#include <elapsedMillis.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <WiFi.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <WiFiClient.h>
#include <pb_encode.h>
#include <pb_decode.h>
#include "greenhouse.pb.h"
#include "definitions.h"
#include "base64.h"
#include <ESPmDNS.h>
// #include <ArduinoOTA.h>
#include <EEPROM.h>

char ssid[] = "Doncaster IoT";
char pass[] = "eViscoGo";
AsyncWebServer server(6969);
String hostname = "IoP-";

DHT_Unified dht(DHT_PIN, DHTTYPE);
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);
// DeviceAddress thermometer = { 0x28, 0xFF, 0xF0, 0xC7, 0x6A, 0x21, 0xCD, 0xAC };
DeviceAddress thermometer;

void notFound(AsyncWebServerRequest *request) {
    request->send(404, "text/plain", "Not found");
}

String bytesAsString(uint8_t *bytes, uint8_t len) {
  String result = "";
  for (int i = 0; i < len; i++) {
    result += String(bytes[i], HEX);
  }
  return result;
}

/**
 * Initialize all greenhouse pins, sensors, etc. when the uC boots up.
 */
void Greenhouse::init() {
  // Debug console
  Serial.begin(115200);

  EEPROM.begin(State_size * 2);

  WiFi.begin(ssid, pass);
  Serial.print("Connecting");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("Connected to ");
  Serial.println(WiFi.localIP());

  uint8_t mac;
  esp_efuse_mac_get_default(&mac);
  
  // Set hostname to partial MAC address and device type
  hostname += bytesAsString(&mac, 3);
  hostname += "-greenhouse";
  WiFi.setHostname(hostname.c_str());
  if (!MDNS.begin(hostname.c_str())) { // greenhousemicro.local hostname
    Serial.println("Error setting up MDNS responder!");
    while(1) {
        delay(1000);
    }
  }
  MDNS.setInstanceName(hostname.c_str());
  MDNS.addService("http", "tcp", 80);
  MDNS.addServiceTxt("http", "tcp", "type", "1");
  MDNS.addServiceTxt("http", "tcp", "mac", bytesAsString(&mac, 6));
  Serial.println("mDNS responder started");

  // // Start the OTA updater
  // ArduinoOTA.onStart([]() {
  //   String type;
  //   if (ArduinoOTA.getCommand() == U_FLASH) {
  //     type = "sketch";
  //   } else { // U_FS
  //     type = "filesystem";
  //   }

  //   // NOTE: if updating FS this would be the place to unmount FS using FS.end()
  //   Serial.println("Start updating " + type);
  // });
  // ArduinoOTA.onEnd([]() {
  //   Serial.println("\nEnd");
  // });
  // ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
  //   Serial.printf("Progress: %u%%\r", (progress / (total / 100)));
  // });
  // ArduinoOTA.onError([](ota_error_t error) {
  //   Serial.printf("Error[%u]: ", error);
  //   if (error == OTA_AUTH_ERROR) {
  //     Serial.println("Auth Failed");
  //   } else if (error == OTA_BEGIN_ERROR) {
  //     Serial.println("Begin Failed");
  //   } else if (error == OTA_CONNECT_ERROR) {
  //     Serial.println("Connect Failed");
  //   } else if (error == OTA_RECEIVE_ERROR) {
  //     Serial.println("Receive Failed");
  //   } else if (error == OTA_END_ERROR) {
  //     Serial.println("End Failed");
  //   }
  // });
  // ArduinoOTA.begin();
  
  // Set server routing
  restServerRouting();

  server.onNotFound(notFound);

  server.begin();

  pinMode(LED_SSR_PIN, OUTPUT);
  pinMode(LED_DIMMER_ZONE_1, OUTPUT);
  pinMode(LED_DIMMER_ZONE_2, OUTPUT);
  pinMode(VENT_FAN_PIN, OUTPUT);
  pinMode(RECIRCULATION_FAN_PIN, OUTPUT);

  dht.begin();
  sensors.begin(); // OneWire sensors
  sensors.setResolution(thermometer, TEMPERATURE_PRECISION);
  if (!sensors.getAddress(thermometer, 0)) Serial.println("Unable to find address for device 0");
  Serial.println("Sensors initialized");

  configTime(GMT_OFFSET_SEC, DAYLIGHT_OFFSET_SEC, "pool.ntp.org");
  Serial.println("Time syncronized");

  ledcSetup(0, PWM_FREQUENCY, PWM_RESOLUTION); // Setting up PWM channel 0
  ledcSetup(1, PWM_FREQUENCY, PWM_RESOLUTION);
  ledcAttachPin(LED_DIMMER_ZONE_1, 0);
  ledcAttachPin(LED_DIMMER_ZONE_2, 1);
  Serial.println("Lights initialized");

  this->getLastState();

  sensors.setHighAlarmTemp(thermometer, 26);
  sensors.setLowAlarmTemp(thermometer, 24);

  Serial.println("Greenhouse initiated successfully");
}

std::string Greenhouse::encodeState(State state) {
    uint8_t buffer[State_size];
    pb_ostream_t stream = pb_ostream_from_buffer(buffer, State_size);
    if (!pb_encode(&stream, State_fields, &state)) {
        Serial.println("Encoding failed!");
        Serial.println(PB_GET_ERROR(&stream));
        return "";
    }
    Serial.printf("Encoded state. Bytes written: %d\n", stream.bytes_written);
    std::string encoded = base64_encode(buffer, stream.bytes_written);
    return encoded;
}

bool Greenhouse::decodeState(State *state, uint8_t *data, size_t len) {
    pb_istream_t stream = pb_istream_from_buffer(data, len);
    if (!pb_decode(&stream, State_fields, state)) {
        Serial.println("Decoding failed!");
        Serial.println(PB_GET_ERROR(&stream));
        return false;
    }
    return true;
}

// Define routing
void Greenhouse::restServerRouting() {
    server.on("/GetState", HTTP_GET, [](AsyncWebServerRequest *request) {
      Serial.println("Get state");
      State state = greenhouse.getState();
      std::string encoded = greenhouse.encodeState(state);
      request->send(200, "application/grpc-web-text", encoded.c_str());
    });

    server.on("/SetState", HTTP_POST, [](AsyncWebServerRequest *request) {
      // THIS IS INTENTIONALLY BLANK DON'T DELETE
      // This REST library is dog shit
    }, NULL, [](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total) {
      State newState = State_init_zero;
      if (!greenhouse.decodeState(&newState, data, len)) {
        Serial.println("Failed to decode state. Just responding with current state.");
        State state = greenhouse.getState();
        std::string encoded = greenhouse.encodeState(state);
        request->send(200, "application/grpc-web-text", encoded.c_str());
        return;
      }
      Serial.println("Decoded state");
      State updatedState = greenhouse.setState(newState);
      Serial.println("Returning state:");
      Serial.printf("Lights: %d\n", updatedState.lights);
      Serial.printf("Recirculation fan: %d\n", updatedState.recirculationFan);
      Serial.printf("Vent fan: %d\n", updatedState.ventFan);

      std::string encoded = greenhouse.encodeState(updatedState);
      request->send(200, "application/grpc-web-text", encoded.c_str());
    });
}

/**
 * The main loop of the greenhouse.
 */
void Greenhouse::loop() {
    if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Lost connection to WiFi, restarting");
    delay(1000);
    ESP.restart();
  }
  this->ensureLights();
  this->rampBrightness(1.0);

  sensors.requestTemperatures();
  if (sensors.hasAlarm(thermometer)) {
    float temperature = sensors.getTempC(thermometer);
    if (temperature >= 26 && !this->state.ventFan && !this->state.ventOverridden) {
      Serial.println("High temperature alarm triggered. Turning on vent fans");
      digitalWrite(VENT_FAN_PIN, HIGH);
      this->state.ventFan = true;
      this->state.ventFanLast = time(NULL);
    } else if (temperature <= 24 && this->state.ventFan && !this->state.ventOverridden) {
      Serial.println("Low temperature alarm triggered. Turning off vent fans");
      digitalWrite(VENT_FAN_PIN, LOW);
      this->state.ventFan = false;
    }
  }
  // ArduinoOTA.handle();
}

/**
 * Ensurelights ensures that the lights are on or off if they are supposed to be based on the light timer.
 */
void Greenhouse::ensureLights() {
  if (!this->state.has_lightsTiming || this->state.lightsOverridden) return;

  // Calculate seconds since the beginning of the day
  time_t now = time(nullptr);
  struct tm *timeinfo = localtime(&now);
  int secondsSinceMidnight = timeinfo->tm_hour * 3600 + timeinfo->tm_min * 60 + timeinfo->tm_sec;

  if (secondsSinceMidnight >= this->state.lightsTiming.start.seconds && secondsSinceMidnight <= this->state.lightsTiming.end.seconds) {
    if (!this->state.lights) {
      Serial.println("Turning on lights");
      digitalWrite(LED_SSR_PIN, HIGH);
      this->setBrightness(this->state.maxAutomationBrightness, 0);
      this->state.lights = true;
    }
  } else {
    if (this->state.lights) {
      Serial.println("Turning off lights");
      digitalWrite(LED_SSR_PIN, LOW);
      this->setBrightness(0, 0);
      this->state.lights = false;
    }
  }
}

/**
 * bufferToString converts a char buffer to a string.
 * @param buffer The buffer to convert
 * @param bufferSize The size of the buffer
 * @return The string representation of the buffer
 */
std::string bufferToString(char* buffer, int bufferSize)
{
    std::string ret(buffer, bufferSize);

    return ret;
}

/**
 * @brief Get a specific value from a string using a delimiter
 * 
 * @param data The string to split on the delimiter
 * @param delimiter The delimiter to split on 
 * @param index The index of the value to get
 * @return The value at the specified index
 */
String getValue(String data, char delimiter, int index) {
  int found = 0;
  int strIndex[] = {0, -1};
  int maxIndex = data.length()-1;

  for(int i=0; i<=maxIndex && found<=index; i++){
    if(data.charAt(i)==delimiter || i==maxIndex){
        found++;
        strIndex[0] = strIndex[1]+1;
        strIndex[1] = (i == maxIndex) ? i+1 : i;
    }
  }

  return found>index ? data.substring(strIndex[0], strIndex[1]) : "";
}

/**
 * Makes a request to the Pi command server to get the last known state.
 * Once received, the uC state will be updated with the new state.
 * 
 * @return The new uC internal state
 */
State Greenhouse::getLastState() {
  Serial.println("Getting last state from EEPROM...");

  // Retrieve state from EEPROM
  State state;
  state = State_init_default;
  EEPROM.get(0, state);

  Serial.println("Previous state received. Setting...");
  this->setState(state);
  return state;
}

/**
 * Ramps the brightness of the lights if the current time
 * matches the light timing schedule stored in the state
 */
void Greenhouse::rampBrightness(float period) {
  if (!this->state.has_lightsTiming || this->state.lightsOverridden) return;

  // Calculate seconds since the beginning of the day
  time_t now = time(nullptr);
  struct tm *timeinfo = localtime(&now);
  int secondsSinceMidnight = timeinfo->tm_hour * 3600 + timeinfo->tm_min * 60 + timeinfo->tm_sec - 60; // subtract 1 minute to account for the delay in the loop

  if (secondsSinceMidnight >= this->state.lightsTiming.start.seconds && secondsSinceMidnight <= this->state.lightsTiming.end.seconds) {
    if (isnan(this->rampBrightnessAmount)) {
      this->rampBrightnessAmount = 10.0;
      this->rampTimer = 0;
      this->setBrightness(this->rampBrightnessAmount, 0);
    }

    if (this->rampTimer >= 1000) {
      int secondsBetweenStartAndEnd = this->state.lightsTiming.end.seconds - this->state.lightsTiming.start.seconds;
      int secondsFromStart = secondsSinceMidnight - this->state.lightsTiming.start.seconds;
      int secondsToEnd = secondsBetweenStartAndEnd - secondsFromStart;
      float rampDuration = secondsBetweenStartAndEnd * (this->state.rampPercentage / 100 / 2);

      if (!rampDuration || period == 0 || rampDuration == 0) {
        if (!this->state.lights) {
          this->setBrightness(this->state.maxAutomationBrightness, 0);
        }
        return;
      }

      float stepSize = (this->state.maxAutomationBrightness - MINIMUM_BRIGHTNESS_PERCENT) / rampDuration / period; // Subtract the minimum brightness amount to compensate for hardware limitations
      bool shouldRampUp = secondsFromStart <= rampDuration;
      bool shouldRampDown = secondsToEnd <= rampDuration;
      if (shouldRampUp) {
        this->rampBrightnessAmount = (secondsFromStart * stepSize) + 10;
      } else if (shouldRampDown) {
        this->rampBrightnessAmount = (secondsToEnd * stepSize) + 10;
      } else {
        this->rampBrightnessAmount = this->state.maxAutomationBrightness;
      }

      Serial.printf("Ramping brightness to %f\n", this->rampBrightnessAmount);
      this->setBrightness(this->rampBrightnessAmount, 0);
      this->rampTimer = 0;
    }
  } else {
    if (!isnan(this->rampBrightnessAmount)) {
      this->rampBrightnessAmount = NAN;
      this->rampTimer = 0;
      this->setBrightness(0, 0);
      return;
    }
  }
}

/**
 * Sets the brightness of the lights in a specific PWM zone
 * 
 * @param brightness Value between 0 and 100
 * @param pwmZone The zone to set. 0 is all zones
 */
void Greenhouse::setBrightness(float brightness, int pwmZone) {
  Serial.printf("Got brightness: %f\n", brightness);
  if (brightness < 10.0) {
    Serial.println("Brightness less than 10. Turning off lights");
    digitalWrite(LED_SSR_PIN, LOW);
    this->state.lights = false;
    this->state.brightnessPercent1 = 0;
    this->state.brightnessPercent2 = 0;
    this->rampBrightnessAmount = NAN;
    return;
  }

  if (this->state.lights == false) {
    Serial.println("Turning on lights inside brightness call");
    digitalWrite(LED_SSR_PIN, HIGH);
    this->state.lights = true;
  }

  if (pwmZone == 0) {
    Serial.printf("Writing to pwmZone 0 value %d\n", (int)((brightness * MAX_DUTY_CYCLE) / 100.0));
    ledcWrite(0, (int)((MAX_DUTY_CYCLE * brightness) / 100));
    ledcWrite(1, (int)((MAX_DUTY_CYCLE * brightness) / 100));
    this->state.brightnessPercent1 = brightness;
    this->state.brightnessPercent2 = brightness;
  } else if (pwmZone == 1) {
    Serial.printf("Writing to pwmZone 1 value %d\n", (int)((brightness * MAX_DUTY_CYCLE) / 100.0));
    ledcWrite(0, (int)((MAX_DUTY_CYCLE * brightness) / 100));
    this->state.brightnessPercent1 = brightness;
  } else if (pwmZone == 2) {
    Serial.printf("Writing to pwmZone 2 value %d\n", (int)((brightness * MAX_DUTY_CYCLE) / 100.0));
    ledcWrite(1, (int)((MAX_DUTY_CYCLE * brightness) / 100));
    this->state.brightnessPercent2 = brightness;
  }
};

/**
 * Retrieves the current state of the greenhouse and updates the sensor data
 * 
 * @return State The current greenhouse state
 */
State Greenhouse::getState() { 
  this->readSensors();
  this->state.timestamp = time(NULL);
  return this->state;
};

/**
 * Sets the state of the greenhouse based on a recieved State protobuf
 * 
 * @param state The new State protobuf to set the greenhouse to
 * @return State The new uC internal state of the greenhouse. Should be the same as the state passed in.
 */
State Greenhouse::setState(State state) {
  Serial.println("Setting state");
  // Find which hardware values have changed so we can act upon them
  boolean lights = state.lights != this->state.lights;
  boolean brightnessPercent1 =
      state.brightnessPercent1 != this->state.brightnessPercent1;
  boolean brightnessPercent2 =
      state.brightnessPercent2 != this->state.brightnessPercent2;
  boolean recirculationFan = state.recirculationFan != this->state.recirculationFan;
  boolean ventFan = state.ventFan != this->state.ventFan;

  if (lights) {
    Serial.printf("Setting lights on pin %d to %d\n", LED_SSR_PIN, state.lights);
    if (state.lights) {
      digitalWrite(LED_SSR_PIN, HIGH);
      state.lightsLast = time(NULL);
      if (state.brightnessPercent1 <= 10 && state.brightnessPercent2 <= 10) {
        state.brightnessPercent1 = this->state.maxAutomationBrightness;
        state.brightnessPercent2 = this->state.maxAutomationBrightness;
      }
      this->setBrightness(state.brightnessPercent1, 1);
      this->setBrightness(state.brightnessPercent2, 2);
    } else {
      digitalWrite(LED_SSR_PIN, LOW);
      state.brightnessPercent1 = 0;
      state.brightnessPercent2 = 0;
    }
  }

  if (brightnessPercent1) {
    Serial.printf("Setting brightness 1 to %f\n", state.brightnessPercent1);
    this->setBrightness(state.brightnessPercent1, 1);
  }

  if (brightnessPercent2) {
    Serial.printf("Setting brightness 2 to %f\n", state.brightnessPercent2);
    this->setBrightness(state.brightnessPercent2, 2);
  }

  if (recirculationFan) {
    Serial.printf("Setting recirc fan on pin %d to %d\n", RECIRCULATION_FAN_PIN, state.recirculationFan);
    if (state.recirculationFan) {
      digitalWrite(RECIRCULATION_FAN_PIN, HIGH);
      state.recirculationFanLast = time(NULL);
    } else {
      digitalWrite(RECIRCULATION_FAN_PIN, LOW);
    }
  }

  if (state.ventOverridden && ventFan) {
    Serial.printf("Setting vent fan on pin %d to %d\n", VENT_FAN_PIN, state.ventFan);
    if (state.ventFan) {
      digitalWrite(VENT_FAN_PIN, HIGH);
      state.ventFanLast = time(NULL);
    } else {
      digitalWrite(VENT_FAN_PIN, LOW);
    }
  }

  // Store the state locally and read our sensors before returning
  this->state = state;
  this->readSensors();

  // Store state in EEPROM
  EEPROM.put(0, this->state);
  EEPROM.commit();

  return this->state;
}

/**
 * Read the sensors and update the uC internal state
 */
void Greenhouse::readSensors() {
  float tempC = sensors.getTempC(thermometer);
  if (tempC != DEVICE_DISCONNECTED_C) {
    this->state.temperature = tempC;
    Serial.printf("Temperature: %f C\n", tempC);
  }

  // Get and store the current humidity
  sensors_event_t event;
  dht.humidity().getEvent(&event);
  if (!isnan(event.relative_humidity)) {
    this->state.humidity = event.relative_humidity;
  }

  // this->state.soilCapacitance = (float)analogRead(CAPACITIVE_PIN)*(3.3/4096.0);
  this->state.soilCapacitance = NAN; // Set to NaN for now until we can get this working
  this->state.timestamp = time(NULL);
}