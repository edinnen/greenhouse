#include "Irrigation.h"
#include <time.h>
#include <elapsedMillis.h>
#include <pb_decode.h>
#include <pb_encode.h>
#include <WiFi.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <WiFiClient.h>
#include "irrigation.pb.h"
#include "definitions.h"
#include "base64.h"
#include <ESPmDNS.h>
#include <EEPROM.h>
// #include <ArduinoOTA.h>

char ssid[] = "Doncaster IoT";
char pass[] = "eViscoGo";
AsyncWebServer server(80);
String hostname = "IoP-";

#define SYSTEM_PSI 25
#define FLOW_RATE_L_PER_METER_HOUR 0.9463529

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

void Irrigation::init() {
    // Debug console
  Serial.begin(115200);

  EEPROM.begin(Irrigator_size * 2);

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
  hostname += "-irrigation";
  WiFi.setHostname(hostname.c_str());
  if (!MDNS.begin(hostname.c_str())) {
    Serial.println("Error setting up MDNS responder!");
    while(1) {
      delay(1000);
    }
  }
  MDNS.setInstanceName(hostname.c_str());
  MDNS.addService("http", "tcp", 80);
  MDNS.addServiceTxt("http", "tcp", "type", "2");
  MDNS.addServiceTxt("http", "tcp", "mac", bytesAsString(&mac, 6));
  Serial.println("mDNS responder started - " + hostname);

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

  
  configTime(GMT_OFFSET_SEC, DAYLIGHT_OFFSET_SEC, "pool.ntp.org");
  Serial.println("Time syncronized");

  this->getLastState();
  // loop over this->state.solenoids
  for (int i = 0; i < this->state.solenoids_count; i++) {
    pinMode(this->state.solenoids[i].pin, OUTPUT);
  }
  server.begin();

  Serial.println("Irrigator initiated successfully");
}

void Irrigation::loop() {
  // Check if we are still connected to WiFi
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Lost connection to WiFi, restarting");
    delay(1000);
    ESP.restart();
  }
  // ArduinoOTA.handle();

  time_t now = time(nullptr);
  this->shouldReleaseLockout(now);
  this->shouldIrrigate(now);
  this->calculateOverriddenDispensed();
}

void Irrigation::calculateOverriddenDispensed() {
  if (this->state.solenoids_count == 0) {
    return;
  }

  // Calculate the amount of water that has been dispensed for any overridden and on solenoid
  for (int i = 0; i < this->state.solenoids_count; i++) {
    if (!this->state.solenoids[i].override) {
      continue;
    }
    if (this->state.solenoids[i].state == Solenoid_State_ON) {
      if (this->state.solenoids[i].lastOverridden == 0) {
        this->state.solenoids[i].lastOverridden = millis();
      }

      int millisInHour = 3600000; // Hour in milliseconds

      // Calculate the number of millis since lastOverridden
      int milliseconds = millis() - this->state.solenoids[i].lastOverridden;

      float rate = FLOW_RATE_L_PER_METER_HOUR / millisInHour;
      float litresDispensed = this->state.solenoids[i].lengthOfSoakerHose * rate * milliseconds;
      this->state.solenoids[i].litresDispensed = litresDispensed;
    }
  }
}

void Irrigation::shouldReleaseLockout(time_t now) {
  // If it has been more than 24 hours since the lastLockout was set, release the lockout
  if (this->state.rainLockout && now - this->state.lastLockout > 24 * 60 * 60) {
    this->state.rainLockout = false;
    EEPROM.put(0, this->state);
    EEPROM.commit();
  }
}

