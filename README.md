Smart Warehouse — Sistema di Gestione Magazzino IoT

Monitoraggio in tempo reale di un magazzino tramite sensori ultrasonici IoT, MQTT e dashboard web


Documentazione disponibile solo in italiano.



Screenshot
Screenshot delle pagine presenti nella cartella [Screenshot Pagina](Screenshot%20Pagina/)


Indice


Come iniziare
Come contribuire
Manutenzione
Test
Licenza



Come iniziare

Il progetto è composto da tre parti che lavorano insieme:


Backend (questo repository): server Node.js/Express che espone le API REST, gestisce il database MariaDB e ascolta i messaggi MQTT provenienti dai sensori.
Frontend: pagine web statiche (HTML/CSS/JS) servite direttamente dal backend, per consultare e gestire prodotti, scaffali e movimenti.
Node-RED: flusso separato, gestito da un altro membro del team, che riceve i dati via MQTT e alimenta una dashboard di monitoraggio dedicata.


Dipendenze

Software richiesto sulla macchina prima di iniziare:

Software: Node.js (v18+) e npm
Ruolo: Esecuzione del server backend

Software: MariaDB
Ruolo: Database relazionale

Software: Broker MQTT (es. Mosquitto)
Ruolo: Comunicazione con i sensori

Software: Node-RED (opzionale)
Ruolo: Dashboard aggiuntiva, gestita separatamente

Pacchetti npm installati automaticamente (vedi package.json):

Pacchetto: express
Versione: ^5.2.1
Uso nel progetto: Server web e gestione delle rotte

Pacchetto: mysql2
Versione: ^3.22.4
Uso nel progetto: Connessione al database MariaDB

Pacchetto: cors
Versione: ^2.8.6
Uso nel progetto: Gestione delle richieste cross-origin

Pacchetto: express-session
Versione: ^1.19.0
Uso nel progetto: Gestione della sessione utente dopo il login

Pacchetto: bcrypt
Versione: ^6.0.0
Uso nel progetto: Hashing sicuro delle password

Pacchetto: mqtt
Versione: ^5.15.1
Uso nel progetto: Connessione al broker MQTT per ricevere i dati dai sensori

Pacchetto: dotenv
Versione: ^17.4.2
Uso nel progetto: Caricamento delle variabili d'ambiente dal file .env

