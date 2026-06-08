#include <NewPing.h>

#define TRIG_PIN 22
#define ECHO_PIN 23
#define MAX_DISTANCE 200
#define ID_SCAFFALE 1

NewPing sonar(TRIG_PIN, ECHO_PIN, MAX_DISTANCE);

void setup() {
  Serial.begin(9600);
}

void loop() {
  delay(500);
  int distanza = sonar.ping_cm();

  if (distanza > 0) {
    Serial.print("{\"id_scaffale\":");
    Serial.print(ID_SCAFFALE);
    Serial.print(",\"distanza\":");
    Serial.print(distanza);
    Serial.println("}");
  }
}