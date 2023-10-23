#include "Lighting.h"
#include "definitions.h"
#include "lighting.pb.h"
#include <ESPAsyncWebServer.h>
#include <WiFiClient.h>
#include <pb_decode.h>
#include <pb_encode.h>
#include <EEPROM.h>
#include <ArduinoOTA.h>
#include <ESPmDNS.h>
#include <AsyncTCP.h>
#include "base64.h"
#include <WiFi.h>

char ssid[] = "Doncaster IoT";
char pass[] = "eViscoGo";
AsyncWebServer server(80);
String hostname = "IoP-";

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

void Lighting::init() {
    Serial.begin(115200);

    EEPROM.begin(Light_size * 2);

    WiFi.begin(ssid, pass);
    Serial.print("Connecting to WiFi");
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.print("Connected to the WiFi network as");
    Serial.println(WiFi.localIP());

    uint8_t mac;
    esp_efuse_mac_get_default(&mac);

    // Set hostname to partial MAC address and device type
    hostname += bytesAsString(&mac, 3);
    hostname += "-lighting";
    WiFi.setHostname(hostname.c_str());
    if (!MDNS.begin(hostname.c_str())) {
        Serial.println("Error setting up MDNS responder!");
        while (1) {
            delay(1000);
        }
    }
    MDNS.setInstanceName(hostname.c_str());
    MDNS.addService("http", "tcp", 80);
    MDNS.addServiceTxt("http", "tcp", "type", "3");
    MDNS.addServiceTxt("http", "tcp", "mac", bytesAsString(&mac, 6));
    Serial.println("mDNS responder started - " + hostname);

    // Start the OTA updater
    ArduinoOTA.onStart([]() {
        String type;
        if (ArduinoOTA.getCommand() == U_FLASH) {
        type = "sketch";
        } else { // U_FS
        type = "filesystem";
        }

        // NOTE: if updating FS this would be the place to unmount FS using FS.end()
        Serial.println("Start updating " + type);
    });
    ArduinoOTA.onEnd([]() {
        Serial.println("\nEnd");
    });
    ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
        Serial.printf("Progress: %u%%\r", (progress / (total / 100)));
    });
    ArduinoOTA.onError([](ota_error_t error) {
        Serial.printf("Error[%u]: ", error);
        if (error == OTA_AUTH_ERROR) {
        Serial.println("Auth Failed");
        } else if (error == OTA_BEGIN_ERROR) {
        Serial.println("Begin Failed");
        } else if (error == OTA_CONNECT_ERROR) {
        Serial.println("Connect Failed");
        } else if (error == OTA_RECEIVE_ERROR) {
        Serial.println("Receive Failed");
        } else if (error == OTA_END_ERROR) {
        Serial.println("End Failed");
        }
    });
    ArduinoOTA.begin();
    
    // Set server routing
    restServerRouting();

    server.onNotFound(notFound);

    Serial.println("Lighting initiated successfully");
}

void Lighting::loop() {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("Lost connection to WiFi, restarting");
        delay(1000);
        ESP.restart();
    }
    ArduinoOTA.handle();
}

std::string Lighting::encodeState(Light state) {
    uint8_t buffer[Light_size];
    pb_ostream_t stream = pb_ostream_from_buffer(buffer, Light_size);
    if (!pb_encode(&stream, Light_fields, &state)) {
        Serial.println("Encoding failed!");
        Serial.println(PB_GET_ERROR(&stream));
        return "";
    }
    // Serial.printf("Encoded state. Bytes written: %d\n", stream.bytes_written);
    std::string encoded = base64_encode(buffer, stream.bytes_written);
    return encoded;
}

bool Lighting::decodeState(Light *state, uint8_t *data, size_t len) {
    pb_istream_t stream = pb_istream_from_buffer(data, len);
    if (!pb_decode(&stream, Light_fields, state)) {
        Serial.println("Decoding failed!");
        Serial.println(PB_GET_ERROR(&stream));
        return false;
    }
    return true;
}

void Lighting::restServerRouting() {
    server.on("/GetState", HTTP_GET, [](AsyncWebServerRequest *request) {
      // Serial.println("Get state");
    //   Irrigator state = irrigation.getState();
    //   std::string encoded = irrigation.encodeState(state);
    //   request->send(200, "application/grpc-web-text", encoded.c_str());
    });

    server.on("/SetState", HTTP_POST, [](AsyncWebServerRequest *request) {
      // THIS IS INTENTIONALLY BLANK DON'T DELETE
      // This REST library is dog shit
    }, NULL, [](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total) {
    //   Irrigator newState = Irrigator_init_zero;
    //   if (!irrigation.decodeState(&newState, data, len)) {
    //     Serial.println("Failed to decode state. Just responding with current state.");
    //     Irrigator state = irrigation.getState();
    //     std::string encoded = irrigation.encodeState(state);
    //     request->send(200, "application/grpc-web-text", encoded.c_str());
    //     return;
    //   }
    //   Irrigator updatedState = irrigation.setState(newState);

    //   std::string encoded = irrigation.encodeState(updatedState);
    //   request->send(200, "application/grpc-web-text", encoded.c_str());
      request->send(200, "application/grpc-web-text", "Hi");
    });
}

Light Lighting::getState() {
    return this->state;
}

Light Lighting::setState(Light newState) {
    this->state = newState;

    switch (newState.type) {
        case Type_RGB:
            // Do RGB stuff
            break;
        case Type_RGBW:
            // Do RGBW stuff
            break;
        default:
            break;
    }
    return this->state;
}