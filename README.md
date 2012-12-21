Das Onlinebeteiligungstool der grünen Bundestagsfraktion
========================================================

Installation
------------

- Lade das [Introduction Package](http://typo3.org/download/) in der Version 4.5 herunter und bringe es zum laufen.
- Erstelle einen neuen Ordner in `htdocs\typo3conf\ext\` und nenne ihn `ww_bbt`, kopiere die Dateien der Extension dort hinein.
- Installiere die Extension im Typo3 Backend.
- In dem Ordner `Frontend users and groups` füge eine neue Benutzergruppe hinzu ("BetatextUser").
- Erzeuge einen Neuen Ordner im Backend und nenne ihn z.B. "Betatext User".
- Lege dort einen neuen Benutzer an: `Username=Foo`, `password=Bar` und gib ihm die Gruppe, die zuvor angelegt wurde.
- Richte eine Rewrite-Rule in htaccess ein:  
	siehe `doc/.htaccess.dist`  	
	`RewriteRule rest\.php(/.*)$ index.php?eID=bbt&route=$1 [QSA,L,PT]`
- Installiere/aktiviere die Extension `saltedpasswords`

- Wähle eine Seite aus, die mit Betatext kommentiert werden soll und kreuze dort für die rechte Spalte unter `Access -> Visibility -> Content Element` "Disable" an (damit rechts genug Platz für die Kommentare ist).
- In "Edit Page" schalte unter `General` den Page Type auf "betatext" und schalte unter dem Reiter `betatext` "commentable text" ein.
- Jetzt sollte sich eine Textstelle mit dem Testuser "Foo" kommentieren lassen.
- Passe ggf. das CSS (oder SCSS) und die dazugehörigen Grafiken im Ordner `ww_bbt/template` an.

- Für die Benutzeranmeldung, installiere die Extension `sr_feuser_register`

- Stelle im Extension Manager für Betatext die Konfiguration ein.