const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db');
 
// --- login: verifica credenziali e crea la sessione ---
router.post('/login', (req, res) => {
    const { username, password } = req.body;
 
    db.query('SELECT * FROM utenti WHERE username = ?', [username], (err, results) => {
        if (err) return res.status(500).send('Errore server');
        if (results.length === 0) return res.redirect('/index.html?errore=1');
 
        bcrypt.compare(password, results[0].password, (err, corrisponde) => {
            if (err) return res.status(500).send('Errore server');
            if (corrisponde) {
                req.session.user = results[0];
                res.redirect('/Inventario.html');
            } else {
                res.redirect('/index.html?errore=1');
            }
        });
    });
});
 
// --- logout: distrugge la sessione e reindirizza al login ---
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/index.html');
});
 
// --- lista username per autocomplete nella pagina di login ---
router.get('/api/utenti', (req, res) => {
    db.query('SELECT username FROM utenti', (err, results) => {
        if (err) return res.status(500).json([]);
        res.json(results);
    });
});
 
// --- cambio password: verifica vecchia password con bcrypt e salva l'hash della nuova ---
router.post('/api/password', (req, res) => {
    const { username, vecchia_password, nuova_password } = req.body;
 
    db.query('SELECT * FROM utenti WHERE username = ?', [username], (err, results) => {
        if (err) return res.status(500).json({ errore: 'Errore server' });
        if (results.length === 0) return res.status(401).json({ errore: 'Username o password vecchia non corretti' });
 
        bcrypt.compare(vecchia_password, results[0].password, (err, corrisponde) => {
            if (err) return res.status(500).json({ errore: 'Errore server' });
            if (!corrisponde) return res.status(401).json({ errore: 'Username o password vecchia non corretti' });
 
            bcrypt.hash(nuova_password, 10, (err, hash) => {
                if (err) return res.status(500).json({ errore: 'Errore server' });
 
                db.query('UPDATE utenti SET password = ? WHERE username = ?', [hash, username], (err) => {
                    if (err) return res.status(500).json({ errore: 'Errore aggiornamento' });
                    res.json({ messaggio: 'Password aggiornata con successo!' });
                });
            });
        });
    });
});
 
// --- cambio username: verifica password e controlla che il nuovo username non sia già in uso ---
router.post('/api/username', (req, res) => {
    const { username, password, nuovo_username } = req.body;
 
    db.query('SELECT * FROM utenti WHERE username = ?', [username], (err, results) => {
        if (err) return res.status(500).json({ errore: 'Errore server' });
        if (results.length === 0) return res.status(401).json({ errore: 'Username o password non corretti' });
 
        bcrypt.compare(password, results[0].password, (err, corrisponde) => {
            if (err) return res.status(500).json({ errore: 'Errore server' });
            if (!corrisponde) return res.status(401).json({ errore: 'Username o password non corretti' });
 
            db.query('SELECT * FROM utenti WHERE username = ?', [nuovo_username], (err, esistente) => {
                if (err) return res.status(500).json({ errore: 'Errore server' });
                if (esistente.length > 0) return res.status(409).json({ errore: 'Username già in uso, scegline un altro' });
 
                db.query('UPDATE utenti SET username = ? WHERE username = ?', [nuovo_username, username], (err) => {
                    if (err) return res.status(500).json({ errore: 'Errore aggiornamento' });
                    res.json({ messaggio: 'Username aggiornato con successo!' });
                });
            });
        });
    });
});
 
module.exports = router;
