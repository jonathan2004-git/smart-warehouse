//Implementazione subscriber in Node js, connessione al broker e sottoscrizione del topic magazzino/

---------------------------------------------------------------------------------------------------------------------
require('dotenv').config();                        // legge la password del file .env
const express = require('express');               // crea un server web
const mysql = require('mysql2');                 // per connettersi a MariaDB [cite: 17, 99]
const cors = require('cors');                   // per permettere richieste
const session = require('express-session');    // per gestione sessione utenti

const app = express();


app.use(session({
    secret: 'segreto_magazzino_2025',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const path = require('path');

// definisce la cartella 'Frontend' come sorgente dei file statici
app.use(express.static(path.join(__dirname, 'Frontend')));

// --- da dove proviene la rotta principale ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Frontend', 'index.html'));
});

// configura i parametri di accesso al database MariaDB
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

// connessione al database
db.connect((err) => {
    if (err) {
        console.error('Errore di connessione al database:', err.message);
        return;
    }
    console.log('Connesso con successo al database MariaDB!');
});

// torna al login se nessuno si è autenticato
const authMiddleware = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login.html');
    }
    next();
};

// --- rotte per il Login ---
app.post('/pippo', (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM utenti WHERE username = ? AND password = ?';

    db.query(sql, [username, password], (err, results) => {
        if (err) return res.status(500).send('Errore server');
        if (results.length > 0) {
            req.session.user = results[0];
            res.redirect('/Inventario.html'); // va alla pagina principale
        } else {
            res.redirect('/unauth.html');
        }
    });
});

// chiude la sessione dell'utente e lo reindirizza alla pagina di login.
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login.html');
});


// --- rotta di prova per vedere i prodotti ---
//app.get('/api/prodotti', authMiddleware, (req, res) => {
  //  db.query('SELECT * FROM prodotti', (err, results) => {
    //    if (err) {
      //      res.status(500).json({ error: err.message });
        //    return;
        //}
        //res.json(results);
    //});
//});

