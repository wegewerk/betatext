// To run the build type: node build.js

var requirejs = require('./node_modules/requirejs/bin/r.js');

var baseConfig = {
    // Wraps all scripts in an IIFE (Immediately Invoked Function Expression)
    // (function() { + content + }());
    wrap: true,

    // Uses uglify.js for minification none|uglify
    optimize: "none"
};

// Array of build configs, the baseConfig will be mixed into all of them
var targets = [
    {
        baseUrl: '../',

        include: [
            'jquery-1.7.1',
            'underscore-1.3.1',
            'backbone',
            'rangy/rangy-core.js',
            'rangy/rangy-cssclassapplier.js',
            'rangy/rangy-textrange.js'
        ],

        // The optimized build file will use almond.js (AMD shim) instead of the larger Require.js
        name: 'build/node_modules/almond/almond',

        // The optimized mobile build file will put into the app directory
        out: 'dist/vendor.js'
    },
    {
        baseUrl: '../../app/',

        paths: {
            'app': 'main',
            'text': '../lib/requirejs/text'
        },

        include: [
            'app'
        ],

        // The optimized build file will use almond.js (AMD shim) instead of the larger Require.js
        name: '../lib/build/node_modules/almond/almond',

        out: 'dist/betatext.js'
    }
];

// Function used to mix in baseConfig to a new target
function mix(target) {
    for (var prop in baseConfig) {
        if (baseConfig.hasOwnProperty(prop)) {
            target[prop] = baseConfig[prop];
        }
    }
    return target;
}

//Create a runner that will run a separate build for each item
//in the targets array.
var runner = function() {
    targets.map(function(currentConfig) {
        var mixedConfig = mix(currentConfig);
        console.log('building ' + mixedConfig.out);
        requirejs.optimize(mixedConfig, function(result){
            console.log(mixedConfig.out + ' done');
        });
    });
};

//Run the builds
runner();
