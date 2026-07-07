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
- **Passi eseguiti:** inserimento username/password errati click su "Accedi"
- **Risultato atteso:** messaggio di errore, nessun accesso consentito
- **Risultato ottenuto:** nessun accesso 
- **Screenshot:** ![accesso negato](../Screenshot%20Pagina/Login/accesso%20negato.png)

### 2.3 Logout
- **Passi eseguiti:** click su "Logout"
- **Risultato atteso:** reindirizzamento alla pagina di login
- **Risultato ottenuto:** uscito dalla home, e ritorno alla apgina iniziale 
- **Screenshot:** ![Logout effettuato](../Screenshot%20Pagina/Login/appena%20effettuato%20logout.png)

---

## 3. Test  Prodotti 

### 3.1 Visualizzazione elenco prodotti
- **Passi eseguiti:** accesso alla pagina "Prodotti"
- **Risultato atteso:** elenco prodotti mostrato correttamente con tutti i campi
- **Risultato ottenuto:** Visualizzato elenco
- **Screenshot:** ![Elenco prodotti](../Screenshot%20Pagina/Prodotti/prodotti.png)

### 3.2 Creazione nuovo prodotto
- **Passi eseguiti:** click su "Nuovo prodotto", compilazione campi, salvataggio
- **Risultato atteso:** prodotto creato e visibile in elenco
- **Risultato ottenuto:** Prodotto creato correttamente 
- **Screenshot:** ![Prodotto aggiunto](../Screenshot%20Pagina/Prodotti/prodotti%20dopo%20l'aggiunzione.png)

### 3.3 Modifica prodotto esistente
- **Passi eseguiti:** selezione prodotto, modifica campo, salvataggio
- **Risultato atteso:** modifica salvata e visibile in elenco
- **Risultato ottenuto:** prodotto modificato correttamente 
- **Screenshot:** ![Modifica prodotto](../Screenshot%20Pagina/Prodotti/modifica%20prodotto%20esistente.png)

### 3.4 Eliminazione prodotto
- **Passi eseguiti:** selezione prodotto, click su "Elimina", conferma
- **Risultato atteso:** prodotto rimosso dall'elenco
- **Risultato ottenuto:** prodotto eliminato correttamente 
- **Screenshot:** ![Eliminazione prodotto](../Screenshot%20Pagina/Prodotti/eliminazione%20prodotto.png)

### 3.5 Validazione campi obbligatori / errori input
- **Passi eseguiti:** tentativo di salvataggio con campo nome vuoto
- **Risultato atteso:** messaggio di errore, salvataggio bloccato
- **Risultato ottenuto:** nessuna segnalazione di errore
- **Screenshot:** ![Validazione campo numerico](../Screenshot%20Pagina/Prodotti/quando%20al%20posto%20del%20numero%20metto%20delle%20lettere%20non%20aggiunge%20niente%20e%20basta%20non%20segnala%20nessun%20errore.png)

---

## 4. Test  Scaffali 

### 4.1 Visualizzazione elenco scaffali
- **Passi eseguiti:** accesso alla pagina "Scaffali"
- **Risultato atteso:** elenco scaffali mostrato correttamente
- **Risultato ottenuto:** scaffali visualizzati correttamente
- **Screenshot:** ![Elenco scaffali](../Screenshot%20Pagina/Scaffali/scaffali.png)

### 4.2 Creazione nuovo scaffale
- **Passi eseguiti:** Creazione Scaffale
- **Risultato atteso:** scaffale creato e visibile in elenco
- **Risultato ottenuto:** lo scaffale non è possibile da aggiungere manualmente 

### 4.3 Modifica scaffale esistente
- **Passi eseguiti:** selezione scaffale, modifica campo, salvataggio
- **Risultato atteso:** modifica salvata e visibile in elenco
- **Risultato ottenuto:** scaffale modificato
- **Screenshot:** ![Modifica scaffale](screenshots/scaffali_modifica.png)

### 4.4 Eliminazione scaffale
- **Passi eseguiti:** selezione scaffale, click su "Elimina", conferma
- **Risultato atteso:** scaffale rimosso dall'elenco
- **Risultato ottenuto:** scaffale eliminato
- **Screenshot:** ![Eliminazione scaffale](../Screenshot%20Pagina/Scaffali/Eliminazione%20scaffale.png)

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

