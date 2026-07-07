# Report 


## 1. Introduzione

Questo documento riporta i risultati dei test manuali eseguiti sull'applicazione web di gestione del magazzino.

- Login
- Gestione Prodotti 
- Gestione Scaffali 
- Storico Logistica
- Stato Sensore/Dashboard


## 2 Test — Login

### 2.1 Login con credenziali corrette
- **Passi eseguiti:** inserimento username e password validi, click su "Accedi"
- **Risultato atteso:** accesso alla home 
- **Risultato ottenuto:** accesso alla home 
- **Screenshot:** ![Login effettuato](../Screenshot%20Pagina/Login/appena%20effetuato%20accesso.png)


### 2.2 Login con credenziali errate
- **Passi eseguiti:** inserimento username/password errati, click su "Accedi"
- **Risultato atteso:** messaggio di errore, nessun accesso consentito
- **Risultato ottenuto:** [inserire]
- **Esito:** [PASS/FAIL]
- **Screenshot:** ![Login errore](screenshots/login_errore.png)

### 2.3 Logout
- **Passi eseguiti:** click su "Logout"
- **Risultato atteso:** reindirizzamento alla pagina di login, sessione terminata
- **Risultato ottenuto:** [inserire]
- **Esito:** [PASS/FAIL]
- **Screenshot:** ![Logout](screenshots/logout.png)

---

## 3. Test  Prodotti 

### 3.1 Visualizzazione elenco prodotti
- **Passi eseguiti:** accesso alla pagina "Prodotti"
- **Risultato atteso:** elenco prodotti mostrato correttamente con tutti i campi
- **Risultato ottenuto:** [inserire]
- **Esito:** [PASS/FAIL]
- **Screenshot:** ![Elenco prodotti](screenshots/prodotti_lista.png)

### 3.2 Creazione nuovo prodotto
- **Passi eseguiti:** click su "Nuovo prodotto", compilazione campi, salvataggio
- **Risultato atteso:** prodotto creato e visibile in elenco
- **Risultato ottenuto:** [inserire]
- **Esito:** [PASS/FAIL]
- **Screenshot:** ![Creazione prodotto](screenshots/prodotti_crea.png)

### 3.3 Modifica prodotto esistente
- **Passi eseguiti:** selezione prodotto, modifica campo, salvataggio
- **Risultato atteso:** modifica salvata e visibile in elenco
- **Risultato ottenuto:** [inserire]
- **Esito:** [PASS/FAIL]
- **Screenshot:** ![Modifica prodotto](screenshots/prodotti_modifica.png)

### 3.4 Eliminazione prodotto
- **Passi eseguiti:** selezione prodotto, click su "Elimina", conferma
- **Risultato atteso:** prodotto rimosso dall'elenco
- **Risultato ottenuto:** [inserire]
- **Esito:** [PASS/FAIL]
- **Screenshot:** ![Eliminazione prodotto](screenshots/prodotti_elimina.png)

### 3.5 Validazione campi obbligatori / errori input
- **Passi eseguiti:** tentativo di salvataggio con campo nome vuoto
- **Risultato atteso:** messaggio di errore, salvataggio bloccato
- **Risultato ottenuto:** [inserire]
- **Esito:** [PASS/FAIL]
- **Screenshot:** ![Validazione prodotti](screenshots/prodotti_validazione.png)

---

## 4. Test — Scaffali (CRUD completo)

### 4.1 Visualizzazione elenco scaffali
- **Passi eseguiti:** accesso alla pagina "Scaffali"
- **Risultato atteso:** elenco scaffali mostrato correttamente
- **Risultato ottenuto:** [inserire]
- **Esito:** [PASS/FAIL]
- **Screenshot:** ![Elenco scaffali](screenshots/scaffali_lista.png)

### 4.2 Creazione nuovo scaffale
- **Passi eseguiti:** click su "Nuovo scaffale", compilazione campi, salvataggio
- **Risultato atteso:** scaffale creato e visibile in elenco
- **Risultato ottenuto:** [inserire]
- **Esito:** [PASS/FAIL]
- **Screenshot:** ![Creazione scaffale](screenshots/scaffali_crea.png)

### 4.3 Modifica scaffale esistente
- **Passi eseguiti:** selezione scaffale, modifica campo, salvataggio
- **Risultato atteso:** modifica salvata e visibile in elenco
- **Risultato ottenuto:** [inserire]
- **Esito:** [PASS/FAIL]
- **Screenshot:** ![Modifica scaffale](screenshots/scaffali_modifica.png)

