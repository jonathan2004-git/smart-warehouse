const express = require('express');
const router = express.Router();
const db = require('../db');

// --- GET: storico movimenti con filtri opzionali per scaffale e data ---
router.get('/movimenti', (req, res) => {
    const { id_scaffale, data_da, data_a } = req.query;

    const filtri = [];
    const params = [];

    if (id_scaffale) {
        filtri.push('(m.id_scaffale = ? OR ps.id_scaffale = ?)');
        params.push(id_scaffale, id_scaffale);
    }
    if (data_da) {
        filtri.push('m.data_movimento >= ?');
        params.push(data_da);
    }
    if (data_a) {
        filtri.push('DATE(m.data_movimento) <= ?');
        params.push(data_a);
    }

    const where = filtri.length > 0 ? 'WHERE ' + filtri.join(' AND ') : '';

    const sql = `
        SELECT m.id_movimento, m.data_movimento, m.tipo_movimento, m.quantita, m.distanza,
               p.nome, s.nome_scaffale,
               COALESCE(m.id_scaffale, ps.id_scaffale) AS id_scaffale,
               s.profondita
        FROM movimenti m
        LEFT JOIN prodotti p ON m.id_prodotto = p.id_prodotto
        LEFT JOIN prodotti_scaffali ps ON m.id_prodotto = ps.id_prodotto
        LEFT JOIN scaffali s ON s.id_scaffale = COALESCE(m.id_scaffale, ps.id_scaffale)
        ${where}
        ORDER BY m.data_movimento DESC
        LIMIT 100`;

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json([]);
        res.json(results);
    });
});

// --- POST: inserimento manuale di un movimento (usato da Postman/Thunder Client) ---
router.post('/movimenti', (req, res) => {
    const { id_prodotto, tipo_movimento, quantita } = req.body;

    if (!id_prodotto || !tipo_movimento || quantita === undefined || quantita === null) {
        return res.status(400).json({ error: 'Mancano dati obbligatori' });
    }

    db.query('INSERT INTO movimenti (id_prodotto, tipo_movimento, quantita) VALUES (?, ?, ?)',
        [id_prodotto, tipo_movimento, quantita], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Movimento registrato con successo!', id_movimento: result.insertId });
        });
});

module.exports = router;
