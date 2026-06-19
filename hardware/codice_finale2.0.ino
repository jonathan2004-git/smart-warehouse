#include <NewPing.h>
#define TRIG_PIN 22
#define ECHO_PIN 23
#define MAX_DISTANCE 200
#define ID_SCAFFALE 1
#define TOLLERANZA_CM 2
#define LETTURE_STABILI 3
NewPing sonar(TRIG_PIN, ECHO_PIN, MAX_DISTANCE);
int distanzaPrecedente = -1;
int contatoreStabilita = 0;
int ultimaDistanzaInviata = -1;
unsigned long ultimoInvio = 0;
const unsigned long INTERVALLO_HEARTBEAT = 5000;
void setup() {
  Serial.begin(9600);
}
void loop() {
  delay(500);
  int distanza = sonar.ping_median(5) / US_ROUNDTRIP_CM;
  if (distanza == 0) distanza = MAX_DISTANCE;
  if (abs(distanza - distanzaPrecedente) <= TOLLERANZA_CM) {
    contatoreStabilita++;
  } else {
    contatoreStabilita = 0;
  }
  distanzaPrecedente = distanza;
  if (contatoreStabilita < LETTURE_STABILI) {
    return;
  }
  bool valoreCambiato = abs(distanza - ultimaDistanzaInviata) > TOLLERANZA_CM;
  bool tempoScaduto = (millis() - ultimoInvio) >= INTERVALLO_HEARTBEAT;

  if (!valoreCambiato && !tempoScaduto) {
    return;
  }

  ultimaDistanzaInviata = distanza;
  ultimoInvio = millis();
  Serial.print("{\"id_scaffale\":");
  Serial.print(ID_SCAFFALE);
  Serial.print(",\"distanza\":");
  Serial.print(distanza);
  Serial.println("}");
}