void Irrigation::shouldIrrigate(time_t now) {
  if (this->state.solenoids_count == 0 || millis() < 5000) { // Wait for 5 seconds to ensure time is synced
    return;
  }

  // Get the current time
  struct tm *timeinfo = localtime(&now);
  int nowDayOfYear = timeinfo->tm_yday;
  int secondsSinceMidnight = timeinfo->tm_hour * 3600 + timeinfo->tm_min * 60 + timeinfo->tm_sec;


  // Check if we watered today already and if it's past the start time
  time_t lastWatered = this->state.lastWatered;
  struct tm *lastWateredTimeinfo = localtime(&lastWatered);
  int lastWateredDayOfYear = lastWateredTimeinfo->tm_yday;
  int halfDaySeconds = 43200;
  bool afterNoon = secondsSinceMidnight >= halfDaySeconds;
  bool shouldIrrigate = (
    lastWateredDayOfYear != nowDayOfYear &&
    secondsSinceMidnight >= this->state.timing &&
    !afterNoon &&
    !this->state.rainLockout
  );

  if (shouldIrrigate) {
    if (!this->state.irrigating) {
      this->waterTimer = 0;
      // Set litresDispensed for all solenoids to 0
      for (int i = 0; i < this->state.solenoids_count; i++) {
        this->state.solenoids[i].litresDispensed = 0;
      }
      this->state.irrigating = true;
      EEPROM.put(0, this->state);
      EEPROM.commit();
    }
    this->irrigate();
  } else {
    this->state.irrigating = false;
    // If any solenoid is on and not overridden turn it off
    for (int i = 0; i < this->state.solenoids_count; i++) {
      if (!this->state.solenoids[i].override && this->state.solenoids[i].state == Solenoid_State_ON) {
        Serial.println("Turning off solenoid " + String(i));
        this->state.solenoids[i].state = Solenoid_State_OFF;
        digitalWrite(this->state.solenoids[i].pin, LOW);
      }
    }
  }
}

void Irrigation::irrigate() {
  if (this->waterTimer % 1000 != 0) {
    // Only run every second
    return;
  }
  // Turn off all solenoids if we are in a rain lockout
  if (this->state.rainLockout) {
    for (int i = 0; i < this->state.solenoids_count; i++) {
      digitalWrite(this->state.solenoids[i].pin, LOW);
    }
    Serial.println("Rain lockout. Will not irrigate.");
    return;
  }

  // Loop over this->state.solenoids
  for (int i = 0; i < this->state.solenoids_count; i++) {
    if (
      this->state.solenoids[i].override ||
      this->state.solenoids[i].lengthOfSoakerHose <= 0 ||
      this->state.solenoids[i].litresToDispense <= 0 ||
      (this->state.solenoids[i].litresDispensed >= this->state.solenoids[i].litresToDispense && this->state.solenoids[i].state == Solenoid_State_ON)
    ) {
      Serial.println("Skipping solenoid " + String(i));
      continue; // Don't modify this solenoid's state
    }

    // Get the number of seconds since the irrigation start
    elapsedMillis milliseconds = this->waterTimer;
    int millisInHour = 3600000; // Hour in milliseconds

    // Calculate the amount of water dispensed so far
    float rate = FLOW_RATE_L_PER_METER_HOUR / millisInHour;
    float litresDispensed = this->state.solenoids[i].lengthOfSoakerHose * rate * milliseconds;

    if (litresDispensed >= this->state.solenoids[i].litresToDispense && this->state.solenoids[i].state == Solenoid_State_ON) {
      Serial.println("Solenoid " + String(i) + " is done. Turning off");
      digitalWrite(this->state.solenoids[i].pin, LOW);
      this->state.solenoids[i].state = Solenoid_State_OFF;
      this->state.solenoids[i].litresDispensed = this->state.solenoids[i].litresToDispense;
    } else if (litresDispensed < this->state.solenoids[i].litresToDispense && this->state.solenoids[i].state == Solenoid_State_OFF) {
      Serial.println("Solenoid " + String(i) + " is off. Turning on");
      digitalWrite(this->state.solenoids[i].pin, HIGH);
      this->state.solenoids[i].state = Solenoid_State_ON;
    }

    if (this->state.solenoids[i].state == Solenoid_State_ON) {
      Serial.printf("Litres dispensed solenoid %d: %f\n", i, litresDispensed);
      this->state.solenoids[i].litresDispensed = litresDispensed;
    }
  }

  // Check if all solenoids are off
  bool allSolenoidsOff = true;
  for (int i = 0; i < this->state.solenoids_count; i++) {
    if (this->state.solenoids[i].state != Solenoid_State_OFF) {
      allSolenoidsOff = false;
    }
  }

  // If all solenoids are off, set the lastWatered time to now
  if (allSolenoidsOff) {
    this->state.lastWatered = time(nullptr);
    this->state.irrigating = false;
    EEPROM.put(0, this->state);
    EEPROM.commit();
  }
}

