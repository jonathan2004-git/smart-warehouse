# Scenari di Test End-to-End

Questo documento descrive l'esecuzione di due scenari di test end-to-end sul sistema smart-warehouse, coprendo il flusso completo dalla gestione prodotti fino alla visualizzazione sulla dashboard Node-RED.

---

## Scenario 1: Ricezione merce

**Obiettivo**: verificare che l'aggiunta di un nuovo prodotto e il conseguente carico fisico sullo scaffale si riflettano correttamente sulla dashboard.

### Passi

| # | Passo | Risultato atteso | Risultato ottenuto |
|---|-------|-------------------|---------------------|
| 1 | Aggiunta di un nuovo prodotto  | Prodotto salvato correttamente, visibile nell'elenco Prodotti | Prodotto creato e visibile correttamente nell'elenco |
| 2 | Associazione del prodotto allo scaffale S01 | Associazione salvata e visibile nella vista Prodotti e Scaffali | Associazione effettuata correttamente |
| 3 | Pezzo fisico: avvicinamento ostacolo al sensore | Il sensore rileva la nuova distanza e la pubblica su MQTT | Distanza aggiornata correttamente nel debug |
| 4 | Verifica  dato su Node-RED | Payload con quantita e stato coerenti | Payload ricevuto corretto |
| 5 | Verifica visualizzazione su dashboard | Gauge e stato aggiornati in tempo reale | Dashboard aggiornata correttamente |
| 6 | Verifica coerenza dato a database | Lettura salvata con quantità e timestamp corretti | Da verificare |

### Screenshot

- `![Aggiunta prodotto](./screenshot/scenario1_aggiunta_prodotto.png)`
- `![Dashboard aggiornata](./screenshot/scenario1_dashboard_aggiornata.png)`

### Esito

**Scenario superato** — tutti i passi hanno prodotto il risultato atteso.

---

## Scenario 2: Scaffale che si svuota

**Obiettivo**: verificare che la rimozione di colli dallo scaffale generi correttamente lo stato "vuoto" e che venga mostrato sulla dashboard.


### Passi

| # | Passo | Risultato atteso | Risultato ottenuto |
|---|-------|-------------------|---------------------|
| 1 | Rimozione fisica: allontanamento ostacolo dal sensore HC-SR04 | Il sensore rileva l'aumento di distanza | |
| 2 | Pubblicazione dato aggiornato su MQTT | Payload con `quantita: 0` e `stato: "vuoto"` | |
| 3 | Verifica ricezione su Node-RED | Messaggio formattato correttamente con emoji 🔴 Vuoto | |
| 4 | Verifica su dashboard | Testo "Stato" mostra "S01: 🔴 Vuoto" | |
| 5 | Verifica coerenza dato a database | Stato "vuoto" salvato correttamente nello storico | |

### Screenshot

- `![Rimozione colli](./screenshot/scenario2_rimozione_colli.png)`
- `![Allerta vuoto dashboard](./screenshot/scenario2_allerta_vuoto.png)`

### Esito

⬜ *Da completare*

---

## Riepilogo esiti

| Scenario | Esito |
|----------|-------|
| Scenario 1 - Ricezione merce | ✅ |
| Scenario 2 - Scaffale che si svuota | ⬜ Da completare |
