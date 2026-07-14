# Smart Warehouse — Sistema di Gestione Magazzino IoT

Monitoraggio in tempo reale di un magazzino tramite sensori ultrasonici IoT, MQTT e dashboard web

*Documentazione disponibile solo in italiano.*

---

## Screenshot
Screenshot delle pagine presenti nella cartella [Screenshot Pagina](Screenshot%20Pagina/)

---

## Indice
1. [Come iniziare](#come-iniziare)
2. [Come contribuire](#come-contribuire)
3. [Manutenzione](#manutenzione)
4. [Test](#test)
5. [Licenza](#licenza)

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
| **Broker MQTT (es. Mosquitto)** | Comunicazione con i sensori |
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
