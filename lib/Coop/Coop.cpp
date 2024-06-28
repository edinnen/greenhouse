#include "Coop.h"
#include <time.h>
#include <elapsedMillis.h>
#include <WiFi.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <WiFiClient.h>
#include <pb_encode.h>
#include <pb_decode.h>
#include "coop.pb.h"
#include "definitions.h"
#include "base64.h"
#include <ESPmDNS.h>
// #include <ArduinoOTA.h>
#include <EEPROM.h>
#include <Adafruit_NeoPixel.h>
#include "Adafruit_SHT4x.h"
#include "SPI.h"

char ssid[] = "127.0.0.1";
char pass[] = "eViscoGiot";
AsyncWebServer server(6969);
String hostname = "IoP-";

Adafruit_NeoPixel strip(LED_COUNT, LED_DATA_PIN, NEO_GRBW + NEO_KHZ800);
Adafruit_SHT4x sht4 = Adafruit_SHT4x();
static elapsedMillis sensorTimer = 0;
static elapsedMillis rampDelayTimer = 0;

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
 * Initialize all coop pins, sensors, etc. when the uC boots up.
 */
void Coop::init() {
  // Debug console
  Serial.begin(115200);

  EEPROM.begin(CoopState_size * 2);

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
  hostname += "-chicken-coop";
  WiFi.setHostname(hostname.c_str());
  if (!MDNS.begin(hostname.c_str())) { // coopmicro.local hostname
    Serial.println("Error setting up MDNS responder!");
    while(1) {
        delay(1000);
    }
  }
  MDNS.setInstanceName(hostname.c_str());
  MDNS.addService("http", "tcp", 80);
  MDNS.addServiceTxt("http", "tcp", "type", "4");
  MDNS.addServiceTxt("http", "tcp", "mac", bytesAsString(&mac, 6));
  Serial.println("mDNS responder started");

  // Start the OTA updater
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

  pinMode(LED_DATA_PIN, OUTPUT);
  pinMode(VENT_FAN_PIN, OUTPUT);
  pinMode(RECIRCULATION_FAN_PIN, OUTPUT);

  if (!sht4.begin()) {
    Serial.println("Couldn't find SHT4x");
  }
  sht4.setPrecision(SHT4X_HIGH_PRECISION);
  sht4.setHeater(SHT4X_NO_HEATER);
  Serial.println("Sensors initialized");

  configTime(GMT_OFFSET_SEC, DAYLIGHT_OFFSET_SEC, "pool.ntp.org");
  Serial.println("Time syncronized");

  strip.begin();
  strip.clear();
  strip.show();
  Serial.println("Lights initialized");

  this->getLastCoopState();

  Serial.println("Coop initiated successfully");
}

std::string Coop::encodeCoopState(CoopState state) {
    uint8_t buffer[CoopState_size];
    pb_ostream_t stream = pb_ostream_from_buffer(buffer, CoopState_size);
    if (!pb_encode(&stream, CoopState_fields, &state)) {
        Serial.println("Encoding failed!");
        Serial.println(PB_GET_ERROR(&stream));
        return "";
    }
    Serial.printf("Encoded state. Bytes written: %d\n", stream.bytes_written);
    std::string encoded = base64_encode(buffer, stream.bytes_written);
    return encoded;
}

bool Coop::decodeCoopState(CoopState *state, uint8_t *data, size_t len) {
    pb_istream_t stream = pb_istream_from_buffer(data, len);
    if (!pb_decode(&stream, CoopState_fields, state)) {
        Serial.println("Decoding failed!");
        Serial.println(PB_GET_ERROR(&stream));
        return false;
    }
    return true;
}

// Define routing
void Coop::restServerRouting() {
    server.on("/GetCoopState", HTTP_GET, [](AsyncWebServerRequest *request) {
      Serial.println("Get state");
      CoopState state = coop.getCoopState();
      std::string encoded = coop.encodeCoopState(state);
      request->send(200, "application/grpc-web-text", encoded.c_str());
    });

    server.on("/SetCoopState", HTTP_POST, [](AsyncWebServerRequest *request) {
      // THIS IS INTENTIONALLY BLANK DON'T DELETE
      // This REST library is dog shit
    }, NULL, [](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total) {
      CoopState newCoopState = CoopState_init_zero;
      if (!coop.decodeCoopState(&newCoopState, data, len)) {
        Serial.println("Failed to decode state. Just responding with current state.");
        CoopState state = coop.getCoopState();
        std::string encoded = coop.encodeCoopState(state);
        request->send(200, "application/grpc-web-text", encoded.c_str());
        return;
      }
      Serial.println("Decoded state");
      CoopState updatedCoopState = coop.setCoopState(newCoopState);
      Serial.println("Returning state:");
      Serial.printf("Lights: %d\n", updatedCoopState.lights);
      Serial.printf("Recirculation fan: %d\n", updatedCoopState.recirculationFan);
      Serial.printf("Vent fan: %d\n", updatedCoopState.ventFan);

      std::string encoded = coop.encodeCoopState(updatedCoopState);
      request->send(200, "application/grpc-web-text", encoded.c_str());
    });
}

