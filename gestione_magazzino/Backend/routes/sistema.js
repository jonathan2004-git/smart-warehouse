const express = require('express');
const router = express.Router();
const db = require('../db');
const stato = require('../stato');

// --- GET: verifica che il server e il database siano raggiungibili ---
router.get('/health', (req, res) => {
    db.ping((err) => {
        if (err) return res.status(500).json({ stato: 'offline' });
        res.json({ stato: 'online' });
    });
});

// --- GET: stato del sensore fisico (online/offline) aggiornato dal watchdog Node-RED ---
router.get('/sensore/stato', (req, res) => {
    res.json({ stato: stato.statoSensore });
});

// --- GET: ultimo errore di parsing MQTT (usato dal popup errore payload nel frontend) ---
router.get('/errore/payload', (req, res) => {
    res.json({ errore: stato.ultimoErrorePayload });
});

// --- GET: timestamp dell'ultima lettura MQTT (usato dal polling intelligente del frontend) ---
router.get('/sensor/timestamp', (req, res) => {
    res.json({ ultimoAggiornamento: stato.ultimoAggiornamento });
});

module.exports = router;
