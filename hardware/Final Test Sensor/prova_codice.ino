#define TRIG_PIN 22
#define ECHO_PIN 23

void setup() {
  Serial.begin(9600);

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
}

void loop() {

  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);

  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long durata = pulseIn(ECHO_PIN, HIGH);

  float distanza = durata * 0.034 / 2;

  Serial.print("Distanza: ");
  Serial.print(distanza);
  Serial.println(" cm");

  delay(500);
}