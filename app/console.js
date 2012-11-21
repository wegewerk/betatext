define( [ 'appConfig' ]
,function( AppConfig ){

    if( AppConfig.logging && window.console ) return console;
    else {
        var names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml",
        "group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];

        dummyconsole = {};
        for (var i = 0; i < names.length; ++i)
            dummyconsole[names[i]] = function() {}

        return dummyconsole;

    }

});