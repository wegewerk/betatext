# Das Onlinebeteiligungstool der grünen Bundestagsfraktion #

## Installation ##
The english manual with a tutorial can be found in doc/

- Installiere die Extension im Typo3 Backend.
- Inkludiere die statischen Templates.
	- Die Defaultkonfiguration geht davon aus, dass der kommentierbare Text in einem Element mit der id "mainContent" steht. Um den Selektor (und die ggf. die Stylesheets) an zu passen, sollte das entsprechende Typoscript überschrieben werden.
	- Der Text muss mit der Klasse "csc-default" ausgezeichnet sein und als id die UID des Texts enthalten.  
- In dem Ordner `Frontend users and groups` füge eine neue Benutzergruppe hinzu ("BetatextUser").
- Erzeuge einen Neuen Ordner im Backend und nenne ihn z.B. "Betatext User".
- Lege dort einen neuen Benutzer an: `Username=Foo`, `password=Bar` und gib ihm die Gruppe, die zuvor angelegt wurde.
- Richte eine Rewrite-Rule in htaccess ein:
	`RewriteRule rest\.php(/.*)$ index.php?eID=bbt&route=$1 [QSA,L,PT]`
- Installiere/aktiviere die Extension `realurl`
- Wähle eine Seite aus und schalte unter `General` den Page Type auf "betatext" und schalte unter dem Reiter `betatext` "commentable text" ein.
- Jetzt sollte sich eine Textstelle mit dem Testuser "Foo" kommentieren lassen.
- Für die Benutzeranmeldung, installiere eine passende Extension, z.B. `sr_feuser_register`.
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

- Es gibt ein Serverseitiges Logfile in `we_betatext/lib/debug.log`.
- Es gibt ein Clientseitiges logging (Javascript Console), das in `we_betatext/app/appConfig.js` eingeschaltet werden kann. Weiter ist dort eingestellt:
	- `REST` Welche URL die Extension verwenden soll (siehe auch: Rewrite-Rule).
	- `wordRegex` Regular Expression um einzenle Wörter zu identifizieren.
	- `readonly` Selektor für das nur-Lesen von Seiten, bei denen kein Betatext mehr aktiviert ist (siehe weiter unten).
	- `limits` Länge eines gültigen Kommentars.
- Schaltet man im Reiter `betatext` "commentable text" wieder aus, so kann man keine neuen Kommentare auf der Seite mehr verfassen oder bewerten aber alte anschauen.
