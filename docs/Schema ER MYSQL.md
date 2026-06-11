Schema ER MYSQL:
 - Tabella prodotti: 
	Dati generali
	quantita_totale indica la somma del prodotto nell'intero magazzino

 - Tabella scaffali: 
	Posizione nel magazzino
	stato indica se lo scaffale è pieno o vuoto

 - Tabella lettura_sensore: 
	Tramite il sensore, indipendentemente dal software, notiamo se lo scaffale è occupato o no e in base alla distanza capiamo quanto 	è occupato
+-------------------+---------------+------+-----+---------------------+----------------+
| Field             | Type          | Null | Key | Default             | Extra          |
+-------------------+---------------+------+-----+---------------------+----------------+
| id_lettura        | int(11)       | NO   | PRI | NULL                | auto_increment |
| id_scaffale       | varchar(50)   | YES  | MUL | NULL                |                |
| distanza_rilevata | decimal(10,2) | YES  |     | NULL                |                |
| data_lettura      | timestamp     | YES  |     | current_timestamp() |                |
+-------------------+---------------+------+-----+---------------------+----------------+
   
- Tabella movimenti: 
	Mostra i vari movimenti effettuati e da quale scaffale
	Quando avviene un cambio di distanza si capisce se è pieno o no 
+----------------+--------------------------+------+-----+---------------------+----------------+
| Field          | Type                     | Null | Key | Default             | Extra          |
+----------------+--------------------------+------+-----+---------------------+----------------+
| id_movimento   | int(11)                  | NO   | PRI | NULL                | auto_increment |
| id_prodotto    | int(11)                  | YES  | MUL | NULL                |                |
| id_scaffale    | varchar(50)              | YES  | MUL | NULL                |                |
| tipo_movimento | enum('entrata','uscita') | YES  |     | NULL                |                |
| quantita       | int(11)                  | YES  |     | NULL                |                |
| data_movimento | timestamp                | YES  |     | current_timestamp() |                |
+----------------+--------------------------+------+-----+---------------------+----------------+

 - Tabella prodotti_scaffali: 
	Mostra se il prodotto è distribuito su più scaffali
	Consente ad ogni scafale di poter avere anche diversi prodotti
+-----------------+-------------+------+-----+---------------------+-------------------------------+
| Field           | Type        | Null | Key | Default             | Extra                         |
+-----------------+-------------+------+-----+---------------------+-------------------------------+
| id_prodotto     | int(11)     | NO   | PRI | NULL                |                               |
| id_scaffale     | varchar(50) | NO   | PRI | NULL                |                               |
| ultima_modifica | timestamp   | YES  |     | current_timestamp() | on update current_timestamp() |
+-----------------+-------------+------+-----+---------------------+-------------------------------+

