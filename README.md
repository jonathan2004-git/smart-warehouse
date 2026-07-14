# Smart Warehouse — Sistema di Gestione Magazzino IoT

Monitoraggio in tempo reale di un magazzino tramite sensori ultrasonici IoT, MQTT e dashboard web

*Documentazione disponibile solo in italiano.*

---

## Screenshot
Screenshot delle pagine presenti nella cartella [Screenshot Pagina](Screenshot%20Pagina/)

---

## Indice
1. [Come iniziare](#come-iniziare)
2. [Schema ER MYSQL](#schema-er-mysql)
3. [Come funziona il flusso dati](#come-funziona-il-flusso-dati)
4. [API Reference](#api-reference)
5. [Come contribuire](#come-contribuire)
6. [Manutenzione](#manutenzione)
7. [Test](#test)
8. [Licenza](#licenza)

---

## Come iniziare

Il progetto è composto da tre parti che lavorano insieme:

* **Backend (questo repository)**: server Node.js/Express che espone le API REST, gestisce il database MariaDB e ascolta i messaggi MQTT provenienti dai sensori.
* **Frontend**: pagine web statiche (HTML/CSS/JS) servite direttamente dal backend, per consultare e gestire prodotti, scaffali e movimenti.
* **Node-RED**: flusso separato, gestito da un altro membro del team, che riceve i dati via MQTT e alimenta una dashboard di monitoraggio dedicata.

### Dipendenze

Software richiesto sulla macchina prima di iniziare:

| Software | Ruolo |
| :--- | :--- |
| **Node.js (v18+) e npm** | Esecuzione del server backend |
| **MariaDB** | Database relazionale |
| **Broker MQTT (es. Mosquitto)** | Communication con i sensori |
| **Node-RED (opzionale)** | Dashboard aggiuntiva, gestita separatamente |

Pacchetti npm installati automaticamente (vedi `package.json`):

| Pacchetto | Versione | Uso nel progetto |
| :--- | :--- | :--- |
| **express** | `^5.2.1` | Server web e gestione delle rotte |
| **mysql2** | `^3.22.4` | Connessione al database MariaDB |
| **cors** | `^2.8.6` | Gestione delle richieste cross-origin |
| **express-session** | `^1.19.0` | Gestione della sessione utente dopo il login |
| **bcrypt** | `^6.0.0` | Hashing sicuro delle password |
| **mqtt** | `^5.15.1` | Connessione al broker MQTT per ricevere i dati dai sensori |
| **dotenv** | `^17.4.2` | Caricamento delle variabili d'ambiente dal file `.env` |

Pacchetto di sviluppo (non richiesto per l'esecuzione, solo per i test):

* **jest** (`^30.4.2`): Framework di test, usato da `utils.test.js`

### Come installare:

1. **Clona il repository** (i comandi successivi per l'installazione vanno eseguiti da `gestione_magazzino/Backend/` dentro il repository clonato):
   ```bash
   git clone [https://github.com/jonathan2004-git/smart-warehouse.git](https://github.com/jonathan2004-git/smart-warehouse.git)
   cd smart-warehouse/gestione_magazzino/Backend
Installa le dipendenze:

Bash
npm install
Crea il database e, in seguito, seguendo i comandi che trovi in schema.sql (incluso in questo repository), crei le tabelle. Contiene le istruzioni CREATE TABLE per tutte e sei le tabelle:

Bash
mysql -u nome_utente_mariadb -p nome_database
Ogni installazione può usare il proprio nome utente e la propria password MariaDB, definiti nel passo successivo tramite .env — lo schema non contiene credenziali.

Crea un file .env nella cartella Backend:

Snippet di codice
DB_HOST=localhost
DB_PORT=3306
DB_USER=tuo_nome_utente_mariadb
DB_PASS=tua_password_mariadb
DB_NAME=nome_database_creato
Avvia MariaDB e il broker MQTT, poi avvia il server:

Bash
node express.js
Output atteso in console:

Plaintext
Connesso con successo al database MariaDB!
Connesso al broker MQTT
--- Server avviato con successo ---
Pagina web: [http://192.168.0.218:3000/login.html](http://192.168.0.218:3000/login.html)
L'indirizzo IP e la porta sono attualmente definiti come costanti (IP_LOCALE, PORT) direttamente in express.js: se il server viene eseguito su una macchina diversa, vanno aggiornati manualmente prima dell'avvio.

Schema ER MYSQL
Il database magazzino è composto da 6 tabelle collegate tra loro tramite chiavi esterne. Le istruzioni SQL complete per crearle sono disponibili in schema.sql

1. Tabella prodotti
Dati generali, anagrafica degli articoli nel sistema

id_prodotto (INT): Identificativo univoco e numerico del prodotto. Viene incrementato automaticamente dal database a ogni nuovo inserimento, garantendo l'assenza di duplicati.

nome (VARCHAR 100): Il nome o titolo identificativo dell'articolo. È un campo obbligatorio con un limite di 100 caratteri.

descrizione (TEXT): Campo testuale facoltativo e senza limiti stringenti di lunghezza, utilizzato per inserire dettagli aggiuntivi o specifiche sul prodotto.

misura (DECIMAL 5,2): Valore numerico decimale opzionale che esprime la dimensione fisica. Questo dato è fondamentale per permettere all'algoritmo del backend di calcolare matematicamente quanti pezzi sono presenti basandosi sullo spazio residuo rilevato dal sensore IoT.

2. Tabella scaffali
Mappa i punti di stoccaggio fisici all'interno del magazzino

id_scaffale (VARCHAR 50): Identificativo univoco del singolo scaffale. Essendo chiave primaria, impedisce la creazione di scaffali duplicati nel sistema ed è inserito obbligatoriamente.

posizione (VARCHAR 100): Campo testuale opzionale utilizzato per descrivere la collocazione fisica dello scaffale all'interno dello stabilimento. Se non specificato dall'utente, il backend assegna un valore temporaneo di default.

stato (VARCHAR 20): Indica la condizione di riempimento dello scaffale. Ha un valore predefinito impostato su 'verde' e viene aggiornato automaticamente dal sistema in base ai dati ricevuti dai sensori IoT, assumendo valori legati alla logistica di stoccaggio.

profondita (DECIMAL 5,2): Valore numerico decimale che memorizza la profondità totale espressa in centimetri dello scaffale vuoto. Questo dato è essenziale poiché funge da punto di riferimento per l'algoritmo del server il sistema calcola lo spazio occupato dalla merce e determina la quantità di prodotti presenti, confrontando la profondità massima con la distanza rilevata dal sensore ultrasonico.

3. Tabella letture_sensore
Tramite il sensore in base alla distanza capiamo quanto è occupato, un registro storico che archivia tutti i dati grezzi trasmessi dai sensori tramite MQTT.

id_lettura (INT): È un contatore numerico progressivo generato automaticamente dal database per ogni nuova ricezione di dati, utile per indicizzare cronologicamente i messaggi del sensore.

id_scaffale (VARCHAR 50): Memorizza l'identificativo dello scaffale a cui appartiene il sensore che ha trasmesso il dato. La dicitura "MUL" nella colonna "Key" indica la presenza di un indice che collega questa tabella alla tabella principale degli scaffali, ottimizzando le query di ricerca dell'ultima lettura.

distanza_rilevata (DECIMAL 10,2): Il valore numerico inviato dal sensore. Rappresenta lo spazio vuoto misurato dal sensore tra se stesso e il primo ostacolo rilevato.

data_lettura (TIMESTAMP): Indica il momento esatto in cui la lettura viene registrata sul database. Se non specificato, il sistema inserisce in automatico la data e l'ora correnti del server, permettendo di tracciare la timeline degli eventi in tempo reale.

4. Tabella movimenti
Mostra i vari movimenti effettuati e da quale scaffale vengono eseguiti

id_movimento (INT): È un identificativo numerico progressivo generato automaticamente che, in modo univoco, cataloga ogni transazione logistica.

id_prodotto (INT): Memorizza l'identificativo del prodotto coinvolto nell'operazione. La dicitura "MUL" nella colonna "Key" indica un indice che collega il movimento all'anagrafica prodotti.

id_scaffale (VARCHAR 50): Identifica lo scaffale da cui la merce è stata prelevata o in cui è stata depositata. Anche questo campo ha dicitura "MUL" utilizzato per collegare il movimento allo scaffale

tipo_movimento (ENUM): Campo a scelta obbligata vincolato ai soli valori "entrata" o "uscita" o "errore". Definisce la natura del flusso logistico, dove "errore" identifica le letture anomale (nel caso in cui la lettura sia maggiore della profondità dello scaffale) che non corrisponde ad un reale movimento della merce.

quantita (INT): Il numero di pezzi movimentati durante la singola operazione. Questo valore viene utilizzato dal backend per aggiornare, per somma o sottrazione, la disponibilità complessiva.

data_movimento (TIMESTAMP): Registra il momento esatto in cui è avvenuta la transazione. Valorizzato automaticamente dal database con l'ora corrente del server, permette di ricostruire la cronologia dei flussi e alimentare la pagina dello storico delle movimentazioni.

distanza (DECIMAL 5,2): Registra la distanza rilevata dal sensore (in centimetri) al momento del movimento. Viene salvata insieme a ogni transazione per mantenere traccia della misurazione grezza che ha generato il calcolo della quantità, utile anche per verificare o correggere eventuali anomalie rilevate come "errore".

5. Tabella prodotti_scaffali
Mostra su quale scaffale è posizionato ogni prodotto

Consente ad ogni scaffale di poter avere anche diversi prodotti

id_prodotto (INT): Memorizza l'identificativo del prodotto. Insieme a "id_scaffale" costituisce una chiave primaria composta. Inoltre è vincolato da un ulteriore indice "UNIQUE" sulla sola colonna id_prodotto, che garantisce che ogni prodotto possa essere associato a un solo scaffale alla volta, quindi se un prodotto viene riassegnato a un nuovo scaffale e la vecchia associazione viene sostituita automaticamente, non duplicata.

id_scaffale (VARCHAR 50): Memorizza l'identificativo dello scaffale logistico. Funge da vincolo relazionale verso l'anagrafica degli scaffali. A differenza di "id_prodotto", questa colonna non ha vincoli di unicità propri, quindi lo stesso scaffale può comparire in più righe, ospitando prodotti diversi

ultima_modifica (TIMESTAMP): Tiene traccia del momento esatto in cui l'associazione è stata creata o modificata. Il database aggiorna automaticamente questo valore in tempo reale ogni volta che la riga viene modificata, senza bisogno di specificarlo manualmente nel codice del backend.

Nota generale: Nelle tabelle "letture_sensore", "movimenti" e "prodotti_scaffali" possiamo notare che nell'ultima riga di ognuno c'è la colonna "current_timestamp()" ciò significa che il database inserisce automaticamente la data e l'ora corrente ogni volta che viene eseguita la query "INSERT".

6. Tabella utenti
Gestisce gli account abilitati ad accedere al sistema

id (INT): È un identificativo numerico progressivo generato automaticamente che, in modo univoco, identifica ogni account registrato nel sistema.

username (VARCHAR 50): Il nome utente scelto per l'accesso al sistema. La dicitura "UNI" nella colonna "Key" indica un vincolo di unicità: non possono esistere due account con lo stesso username.

password (VARCHAR 255): Contiene l'hash della password calcolato tramite l'algoritmo bcrypt, non la password in chiaro. La lunghezza di 255 caratteri è dimensionata per ospitare il formato standard degli hash generati da questa libreria, garantendo che le credenziali non siano mai leggibili direttamente dal database.

nome (VARCHAR 100): Campo opzionale che memorizza il nome descrittivo associato all'account, utilizzato eventualmente per identificare l'utente in modo più leggibile rispetto al solo username.

Relazioni e comportamento delle eliminazioni a catena
(nel codice esistono cancellazioni manuali prima di alcune DELETE)

prodotti_scaffali → prodotti: ON DELETE CASCADE — eliminando un prodotto, l'associazione allo scaffale viene rimossa automaticamente dal database.

prodotti_scaffali → scaffali: ON DELETE CASCADE — stesso comportamento eliminando uno scaffale.

letture_sensore → scaffali: nessuna clausola (default RESTRICT) — il database impedirebbe l'eliminazione di uno scaffale finché esistono letture collegate; per questo la rotta DELETE /api/scaffali/:id cancella prima manualmente le letture.

movimenti → scaffali: ON DELETE SET NULL — eliminando uno scaffale, il campo id_scaffale dei movimenti collegati verrebbe impostato a NULL anziché essere cancellato; il backend però cancella comunque questi movimenti manualmente prima di procedere.

movimenti → prodotti: nessuna clausola (default RESTRICT) — il database impedirebbe l'eliminazione di un prodotto finché esistono movimenti collegati; per questo la rotta DELETE /api/prodotti/:id cancella prima manualmente i movimenti.

prodotti_scaffali.id_prodotto ha inoltre un vincolo UNIQUE (uq_id_prodotto) oltre alla chiave primaria composta: un prodotto può essere associato a un solo scaffale alla volta.

Lo schema Entità-Relazione completo, con la descrizione dettagliata di ogni campo, la trovi in Schema ER MYSQL.md; la definizione SQL esatta di ogni colonna e vincolo è invece consultabile direttamente in schema.sql

Come funziona il flusso dati
Il sensore ultrasonico misura la distanza tra sé e il primo ostacolo (il prodotto sullo scaffale, o il fondo se vuoto).

Il dato viene pubblicato su un topic MQTT e ricevuto da mqtt/listener.js.

Il listener:

crea automaticamente lo scaffale se non esiste ancora;

classifica lo stato dello scaffale (pieno, parziale, vuoto) in base alla distanza;

scarta le letture duplicate ricevute entro 3 secondi con lo stesso valore;

salva la lettura in letture_sensore;

confronta la lettura nuova con la precedente per calcolare pezzi aggiunti/rimossi, registrando il movimento in movimenti;

se la distanza è fisicamente impossibile (oltre la profondità dello scaffale, o negativa), registra un movimento di tipo errore;

se il messaggio include un prodotto, aggiorna l'associazione prodotto-scaffale.

Il frontend interroga periodicamente le API REST per mostrare i dati aggiornati (polling, non websocket).

API Reference
Tutte le rotte sotto /api/... richiedono una sessione attiva (login). Le pagine .html diverse da login.html, password.html e username.html sono protette da un middleware che reindirizza al login chi non è autenticato.

Per una descrizione dettagliata, riga per riga, della logica di express.js, consulta la Relazione file js.md

Autenticazione (routes/auth.js)
POST /login

Descrizione: Verifica le credenziali e crea la sessione

Body: { username, password }

GET /logout

Descrizione: Distrugge la sessione corrente

GET /api/utenti

Descrizione: Elenco username (autocomplete login)

POST /api/password

Descrizione: Cambia la password

Body: { username, vecchia_password, nuova_password }

POST /api/username

Descrizione: Cambia lo username

Body: { username, password, nuovo_username }

Prodotti (routes/prodotti.js)
GET /api/prodotti

Descrizione: Elenco prodotti

POST /api/prodotti

Descrizione: Crea un prodotto

Body: { nome, descrizione, misura }

PUT /api/prodotti/:id

Descrizione: Aggiorna un prodotto

Body: { nome, descrizione, misura }

DELETE /api/prodotti/:id

Descrizione: Elimina un prodotto e i movimenti collegati

Scaffali e associazioni (routes/scaffali.js)
GET /api/scaffali

Descrizione: Scaffali con ultima lettura e quantità calcolata

POST /api/scaffali

Descrizione: Crea uno scaffale manualmente

Body: { id_scaffale, posizione, stato }

PUT /api/scaffali/:id

Descrizione: Aggiorna posizione/profondità/nome

Body: { posizione, profondita, nome_scaffale }

DELETE /api/scaffali/:id

Descrizione: Elimina uno scaffale e i dati collegati

GET /api/prodotti_scaffali

Descrizione: Elenco associazioni prodotto-scaffale

POST /api/prodotti_scaffali

Descrizione: Associa un prodotto a uno scaffale

Body: { id_prodotto, id_scaffale }

DELETE /api/prodotti_scaffali/:id_prodotto/:id_scaffale

Descrizione: Rimuove un'associazione

Movimenti (routes/movimenti.js)
GET /api/movimenti

Descrizione: Storico movimenti (max 100), filtrabile

Query: id_scaffale, data_da, data_a

POST /api/movimenti

Descrizione: Inserimento manuale di un movimento

Body: { id_prodotto, tipo_movimento, quantita }

Sensori (routes/sensori.js)
GET /api/letture_sensore

Descrizione: Ultime 5 letture

GET /api/sensor/latest

Descrizione: Ultima lettura per ciascuno scaffale

GET /api/sensor/history

Descrizione: Ultime N letture, filtrabili

Query: n (max 100), id_scaffale

GET /api/sensor/chart

Descrizione: Letture delle ultime 24h per uno scaffale

Query: id_scaffale (obbligatorio)

Sistema (routes/sistema.js)
GET /api/health

Descrizione: Raggiungibilità del database

GET /api/sensore/stato

Descrizione: Stato online/offline del sensore

GET /api/errore/payload

Descrizione: Ultimo errore di parsing MQTT

GET /api/sensor/timestamp

Descrizione: Timestamp dell'ultima lettura MQTT

Link a documentazione esterna
Documentazione Express.js

Documentazione mysql2

Documentazione MQTT.js

Documentazione bcrypt (npm)

Sito ufficiale MariaDB

Sito ufficiale Node-RED

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

Stato scaffale di default 'verde' a livello di database (colonna stato, default 'verde'): valore non più utilizzato dalla logica applicativa di produzione (che calcola dinamicamente pieno/parziale/vuoto) — la rotta POST /api/scaffali sovrascrive comunque questo default con 'vuoto', ma la definizione della colonna nello schema resta con il vecchio default.

Comportamento asimmetrico delle associazioni prodotto-scaffale: un prodotto può stare su un solo scaffale alla volta (vincolo UNIQUE). Passando dalla pagina web, assegnare un prodotto a uno scaffale già occupato sostituisce quello precedente; passando dal flusso MQTT automatico, questa sostituzione non avviene allo stesso modo. Comportamento documentato più nel dettaglio nella relazione tecnica del progetto.

File di backup residui: alcuni file .save generati dall'editor (es. sensore.html.save) sono ancora presenti nella cartella Frontend e andrebbero rimossi prima della pubblicazione definitiva.

Test
Il progetto include test automatici tramite Jest, eseguibili con:

Bash
npm test
Il dettaglio dei test eseguiti è consultabile in report_test.md

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
