const express = require('express');
const router = express.Router();
const db = require('../db');

// --- GET: lista completa dei prodotti ---
router.get('/prodotti', (req, res) => {
    db.query('SELECT * FROM prodotti', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// --- POST: crea un nuovo prodotto ---
router.post('/prodotti', (req, res) => {
    const { nome, descrizione, misura } = req.body;

    db.query('INSERT INTO prodotti (nome, descrizione, misura) VALUES (?, ?, ?)',
        [nome, descrizione, misura], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Prodotto creato!', id: result.insertId });
        });
});

// --- PUT: aggiorna nome, descrizione e misura di un prodotto ---
router.put('/prodotti/:id', (req, res) => {
    const { nome, descrizione, misura } = req.body;

    db.query('UPDATE prodotti SET nome=?, descrizione=?, misura=? WHERE id_prodotto=?',
        [nome, descrizione, misura, req.params.id], (err) => {
            if (err) return res.status(500).json({ error: err.message });

            // aggiorna il timestamp di ultima modifica nella tabella di associazione
            db.query('UPDATE prodotti_scaffali SET ultima_modifica=NOW() WHERE id_prodotto=?',
                [req.params.id], (err) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ message: 'Prodotto aggiornato' });
                });
        });
});

// --- DELETE: elimina un prodotto e tutti i movimenti collegati ---
router.delete('/prodotti/:id', (req, res) => {
    db.query('DELETE FROM movimenti WHERE id_prodotto=?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });

        db.query('DELETE FROM prodotti WHERE id_prodotto=?', [req.params.id], (err) => {
            if (err) return res.status(500).json({ error: err.message });

            // resetta il contatore auto-increment per evitare buchi nei numeri ID
            db.query('SELECT MAX(id_prodotto) AS maxId FROM prodotti', (err, rows) => {
                if (!err) {
                    const nuovoAutoIncrement = (rows[0].maxId || 0) + 1;
                    db.query(`ALTER TABLE prodotti AUTO_INCREMENT = ${nuovoAutoIncrement}`, (errAlter) => {
                        if (errAlter) console.error("Errore reset auto-increment:", errAlter.message);
                    });
                }
            });

            res.json({ message: 'Prodotto e movimenti collegati eliminati' });
        });
    });
});

module.exports = router;
