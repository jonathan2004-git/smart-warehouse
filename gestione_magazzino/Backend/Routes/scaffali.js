const express = require('express');
const router = express.Router();
const db = require('../db');

// --- GET: lista scaffali con ultima lettura sensore e quantità calcolata ---
router.get('/scaffali', (req, res) => {
    const sql = `
        SELECT s.id_scaffale, s.nome_scaffale, s.posizione, s.stato, s.profondita,
               l.distanza_rilevata, p.nome AS nome_prodotto, p.misura,
               CASE
                   WHEN s.profondita IS NOT NULL AND p.misura IS NOT NULL AND p.misura > 0 AND l.distanza_rilevata IS NOT NULL
                   THEN FLOOR((s.profondita - l.distanza_rilevata) / p.misura)
                   ELSE NULL
               END AS quantita_calcolata
        FROM scaffali s
        LEFT JOIN letture_sensore l ON s.id_scaffale = l.id_scaffale
            AND l.id_lettura = (SELECT MAX(id_lettura) FROM letture_sensore WHERE id_scaffale = s.id_scaffale)
        LEFT JOIN prodotti_scaffali ps ON s.id_scaffale = ps.id_scaffale
        LEFT JOIN prodotti p ON ps.id_prodotto = p.id_prodotto
        WHERE l.id_lettura IS NOT NULL OR l.id_lettura IS NULL`;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// --- POST: crea un nuovo scaffale manualmente ---
router.post('/scaffali', (req, res) => {
    const { id_scaffale, posizione, stato } = req.body;

    db.query('INSERT INTO scaffali (id_scaffale, posizione, stato) VALUES (?, ?, ?)',
        [id_scaffale, posizione, stato || 'vuoto'], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Scaffale creato correttamente!' });
        });
});

// --- PUT: aggiorna posizione, profondità e nome di uno scaffale ---
router.put('/scaffali/:id', (req, res) => {
    const { posizione, profondita, nome_scaffale } = req.body;

    db.query('UPDATE scaffali SET posizione=?, profondita=?, nome_scaffale=? WHERE id_scaffale=?',
        [posizione, profondita, nome_scaffale, req.params.id], (err) => {
            if (err) return res.status(500).json({ error: err.message });

            db.query('UPDATE prodotti_scaffali SET ultima_modifica=NOW() WHERE id_scaffale=?',
                [req.params.id], (err) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ message: 'Scaffale aggiornato' });
                });
        });
});

// --- DELETE: elimina uno scaffale e tutti i dati collegati (cascade manuale) ---
router.delete('/scaffali/:id', (req, res) => {
    db.query('DELETE FROM movimenti WHERE id_scaffale=?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });

        db.query('DELETE FROM letture_sensore WHERE id_scaffale=?', [req.params.id], (err) => {
            if (err) return res.status(500).json({ error: err.message });

            db.query('DELETE FROM prodotti_scaffali WHERE id_scaffale=?', [req.params.id], (err) => {
                if (err) return res.status(500).json({ error: err.message });

                db.query('DELETE FROM scaffali WHERE id_scaffale=?', [req.params.id], (err) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ message: 'Scaffale, movimenti e letture collegati eliminati' });
                });
            });
        });
    });
});

// --- GET: lista associazioni prodotto-scaffale con nomi leggibili ---
router.get('/prodotti_scaffali', (req, res) => {
    const sql = `
        SELECT ps.*, p.nome AS nome_prodotto, s.nome_scaffale, s.posizione
        FROM prodotti_scaffali ps
        JOIN prodotti p ON ps.id_prodotto = p.id_prodotto
        JOIN scaffali s ON ps.id_scaffale = s.id_scaffale`;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// --- POST: associa un prodotto a uno scaffale (uno scaffale = un prodotto) ---
router.post('/prodotti_scaffali', (req, res) => {
    const { id_prodotto, id_scaffale } = req.body;
    if (!id_prodotto || !id_scaffale) {
        return res.status(400).json({ errore: 'id_prodotto o id_scaffale mancante' });
    }

    // rimuove eventuali altri prodotti già associati allo stesso scaffale
    db.query('DELETE FROM prodotti_scaffali WHERE id_scaffale = ? AND id_prodotto != ?',
        [id_scaffale, id_prodotto], (err) => {
            if (err) return res.status(500).json({ errore: err.message });

            const sql = `INSERT INTO prodotti_scaffali (id_prodotto, id_scaffale)
                         VALUES (?, ?)
                         ON DUPLICATE KEY UPDATE id_scaffale = VALUES(id_scaffale), ultima_modifica = NOW()`;
            db.query(sql, [id_prodotto, id_scaffale], (err) => {
                if (err) return res.status(500).json({ errore: err.message });
                res.status(201).json({ message: 'Prodotto assegnato allo scaffale!' });
            });
        });
});

// --- DELETE: rimuove l'associazione tra un prodotto e uno scaffale ---
router.delete('/prodotti_scaffali/:id_prodotto/:id_scaffale', (req, res) => {
    db.query('DELETE FROM prodotti_scaffali WHERE id_prodotto=? AND id_scaffale=?',
        [req.params.id_prodotto, req.params.id_scaffale], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Prodotto rimosso dallo scaffale!' });
        });
});

module.exports = router;
