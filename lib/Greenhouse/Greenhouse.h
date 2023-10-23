#pragma once
#include "greenhouse.pb.h"
#include <ESPAsyncWebServer.h>
#include <WiFiClient.h>
#include <pb_decode.h>
#include <pb_encode.h>
#include <elapsedMillis.h>
#include "definitions.h"

#ifndef GREENHOUSE_H
#define GREENHOUSE_H 
#define MAX_TIMESERIES 100

typedef struct {
    State states[MAX_TIMESERIES];
    int32_t states_count;
} StateList;
void Statelist_addState(StateList *list, State state);
#endif

void printTime();

class Greenhouse {
public:
  Greenhouse() {
    this->state = State_init_zero;
    this->state.maxAutomationBrightness = DEFAULT_BRIGHTNESS;
    this->rampBrightnessAmount = NAN;
    this->rampStepSize = 0;
    this->rampTimer = 0;
  };

  State state;
  float rampBrightnessAmount;
  float rampStepSize;
  elapsedMillis rampTimer;

  void init();
  void restServerRouting();
  bool decodeState(State *state, uint8_t *data, size_t len);
  std::string encodeState(State state);

  void loop();

  void lightTimer();
  void rampBrightness(float period);
  void ensureLights();

  void setBrightness(float brightness, int pwmZone);

  State getState();
  State setState(State state);
  State getLastState();
  Timing getLightTiming();

  void getTimeseries(int from, int to, StateList *stateList);

private:
  void readSensors();
};

// Ensure that the greenhouse class is globally accessible
extern Greenhouse greenhouse;