.. ==================================================
.. FOR YOUR INFORMATION
.. --------------------------------------------------
.. -*- coding: utf-8 -*- with BOM.

.. include:: ../Includes.txt


.. _configuration:

Configuration
=============

There is an server side log file located in we_betatext/lib/debug.log.

The client will log some things in the java script console. You can deactivate this in appConfig.js.

It is necessary to add an rewrite-rule in the .htaccess file:

::
    RewriteRule rest\.php(/.*)$ index.php?eID=bbt&route=$1 [QSA,L,PT]

we_betatext/app/appConfig.js:

==========  ==========  =======================================================  ================================================
Property:   Data type:  Description:                                             Default:
==========  ==========  =======================================================  ================================================
logging     boolean     Writes debug information in the java script console.     true
----------  ----------  -------------------------------------------------------  ------------------------------------------------
REST        array       The URLs the extension will be using.                    url:'rest.php',

                                                                                 login:'rest.php/login' ,

                                                                                 logout:'rest.php/logout'
----------  ----------  -------------------------------------------------------  ------------------------------------------------
wordRegex   string      This regular expression defines single words.            /[a-z0-9\-äöüÄÖÜß]+/gi
----------  ----------  -------------------------------------------------------  ------------------------------------------------
readonly    string      The Selector for deactivated Betatext sites.             !$('body').hasClass('bbt_enabled')

                        If set to true, all Betatext sites will be readonly.
----------  ----------  -------------------------------------------------------  ------------------------------------------------
Limits      array       Defines the length of a valid comment.                   commentLength: { max:700, min:3 }

                        The max length of the text is also enforced in
                        'webetatext_comment.php'!
----------  ----------  -------------------------------------------------------  ------------------------------------------------
pstepsView  array       loadContent: jQuery Selector. If set, only this part of  { loadContent: '#mainContent', visibleSteps: 4 }
                        a linked page is shown in pstep-popup

                        visibleSteps: number of pSteps visible in your design.
==========  ==========  =======================================================  ================================================

we_betatext/static/setup.txt:

=================  ==========  ======================================================  ============
Property:          Data type:  Description:                                            Default:
=================  ==========  ======================================================  ============
TSFE:page|doktype  int         Betatext adds the pagetype 124 as a commentable page.   124
-----------------  ----------  ------------------------------------------------------  ------------
bbt_selector       string      This selector is used to mark the commentable text. If  #mainContent
                               your template does not contain this id, betatext will
                               not work.
=================  ==========  ======================================================  ============

we_betatext configuration:

================  ==========  ======================================================  ========
Property:         Data type:  Description:                                            Default:
================  ==========  ======================================================  ========
dokType           int         The doktype of commentable pages.                       124
----------------  ----------  ------------------------------------------------------  --------
groupID           int         The ID of the Usergroup able to comment.
----------------  ----------  ------------------------------------------------------  --------
userPID           int         The ID of the Folder containing the User.
----------------  ----------  ------------------------------------------------------  --------
url_registration  string      The URL to an registration form (user registration
                              extension of your choice needed).
----------------  ----------  ------------------------------------------------------  --------
url_pwforgot      string      The URL to an form for recovering a forgotten password
                              (user registration extension of your choice needed).
----------------  ----------  ------------------------------------------------------  --------
url_edit          string      The URL to show and edit the user information (user
                              registration extension of your choice needed).
----------------  ----------  ------------------------------------------------------  --------
infomail_from     string      Sender of the comment information Email.
----------------  ----------  ------------------------------------------------------  --------
infomail_to       string      This Email address will receive Emails if new comments
                              are posted and contain a link to delete inappropriate
                              comments.
----------------  ----------  ------------------------------------------------------  --------
authhash_salt     string      A String used so salt passwords – generate randomly
                              and set only once. If you change this String later on,
                              older passwords can't be verified anymore.
================  ==========  ======================================================  ========

You will have to change the css/scss if you do not use the introduction package not only to make the
colors fit but to make the box sizes fit in place.