/**
 * The main loop of the coop.
 */
void Coop::loop() {
    if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Lost connection to WiFi, restarting");
    delay(1000);
    ESP.restart();
  }
  this->ensureLights();

  if (rampDelayTimer > 5000) {
    this->rampBrightness(1.0);
    rampDelayTimer = 0;
  }

  // Once every 5 seconds, read the sensors
  if (sensorTimer > 5000) {
    this->readSensors();
    Serial.printf("Temperature: %f C\n", this->state.temperature);
    Serial.printf("Humidity: %f %%\n", this->state.humidity);
    sensorTimer = 0;
  }


  // sensors.requestTemperatures();
  // if (sensors.hasAlarm(thermometer)) {
  //   float temperature = sensors.getTempC(thermometer);
  //   if (temperature >= 26 && !this->state.ventFan && !this->state.ventOverridden) {
  //     Serial.println("High temperature alarm triggered. Turning on vent fans");
  //     digitalWrite(VENT_FAN_PIN, HIGH);
  //     this->state.ventFan = true;
  //     this->state.ventFanLast = time(NULL);
  //   } else if (temperature <= 24 && this->state.ventFan && !this->state.ventOverridden) {
  //     Serial.println("Low temperature alarm triggered. Turning off vent fans");
  //     digitalWrite(VENT_FAN_PIN, LOW);
  //     this->state.ventFan = false;
  //   }
  // }
  // ArduinoOTA.handle();
}

/**
 * Ensurelights ensures that the lights are on or off if they are supposed to be based on the light timer.
 */
