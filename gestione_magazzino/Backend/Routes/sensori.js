const express = require('express');
const router = express.Router();
const db = require('../db');

// --- GET: ultime 5 letture (usato dalla pagina sensori) ---
router.get('/letture_sensore', (req, res) => {
    db.query('SELECT * FROM letture_sensore ORDER BY id_lettura DESC LIMIT 5', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// --- GET: ultima lettura per ogni scaffale (usata dalla dashboard live) ---
router.get('/sensor/latest', (req, res) => {
    const sql = `
        SELECT l.id_lettura, l.id_scaffale, l.distanza_rilevata, l.data_lettura,
               s.nome_scaffale, s.posizione, s.stato, s.profondita
        FROM letture_sensore l
        JOIN scaffali s ON l.id_scaffale = s.id_scaffale
        WHERE l.id_lettura = (
            SELECT MAX(id_lettura) FROM letture_sensore WHERE id_scaffale = l.id_scaffale
        )
        ORDER BY l.id_scaffale`;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Nessuna lettura disponibile' });
        res.json(results);
    });
});

// --- GET: ultime N letture con filtro scaffale opzionale (usata dallo storico) ---
router.get('/sensor/history', (req, res) => {
    const n = parseInt(req.query.n) || 10;
    const id_scaffale = req.query.id_scaffale || null;

    if (n > 100) return res.status(400).json({ error: 'Massimo 100 letture consentite' });

    const sql = `
        SELECT l.id_lettura, l.id_scaffale, l.distanza_rilevata, l.data_lettura,
               s.nome_scaffale, s.posizione, s.profondita
        FROM letture_sensore l
        JOIN scaffali s ON l.id_scaffale = s.id_scaffale
        ${id_scaffale ? 'WHERE l.id_scaffale = ?' : ''}
        ORDER BY l.id_lettura DESC
        LIMIT ?`;

    const params = id_scaffale ? [id_scaffale, n] : [n];

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// --- GET: letture nelle ultime 24h per uno scaffale (usata dal grafico Chart.js) ---
router.get('/sensor/chart', (req, res) => {
    const id_scaffale = req.query.id_scaffale;
    if (!id_scaffale) return res.status(400).json({ error: 'id_scaffale obbligatorio' });

    const sql = `
        SELECT distanza_rilevata, data_lettura
        FROM letture_sensore
        WHERE id_scaffale = ?
        AND data_lettura >= NOW() - INTERVAL 24 HOUR
        ORDER BY data_lettura ASC`;

    db.query(sql, [id_scaffale], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

module.exports = router;
