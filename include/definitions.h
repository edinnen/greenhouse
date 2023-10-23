#ifndef DEFINITIONS_H
#define DEFINITIONS_H
#include <cmath>

/**
 * Pin definitions
 */
#define LED_SSR_PIN 21
#define LED_DIMMER_ZONE_1 14
#define LED_DIMMER_ZONE_2 32
#define RECIRCULATION_FAN_PIN 15
#define VENT_FAN_PIN 33
#define PUMP_PIN 33
#define DHT_PIN 4 // A5
#define CAPACITIVE_PIN A3
#define ONE_WIRE_BUS 5 // sck

/**
 * Sensor definitions
 */
#define DHTTYPE DHT11
#define PWM_MAX_DUTY_CYCLE 1023.0
#define TEMPERATURE_PRECISION 11
#define TEMPERATURE_VENT_TRIGGER_SPREAD 1

/**
 * Light automation ramping settings
 */
// Hour and a half in seconds
#define DEFAULT_BRIGHTNESS 75
#define MINIMUM_BRIGHTNESS_PERCENT 10

/**
 * Constants
 */
const int PWM_FREQUENCY = 1000;
const int PWM_CHANNEL = 0;
const int PWM_RESOLUTION = 10;
const int MAX_DUTY_CYCLE = (int)(pow(2, PWM_RESOLUTION) - 1);
const long GMT_OFFSET_SEC = -8 * 3600;
const int DAYLIGHT_OFFSET_SEC = 3600;

#endif