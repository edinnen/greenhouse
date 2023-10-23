#include "definitions.h"

#ifdef IS_GREENHOUSE
#include <Greenhouse.h>
Greenhouse greenhouse;

void setup() {
  greenhouse.init();
}

void loop() {
  greenhouse.loop();
}
#endif

#ifdef IS_IRRIGATION
#include <Irrigation.h>
Irrigation irrigation;

void setup() {
  irrigation.init();
}

void loop() {
  irrigation.loop();
}
#endif