// --- rotta per stato scaffali ---
app.get('/api/scaffali', (req, res) => {
    // Uniamo le tabelle per vedere l'ultima lettura di ogni scaffale
    const sql = `
        SELECT s.id_scaffale, s.posizione, s.stato, l.distanza_rilevata
        FROM scaffali s
        LEFT JOIN letture_sensore l ON s.id_scaffale = l.id_scaffale
        WHERE l.id_lettura = (SELECT MAX(id_lettura) FROM letture_sensore WHERE id_scaffale = s.id_scaffale)
        OR l.id_lettura IS NULL`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// --- rotta per letture sensore ---
app.get('/api/letture_sensore', (req, res) => {
    const sql = 'SELECT * FROM letture_sensore ORDER BY id_lettura DESC LIMIT 100';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// --- rotta per stato movimenti ---
app.get('/api/movimenti', (req, res) => {
    const sql = `
        SELECT m.*, p.nome
        FROM movimenti m
        LEFT JOIN prodotti p ON m.id_prodotto = p.id_prodotto
        ORDER BY m.data_movimento DESC`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json([]);
        res.json(results);
    });
});

// --- rotte per ricevere i dati da Postman ---
// --- rotta per sensore ---
app.post('/api/sensore', (req, res) => {
    let { id_scaffale, distanza } = req.body;
    console.log("Dati ricevuti:", req.body);

    if (typeof id_scaffale === 'number' || !isNaN(id_scaffale)) {
        id_scaffale = `S${id_scaffale.toString().padStart(2, '0')}`;
    }

    const sqlScaffale = 'INSERT IGNORE INTO scaffali (id_scaffale, posizione, stato) VALUES (?, ?, ?)';
    db.query(sqlScaffale, [id_scaffale, 'Posizione Automatica', 'verde'], (err) => {
        if (err) return res.status(500).json({ error: err.message });

        const sqlLettura = 'INSERT INTO letture_sensore (id_scaffale, distanza_rilevata) VALUES (?, ?)';
        db.query(sqlLettura, [id_scaffale, distanza], (err) => {
            if (err) return res.status(500).json({ error: err.message });

            res.status(201).json({
                status: "Successo",
                trasformato_in: id_scaffale,
                message: "Scaffale creato/verificato e dato salvato"
            });
        });
    });
});

// --- rotta per aggiungere prodotti ---
app.post('/api/prodotti', (req, res) => {
    const { nome, descrizione, quantita_totale } = req.body;
    const query = 'INSERT INTO prodotti (nome, descrizione, quantita_totale) VALUES (?, ?, ?)';

    db.query(query, [nome, descrizione, quantita_totale], (err, result) => {
        if (err) {
            console.error("Errore inserimento prodotto:", err);
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Prodotto creato!', id: result.insertId });
    });
});

// --- rotta per aggiungere scaffali ---
app.post('/api/scaffali', (req, res) => {
    const { id_scaffale, posizione, stato } = req.body;
    const query = 'INSERT INTO scaffali (id_scaffale, posizione, stato) VALUES (?, ?, ?)';

    db.query(query, [id_scaffale, posizione, stato || 'verde'], (err, result) => {
        if (err) {
            console.error("Errore inserimento scaffale:", err);
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Scaffale creato correttamente!' });
    });
});

// --- rotta per vedere tutti i prodotti ---
app.get('/api/prodotti', (req, res) => {
    db.query('SELECT * FROM prodotti', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// --- rotta per aggiungere movimenti ---
app.post('/api/movimenti', (req, res) => {
    const { id_prodotto, tipo_movimento, quantita } = req.body;

    // Verifica che i dati siano presenti
    if (!id_prodotto || !tipo_movimento || !quantita) {
        return res.status(400).json({ error: "Mancano dati obbligatori" });
    }

    const query = 'INSERT INTO movimenti (id_prodotto, tipo_movimento, quantita) VALUES (?, ?, ?)';

    db.query(query, [id_prodotto, tipo_movimento, quantita], (err, result) => {
        if (err) {
            console.error("Errore inserimento movimento:", err);
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({
            message: 'Movimento registrato con successo!',
            id_movimento: result.insertId
        });
    });
});

// --- rotte PUT e DELETE per prodotti ---
app.put('/api/prodotti/:id', (req, res) => {
    const { nome, descrizione, quantita_totale } = req.body;
    db.query('UPDATE prodotti SET nome=?, descrizione=?, quantita_totale=? WHERE id_prodotto=?',
        [nome, descrizione, quantita_totale, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Prodotto aggiornato' });
        });
});

app.delete('/api/prodotti/:id', (req, res) => {
    // Prima elimina i movimenti collegati
    db.query('DELETE FROM movimenti WHERE id_prodotto=?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // Poi elimina il prodotto
        db.query('DELETE FROM prodotti WHERE id_prodotto=?', [req.params.id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Prodotto e movimenti collegati eliminati' });
        });
    });
});

// --- rotte PUT e DELETE per scaffali ---
app.put('/api/scaffali/:id', (req, res) => {
    const { posizione, stato } = req.body;
    db.query('UPDATE scaffali SET posizione=?, stato=? WHERE id_scaffale=?',
        [posizione, stato, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Scaffale aggiornato' });
        });
});

app.delete('/api/scaffali/:id', (req, res) => {
    // Prima elimina i movimenti collegati allo scaffale
    db.query('DELETE FROM movimenti WHERE id_scaffale=?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // Poi elimina le letture sensore collegate
        db.query('DELETE FROM letture_sensore WHERE id_scaffale=?', [req.params.id], (err) => {
            if (err) return res.status(500).json({ error: err.message });

            // Infine elimina lo scaffale
            db.query('DELETE FROM scaffali WHERE id_scaffale=?', [req.params.id], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Scaffale, movimenti e letture collegati eliminati' });
            });
        });
    });
});

// --- rotte per prodotti_scaffali ---

// --- GET: vedi dove sono i prodotti negli scaffali ---
app.get('/api/prodotti_scaffali', (req, res) => {
    const sql = `
        SELECT ps.*, p.nome AS nome_prodotto, s.posizione
        FROM prodotti_scaffali ps
        JOIN prodotti p ON ps.id_prodotto = p.id_prodotto
        JOIN scaffali s ON ps.id_scaffale = s.id_scaffale
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// --- POST: aggiungi un prodotto a uno scaffale ---
app.post('/api/prodotti_scaffali', (req, res) => {
    const { id_prodotto, id_scaffale, quantita_parziale } = req.body;
    const sql = 'INSERT INTO prodotti_scaffali (id_prodotto, id_scaffale, quantita_parziale) VALUES (?, ?, ?)';
    db.query(sql, [id_prodotto, id_scaffale, quantita_parziale], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Prodotto assegnato allo scaffale!' });
    });
});

// --- PUT: aggiorna la quantità di un prodotto in uno scaffale ---
app.put('/api/prodotti_scaffali/:id_prodotto/:id_scaffale', (req, res) => {
    const { quantita_parziale } = req.body;
    const sql = 'UPDATE prodotti_scaffali SET quantita_parziale=? WHERE id_prodotto=? AND id_scaffale=?';
    db.query(sql, [quantita_parziale, req.params.id_prodotto, req.params.id_scaffale], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Quantità aggiornata!' });
    });
});

// --- DELETE: rimuovi un prodotto da uno scaffale ---
app.delete('/api/prodotti_scaffali/:id_prodotto/:id_scaffale', (req, res) => {
    const sql = 'DELETE FROM prodotti_scaffali WHERE id_prodotto=? AND id_scaffale=?';
    db.query(sql, [req.params.id_prodotto, req.params.id_scaffale], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Prodotto rimosso dallo scaffale!' });
    });
});

// Avvio del server sulla porta 3000
const PORT = 3000;
const IP_LOCALE = '192.168.0.218';

app.listen(PORT, '0.0.0.0', () => {
    // \x1b[32m imposta il colore VERDE, \x1b[0m lo resetta
    console.log('\x1b[32m%s\x1b[0m', `--- Server avviato con successo ---`);
    console.log(`Pagina web disponibile su: \x1b[36mhttp://${IP_LOCALE}:${PORT}/index.html\x1b[0m`);
    console.log('------------------------------------------');
});

// MQTT
const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://localhost');

// Quando il server si connette al "centralino" (Broker)
client.on('connect', () => {
    console.log('Connesso al broker MQTT');
    client.subscribe('magazzino/#'); // Si mette in ascolto sul canale
});


//MQTT
client.on('message', (topic, message) => {
    if (topic === 'magazzino/monitor') {

        return;
    }
    console.log(`Topic ricevuto: ${topic}`);
    console.log(`Payload raw: ${message.toString()}`);
    try {
        const dati = JSON.parse(message.toString());
        console.log("Dato ricevuto via MQTT:", dati);

        
        const idScaffaleFormattato = typeof dati.id_scaffale === 'number' ? `S${dati.id_scaffale.toString().padStart(2, '0')}` : dati.id_scaffale;

        const queryScaffale = 'INSERT IGNORE INTO scaffali (id_scaffale, posizione, stato) VALUES (?, ?, ?)';

        // Inserimento di uno scaffale con una posizione di default 
        db.query(queryScaffale, [idScaffaleFormattato, 'Corsia da definire', 'verde'], (err) => {
            if (err) {
                console.error("Errore creazione automatica scaffale:", err.message);
                return;
            }

            // Salva la lettura usando l'ID formattato
            const queryLettura = 'INSERT INTO letture_sensore (id_scaffale, distanza_rilevata) VALUES (?, ?)';
            db.query(queryLettura, [idScaffaleFormattato, dati.distanza], (err) => {
                if (err) {
                    console.error("Errore salvataggio lettura MQTT:", err.message);
                } else {
                    console.log(`Successo: Lettura salvata per ${idScaffaleFormattato}`);
                    const payloadApp = JSON.stringify({
                        id_scaffale: idScaffaleFormattato,
                        distanza: dati.distanza,
                        fonte: 'SENSOR_MQTT'
                    });
                    client.publish('magazzino/monitor', payloadApp);
                }
            });
        });
    } catch (e) {
        console.error("Errore nel formato dei dati ricevuti:", e.message);
    }
});