Pacchetto di sviluppo (non richiesto per l'esecuzione, solo per i test):

Pacchetto: jest
Versione: ^30.4.2
Uso nel progetto: Framework di test, usato da utils.test.js

Come installare:


Clona il repository (i comandi successivi per l'installazione vanno eseguiti da gestione_magazzino/Backend/ dentro il repository clonato):


   git clone https://github.com/jonathan2004-git/smart-warehouse.git
   cd smart-warehouse/gestione_magazzino/Backend


Installa le dipendenze:


   npm install


Crea il database e, in seguito, seguendo i comandi che trovi in
[schema.sql](gestione_magazzino/Backend/schema.sql) (incluso in questo repository), crei le tabelle, contiene le istruzioni CREATE TABLE per tutte e sei le tabelle:


   mysql -u nome_utente_mariadb -p nome_database 

Ogni installazione può usare il proprio nome utente e la propria password MariaDB, definiti nel passo successivo tramite .env — lo schema non contiene credenziali.


Crea un file .env nella cartella Backend:


   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=tuo_nome_utente_mariadb
   DB_PASS=tua_password_mariadb
   DB_NAME=nome_database_creato


Avvia MariaDB e il broker MQTT, poi avvia il server:


   node express.js

Output atteso in console:

   Connesso con successo al database MariaDB!
   Connesso al broker MQTT
   --- Server avviato con successo ---
   Pagina web: http://192.168.0.218:3000/login.html

L'indirizzo IP e la porta sono attualmente definiti come costanti (IP_LOCALE, PORT) direttamente in express.js: se il server viene eseguito su una macchina diversa, vanno aggiornati manualmente prima dell'avvio.

Documentazione

Schema del database

Il database magazzino è composto da 6 tabelle collegate tra loro tramite chiavi esterne. Le istruzioni SQL complete per crearle sono disponibili in [schema.sql](gestione_magazzino/Backend/schema.sql)

Tabella: utenti
Primary key: id
Descrizione: Account abilitati all'accesso al sistema

Tabella: prodotti
Primary key: id_prodotto
Descrizione: Anagrafica degli articoli gestiti

Tabella: scaffali
Primary key: id_scaffale (varchar)
Descrizione: Punti di stoccaggio fisici, monitorati dai sensori

Tabella: letture_sensore
Primary key: id_lettura
Descrizione: Storico grezzo delle misurazioni ricevute via MQTT

Tabella: movimenti
Primary key: id_movimento
Descrizione: Storico delle entrate/uscite/errori di magazzino

Tabella: prodotti_scaffali
Primary key: id_prodotto + id_scaffale
Descrizione: Associazione tra un prodotto e lo scaffale su cui si trova


Relazioni e comportamento delle eliminazioni a catena (nel codice esistono cancellazioni manuali prima di alcune DELETE):


prodotti_scaffali → prodotti: ON DELETE CASCADE — eliminando un prodotto, l'associazione allo scaffale viene rimossa automaticamente dal database.

prodotti_scaffali → scaffali: ON DELETE CASCADE — stesso comportamento eliminando uno scaffale.

letture_sensore → scaffali: nessuna clausola (default RESTRICT) — il database impedirebbe l'eliminazione di uno scaffale finché esistono letture collegate; per questo la rotta DELETE /api/scaffali/:id cancella prima manualmente le letture.

movimenti → scaffali: ON DELETE SET NULL — eliminando uno scaffale, il campo id_scaffale dei movimenti collegati verrebbe impostato a NULL anziché essere cancellato; il backend però cancella comunque questi movimenti manualmente prima di procedere.

movimenti → prodotti: nessuna clausola (default RESTRICT) — il database impedirebbe l'eliminazione di un prodotto finché esistono movimenti collegati; per questo la rotta DELETE /api/prodotti/:id cancella prima manualmente i movimenti.

prodotti_scaffali.id_prodotto ha inoltre un vincolo UNIQUE (uq_id_prodotto) oltre alla chiave primaria composta: un prodotto può essere associato a un solo scaffale alla volta.


Lo schema Entità-Relazione completo, con la descrizione dettagliata di ogni campo, la trovi in [Schema ER MYSQL.md](docs/Schema%20ER%20MYSQL.md); la definizione SQL esatta di ogni colonna e vincolo è invece consultabile direttamente in
[schema.sql](gestione_magazzino/Backend/schema.sql)

Come funziona il flusso dati


1- Il sensore ultrasonico misura la distanza tra sé e il primo ostacolo (il prodotto sullo scaffale, o il fondo se vuoto).
2- Il dato viene pubblicato su un topic MQTT e ricevuto da mqtt/listener.js.
3- Il listener:

    crea automaticamente lo scaffale se non esiste ancora;

    classifica lo stato dello scaffale (pieno, parziale, vuoto) in base alla distanza;

    scarta le letture duplicate ricevute entro 3 secondi con lo stesso valore;
    salva la lettura in letture_sensore;

    confronta la lettura nuova con la precedente per calcolare pezzi aggiunti/rimossi, registrando il movimento in movimenti;

    se la distanza è fisicamente impossibile (oltre la profondità dello scaffale, o negativa), registra un movimento di tipo errore;

    se il messaggio include un prodotto, aggiorna l'associazione prodotto-scaffale.



4- Il frontend interroga periodicamente le API REST per mostrare i dati aggiornati (polling, non websocket).


API Reference

Tutte le rotte sotto /api/... richiedono una sessione attiva (login). Le pagine .html diverse da login.html, password.html e username.html sono protette da un middleware che reindirizza al login chi non è autenticato.
Per una descrizione dettagliata, riga per riga, della logica di
express.js, consulta la [Relazione file js.md](src/Relazione%20file%20js.md)

Autenticazione (routes/auth.js)

Metodo: POST
Endpoint: /login
Descrizione: Verifica le credenziali e crea la sessione
Body: { username, password }

Metodo: GET
Endpoint: /logout
Descrizione: Distrugge la sessione corrente

Metodo: GET
Endpoint: /api/utenti
Descrizione: Elenco username (autocomplete login)

Metodo: POST
Endpoint: /api/password
Descrizione: Cambia la password
Body: { username, vecchia_password, nuova_password }

Metodo: POST
Endpoint: /api/username
Descrizione: Cambia lo username
Body: { username, password, nuovo_username }

Prodotti (routes/prodotti.js)

Metodo:GET
Endpoint: /api/prodotti
Descrizione: Elenco prodotti

Metodo: POST
Endpoint: /api/prodotti
Descrizione: Crea un prodotto
Body: { nome, descrizione, misura }

Metodo: PUT
Endpoint: /api/prodotti/:id
Descrizione: Aggiorna un prodotto
Body. { nome, descrizione, misura }

Metodo: DELETE
Endpoint: /api/prodotti/:id
Descrizione: Elimina un prodotto e i movimenti collegati

Scaffali e associazioni (routes/scaffali.js)

Metodo:GET
Endpoint: /api/scaffali
Descrizione: Scaffali con ultima lettura e quantità calcolata

Metodo: POST
Endpoint: /api/scaffali
Descrizione: Crea uno scaffale manualmente
Body: { id_scaffale, posizione, stato }

Metodo: PUT
Endpoint: /api/scaffali/:id
Descrizione: Aggiorna posizione/profondità/nome
Body: { posizione, profondita, nome_scaffale }

Metodo: DELETE
Endpoint: /api/scaffali/:id
Descrizione: Elimina uno scaffale e i dati collegati

Metodo: GET
Endpoint: /api/prodotti_scaffali
Descrizione: Elenco associazioni prodotto-scaffale

Metodo: POST
Endpoint: /api/prodotti_scaffali
Descrizione: Associa un prodotto a uno scaffale
Body: { id_prodotto, id_scaffale }

Metodo: DELETE
Endpoint: /api/prodotti_scaffali/:id_prodotto/:id_scaffale
Descrizione: Rimuove un'associazione

Movimenti (routes/movimenti.js)

Metodo: GET
Endpoint: /api/movimenti
Descrizione: Storico movimenti (max 100), filtrabile
Query: id_scaffale, data_da, data_a

Metodo: POST
Endpoint: /api/movimenti
Descrizione: Inserimento manuale di un movimento
Body: { id_prodotto, tipo_movimento, quantita }

Sensori (routes/sensori.js)

Metodo: GET
Endpoint: /api/letture_sensore
Descrizione: Ultime 5 letture

Metodo: GET
Endpoint: /api/sensor/latest
Descrizione: Ultima lettura per ciascuno scaffale

Metodo: GET
Endpoint: /api/sensor/history
Descrizione: Ultime N letture, filtrabili
Query: n (max 100), id_scaffale

Metodo: GET
Endpoint: /api/sensor/chart
Descrizione: Letture delle ultime 24h per uno scaffale
Query: id_scaffale (obbligatorio)

Sistema (routes/sistema.js)

Metodo: GET
Endpoint: /api/health
Descrizione: Raggiungibilità del database

Metodo: GET
Endpoint: /api/sensore/stato
Descrizione: Stato online/offline del sensore

Metodo: GET
Endpoint: /api/errore/payload
Descrizione: Ultimo errore di parsing MQTT

Metodo: GET
Endpoint: /api/sensor/timestamp
Descrizione: Timestamp dell'ultima lettura MQTT

Link a documentazione esterna

- [Documentazione Express.js](https://expressjs.com/it/)
- [Documentazione mysql2](https://github.com/sidorares/node-mysql2)
- [Documentazione MQTT.js](https://github.com/mqttjs/MQTT.js)
- [Documentazione bcrypt (npm)](https://www.npmjs.com/package/bcrypt)
- [Sito ufficiale MariaDB](https://mariadb.org/documentation/)
- [Sito ufficiale Node-RED](https://nodered.org/docs/)


Come contribuire

Il progetto nasce come lavoro scolastico realizzato in coppia; questa sezione descrive comunque come strutturare eventuali contributi futuri.

Installare le dipendenze di sviluppo

Non è previsto al momento un ambiente di test o linting separato oltre alle dipendenze elencate in Dipendenze. Per proporre modifiche è sufficiente seguire i passaggi della sezione Come installare.


Community

Code of conduct

Le regole di collaborazione tra i membri del team seguono le indicazioni fornite dal percorso didattico ITS Alto Adriatico.

Responsible Disclosure

Il progetto è a scopo didattico e non è distribuito in produzione pubblica. Eventuali vulnerabilità individuate (vedi anche Limitazioni note) possono essere segnalate direttamente agli autori del progetto.

Segnalazione bug e richieste di aiuto

Per segnalare un bug o richiedere assistenza, aprire una issue sul repository GitHub del progetto, descrivendo:


comportamento atteso e comportamento osservato;
pagina o endpoint API coinvolto;
eventuali messaggi di errore in console (browser e/o server).



Manutenzione

Il progetto è attualmente in fase di freeze funzionalità (versione v1.0): non sono previste nuove funzionalità, solo eventuale correzione di bug critici.

Limitazioni note e possibili miglioramenti


    Configurazione hardcoded: PORT, IP_LOCALE e il secret della sessione sono scritti direttamente in express.js invece che nel .env. Spostarli renderebbe il deploy su macchine diverse più semplice e sicuro.

    CORS aperto: app.use(cors()) accetta richieste da qualsiasi origine, senza restrizioni — accettabile in rete locale, da restringere in un contesto reale.

    Nessun rate limiting sulle API.

    Stato scaffale di default 'verde' a livello di database (colonna stato, default 'verde'): valore non più utilizzato dalla logica applicativa attuale (che usa pieno/parziale/vuoto) — la rotta POST /api/scaffali sovrascrive comunque questo default con 'vuoto', ma la definizione della colonna nello schema resta con il vecchio default.

    Comportamento asimmetrico delle associazioni prodotto-scaffale: un prodotto può stare su un solo scaffale alla volta (vincolo UNIQUE). Passando dalla pagina web, assegnare un prodotto a uno scaffale già occupato sostituisce quello precedente; passando dal flusso MQTT automatico, questa sostituzione non avviene allo stesso modo. Comportamento documentato più nel dettaglio nella relazione tecnica del progetto.

    File di backup residui: alcuni file .save generati dall'editor (es. sensore.html.save) sono ancora presenti nella cartella Frontend e andrebbero rimossi prima della pubblicazione definitiva.


Test
Il progetto include test automaticitramite Jest, eseguibili con:

   npm test

Il dettaglio dei test eseguiti è consultabile in [report_test.md](docs/report_test.md)


Licenza

Licenza generale

Progetto didattico realizzato nell'ambito del percorso ITS Alto Adriatico. Non è rilasciato sotto una licenza open source formale; l'uso è riservato agli scopi del corso, salvo diverso accordo con gli autori.

Autori e Copyright

Progetto sviluppato in collaborazione da due studenti del percorso ITS Alto Adriatico:


Backend, database e logica MQTT: (Sara Sperti)
Dashboard Node-RED e sensore: (Jonathan Patrick Gouba)


Licenze software dei componenti di terze parti

Il progetto utilizza le seguenti librerie open source, ciascuna rilasciata secondo la propria licenza (consultare il rispettivo pacchetto su npm per il testo completo):

express
mysql2
cors
express-session
bcrypt
mqtt
dotenv
jest (solo sviluppo/test)
bootstrap (CDN, solo frontend)
