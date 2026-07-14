// variabili condivise tra le route REST e il listener MQTT
const stato = {
    ultimoAggiornamento: Date.now(),  // timestamp dell'ultima lettura ricevuta via MQTT
    statoSensore: 'online',          // 'online' o 'offline' — aggiornato dal watchdog Node-RED
    ultimoErrorePayload: null       // ultimo errore di parsing MQTT { messaggio, timestamp }
};

module.exports = stato;