### 4.4 Eliminazione scaffale
- **Passi eseguiti:** selezione scaffale, click su "Elimina", conferma
- **Risultato atteso:** scaffale rimosso dall'elenco
- **Risultato ottenuto:** [inserire]
- **Esito:** [PASS/FAIL]
- **Screenshot:** ![Eliminazione scaffale](screenshots/scaffali_elimina.png)

### 4.5 Validazione campi obbligatori / errori input
- **Passi eseguiti:** tentativo di salvataggio con id scaffale vuoto
- **Risultato atteso:** messaggio di errore, salvataggio bloccato
- **Risultato ottenuto:** [inserire]
- **Esito:** [PASS/FAIL]
- **Screenshot:** ![Validazione scaffali](screenshots/scaffali_validazione.png)

---

## 5. Test — Dashboard

### 5.1 Visualizzazione dati in tempo reale
- **Passi eseguiti:** accesso alla dashboard
- **Risultato atteso:** valori aggiornati coerenti con le letture dei sensori
- **Risultato ottenuto:** [inserire]
- **Esito:** [PASS/FAIL]
- **Screenshot:** ![Dashboard](screenshots/dashboard_realtime.png)

### 5.2 Aggiornamento automatico dei valori
- **Passi eseguiti:** confronto valore prima/dopo variazione via MQTT
- **Risultato atteso:** la dashboard si aggiorna senza refresh manuale
- **Risultato ottenuto:** [inserire]
- **Esito:** [PASS/FAIL]
- **Screenshot:** ![Aggiornamento dashboard](screenshots/dashboard_update.png)

### 5.3 Stato online/offline scaffali
- **Passi eseguiti:** spegnimento/accensione sensore, osservazione stato
- **Risultato atteso:** stato online/offline riflette la realtà (topic `magazzino/sensore/stato`)
- **Risultato ottenuto:** [inserire]
- **Esito:** [PASS/FAIL]
- **Screenshot:** ![Stato sensore](screenshots/dashboard_stato_sensore.png)

---

## 6. Test — Storico Logistica

### 6.1 Visualizzazione storico letture
- **Passi eseguiti:** accesso alla pagina "Storico Logistica"
- **Risultato atteso:** elenco cronologico delle letture/movimenti mostrato correttamente
- **Risultato ottenuto:** [inserire]
- **Esito:** [PASS/FAIL]
- **Screenshot:** ![Storico](screenshots/storico_lista.png)

### 6.2 Filtro per scaffale/data (se presente)
- **Passi eseguiti:** applicazione filtro
- **Risultato atteso:** elenco filtrato correttamente
- **Risultato ottenuto:** [inserire]
- **Esito:** [PASS/FAIL]
- **Screenshot:** ![Filtro storico](screenshots/storico_filtro.png)

---

## 7. Test — Prodotti&Scaffali (vista associazioni)

### 7.1 Visualizzazione distribuzione prodotti sugli scaffali
- **Passi eseguiti:** accesso alla pagina "Prodotti&Scaffali"
- **Risultato atteso:** associazioni prodotto-scaffale mostrate correttamente con data ultima modifica
- **Risultato ottenuto:** [inserire]
- **Esito:** [PASS/FAIL]
- **Screenshot:** ![Prodotti e scaffali](screenshots/prodotti_scaffali_lista.png)

### 7.2 Azione pulsante "+"
- **Passi eseguiti:** click sul pulsante "+" associato a una riga
- **Risultato atteso:** [descrivere comportamento atteso]
- **Risultato ottenuto:** [inserire]
- **Esito:** [PASS/FAIL]
- **Screenshot:** ![Azione pulsante +](screenshots/prodotti_scaffali_azione.png)

---

## 8. Riepilogo finale

| Sezione | Test totali | PASS | FAIL |
|---|---|---|---|
| Login | 3 | | |
| Prodotti | 5 | | |
| Scaffali | 5 | | |
| Dashboard | 3 | | |
| Storico | 2 | | |
| Prodotti&Scaffali | 2 | | |
| **Totale** | **20** | | |

### Bug/anomalie riscontrate
- [elencare eventuali problemi trovati durante i test]

### Conclusioni
[breve valutazione complessiva sulla stabilità e funzionalità dell'applicazione]
