require('dotenv').config();
const mysql = require('mysql2');

// connessione al database MariaDB tramite variabili d'ambiente
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('Errore di connessione al database:', err.message);
        return;
    }
    console.log('Connesso con successo al database MariaDB!');
});

module.exports = db;
