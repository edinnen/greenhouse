#pragma once
#include "irrigation.pb.h"
#include <ESPAsyncWebServer.h>
#include <WiFiClient.h>
#include <pb_decode.h>
#include <pb_encode.h>
#include <elapsedMillis.h>
#include "definitions.h"

#ifndef IRRIGATION_H
#define IRRIGATION_H
#define SOLENOID_PIN LED_BUILTIN
#endif

class Irrigation {
public:
    Irrigation() {
        this->state = Irrigator_init_zero;
        this->waterTimer = 0;
    };

    Irrigator state;
    elapsedMillis waterTimer;

    void init();
    void restServerRouting();
    bool decodeState(Irrigator *state, uint8_t *data, size_t len);
    std::string encodeState(Irrigator state);

    void loop();
    void shouldReleaseLockout(time_t now);
    void shouldIrrigate(time_t now);
    void irrigate();
    void calculateOverriddenDispensed();
    void setLockoutLED();

    Irrigator getState();
    Irrigator setState(Irrigator state, bool initial = false);
    Irrigator getLastState();
};

extern Irrigation irrigation;
