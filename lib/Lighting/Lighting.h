#pragma once
#include "lighting.pb.h"
#include <ESPAsyncWebServer.h>
#include <WiFiClient.h>
#include <pb_decode.h>
#include <pb_encode.h>
#include <elapsedMillis.h>
#include "definitions.h"

#ifndef LIGHTING_H
#define LIGHTING_H
#define LED_PIN LED_BUILTIN
#endif

class Lighting {
  public:
    Lighting() {
      this->state = Light_init_zero;
    };

    Light state;

    void init();
    void restServerRouting();
    bool decodeState(Light *state, uint8_t *data, size_t len);
    std::string encodeState(Light state);

    void loop();

    Light getState();
    Light setState(Light state);
};

extern Lighting lighting;