void Coop::ensureLights() {
  if (!this->state.has_lightsTiming || this->state.lightsOverridden) return;

  // Calculate seconds since the beginning of the day
  time_t now = time(nullptr);
  struct tm *timeinfo = localtime(&now);
  int secondsSinceMidnight = timeinfo->tm_hour * 3600 + timeinfo->tm_min * 60 + timeinfo->tm_sec;

  if (secondsSinceMidnight >= this->state.lightsTiming.start.seconds && secondsSinceMidnight <= this->state.lightsTiming.end.seconds) {
    if (!this->state.lights) {
      Serial.println("Turning on lights");
      strip.fill(this->lightColor);
      this->setBrightness(this->state.maxAutomationBrightness);
      this->state.lights = true;
    }
  } else {
    if (this->state.lights) {
      Serial.println("Turning off lights");
      strip.clear();
      this->setBrightness(0);
      this->state.lights = false;
    }
  }

  strip.show();
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
CoopState Coop::getLastCoopState() {
  Serial.println("Getting last state from EEPROM...");

  // Retrieve state from EEPROM
  CoopState state;
  state = CoopState_init_default;
  EEPROM.get(0, state);

  Serial.println("Previous state received. Setting...");
  this->setCoopState(state);
  return state;
}

/**
 * Ramps the brightness of the lights if the current time
 * matches the light timing schedule stored in the state
 */
void Coop::rampBrightness(float period) {
  if (!this->state.has_lightsTiming || this->state.lightsOverridden) return;

  // Lights not overridden so ensure brightness amount (state only) matches the current brightness level for consistency in the UI
  this->state.brightness = strip.getBrightness();

  // Calculate seconds since the beginning of the day
  time_t now = time(nullptr);
  struct tm *timeinfo = localtime(&now);
  int secondsSinceMidnight = timeinfo->tm_hour * 3600 + timeinfo->tm_min * 60 + timeinfo->tm_sec - 60; // subtract 1 minute to account for the delay in the loop

  if (secondsSinceMidnight >= this->state.lightsTiming.start.seconds && secondsSinceMidnight <= this->state.lightsTiming.end.seconds) {
    if (isnan(this->rampBrightnessAmount)) {
      Serial.println("rampBrightnessAmount is nan. Initializing.");
      this->rampBrightnessAmount = 0.0;
      this->rampTimer = 0;
    }

    if (this->rampTimer >= 1000) {
      int secondsBetweenStartAndEnd = this->state.lightsTiming.end.seconds - this->state.lightsTiming.start.seconds;
      int secondsFromStart = secondsSinceMidnight - this->state.lightsTiming.start.seconds;
      int secondsToEnd = secondsBetweenStartAndEnd - secondsFromStart;
      float rampDuration = secondsBetweenStartAndEnd * (this->state.rampPercentage / 100 / 2);

      if (!rampDuration || period == 0 || rampDuration == 0) {
        if (!this->state.lights) {
          this->setBrightness(this->state.maxAutomationBrightness);
        }
        return;
      }

      float stepSize = (this->state.maxAutomationBrightness - MINIMUM_BRIGHTNESS_PERCENT) / rampDuration / period; // Subtract the minimum brightness amount to compensate for hardware limitations
      bool shouldRampUp = secondsFromStart <= rampDuration;
      bool shouldRampDown = secondsToEnd <= rampDuration;
      if (shouldRampUp) {
        this->rampBrightnessAmount = (secondsFromStart * stepSize);
      } else if (shouldRampDown) {
        this->rampBrightnessAmount = (secondsToEnd * stepSize);
      } else {
        this->rampBrightnessAmount = this->state.maxAutomationBrightness;
      }

      Serial.printf("Ramping brightness to %f\n", this->rampBrightnessAmount);
      this->setBrightness(this->rampBrightnessAmount);
      this->rampTimer = 0;
    }
  } else {
    if (!isnan(this->rampBrightnessAmount)) {
      Serial.printf("Turning off lights. rampBrightnessAmount set to 0\n");
      this->rampBrightnessAmount = NAN;
      this->rampTimer = 0;
      this->setBrightness(0);
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
void Coop::setBrightness(float brightness) {
  Serial.printf("Got brightness: %f\n", brightness);
  if (brightness == 0.0) {
    Serial.println("Brightness of 0. Turning off lights");
    strip.clear();
    strip.setBrightness(0);
    this->state.lights = false;
    this->state.brightness = 0;
    this->rampBrightnessAmount = NAN;
    strip.show();
    return;
  }

  strip.setBrightness((uint8_t)brightness);
  strip.fill(this->lightColor);
  this->state.lights = true;
  this->state.brightness = brightness;
  strip.show();
};

/**
 * Retrieves the current state of the coop and updates the sensor data
 * 
 * @return CoopState The current coop state
 */
CoopState Coop::getCoopState() { 
  this->readSensors();
  this->state.timestamp = time(NULL);
  return this->state;
};

/**
 * Sets the state of the coop based on a recieved CoopState protobuf
 * 
 * @param state The new CoopState protobuf to set the coop to
 * @return CoopState The new uC internal state of the coop. Should be the same as the state passed in.
 */
CoopState Coop::setCoopState(CoopState state) {
  Serial.println("Setting state");
  // Find which hardware values have changed so we can act upon them
  boolean lights = state.lights != this->state.lights;
  boolean brightness =
      state.brightness != this->state.brightness;
  boolean recirculationFan = state.recirculationFan != this->state.recirculationFan;
  boolean ventFan = state.ventFan != this->state.ventFan;
  boolean color = state.red != this->state.red || state.green != this->state.green || state.blue != this->state.blue || state.white != this->state.white;

    if (color) {
    this->state.red = state.red;
    this->state.green = state.green;
    this->state.blue = state.blue;
    this->state.white = state.white;

    this->lightColor = strip.Color(state.red, state.green, state.blue, state.white);
    if (state.lights) {
      strip.fill(this->lightColor);
      strip.show();
    }
  }

  if (lights) {
    Serial.printf("Setting lights on pin %d to %d\n", LED_DATA_PIN, state.lights);
    if (state.lights) {
      strip.fill(this->lightColor);
      state.lightsLast = time(NULL);
      if (state.brightness <= 10) {
        state.brightness = this->state.maxAutomationBrightness;
      }
      this->setBrightness(state.brightness);
    } else {
      strip.clear();
      this->setBrightness(0);
    }
  }

  if (brightness) {
    Serial.printf("Setting brightness to %f\n", state.brightness);
    this->setBrightness(state.brightness);
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
void Coop::readSensors() {
  sensors_event_t humidity, temp;
  sht4.getEvent(&humidity, &temp);
  
  // convert temp.temperature to celsius
  float tempC = temp.temperature;
  this->state.temperature = tempC;

  // Get and store the current humidity
  this->state.humidity = humidity.relative_humidity;
  this->state.timestamp = time(NULL);

  if (tempC >= FAN_ON_TEMP && !this->state.ventFan && !this->state.ventOverridden) {
    Serial.println("High temperature alarm triggered. Turning on vent fans");
    digitalWrite(VENT_FAN_PIN, HIGH);
    this->state.ventFan = true;
    this->state.ventFanLast = time(NULL);
  } else if (tempC <= FAN_OFF_TEMP && this->state.ventFan && !this->state.ventOverridden) {
    Serial.println("Low temperature alarm triggered. Turning off vent fans");
    digitalWrite(VENT_FAN_PIN, LOW);
    this->state.ventFan = false;
  }
}