EXPRESS.JS
È un server Node.js scritto con il framework Express che svolge tre compiti principali in contemporanea:

	Serve le pagine HTML del frontend;

	Espone un'API REST che il frontend usa per leggere e scrivere dati sul database 	MariaDB;

	Si connette al broker MQTT Mosquitto per ricevere in tempo reale i dati inviati 	dall'Arduino tramite Node-RED, elaborarli e salvarli nel database.

Librerie utilizzate:

dotenv: Legge le credenziali del database da un file .env nascosto, evitando di scrivere password nel codice;
express: Framework per creare il server web e definire le API REST;
mysql2: Driver per connettersi e fare query su MariaDB;
cors: Permette al frontend di fare richieste HTTP al backend anche da origini diverse
express-session: Gestisce le sessioni utente (login/logout);
mqtt: Permette al backend di connettersi al broker Mosquitto e ricevere i messaggi MQTT dall'Arduino;
path: Modulo Node.js standard per gestire i percorsi dei file.


Il file è organizzato in 5 blocchi logici:
	Setup e configurazioni iniziale;
	Connessione al database;
	Autenticazione;
	API REST;
	Listener MQTT.

Setup e configurazioni iniziale:
Carica le variabili d'ambiente dal file .env così le credenziali non sono mai scritte nel codice sorgente.

Connessione al database:
Il backend si connette a MariaDB usando le variabili lette da .env
La connessione avviene una sola volta all'avvio del server e rimane aperta per tutta la durata dell'esecuzione. Se la connessione fallisce, viene stampato un errore nel terminale ma il server continua ad avviarsi.

Autenticazione:
" authMiddleware " è una funzione di guardia che può essere applicata a qualsiasi rotta per renderla accessibile solo agli utenti autenticati. Se non c'è nessuna sessione attiva, redirige al login. La rotta di autenticazione (/pippo) serve per verificare che username e password corrispondano su tabella utenti per reindirizzare a
" Inventario.html " altrimenti lo reindirizza in /logout

API REST:
Ogni rotta riceve una richiesta http, esegue una query e restituisce il risultato in json.
Sia per la rotta " /api/prodotti " che la rotta " /api/scaffali " le query restituiscono quasi le stesse cose: GET restituisce i prodotti nel magazzino, POST crea un nuovo prodotto, PUT modifica le informazioni del prodotto e DELETE elimina il prodotto e i suoi movimenti.
La query GET " /api/scaffali " recupera solo l'ultima lettura e calola la quantità stimata.

Movimenti: GET restituisce gli ultimi 10 movimenti mentre POST permette di inserire manualmente un movimento (usato con Postman).

Prodotti-scaffali: GET mostra i prodotti associati agli scaffali, POST associa un prodotto ad uno scaffale e DELETE rimuove l'associazione.

Sensore: GET " /api/letture_sensore " restituisce le ultime 5 letture,
GET " /api/sensor/latest " restituisce l'ultima lettura per ogni scaffale,
GET " /api/sensor/history?n=N " restituisce le ultime n letture,
GET " /api/sensor/timestamp " restituisce l'ultimo aggiornamento, infine
POST " /api/sensore " è stato usato come test per creare uno scaffale tramite Postman.


Listener MQTT:
Gestisce la comunicazione in tempo reale con l'hardware, il backend si connette al broker Mosquitto in esecuzione sul Raspberry Pi e si mette in ascolto su tutti i topic del canale.
" classificaStato(distanza) " converte la distanza in cm in un'etichetta leggibile, nel nostro caso in "pieno", "parziale" o "vuoto"
Ignora i messaggi sul topic " magazzino/monitor " per evitare loop
Parsifica il payload JSON ricevuto da Node-RED/Arduino
Formatta l'ID scaffale nel formato standard (nel nostro caso S01)
Crea lo scaffale nel database se non esiste già
Aggiorna lo stato dello scaffale in base alla distanza
Salva la lettura con timestamp automatico
Calcola la quantità presente prima e dopo con la formula: FLOOR((profondita - distanza) / misura), se è positiva registra un'entrata ma se è negativa registra un'uscita di merce, invece se la distanza supera la profondità dello scaffale o è negativa registra "Errore"
Viene pubblicato un messaggio di conferma in " magazzino/monitor " e infine aggiorna con il timestamp.

Avvio del server sulla porta 3000.

Per essere sicuri che sia stato fatto nel modo corretto ho estrapolato la funzione 
" classificaStato " dal listener MQTT, creato un nuovo file chiamato " utils.test.js " con 6 casi di test che coprono gli scenari reali del sensore, usato JEST per fare il test e sono tutti andati a buon fine.

![Risultato unit test Jest](Unit-test.png)
