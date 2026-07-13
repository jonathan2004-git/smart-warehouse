+--------+---------------------------------------------------------------------------------
| Table  | Create Table                                                                                                                                                                                                                                                                                                                 |
+--------+---------------------------------------------------------------------------------
| utenti | CREATE TABLE `utenti` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `nome` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci |
+--------+---------------------------------------------------------------------------------


+----------+-------------------------------------------------------------------------------
| Table    | Create Table                                                                                                                                                                                                                                                                                          |
+----------+-------------------------------------------------------------------------------
| prodotti | CREATE TABLE `prodotti` (
  `id_prodotto` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `descrizione` text DEFAULT NULL,
  `misura` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`id_prodotto`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci |
+----------+-------------------------------------------------------------------------------



+----------+-------------------------------------------------------------------------------
| Table    | Create Table                                                                                                                                                                                                                                                                                                                            |
+----------+-------------------------------------------------------------------------------
| scaffali | CREATE TABLE `scaffali` (
  `id_scaffale` varchar(50) NOT NULL,
  `posizione` varchar(100) DEFAULT NULL,
  `stato` varchar(20) DEFAULT 'verde',
  `profondita` decimal(5,2) DEFAULT NULL,
  `nome_scaffale` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_scaffale`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci |
+----------+-------------------------------------------------------------------------------



+-------------------+----------------------------------------------------------------------
| Table             | Create Table                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
+-------------------+----------------------------------------------------------------------
| prodotti_scaffali | CREATE TABLE `prodotti_scaffali` (
  `id_prodotto` int(11) NOT NULL,
  `id_scaffale` varchar(50) NOT NULL,
  `ultima_modifica` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_prodotto`,`id_scaffale`),
  UNIQUE KEY `uq_id_prodotto` (`id_prodotto`),
  KEY `id_scaffale` (`id_scaffale`),
  CONSTRAINT `prodotti_scaffali_ibfk_1` FOREIGN KEY (`id_prodotto`) REFERENCES `prodotti` (`id_prodotto`) ON DELETE CASCADE,
  CONSTRAINT `prodotti_scaffali_ibfk_2` FOREIGN KEY (`id_scaffale`) REFERENCES `scaffali` (`id_scaffale`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci |
+-------------------+----------------------------------------------------------------------


+-----------------+------------------------------------------------------------------------
| Table           | Create Table                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
+-----------------+------------------------------------------------------------------------
| letture_sensore | CREATE TABLE `letture_sensore` (
  `id_lettura` int(11) NOT NULL AUTO_INCREMENT,
  `id_scaffale` varchar(50) DEFAULT NULL,
  `distanza_rilevata` decimal(10,2) DEFAULT NULL,
  `data_lettura` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_lettura`),
  KEY `id_scaffale` (`id_scaffale`),
  CONSTRAINT `letture_sensore_ibfk_1` FOREIGN KEY (`id_scaffale`) REFERENCES `scaffali` (`id_scaffale`)
) ENGINE=InnoDB AUTO_INCREMENT=383564 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci |
+-----------------+------------------------------------------------------------------------


+-----------+------------------------------------------------------------------------------
| Table     | Create Table                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
+-----------+------------------------------------------------------------------------------
| movimenti | CREATE TABLE `movimenti` (
  `id_movimento` int(11) NOT NULL AUTO_INCREMENT,
  `id_prodotto` int(11) DEFAULT NULL,
  `id_scaffale` varchar(50) DEFAULT NULL,
  `tipo_movimento` enum('entrata','uscita','errore') DEFAULT NULL,
  `quantita` int(11) DEFAULT NULL,
  `data_movimento` timestamp NULL DEFAULT current_timestamp(),
  `distanza` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`id_movimento`),
  KEY `id_prodotto` (`id_prodotto`),
  KEY `fk_movimento_scaffale` (`id_scaffale`),
  CONSTRAINT `fk_movimento_scaffale` FOREIGN KEY (`id_scaffale`) REFERENCES `scaffali` (`id_scaffale`) ON DELETE SET NULL,
  CONSTRAINT `movimenti_ibfk_1` FOREIGN KEY (`id_prodotto`) REFERENCES `prodotti` (`id_prodotto`)
) ENGINE=InnoDB AUTO_INCREMENT=6200 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci |
+-----------+------------------------------------------------------------------------------