#define MAX_SOLENOIDS 5

typedef struct {
  Solenoid solenoids[MAX_SOLENOIDS];
  int32_t solenoids_count;
} SolenoidList;

void SolenoidList_addSolenoid(SolenoidList *list, Solenoid solenoid) {
  if (list->solenoids_count < MAX_SOLENOIDS) {
    list->solenoids[list->solenoids_count] = solenoid;
    list->solenoids_count++;
  }
}

bool Solenoids_encode(pb_ostream_t *ostream, const pb_field_t *field, void *const *arg) {
  SolenoidList *solenoids = (SolenoidList*)*arg;

  for (int i = 0; i < solenoids->solenoids_count; i++) {
    if (!pb_encode_tag_for_field(ostream, field)) {
      const char *error = PB_GET_ERROR(ostream);
      Serial.printf("Error encoding solenoid: %s\n", error);
      return false;
    }

    if (!pb_encode_submessage(ostream, Solenoid_fields, &solenoids->solenoids[i])) {
      const char *error = PB_GET_ERROR(ostream);
      Serial.printf("Error encoding solenoid: %s\n", error);
      return false;
    }
  }

  return true;
}

bool Solenoid_decode(pb_istream_t *istream, const pb_field_t *field, void **arg) {
  SolenoidList *solenoids = (SolenoidList*)*arg;
  Solenoid solenoid;

  if (!pb_decode(istream, Solenoid_fields, &solenoid)) {
    const char *error = PB_GET_ERROR(istream);
    Serial.printf("Error decoding solenoid: %s\n", error);
    return false;
  }

  SolenoidList_addSolenoid(solenoids, solenoid);

  return true;
}

std::string Irrigation::encodeState(Irrigator state) {
    uint8_t buffer[Irrigator_size];
    pb_ostream_t stream = pb_ostream_from_buffer(buffer, Irrigator_size);
    if (!pb_encode(&stream, Irrigator_fields, &state)) {
        Serial.println("Encoding failed!");
        Serial.println(PB_GET_ERROR(&stream));
        return "";
    }
    // Serial.printf("Encoded state. Bytes written: %d\n", stream.bytes_written);
    std::string encoded = base64_encode(buffer, stream.bytes_written);
    return encoded;
}

bool Irrigation::decodeState(Irrigator *state, uint8_t *data, size_t len) {
    pb_istream_t stream = pb_istream_from_buffer(data, len);
    if (!pb_decode(&stream, Irrigator_fields, state)) {
        Serial.println("Decoding failed!");
        Serial.println(PB_GET_ERROR(&stream));
        return false;
    }
    return true;
}

void Irrigation::restServerRouting() {
    server.on("/GetState", HTTP_GET, [](AsyncWebServerRequest *request) {
      // Serial.println("Get state");
      Irrigator state = irrigation.getState();
      std::string encoded = irrigation.encodeState(state);
      request->send(200, "application/grpc-web-text", encoded.c_str());
    });

    server.on("/SetState", HTTP_POST, [](AsyncWebServerRequest *request) {
      // THIS IS INTENTIONALLY BLANK DON'T DELETE
      // This REST library is dog shit
    }, NULL, [](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total) {
      Irrigator newState = Irrigator_init_zero;
      if (!irrigation.decodeState(&newState, data, len)) {
        Serial.println("Failed to decode state. Just responding with current state.");
        Irrigator state = irrigation.getState();
        std::string encoded = irrigation.encodeState(state);
        request->send(200, "application/grpc-web-text", encoded.c_str());
        return;
      }
      Irrigator updatedState = irrigation.setState(newState);

      std::string encoded = irrigation.encodeState(updatedState);
      request->send(200, "application/grpc-web-text", encoded.c_str());
    });
}

