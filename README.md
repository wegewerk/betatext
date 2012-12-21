# Das Onlinebeteiligungstool der grünen Bundestagsfraktion #

## Installation ##

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
- Wähle eine Seite aus, die mit Betatext kommentiert werden soll und kreuze dort für die rechte Spalte unter `Access -> Visibility -> Content Element` "Disable" an (damit auf der rechten Seite genug Platz für die Kommentare ist).
- In "Edit Page" schalte unter `General` den Page Type auf "betatext" und schalte unter dem Reiter `betatext` "commentable text" ein.
- Jetzt sollte sich eine Textstelle mit dem Testuser "Foo" kommentieren lassen.
- Passe ggf. das CSS (oder SCSS) und die dazugehörigen Grafiken im Ordner `ww_bbt/template` an.
- Für die Benutzeranmeldung, installiere die Extension `sr_feuser_register`.
- Stelle im Extension Manager für Betatext die Konfiguration ein.
	- `[defaultLogo]` Standard-Logo der User wenn, kein benutzerdefiniertes eingestellt wurde.
	- `[dokType]` Der doktype der kommentierbaren Seiten.
	- `[groupID]` Benutzergruppen-ID der Nutzer (die ID von "BetatextUser" in `Frontend users and groups`)
	- `[userPID]` Parent-IDs der erlaubten Nutzer (ID des Ordners, in dem die User abgelegt werden)
	- `[url_registration]` Diese URL wird aufgerufen, wenn man in Betatext den Link "Noch nicht registriert?" anklickt.
	- `[url_pwforgot]` Diese URL wird aufgerufen, wenn man in Betatext den Link "Passwort vergessen?" anklickt.
	- `[url_edit]` Auf dieser Seite kann ein Benutzer seine Daten ändern.
	- `[infomail_from]` Absender E-Mail-Adresse von Kommentarbenachrichtigungen.
	- `[infomail_to]` Empfänger E-Mail-Adresse von Kommentarbenachrichtigungen für Redakteure. Ermöglichst die Sichtung und ggf. Löschung des Kommentars.
	- `[authhash_salt]` Zeichenkette zum salzen der Authentifizierungs-Hashes der Kommentarbenachrichtigungen: Am besten zufällig generiert.

		**Nach einmaligem Setzen nicht mehr ändern!** Bestehende Benutzerpasswörter können mit dem falschen Salz nicht mehr erkannt werden.

## Hinweise ##

- Es gibt ein Serverseitiges Logfile in `ww_bbt/lib/debug.log`.
- Es gibt ein Clientseitiges logging (Javascript Console), das in `ww_bbt/app/appConfig.js` ausgeschaltet werden kann. Weiter lässt sich dort einstellen:
	- `REST` Welche URL die Extension verwenden soll (siehe auch: Rewrite-Rule).
	- `wordRegex` Regular Expression um einzenle Wörter zu identifizieren.
	- `readonly` Selektor für das nur-Lesen von Seiten, bei denen kein Betatext mehr aktiviert ist (siehe weiter unten).
	- `limits` Länge eines gültigen Kommentars.
- Schaltet man im Reiter `betatext` "commentable text" wieder aus, so kann man keine neuen Kommentare auf der Seite mehr verfassen oder bewerten aber alte anschauen.