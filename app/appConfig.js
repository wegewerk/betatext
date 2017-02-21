define(function(){

    return {
        logging: false,
        REST: { url:'rest.php',
                login:'rest.php/login' ,
                logout:'rest.php/logout' },
        wordRegex: /[a-z0-9\-äöüÄÖÜß]+/gi,
        readonly: !$('body').hasClass('bbt_enabled'),
        limits: { commentLength: { max:700, min:3 } },
        pstepsView: { loadContent: '#mainContent', visibleSteps: 4 }
    }

});