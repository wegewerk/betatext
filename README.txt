Das Onlinebeteiligungstool der grünen Bundestagsfraktion
========================================================

Installation
------------

- Rewrite-Rule in htaccess einrichten
-> siehe doc/.htaccess.dist

RewriteRule rest\.php(/.*)$ index.php?eID=bbt&route=$1 [QSA,L,PT]

- salted passwords einschalten
