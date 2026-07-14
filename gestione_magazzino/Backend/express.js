require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');

// --- moduli interni ---
const authRoutes     = require('./routes/auth');
const prodottiRoutes = require('./routes/prodotti');
const scaffaliRoutes = require('./routes/scaffali');
const movimentiRoutes = require('./routes/movimenti');
const sensoriRoutes  = require('./routes/sensori');
const sistemaRoutes  = require('./routes/sistema');
const avviaMqtt      = require('./mqtt/listener');

const app = express();

// --- sessione utente ---
app.use(session({
    secret: 'segreto_magazzino_2025',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// --- middleware globali ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- protezione pagine HTML: blocca l'accesso senza sessione attiva ---
const paginePubbliche = ['/index.html', '/password.html', '/username.html'];
app.use((req, res, next) => {
    if (req.path.endsWith('.html') && !paginePubbliche.includes(req.path)) {
        if (!req.session.user) return res.redirect('/index.html');
    }
    next();
});

// --- file statici dalla cartella Frontend ---
app.use(express.static(path.join(__dirname, 'Frontend')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'Frontend', 'index.html')));

// --- rotte ---
app.use('/', authRoutes);           // login, logout, utenti, password, username
app.use('/api', prodottiRoutes);    // CRUD prodotti
app.use('/api', scaffaliRoutes);    // CRUD scaffali e prodotti_scaffali
app.use('/api', movimentiRoutes);   // storico movimenti
app.use('/api', sensoriRoutes);     // letture, latest, history, chart
app.use('/api', sistemaRoutes);     // health, stato sensore, errore payload, timestamp

// --- avvio server ---
const PORT = 3000;
const IP_LOCALE = '192.168.0.218';

app.listen(PORT, '0.0.0.0', () => {
    console.log('\x1b[32m%s\x1b[0m', '--- Server avviato con successo ---');
    console.log(`Pagina web: \x1b[36mhttp://${IP_LOCALE}:${PORT}/index.html\x1b[0m`);
    console.log('------------------------------------------');
});

// --- avvia il listener MQTT ---
avviaMqtt();
