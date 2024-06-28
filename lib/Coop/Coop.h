#pragma once
#include "coop.pb.h"
#include <ESPAsyncWebServer.h>
#include <WiFiClient.h>
#include <pb_decode.h>
#include <pb_encode.h>
#include <elapsedMillis.h>
#include "definitions.h"

#ifndef COOP_H
#define COOP_H 
#define MAX_TIMESERIES 100

typedef struct {
    CoopState states[MAX_TIMESERIES];
    int32_t states_count;
} CoopStateList;
void CoopStatelist_addCoopState(CoopStateList *list, CoopState state);
#endif

void printTime();

class Coop {
public:
  Coop() {
    this->state = CoopState_init_zero;
    this->lightColor = 0;
    this->state.maxAutomationBrightness = DEFAULT_BRIGHTNESS;
    this->rampBrightnessAmount = NAN;
    this->rampStepSize = 0;
    this->rampTimer = 0;
  };

  CoopState state;
  uint32_t lightColor;
  float rampBrightnessAmount;
  float rampStepSize;
  elapsedMillis rampTimer;

  void init();
  void restServerRouting();
  bool decodeCoopState(CoopState *state, uint8_t *data, size_t len);
  std::string encodeCoopState(CoopState state);

  void loop();

  void lightTimer();
  void rampBrightness(float period);
  void ensureLights();

  void setBrightness(float brightness);

  CoopState getCoopState();
  CoopState setCoopState(CoopState state);
  CoopState getLastCoopState();
  CoopTiming getLightTiming();

  void getCoopTimeseries(int from, int to, CoopStateList *stateList);

private:
  void readSensors();
};

// Ensure that the coop class is globally accessible
extern Coop coop;