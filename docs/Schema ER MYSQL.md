Schema ER MYSQL:
 - Tabella prodotti: 
	Dati generali
	quantita_totale indica la somma del prodotto nell'intero magazzino

 - Tabella scaffali: 
	Posizione nel magazzino
	stato indica se lo scaffale è pieno o vuoto

 - Tabella lettura_sensore: 
	Tramite il sensore, indipendentemente dal software, notiamo se lo scaffale è occupato o no e in base alla distanza capiamo quanto 	è occupato

- Tabella movimenti: 
	Mostra i vari movimenti effettuati e da quale scaffale
	Quando avviene un cambio di distanza si capisce se è pieno o no 
	 

 - Tabella prodotti_scaffali: 
	Mostra se il prodotto è distribuito su più scaffali
	Consente ad ogni scafale di poter avere anche diversi prodotti

