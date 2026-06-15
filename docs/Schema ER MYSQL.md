Schema ER MYSQL:
 - Tabella prodotti: 
	Dati generali, anagrafica degli articoli nel sistema

	id_prodotto (INT): Identificativo univoco e numerico del prodotto. Viene incrementato automaticamente dal database a ogni nuovo inserimento, garantendo 		l'assenza di duplicati.

	nome (VARCHAR 100): Il nome o titolo identificativo dell'articolo. È un campo obbligatorio con un limite di 100 caratteri.

	descrizione (TEXT): Campo testuale facoltativo e senza limiti stringenti di lunghezza, utilizzato per inserire dettagli aggiuntivi o specifiche	sul prodotto.

	misura (DECIMAL 5,2): Valore numerico decimale opzionale che esprime la dimensione fisica. 	Questo dato è fondamentale per permettere all'algoritmo del 		backend di calcolare matematicamente quanti pezzi sono presenti basandosi sullo spazio residuo rilevato dal sensore IoT.

![Tabella Prodotti](doc/Photos_Tables/prodotti.png)



 - Tabella scaffali: 
	Mappa i punti di stoccaggio fisici all'interno del magazzino

	id_scaffale (VARCHAR 50): Identificativo univoco del singolo scaffale. Essendo chiave primaria, impedisce la creazione di scaffali duplicati nel sistema ed è 	inserito obbligatoriamente.

	posizione (VARCHAR 100): Campo testuale opzionale utilizzato per descrivere la collocazione fisica dello scaffale all'interno dello stabilimento. Se non 		specificato dall'utente, il backend assegna un valore temporaneo di default.

	stato (VARCHAR 20): Indica la condizione di riempimento dello scaffale. Ha un valore predefinito impostato su 'verde' e viene aggiornato automaticamente dal 	sistema in base ai dati ricevuti dai sensori IoT, assumendo valori legati alla logistica di stoccaggio.

	profondita (DECIMAL 5,2): Valore numerico decimale che memorizza la profondità totale espressa in centimetri dello scaffale vuoto. Questo dato è essenziale 	poiché funge da punto di riferimento per l'algoritmo del server il sistema calcola lo spazio occupato dalla merce e determina la quantità di prodotti 			presenti, confrontando la profondità massima con la distanza rilevata dal sensore ultrasonico.

![Tabella Prodotti](doc/Photos_Tables/scaffali.png)



 - Tabella letture_sensore: 
	Tramite il sensore in base alla distanza capiamo quanto è occupato, un registro storico che archivia tutti i dati grezzi trasmessi dai sensori tramite MQTT.

	id_lettura (INT): È un contatore numerico progressivo generato automaticamente dal database per ogni nuova ricezione di dati, utile per indicizzare 			cronologicamente i messaggi del sensore.

	id_scaffale (VARCHAR 50): Memorizza l'identificativo dello scaffale a cui appartiene il sensore che ha trasmesso il dato. La dicitura "MUL" nella colonna 		"Key" indica la presenza di un indice che collega questa tabella alla tabella principale degli scaffali, ottimizzando le query di ricerca dell'ultima lettura.

	distanza_rilevata (DECIMAL 10,2): Il valore numerico inviato dal sensore. Rappresenta lo spazio vuoto misurato dal sensore tra se stesso e il primo ostacolo 	rilevato.

	data_lettura (TIMESTAMP): Indica il momento esatto in cui la lettura viene registrata sul database. Se non specificato, il sistema inserisce in automatico la 	data e l'ora correnti del server, permettendo di tracciare la timeline degli eventi in tempo reale.

![Tabella Prodotti](doc/Photos_Tables/letture_sensore.png)


   
- Tabella movimenti: 
	Mostra i vari movimenti effettuati e da quale scaffale vengono eseguiti

	id_movimento (INT): È un identificativo numerico progressivo generato automaticamente che, in modo univoco, cataloga ogni transazione logistica.

	id_prodotto (INT): Memorizza l'identificativo del prodotto coinvolto nell'operazione. La dicitura "MUL" nella colonna "Key" indica un indice che collega il 	movimento all'anagrafica prodotti.

	id_scaffale (VARCHAR 50): Identifica lo scaffale da cui la merce è stata prelevata o in cui è stata depositata.

	tipo_movimento (ENUM): Campo a scelta obbligata vincolato ai soli valori "entrata" o "uscita". Definisce la natura del flusso logistico.

	quantita (INT): Il numero di pezzi movimentati durante la singola operazione. Questo valore viene utilizzato dal backend per aggiornare, per somma o 			sottrazione, la disponibilità complessiva.

	data_movimento (TIMESTAMP): Registra il momento esatto in cui è avvenuta la transazione. Valorizzato automaticamente dal database con l'ora corrente del 		server, permette di ricostruire la cronologia dei flussi e alimentare la pagina dello storico delle movimentazioni.

![Tabella Prodotti](doc/Photos_Tables/movimenti.png)



 - Tabella prodotti_scaffali: 
	Mostra se il prodotto è distribuito su più scaffali
	Consente ad ogni scafale di poter avere anche diversi prodotti

	id_prodotto (INT): Memorizza l'identificativo del prodotto. Insieme a "id_scaffale" costituisce una chiave primaria composta, garantendo l'unicità 				dell'accoppiamento: lo stesso prodotto non può essere associato due volte allo stesso identico scaffale.

	id_scaffale (VARCHAR 50): Memorizza l'identificativo dello scaffale logistico. Funge da vincolo relazionale verso l'anagrafica degli scaffali.

	ultima_modifica (TIMESTAMP): Tiene traccia del momento esatto in cui l'associazione è stata creata o modificata. Il database aggiorna automaticamente questo 	valore in tempo reale ogni volta che la riga viene modificata, senza bisogno di specificarlo manualmente nel codice del backend.

![Tabella Prodotti](doc/Photos_Tables/prodotti_scaffali.png)

