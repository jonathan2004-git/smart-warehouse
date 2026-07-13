# Scenari di Test End-to-End

Questo documento descrive l'esecuzione di due scenari di test end-to-end sul sistema smart-warehouse, coprendo il flusso completo dalla gestione prodotti fino alla visualizzazione sulla dashboard Node-RED.

---

## Scenario 1: Ricezione merce

**Obiettivo**: verificare che l'aggiunta di un nuovo prodotto e il conseguente carico fisico sullo scaffale si riflettano correttamente sulla dashboard.

**Precondizioni**:
- Sistema backend, MQTT broker e Node-RED attivi
- Arduino collegato e sensore HC-SR04 funzionante
- Scaffale S01 in stato iniziale "vuoto"

### Passi

| # | Passo | Risultato atteso | Risultato ottenuto |
|---|-------|-------------------|---------------------|
| 1 | Accesso al sistema con utente autorizzato | Login effettuato con successo, reindirizzamento alla dashboard prodotti | |
| 2 | Aggiunta di un nuovo prodotto tramite form (nome, codice, quantità) | Prodotto salvato correttamente nel database, visibile nell'elenco Products | |
| 3 | Associazione del prodotto allo scaffale S01 | Associazione salvata correttamente, visibile nella vista Products&Shelves | |
| 4 | Carico fisico: avvicinamento dell'ostacolo al sensore HC-SR04 (riduzione distanza) | Il sensore rileva la nuova distanza e la pubblica su MQTT tramite Node-RED | |
| 5 | Verifica ricezione dato su Node-RED (nodo `magazzino/dashboard`) | Il payload JSON contiene `quantita` aggiornata e `stato` coerente (es. "parziale" o "pieno") | |
| 6 | Verifica visualizzazione su dashboard Node-RED | La gauge "Pezzi Scaffale S01" e il testo "Stato" si aggiornano in tempo reale con i nuovi valori | |
| 7 | Verifica coerenza dato a database (storico letture) | La nuova lettura risulta salvata in `letture_sensore` con timestamp corretto | |

### Screenshot

*(Inserire qui gli screenshot con path Markdown URL-encoded, come da convenzione già usata in `report_test.md`)*

- `![Aggiunta prodotto](./screenshot/scenario1_aggiunta_prodotto.png)`
- `![Dashboard aggiornata](./screenshot/scenario1_dashboard_aggiornata.png)`

### Note / Anomalie riscontrate

*(Descrivere eventuali comportamenti imprevisti, es. ritardi di aggiornamento, discrepanze tra dato atteso e mostrato)*

---

## Scenario 2: Scaffale che si svuota

**Obiettivo**: verificare che la rimozione di colli dallo scaffale generi correttamente un'allerta di stato "vuoto" e che questa venga notificata sulla dashboard.

**Precondizioni**:
- Scaffale S01 in stato "pieno" o "parziale" (partire da Scenario 1 già completato)
- Sistema in esecuzione e monitoraggio attivo

### Passi

| # | Passo | Risultato atteso | Risultato ottenuto |
|---|-------|-------------------|---------------------|
| 1 | Rimozione fisica dei colli: allontanamento dell'ostacolo dal sensore HC-SR04 | Il sensore rileva l'aumento di distanza | |
| 2 | Pubblicazione dato aggiornato su MQTT (topic `magazzino/dashboard`) | Payload con `quantita: 0` e `stato: "vuoto"` | |
| 3 | Verifica ricezione su Node-RED | Il nodo function "Stato scaffale" formatta correttamente il messaggio con emoji 🔴 Vuoto | |
| 4 | Verifica allerta/notifica su dashboard | Il testo "Stato" mostra "S01: 🔴 Vuoto" in tempo reale | |
| 5 | Verifica persistenza dato a database | Lo stato "vuoto" risulta salvato correttamente nello storico letture | |
| 6 | (Opzionale) Verifica comportamento con più scaffali monitorati contemporaneamente | Solo lo scaffale interessato cambia stato, gli altri restano invariati | |

### Screenshot

- `![Rimozione colli](./screenshot/scenario2_rimozione_colli.png)`
- `![Allerta vuoto dashboard](./screenshot/scenario2_allerta_vuoto.png)`

### Note / Anomalie riscontrate

*(Es. bug riscontrato: stato bloccato su "vuoto" indipendentemente dalla quantità reale — risolto lato backend da Sara il [data])*

---

## Riepilogo esiti

| Scenario | Esito | Note |
|----------|-------|------|
| Scenario 1 - Ricezione merce | ✅ / ❌ | |
| Scenario 2 - Scaffale che si svuota | ✅ / ❌ | |