/**
 * Makes a request to the Pi command server to get the last known state.
 * Once received, the uC state will be updated with the new state.
 * 
 * @return The new uC internal state
 */
Irrigator Irrigation::getLastState() {
  Serial.println("Getting last state from EEPROM...");

  // Retrieve state from EEPROM
  Irrigator state;
  state = Irrigator_init_default;
  EEPROM.get(0, state);
  if (state.id == -1) {
    Serial.println("No state found in EEPROM. Creating new state.");
    state = Irrigator_init_zero;
    state.id = 0;
    state.solenoids_count = 0;
    state.lastWatered = 0;
    state.timestamp = 0;
  }


  Serial.println("Previous state received. Setting...");
  this->setState(state, true);
  return state;
}

/**
 * Retrieves the current state of the greenhouse and updates the sensor data
 * 
 * @return State The current greenhouse state
 */
Irrigator Irrigation::getState() {
    this->state.timestamp = time(NULL);
    return this->state;
};

/**
 * Sets the state of the greenhouse based on a recieved State protobuf
 * 
 * @param state The new State protobuf to set the greenhouse to
 * @return State The new uC internal state of the greenhouse. Should be the same as the state passed in.
 */
Irrigator Irrigation::setState(Irrigator state, bool initial) {
  // Find which hardware values have changed so we can act upon them
  bool newSolenoids = state.solenoids_count != this->state.solenoids_count;
  if (newSolenoids) {
    Serial.println("Solenoids changed. Updating...");
    if (state.solenoids_count < this->state.solenoids_count) {
      // Create int array
      int oldPins[this->state.solenoids_count];
      for (int i = 0; i < this->state.solenoids_count; i++) {
        oldPins[i] = this->state.solenoids[i].pin;
      }

      // Create new int array
      int newPins[state.solenoids_count];
      for (int i = 0; i < state.solenoids_count; i++) {
        newPins[i] = state.solenoids[i].pin;
      }

      for (int i = 0; i < this->state.solenoids_count; i++) {
        // Check if the pin is in the new array
        bool found = false;
        for (int j = 0; j < state.solenoids_count; j++) {
          if (oldPins[i] == newPins[j]) {
            found = true;
            break;
          }
        }

        if (!found) {
          Serial.printf("Solenoid on pin %d was deleted. Writing low.\n", oldPins[i]);
          digitalWrite(oldPins[i], LOW);
        }
      }

    }
    for (int i = 0; i < state.solenoids_count; i++) {
      pinMode(state.solenoids[i].pin, OUTPUT);
    }
  }

  // Loop over state.solenoids
  for (int i = 0; i < state.solenoids_count; i++) {
    bool solenoidChanged = this->state.solenoids[i].state != state.solenoids[i].state;
    if (!solenoidChanged) {
      continue;
    }

    if (state.solenoids[i].override && state.solenoids[i].state == Solenoid_State_ON && !initial) {
      state.solenoids[i].litresDispensed = 0;
      state.solenoids[i].lastOverridden = 0;
    }

    if (state.solenoids[i].state == Solenoid_State_ON) {
      digitalWrite(state.solenoids[i].pin, HIGH);
    } else {
      digitalWrite(state.solenoids[i].pin, LOW);
    }
  }

  // Store the state locally and read our sensors before returning
  this->state = state;

  // Store state in EEPROM
  EEPROM.put(0, this->state);
  EEPROM.commit();

  return this->state;
}