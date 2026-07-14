const mqtt = require('mqtt');
const db = require('../db');
const stato = require('../stato');

// classifica la distanza in cm in uno stato leggibile per lo scaffale
function classificaStato(distanza) {
    if (distanza < 15) return 'pieno';
    if (distanza <= 40) return 'parziale';
    return 'vuoto';
}

function avviaMqtt() {
    const client = mqtt.connect('mqtt://localhost');

    client.on('connect', () => {
        console.log('Connesso al broker MQTT');
        client.subscribe('magazzino/#');
    });

    client.on('message', (topic, message) => {

        // ignora i messaggi di ritorno pubblicati dal backend stesso
        if (topic === 'magazzino/monitor') return;

        // aggiorna lo stato del sensore quando il watchdog Node-RED pubblica online/offline
        if (topic === 'magazzino/sensore/stato') {
            try {
                const dati = JSON.parse(message.toString());
                stato.statoSensore = dati.stato;
                console.log(`Stato sensore: ${stato.statoSensore}`);
            } catch (e) {
                console.error('Payload stato sensore malformato');
            }
            return;
        }

        console.log(`Topic ricevuto: ${topic}`);
        console.log(`Payload raw: ${message.toString()}`);

        try {
            const dati = JSON.parse(message.toString());
            console.log('Dato ricevuto via MQTT:', dati);

            const statoScaffale = classificaStato(dati.distanza);

            // formatta l'ID scaffale nel formato standard S01, S02, ...
            const idScaffaleFormattato = typeof dati.id_scaffale === 'number'
                ? `S${dati.id_scaffale.toString().padStart(2, '0')}`
                : dati.id_scaffale;

            if (!idScaffaleFormattato || idScaffaleFormattato.trim() === '') {
                console.error('ID scaffale vuoto, payload ignorato');
                return;
            }

            // crea lo scaffale se non esiste ancora
            db.query('INSERT IGNORE INTO scaffali (id_scaffale, posizione, stato) VALUES (?, ?, ?)',
                [idScaffaleFormattato, 'Corsia da definire', statoScaffale], (err) => {
                    if (err) { console.error('Errore creazione scaffale:', err.message); return; }

                    // aggiorna lo stato in base alla distanza attuale
                    db.query('UPDATE scaffali SET stato=? WHERE id_scaffale=?',
                        [statoScaffale, idScaffaleFormattato], (err) => {
                            if (err) { console.error(err.message); return; }

                            // blocca i messaggi duplicati arrivati entro 3 secondi con la stessa distanza
                            const sqlCheck = `
                                SELECT id_lettura FROM letture_sensore
                                WHERE id_scaffale = ?
                                AND distanza_rilevata = ?
                                AND data_lettura >= NOW() - INTERVAL 3 SECOND`;

                            db.query(sqlCheck, [idScaffaleFormattato, dati.distanza], (err, rows) => {
                                if (err || (rows && rows.length > 0)) {
                                    console.log('Lettura duplicata ignorata');
                                    return;
                                }

                                // salva la lettura del sensore nel database
                                db.query('INSERT INTO letture_sensore (id_scaffale, distanza_rilevata) VALUES (?, ?)',
                                    [idScaffaleFormattato, dati.distanza], (err) => {
                                        if (err) { console.error('Errore salvataggio lettura:', err.message); return; }

                                        console.log(`Successo: Lettura salvata per ${idScaffaleFormattato}`);

                                        // confronta le ultime 2 letture per rilevare movimenti di merce
                                        const sqlUltime = `
                                            SELECT l.distanza_rilevata, ps.id_prodotto, p.misura, s.profondita
                                            FROM letture_sensore l
                                            JOIN scaffali s ON l.id_scaffale = s.id_scaffale
                                            LEFT JOIN prodotti_scaffali ps ON l.id_scaffale = ps.id_scaffale
                                            LEFT JOIN prodotti p ON ps.id_prodotto = p.id_prodotto
                                            WHERE l.id_scaffale = ?
                                            ORDER BY l.id_lettura DESC
                                            LIMIT 2`;

                                        db.query(sqlUltime, [idScaffaleFormattato], (err, righe) => {
                                            if (err || righe.length < 2) return;

                                            const distanzaNuova = righe[0].distanza_rilevata;
                                            const distanzaVecchia = righe[1].distanza_rilevata;
                                            const misura = righe[0].misura;
                                            const profondita = righe[0].profondita;
                                            const id_prodotto = righe[0].id_prodotto;

                                            if (!misura || !profondita || !id_prodotto) return;

                                            // distanza fuori range: registra un movimento di tipo 'errore'
                                            if (distanzaNuova > profondita || distanzaNuova < 0) {
                                                console.log(`Distanza anomala: ${distanzaNuova}cm — ignorata`);
                                                db.query(
                                                    'INSERT INTO movimenti (id_prodotto, tipo_movimento, quantita, distanza) VALUES (?, ?, ?, ?)',
                                                    [id_prodotto, 'errore', 0, distanzaNuova], (err) => {
                                                        if (err) console.error('Errore salvataggio errore:', err.message);
                                                        else console.log(`Movimento ERRORE registrato per distanza ${distanzaNuova}cm`);
                                                    });
                                                return;
                                            }

                                            // calcola la quantità stimata prima e dopo la lettura
                                            const pzNuovi = Math.floor((profondita - distanzaNuova) / misura);
                                            const pzVecchi = Math.floor((profondita - distanzaVecchia) / misura);
                                            const differenza = pzNuovi - pzVecchi;

                                            // pubblica su magazzino/dashboard solo se la quantità è cambiata
                                            if (pzNuovi !== pzVecchi) {
                                                client.publish('magazzino/dashboard', JSON.stringify({
                                                    id_scaffale: idScaffaleFormattato,
                                                    quantita: pzNuovi,
                                                    distanza: distanzaNuova,
                                                    stato: statoScaffale,
                                                    timestamp: new Date().toISOString()
                                                }));
                                            }

                                            if (differenza === 0) return;

                                            // registra il movimento: entrata se quantità aumenta, uscita se diminuisce
                                            const tipo = differenza > 0 ? 'entrata' : 'uscita';
                                            const quantita = Math.abs(differenza);

                                            db.query(
                                                'INSERT INTO movimenti (id_prodotto, tipo_movimento, quantita, distanza) VALUES (?, ?, ?, ?)',
                                                [id_prodotto, tipo, quantita, distanzaNuova], (err) => {
                                                    if (err) console.error('Errore salvataggio movimento:', err.message);
                                                    else console.log(`Movimento registrato: ${tipo} di ${quantita} pz`);
                                                });
                                        }); // fine sqlUltime

                                        // associa automaticamente il prodotto allo scaffale se il payload lo include
                                        if (dati.id_prodotto) {
                                            db.query(`
                                                INSERT INTO prodotti_scaffali (id_prodotto, id_scaffale)
                                                VALUES (?, ?)
                                                ON DUPLICATE KEY UPDATE id_scaffale = VALUES(id_scaffale), ultima_modifica = NOW()`,
                                                [dati.id_prodotto, idScaffaleFormattato], (err) => {
                                                    if (err) console.error('Errore associazione prodotto-scaffale:', err.message);
                                                    else console.log(`Prodotto ${dati.id_prodotto} associato a ${idScaffaleFormattato}`);
                                                });
                                        }

                                        // pubblica un messaggio di conferma sul topic monitor (anti-loop)
                                        client.publish('magazzino/monitor', JSON.stringify({
                                            id_scaffale: idScaffaleFormattato,
                                            distanza: dati.distanza,
                                            fonte: 'SENSOR_MQTT'
                                        }));

                                        stato.ultimoAggiornamento = Date.now();
                                    }); // fine INSERT lettura
                            }); // fine sqlCheck
                        }); // fine UPDATE stato
                }); // fine INSERT IGNORE scaffale

        } catch (e) {
            console.error('Errore nel formato dei dati ricevuti:', e.message);
            stato.ultimoErrorePayload = {
                messaggio: e.message,
                timestamp: new Date().toLocaleString('it-IT')
            };
        }
    }); // fine client.on('message')
}

module.exports = avviaMqtt;
