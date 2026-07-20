#include <NewPing.h>
#include <MultiFuncShield.h>
#include <TimerOne.h>
#include <ArduinoJson.h>

#define TRIG_PIN 22
#define ECHO_PIN 23
#define MAX_DISTANCE 200
#define ID_SCAFFALE 1
#define TOLLERANZA_CM 2
#define LETTURE_STABILI 3
#define PROFONDITA_SCAFFALE 70
#define SOGLIA_PIENO (PROFONDITA_SCAFFALE / 3)
#define SOGLIA_VUOTO (2 * PROFONDITA_SCAFFALE / 3)

NewPing sonar(TRIG_PIN, ECHO_PIN, MAX_DISTANCE);

enum StatoScaffale { VUOTO, PARZIALE, PIENO };
int statoPrecedente = -1;

int distanzaPrecedente = -1;
int contatoreStabilita = 0;
int ultimaDistanzaInviata = -1;
unsigned long ultimoInvio = 0;
unsigned long ultimoKeepalive = 0;
const unsigned long INTERVALLO_HEARTBEAT = 5000;
String inputSeriale = "";

StatoScaffale calcolaStato(int distanza) {
  if (distanza <= SOGLIA_PIENO) return PIENO;
  if (distanza >= SOGLIA_VUOTO) return VUOTO;
  return PARZIALE;
}

void aggiornaLed(StatoScaffale stato) {
  MFS.writeLeds(LED_ALL, OFF);
  if (stato == PIENO) {
    MFS.writeLeds(LED_ALL, ON);
  } else if (stato == PARZIALE) {
    MFS.writeLeds(LED_1 | LED_2, ON);
  }
}

void setup() {
  Serial.begin(9600);
  Timer1.initialize();
  MFS.initialize();
  MFS.write(0);
  MFS.writeLeds(LED_ALL, OFF);
}

void loop() {
  while (Serial.available()) {
    char c = Serial.read();
    if (c == '\n') {
      StaticJsonDocument<200> doc;
      DeserializationError err = deserializeJson(doc, inputSeriale);
      if (!err) {
        int quantita = doc["quantita"];
        char buf[5];
        sprintf(buf, "%04d", quantita);
        MFS.write(buf);
        if (quantita == 1) {
          MFS.beep();
        }
      }
      inputSeriale = "";
    } else {
      inputSeriale += c;
    }
  }

  delay(500);
  int distanza = sonar.ping_median(5) / US_ROUNDTRIP_CM;
  if (distanza == 0) distanza = MAX_DISTANCE;

  if (abs(distanza - distanzaPrecedente) <= TOLLERANZA_CM) {
    contatoreStabilita++;
  } else {
    contatoreStabilita = 0;
  }
  distanzaPrecedente = distanza;

  if (contatoreStabilita < LETTURE_STABILI) return;

  StatoScaffale statoCorrente = calcolaStato(distanza);
  if (statoCorrente != statoPrecedente) {
    aggiornaLed(statoCorrente);
    if (statoCorrente == VUOTO) {
      MFS.beep();
    }
    statoPrecedente = statoCorrente;
  }

  bool valoreCambiato = abs(distanza - ultimaDistanzaInviata) > TOLLERANZA_CM;
  bool tempoScaduto = (millis() - ultimoInvio) >= INTERVALLO_HEARTBEAT;

  if (!valoreCambiato && !tempoScaduto) return;

  ultimaDistanzaInviata = distanza;
  ultimoInvio = millis();
  Serial.print("{\"id_scaffale\":");
  Serial.print(ID_SCAFFALE);
  Serial.print(",\"distanza\":");
  Serial.print(distanza);
  Serial.println("}");

  if (millis() - ultimoKeepalive >= 5000) {
    ultimoKeepalive = millis();
    Serial.println("{\"stato\":\"online\"}");
  }
}