(function () {
/**
 * @license almond 0.3.3 Copyright jQuery Foundation and other contributors.
 * Released under MIT license, http://github.com/requirejs/almond/LICENSE
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
            foundI, foundStarMap, starI, i, j, part, normalizedBaseParts,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name) {
            name = name.split('/');
            lastIndex = name.length - 1;

            // If wanting node ID compatibility, strip .js from end
            // of IDs. Have to do this here, and not in nameToUrl
            // because node allows either .js or non .js to map
            // to same file.
            if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
            }

            // Starts with a '.' so need the baseName
            if (name[0].charAt(0) === '.' && baseParts) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that 'directory' and not name of the baseName's
                //module. For instance, baseName of 'one/two/three', maps to
                //'one/two/three.js', but we want the directory, 'one/two' for
                //this normalization.
                normalizedBaseParts = baseParts.slice(0, baseParts.length - 1);
                name = normalizedBaseParts.concat(name);
            }

            //start trimDots
            for (i = 0; i < name.length; i++) {
                part = name[i];
                if (part === '.') {
                    name.splice(i, 1);
                    i -= 1;
                } else if (part === '..') {
                    // If at the start, or previous value is still ..,
                    // keep them so that when converted to a path it may
                    // still work when converted to a path, even though
                    // as an ID it is less than ideal. In larger point
                    // releases, may be better to just kick out an error.
                    if (i === 0 || (i === 1 && name[2] === '..') || name[i - 1] === '..') {
                        continue;
                    } else if (i > 0) {
                        name.splice(i - 1, 2);
                        i -= 2;
                    }
                }
            }
            //end trimDots

            name = name.join('/');
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            var args = aps.call(arguments, 0);

            //If first arg is not require('string'), and there is only
            //one arg, it is the array form without a callback. Insert
            //a null so that the following concat is correct.
            if (typeof args[0] !== 'string' && args.length === 1) {
                args.push(null);
            }
            return req.apply(undef, args.concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    //Creates a parts array for a relName where first part is plugin ID,
    //second part is resource ID. Assumes relName has already been normalized.
    function makeRelParts(relName) {
        return relName ? splitPrefix(relName) : [];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relParts) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0],
            relResourceName = relParts[1];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relResourceName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relResourceName));
            } else {
                name = normalize(name, relResourceName);
            }
        } else {
            name = normalize(name, relResourceName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i, relParts,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;
        relParts = makeRelParts(relName);

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relParts);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, makeRelParts(callback)).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {
        if (typeof name !== 'string') {
            throw new Error('See almond README: incorrect module build, no module name');
        }

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("../lib/build/node_modules/almond/almond", function(){});

define('appConfig',[],function(){

    return {
        logging: true,
        REST: { url:'rest.php',
                login:'rest.php/login' ,
                logout:'rest.php/logout' },
        wordRegex: /[a-z0-9\-äöüÄÖÜß]+/gi,
        readonly: !$('body').hasClass('bbt_enabled'),
        limits: { commentLength: { max:700, min:3 } },
        pstepsView: { loadContent: '#mainContent', visibleSteps: 4 }
    }

});
define('eventDispatcher',[],function(){

  return _.clone(Backbone.Events);

});
define(  'models/comment',['appConfig','eventDispatcher']
,function( AppConfig,  EventDispatcher){

  return Backbone.Model.extend({
    urlRoot: AppConfig.REST.url+'/comment',
    defaults: function() {
      return {
        TextID: 0,
        Content: "default comment content",
        StartIndex:0,
        EndIndex:0,
        Likes:0,
        Dislikes:0,
        UserVote:0
      };
    },
    numVotes: function() {
      return this.get('Likes') + this.get('Dislikes');
    },
    // Farbskala:
    //    rot             grau           grün
    // +-----------|----|--|--|-----|----------+
    // |  1        | 2  |  3  |   4 |  5       |
    // +-----------|----|--|--|-----|----------+
    //            33   45 50 55    66
    getVoteClass: function() {
      var pctLikes = this.get('Likes') * 100 / this.numVotes();
      var level = 0;
      if( pctLikes <=33 ) level =1;
      if( pctLikes > 33 && pctLikes <=46 ) level =2;
      if( pctLikes > 46 && pctLikes <=56 ) level =3;
      if( pctLikes > 56 && pctLikes <=67 ) level =4;
      if( pctLikes > 67 ) level =5;
      return 'acceptanceLevel-'+level;
    },
    initialize: function () {
      _.bindAll(this);
      if (!this.get("content")) {
        this.set({"content": this.defaults.content});
      }
    },
    toJSON: function(options) {
      var attrs = _.clone(this.attributes);
      attrs.numVotes = this.numVotes();
      attrs.voteClass = this.getVoteClass();
      attrs.footnoteid = this.id || this.cid;
      return attrs;
    },

  });

});
define( 'console',[ 'appConfig' ]
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
define('models/comments',['models/comment','eventDispatcher','appConfig','console'],function(CommentModel,EventDispatcher,AppConfig,console){
return Backbone.Collection.extend({
    model: CommentModel,
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      var collection = this;
      var success = options.success;
      options.success = function(resp, status, xhr) {
          console.log('Comments have arrived!');
          EventDispatcher.trigger('comments:arrived',collection);
          if (success) success(collection, resp);
      };
      return Backbone.Collection.prototype.fetch.call(this,options);
    }
  });
});
define('models/text',['models/comments','appConfig'],function(CommentList,AppConfig){

  return Backbone.Model.extend({
    idAttribute: "TextID",
    urlRoot: AppConfig.REST.url+'/text',

    initialize: function() {
      this.comments = new CommentList;
      this.comments.url = 'rest.php/comments/'+this.id
      this.comments.fetch();
 }
  });

});
/**
 * @license RequireJS text 2.0.1 Copyright (c) 2010-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/requirejs/text for details
 */
/*jslint regexp: true */
/*global require: false, XMLHttpRequest: false, ActiveXObject: false,
  define: false, window: false, process: false, Packages: false,
  java: false, location: false */

define('text',['module'], function (module) {
    'use strict';

    var progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'],
        xmlRegExp = /^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im,
        bodyRegExp = /<body[^>]*>\s*([\s\S]+)\s*<\/body>/im,
        hasLocation = typeof location !== 'undefined' && location.href,
        defaultProtocol = hasLocation && location.protocol && location.protocol.replace(/\:/, ''),
        defaultHostName = hasLocation && location.hostname,
        defaultPort = hasLocation && (location.port || undefined),
        buildMap = [],
        masterConfig = (module.config && module.config()) || {},
        text, fs;

    text = {
        version: '2.0.1',

        strip: function (content) {
            //Strips <?xml ...?> declarations so that external SVG and XML
            //documents can be added to a document without worry. Also, if the string
            //is an HTML document, only the part inside the body tag is returned.
            if (content) {
                content = content.replace(xmlRegExp, "");
                var matches = content.match(bodyRegExp);
                if (matches) {
                    content = matches[1];
                }
            } else {
                content = "";
            }
            return content;
        },

        jsEscape: function (content) {
            return content.replace(/(['\\])/g, '\\$1')
                .replace(/[\f]/g, "\\f")
                .replace(/[\b]/g, "\\b")
                .replace(/[\n]/g, "\\n")
                .replace(/[\t]/g, "\\t")
                .replace(/[\r]/g, "\\r")
                .replace(/[\u2028]/g, "\\u2028")
                .replace(/[\u2029]/g, "\\u2029");
        },

        createXhr: masterConfig.createXhr || function () {
            //Would love to dump the ActiveX crap in here. Need IE 6 to die first.
            var xhr, i, progId;
            if (typeof XMLHttpRequest !== "undefined") {
                return new XMLHttpRequest();
            } else if (typeof ActiveXObject !== "undefined") {
                for (i = 0; i < 3; i += 1) {
                    progId = progIds[i];
                    try {
                        xhr = new ActiveXObject(progId);
                    } catch (e) {}

                    if (xhr) {
                        progIds = [progId];  // so faster next time
                        break;
                    }
                }
            }

            return xhr;
        },

        /**
         * Parses a resource name into its component parts. Resource names
         * look like: module/name.ext!strip, where the !strip part is
         * optional.
         * @param {String} name the resource name
         * @returns {Object} with properties "moduleName", "ext" and "strip"
         * where strip is a boolean.
         */
        parseName: function (name) {
            var strip = false, index = name.indexOf("."),
                modName = name.substring(0, index),
                ext = name.substring(index + 1, name.length);

            index = ext.indexOf("!");
            if (index !== -1) {
                //Pull off the strip arg.
                strip = ext.substring(index + 1, ext.length);
                strip = strip === "strip";
                ext = ext.substring(0, index);
            }

            return {
                moduleName: modName,
                ext: ext,
                strip: strip
            };
        },

        xdRegExp: /^((\w+)\:)?\/\/([^\/\\]+)/,

        /**
         * Is an URL on another domain. Only works for browser use, returns
         * false in non-browser environments. Only used to know if an
         * optimized .js version of a text resource should be loaded
         * instead.
         * @param {String} url
         * @returns Boolean
         */
        useXhr: function (url, protocol, hostname, port) {
            var match = text.xdRegExp.exec(url),
                uProtocol, uHostName, uPort;
            if (!match) {
                return true;
            }
            uProtocol = match[2];
            uHostName = match[3];

            uHostName = uHostName.split(':');
            uPort = uHostName[1];
            uHostName = uHostName[0];

            return (!uProtocol || uProtocol === protocol) &&
                   (!uHostName || uHostName.toLowerCase() === hostname.toLowerCase()) &&
                   ((!uPort && !uHostName) || uPort === port);
        },

        finishLoad: function (name, strip, content, onLoad) {
            content = strip ? text.strip(content) : content;
            if (masterConfig.isBuild) {
                buildMap[name] = content;
            }
            onLoad(content);
        },

        load: function (name, req, onLoad, config) {
            //Name has format: some.module.filext!strip
            //The strip part is optional.
            //if strip is present, then that means only get the string contents
            //inside a body tag in an HTML string. For XML/SVG content it means
            //removing the <?xml ...?> declarations so the content can be inserted
            //into the current doc without problems.

            // Do not bother with the work if a build and text will
            // not be inlined.
            if (config.isBuild && !config.inlineText) {
                onLoad();
                return;
            }

            masterConfig.isBuild = config.isBuild;

            var parsed = text.parseName(name),
                nonStripName = parsed.moduleName + '.' + parsed.ext,
                url = req.toUrl(nonStripName),
                useXhr = (masterConfig.useXhr) ||
                         text.useXhr;

            //Load the text. Use XHR if possible and in a browser.
            if (!hasLocation || useXhr(url, defaultProtocol, defaultHostName, defaultPort)) {
                text.get(url, function (content) {
                    text.finishLoad(name, parsed.strip, content, onLoad);
                }, function (err) {
                    if (onLoad.error) {
                        onLoad.error(err);
                    }
                });
            } else {
                //Need to fetch the resource across domains. Assume
                //the resource has been optimized into a JS module. Fetch
                //by the module name + extension, but do not include the
                //!strip part to avoid file system issues.
                req([nonStripName], function (content) {
                    text.finishLoad(parsed.moduleName + '.' + parsed.ext,
                                    parsed.strip, content, onLoad);
                });
            }
        },

        write: function (pluginName, moduleName, write, config) {
            if (buildMap.hasOwnProperty(moduleName)) {
                var content = text.jsEscape(buildMap[moduleName]);
                write.asModule(pluginName + "!" + moduleName,
                               "define(function () { return '" +
                                   content +
                               "';});\n");
            }
        },

        writeFile: function (pluginName, moduleName, req, write, config) {
            var parsed = text.parseName(moduleName),
                nonStripName = parsed.moduleName + '.' + parsed.ext,
                //Use a '.js' file name so that it indicates it is a
                //script that can be loaded across domains.
                fileName = req.toUrl(parsed.moduleName + '.' +
                                     parsed.ext) + '.js';

            //Leverage own load() method to load plugin value, but only
            //write out values that do not have the strip argument,
            //to avoid any potential issues with ! in file names.
            text.load(nonStripName, req, function (value) {
                //Use own write() method to construct full module value.
                //But need to create shell that translates writeFile's
                //write() to the right interface.
                var textWrite = function (contents) {
                    return write(fileName, contents);
                };
                textWrite.asModule = function (moduleName, contents) {
                    return write.asModule(moduleName, fileName, contents);
                };

                text.write(pluginName, nonStripName, textWrite, config);
            }, config);
        }
    };

    if (typeof process !== "undefined" &&
             process.versions &&
             !!process.versions.node) {
        //Using special require.nodeRequire, something added by r.js.
        fs = require.nodeRequire('fs');

        text.get = function (url, callback) {
            var file = fs.readFileSync(url, 'utf8');
            //Remove BOM (Byte Mark Order) from utf8 files if it is there.
            if (file.indexOf('\uFEFF') === 0) {
                file = file.substring(1);
            }
            callback(file);
        };
    } else if (text.createXhr()) {
        text.get = function (url, callback, errback) {
            var xhr = text.createXhr();
            xhr.open('GET', url, true);

            //Allow overrides specified in config
            if (masterConfig.onXhr) {
                masterConfig.onXhr(xhr, url);
            }

            xhr.onreadystatechange = function (evt) {
                var status, err;
                //Do not explicitly handle errors, those should be
                //visible via console output in the browser.
                if (xhr.readyState === 4) {
                    status = xhr.status;
                    if (status > 399 && status < 600) {
                        //An http 4xx or 5xx error. Signal an error.
                        err = new Error(url + ' HTTP status: ' + status);
                        err.xhr = xhr;
                        errback(err);
                    } else {
                        callback(xhr.responseText);
                    }
                }
            };
            xhr.send(null);
        };
    } else if (typeof Packages !== 'undefined') {
        //Why Java, why is this so awkward?
        text.get = function (url, callback) {
            var encoding = "utf-8",
                file = new java.io.File(url),
                lineSeparator = java.lang.System.getProperty("line.separator"),
                input = new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(file), encoding)),
                stringBuffer, line,
                content = '';
            try {
                stringBuffer = new java.lang.StringBuffer();
                line = input.readLine();

                // Byte Order Mark (BOM) - The Unicode Standard, version 3.0, page 324
                // http://www.unicode.org/faq/utf_bom.html

                // Note that when we use utf-8, the BOM should appear as "EF BB BF", but it doesn't due to this bug in the JDK:
                // http://bugs.sun.com/bugdatabase/view_bug.do?bug_id=4508058
                if (line && line.length() && line.charAt(0) === 0xfeff) {
                    // Eat the BOM, since we've already found the encoding on this file,
                    // and we plan to concatenating this buffer with others; the BOM should
                    // only appear at the top of a file.
                    line = line.substring(1);
                }

                stringBuffer.append(line);

                while ((line = input.readLine()) !== null) {
                    stringBuffer.append(lineSeparator);
                    stringBuffer.append(line);
                }
                //Make sure we return a JavaScript string and not a Java string.
                content = String(stringBuffer.toString()); //String
            } finally {
                input.close();
            }
            callback(content);
        };
    }

    return text;
});


define('text!templates/textItem.html',[],function () { return '<div class="commentable_text_view">\n    <div class="commented_text selectable">\n        <%= Content %>\n    </div>\n    <div class="text_comments unselectable" unselectable="on">\n    </div>\n    <div class="comment_ui">\n        <div class="comment_ui_panel">\n            <span class="message">Markieren Sie Text mit der Maus und klicken Sie \'weiter\'</span>\n            <span class="message error" id="error_selection" style="display: none;"><h2>Auswahl nicht gefunden.Bitte versuchen Sie es nochmal.</h2></span>\n            <div class="footer">\n                <input type="button" id="cancelCommentButton" value="zurück" unselectable="on" class="bbt-button unselectable">\n                <input type="button" id="createCommentButton" value="weiter" unselectable="on" class="bbt-button unselectable">\n            </div>\n        </div>\n        <div class="blockui-shim">Suche Auswahl...</div>\n    </div>\n\n</div>\n';});


define('text!templates/footnote.html',[],function () { return '<span id="footnote-comment-<%= id %>" class="footnote <%= voteClass %>">\n    <a href="#comment-text-<%= id %>" role="button" aria-controls="comment-text-<%= id %>">\n        <%= numVotes %>\n    </a>\n</span>\'';});


define('text!templates/commentItem.html',[],function () { return '<div class="headerTop jump_newest" style="display:none;">aktuellster Kommentar</div>\n<div class="headerContainer">\n    <div class="header">\n        <span class="logo"><img src="<%= User.Logo %>"></span>\n        <span class="user"><%- User.Name %></span>\n        <% if( User.Verified ) { %>\n            <span class="user-verified"></span>\n            <span class="tooltipContent" style="display:none;">Dieser Nutzer wurde verifiziert.</span>\n        <% } %>\n        <span class="close" id="comment-close" style="display:none">schließen</span>\n    </div>\n</div>\n<div class="body">\n    <div class="show">\n        <%- Content %>\n    </div>\n    <div class="edit">\n        <textarea row=5 cols=40 id="new-comment" class="selectable"></textarea>\n    </div>\n</div>\n<div class="footer">\n    <div class="edit">\n        <input id="comment-save" class="bbt-button smallbutton" type="button" value="Speichern">\n        <input id="comment-cancel" class="bbt-button smallbutton" type="button" value="Abbrechen">\n        <div class="comment-chars-status">\n            <span class="chars-under">Bitte geben Sie mindestens <%= limits.commentLength.min %> Zeichen ein</span>\n            <span class="chars-left"><span class="comment-chars-left-value"></span> Zeichen übrig</span>\n            <span class="chars-over error">Bitte kürzen um <span class="comment-chars-left-value"></span> Zeichen</span>\n        </div>\n\n    </div>\n    <div class="show">\n        <a href="#footnote-comment-<%= footnoteid %>" onClick="javascript:return false;" class="jump_newest" style="display: none;">Zur Textstelle</a>\n        <span class="makeVote">\n            Bewerten:\n            <a id="comment-dislike" \n                   class="button dislike <% if( UserVote ===-1) { %>uservote<% } %>">\n                   <span class="offscreen" role="button" aria-controls="vote-value-<%= footnoteid %>">Kommentar negativ bewerten</span>\n                   <%- Dislikes %>\n            </a>\n            <a id="comment-like" \n                   class="button like <% if( UserVote === 1) { %>uservote<% } %>">\n                   <span class="offscreen" role="button" aria-controls="vote-value-<%= footnoteid %>">Kommentar positiv bewerten</span>\n                   <%- Likes %>\n            </a>\n        </span>\n        <span class="commentVotes">\n            <span id="vote-value-<%= footnoteid %>" class="voteValue <%= voteClass %>"><%- numVotes %></span>\n            <% if ( numVotes == 1)  {%> Bewertung\n            <% } else {%> Bewertungen <% } %>\n        </span>\n    </div>\n</div>\n<div class="blockui-shim">Speichern...</div>';});

define(  'models/vote',['appConfig','eventDispatcher']
,function( AppConfig,  EventDispatcher){
  return Backbone.Model.extend({
    url: AppConfig.REST.url+'/vote'
  });
});
define(  'views/commentView',['text!templates/commentItem.html','models/vote','appConfig','eventDispatcher','console']
,function(CommentItemTemplate,               Vote,         AppConfig,  EventDispatcher , console ){

  return Backbone.View.extend({

    tagName:  "li",
    className: "commentItem",
    events: {
      "click #comment-close"  : 'closeComment',
      "click #comment-save"   : 'saveComment',
      "click #comment-cancel" : 'cancelComment',
      "click #comment-like"   : 'likeComment',
      "click #comment-dislike": 'dislikeComment',
      "mouseenter"            : 'onHoverComment',
      "mouseleave"            : 'onUnhoverComment',
      "keydown  #new-comment" : 'charsLeft',
      "keyup    #new-comment" : 'charsLeft',
      "click .jump_newest"    : 'jumpToNewest',
      "mouseenter .user-verified": 'showTooltip',
      "mouseleave .user-verified" : 'hideTooltip'
    },

    // Cache the template function for a single item.
    template: _.template(CommentItemTemplate),
    stackOffset : { top: 0, bottom: 0 },
    initialize: function( ) {
      _.bindAll(this);
      this.textView = this.options.textView;
      this.homePos = 0;
      this.pintime = 0;
      // disable logging here
      console = _.clone(console);
      console.log=function(){};
      $(window).scroll( this.scrollHandler );
    },
    showTooltip: function() {
      EventDispatcher.trigger('tooltip:show',{
          Content:this.$('.tooltipContent').html(),
          parentEl:this.$('.user-verified'),
          className: 'user-tooltip'
        });
    },

    hideTooltip: function(e) {
      EventDispatcher.trigger('tooltip:hide',e);
    },
    closeComment: function() {
      console.log('close '+this.model.id);
      this.pinned = false;
      EventDispatcher.trigger('comment:userClose',this.model);
    },
    onHoverComment: function() {
      this.hover();
      EventDispatcher.trigger('range:show',this.model);
    },
    onUnhoverComment: function() {
      this.unhover();
      EventDispatcher.trigger('range:showall');
    },
    saveComment: function() {
      if( !this.charsLeft() ) return;
      this.blockUI();
      var commentText = this.$('#new-comment').val();
      this.model.save({ 'Content':commentText }, {wait:true, success: this.unblockUI } );
    },
    blockUI: function() {
        this.$('.blockui-shim').show();
    },
    unblockUI: function() {
        this.$('.blockui-shim').hide();
    },
    unhover: function() {
      this.$el.removeClass('hovering');
      this.scrollHandler();
    },
    hover: function() {
      this.$el.removeClass('hoverOffset');
      this.$el.addClass('hovering');
      this.scrollHandler();
      if( !this.pinned ) {
        this.$el.addClass('hoverOffset');
      }
    },
    display: function() {
      this.render();
      this.show();
    },
    hide: function() {
      this.$el.addClass('offscreen').attr('hidden','hidden');
    },
    show: function() {
      this.$el.removeClass('offscreen').removeAttr('hidden');
      this.$el.focus();
    },
    cancelComment: function() {
      EventDispatcher.trigger('comment:cancel',this.model);
      EventDispatcher.trigger('comment:complete');
      this.model.destroy();
    },
    charsLeft: function() {
      var commentText = this.$('#new-comment').val();
      var charsLeft = AppConfig.limits.commentLength.max - commentText.length;
      this.$('.comment-chars-status > *').hide();
      this.$("#comment-save").attr('disabled','disabled').addClass('disabled');
      if( commentText.length < AppConfig.limits.commentLength.min ) {
        this.$('.chars-under').show();
      } else {
        this.$('.comment-chars-left-value').text(Math.abs(charsLeft));
        if(charsLeft < 0 ) {
          this.$('.chars-over').show();
        } else {
          this.$("#comment-save").removeAttr('disabled').removeClass('disabled');
          this.$('.chars-left').show();
        }
      }
      return true;
    },
    likeComment: function() {
      EventDispatcher.trigger('user:login',{success:this._likeComment});
    },
    dislikeComment: function() {
      EventDispatcher.trigger('user:login',{success:this._dislikeComment});
    },
    _likeComment: function() {
      var vote = new Vote({
        CommentID: this.model.id,
        Value:1
      });
      console.log('vote '+vote.get('Value')+' for '+vote.get('CommentID'));

      vote.save({},{success:this.updateVotes});
    },
    _dislikeComment: function() {
      var vote = new Vote({
        CommentID: this.model.id,
        Value:-1
      });
      console.log('vote '+vote.get('Value')+' for '+vote.get('CommentID'));

      vote.save({},{success:this.updateVotes});
    },
    updateVotes: function(response) {
      this.model.set({ Likes: response.get('Likes')
                      ,Dislikes: response.get('Dislikes')
                      ,UserVote: response.get('UserVote')
                    });
      EventDispatcher.trigger('comment:updateVote',this.model);
    },
    pin: function( value ) {
      this.pinned = value;
      if( this.pinned ) {
        this.$el.removeClass('hoverOffset');
        this.pintime = + new Date(); // badass way to get a timestamp
      } else {
        this.$el.removeClass('hoverOffset');
        this.display();
        this.hide();
      }
    },
    setPosition: function( x ) {
      if( x == null ) return;
      if( x < 425 ) x = 425;
      this.homePos = x;
      this.$el.offset({top:x});
//      this.$el.css('top',x+'px');
//      this.scrollHandler();
      console.log( 'homePos for '+this.model.id+' '+x);
    },
    getOffsetTop: function() {
//      return this.$el.offset().top;
      return this.homePos;
    },
    getHeight: function() {
      return this.$el.height();
    },
    unsetNewest: function() {
        this.isNewest = false;
        this.$el.removeClass('newest');
    },
    jumpToNewest: function() {
      EventDispatcher.trigger("commentsView:scrollTo",this.model);
      return false;
    },
    setNewest: function() {
        this.isNewest = true;
        this.setPosition(425);
        this.$('.jump_newest').show();
        this.$el.addClass('newest');
    },
    scrollHandler: function() {
      if( this.$el.hasClass('offscreen')) return;
      var scrolledOutAt = "";
      var edgeOffsetBottom = 10 + this.stackOffset.bottom;
      var edgeOffsetTop = 150 + this.stackOffset.top;
      if ( $(window).height() < parseInt(this.homePos + this.$el.outerHeight() - Math.abs($(window).scrollTop()) + edgeOffsetBottom,10) ) {
          scrolledOutAt = "bottom";
      };
      if ( ($(window).scrollTop()) > this.homePos - edgeOffsetTop ) {
          scrolledOutAt = "top";
      };
      if (scrolledOutAt==="" || $.browser.msie) { // sorry msie user...
          this.$el.removeClass('fixed');
          this.$el.offset({top:this.homePos});
          this.scrolledOut=false;
      } else {
        this.$el.addClass('fixed');
        this.scrolledOut=true;
        if (scrolledOutAt==="bottom" ) {
            this.$el.css({top:$(window).height()-this.$el.outerHeight() - edgeOffsetBottom+'px'});
        }
        if (scrolledOutAt==="top" ) {
            this.$el.css({top:edgeOffsetTop+'px'});
        }
      }
    },
    // neuberechnen der Home-position
    // wird beim Rendern gebraucht (natürlich)
    // aber auch bei unHover um den Kommentar wieder auszurücken
    getHomePos: function() {
      var commentSelector = this.model.isNew() ? '.comment-new':'.comment-'+this.model.id;
      var commentRange = this.textView.$(commentSelector);
      var commentRangePos = commentRange.offset();
      if( commentRangePos != null) {
        return commentRangePos.top+commentRange.height()/2-this.$el.height()/2;
      }
      else return null
    },

    // bei ignoreScroll = true wird der Kommentar an der Stelle positioniert die die Textrange vorgibt.
    // wir verwendet von arrangeViews in commentsView um die wahre Reihenfolge der kommentare zu bestimmen.

    render: function(ignoreScroll) {
//      console.log('commentView::render '+this.model.id+(this.pinned?' pinned':' unpinned'));
      var tplData = this.model.toJSON();

      tplData.limits = AppConfig.limits;
      this.$el.html(this.template(tplData));
      this.$el.attr('id','comment-text-'+this.model.id);
      this.unblockUI();
      if( this.pinned ) {
        this.$('#comment-close').show();
        this.$el.addClass('pinned');
      } else {
        this.$('#comment-close').hide();
        this.$el.removeClass('pinned');
      }

      if( this.model.isNew() ) {
        this.$('.show').remove();
        this.charsLeft();
      } else {
        this.$('.edit').remove();
      }

      if( !ignoreScroll) this.scrollHandler();
      if( !this.model.isNew() && !this.pinned ) this.hide();
      this.setPosition( this.getHomePos() )
      if( this.isNewest ) this.setNewest();
      if( !ignoreScroll) this.scrollHandler();
      this.delegateEvents();

      return this; // wird von commentsView an die Kommentarspalte angehängt.
    }

  });

});
define(  'views/commentsView',['views/commentView', 'eventDispatcher', 'console'] ,function( CommentView,         EventDispatcher,   console ){

  return Backbone.View.extend({

    tagName:  "ul",
    className: "text_comment_list",


    initialize: function( ) {
      _.bindAll(this);
      this.textView = this.options.textView;
      this.commentsList = this.options.commentsList;
      this.commentsList.bind('all',this._eventproxy);

      this.commentViewStore = {}; // hier werden die commentviews gespeichert
      this.showNewest=true; // wird beim ersten commentClose auf false gesetzt
      this.safetyMargin = 10; // abstand der kommentare im Stack
      this.commenting = false; // true wenn neuer kommentar verfasst wird
	  this.topBoundary = 425; // Platz nach oben (inline Style)
	  this.topBoundaryWhileFixed = 150;

      EventDispatcher.on('comment:show',this.onShowComment,   this);
      EventDispatcher.on('comment:hide',this.onHideComment,   this);
      EventDispatcher.on('comment:userClose',this.onUserCloseComment, this);
      EventDispatcher.on('comment:close',this.onCloseComment, this);

      EventDispatcher.on('comment:unPinAll',this.unPinAll,this);
      EventDispatcher.on('comment:pin',this.onPinComment,this);
      EventDispatcher.on('comment:togglePinning',this.onTogglePinning,this);
      EventDispatcher.on('comment:updateVote',this.onUpdateVote,this);
      EventDispatcher.on('comment:cancel',this.onCancelAddComment,this);
      EventDispatcher.on('comment:complete',this.onCommentComplete,this);
      EventDispatcher.on("commentsView:scrollTo",this.scrollTo,this);
      EventDispatcher.on('action:startComment',this.onStartComment,this);

      EventDispatcher.on('user:arrived',this.resetFirstrun,this);
      EventDispatcher.on('user:left', this.resetFirstrun, this);

    },
    _eventproxy: function( action ) { console.log('commentsList:'+action)},

    checkOverlap: function( currentView, otherView ) {
      if( currentView.pinned && otherView.pinned  ) {
        var myTop       = currentView.getOffsetTop();
        var otherTop    = otherView.getOffsetTop();

        var myBottom    = this.safetyMargin + currentView.getOffsetTop() + currentView.getHeight();
        var otherBottom = this.safetyMargin + otherView.getOffsetTop() + otherView.getHeight();

        var myHeight = myBottom - myTop;

        if( myTop < otherBottom && myTop >= otherTop ) {
          myTop = otherBottom;
        } else if (myBottom > otherTop && myBottom <= otherBottom) {
          myTop = otherTop - myHeight;
        }
        if( myTop < this.topBoundary ) myTop = this.topBoundary;
        if( myTop > this.topBoundary-1 ) {
          currentView.setPosition( myTop );
        } else {
          otherView.setPosition( otherTop + myHeight );
        }
      }
    },

    getPositionInStack: function( view ) {
      var m = this.safetyMargin;
      var offsetTop = _.reduce( this.commentViewStore, function( memo, otherView){
        if( otherView.model.id == view.model.id || !otherView.pinned ) return memo;
        return otherView.homePos < view.homePos ? memo + otherView.getHeight() + m : memo;
      },0);
      var offsetBottom = _.reduce( this.commentViewStore, function( memo, otherView){
        if( otherView.model.id == view.model.id || !otherView.pinned ) return memo;
        return otherView.homePos > view.homePos ? memo + otherView.getHeight() + m : memo;
      },0);

      view.stackOffset = { top: offsetTop, bottom: offsetBottom };
    },

    pinnedComments: function() {
      return _.filter( this.commentViewStore, function( view ) { return view.pinned });
    },
      // wenn mehr als 3 Kommentare offen -> den schliessen der am l�ngsten ge�ffet ist
    closeLongestVisible: function() {
      if( _.size( this.pinnedComments() ) <= 3 ) return;
      var longestVisible = _.min( this.pinnedComments(), function(view) { return view.pintime} );
      console.log('mehr als 3 kommentare. schliesse '+longestVisible.model.id);
      EventDispatcher.trigger('comment:close',longestVisible.model);
    },

    arrangeViews: function() {
      // jeden comment rendern, um homePos zu aktualisieren
      _.invoke(this.pinnedComments(),'render',true);

      for( var iteration = 0; iteration <= this.pinnedComments().length; iteration++ ) {
        _.each(this.commentViewStore,function(currentView) {
          _.each(this.commentViewStore, function(otherView) {
            if( currentView.model.id != otherView.model.id )
              this.checkOverlap(currentView, otherView);
          },this);
        },this);
      }

      _.each(this.pinnedComments(),function(currentView) {
        this.getPositionInStack( currentView );
      },this);

      // call scrollHandler on each pinned comment
      _.invoke(this.pinnedComments(),'scrollHandler');
    },

    onShowComment: function(comment) {
      var view = this.getView(comment);
      if( !view.pinned ) {
        view.display();
        view.hover();
        if( $.browser.msie) this.arrangeViews(); // nasty msie!
      } else {
        view.onHoverComment();
      }
    },
    onHideComment: function(comment) {
      var view = this.getView(comment);
      if( !view.pinned ) view.hide();
      view.unhover();
      this.arrangeViews();
    },
    onStartComment:function() {
      this.commenting = true;
      this.unsetNewest();
    },
    resetFirstrun: function() {
      if( this.commenting || this.pinnedComments().length) return;
      this.showNewest=true;
    },
    unsetNewest: function() {
      if( !this.showNewest ) return;
      this.showNewest=false;
      _.invoke(this.commentViewStore,'unsetNewest');
      EventDispatcher.trigger('comment:close',this.newestComment);
      console.log('Kein Firstrun mehr!');
    },
    onCancelAddComment: function(comment) {
      this.commenting=false;
      if( comment ) {
        var view = this.getView( comment );
        this.commentViewStore = _.without(this.commentViewStore, view );
        this.render();
      }
    },
    onCommentComplete: function() {
      this.commenting=false;
      this.unsetNewest();
      _.invoke(this.commentViewStore,'unsetNewest');
    },
    onUserCloseComment: function(comment) {
      this.unsetNewest();
      this.onCloseComment(comment);
      _.invoke(this.commentViewStore,'unsetNewest');
    },
    onCloseComment: function(comment ) {
      var view = this.getView( comment );
      view.pin( false );
      view.hide();
      EventDispatcher.trigger('comment:hide',comment);
      this.arrangeViews();
    },
    onPinComment: function(comment) {
      var view = this.getView(comment);
      view.pin( true );
      view.display();
      this.closeLongestVisible();
      this.arrangeViews();
    },
    onTogglePinning: function( comment ) {
      var view = this.getView( comment );
      view.pin( !view.pinned );
      view.display();
      view.pin( view.pinned );
      if( view.pinned ) {
        this.closeLongestVisible();
        this.unsetNewest();
      }
      this.arrangeViews();
    },
    unPinAll: function() {
      _.each(this.pinnedComments(),function(view){ this.onCloseComment(view.model); },this);
    },
    scrollTo: function(comment) {
      this.unsetNewest();
      view = this.getView(comment);
      view.display();
      EventDispatcher.trigger('comment:pin',comment);
      EventDispatcher.trigger('range:showall');

      console.log('el.top: '+view.$el.offset().top);


      $('html, body').animate({
          scrollTop: view.getHomePos()-200
      });
    },
    onUpdateVote: function(comment){
      var view = this.getView( comment );
      view.display();
      this.arrangeViews();
      console.log('update after vote complete');
    },
    firstRun: function() {
      if( !this.showNewest ) return;
      console.log('Firstrun!');

      var comment = this.commentsList.max(function(comment) { return comment.get('ctime'); } );
      if( !_.isUndefined( comment )) {
        EventDispatcher.trigger('comment:pin',comment);
        EventDispatcher.trigger('range:showall');
        this.newestComment = comment;
        this.getView( comment ).setNewest();
      }
    },
    hasComments: function() {
      return _.size( this.commentViewStore );
    },
    getView: function(comment) {
      var view = this.commentViewStore[comment.cid];
      if( _.isUndefined( view ) && !_.isUndefined(comment.id ) ) {
        view = _.find(this.commentViewStore, function(view){
          return view.model.id === comment.id;
        });
      }

      if( _.isUndefined( view ) ) {
        view = new CommentView({model:comment,textView:this.textView});
        this.commentViewStore[comment.cid] = view;
        console.log('created new view for '+comment.cid+'('+comment.id+')', comment);
      }
      view.model=comment;
      return view;
    },

    renderComment: function(comment){
      var view;
      view = this.getView( comment );

      this.$el.append(view.render().el);
      if(comment.isNew()) {
        view.pin(true);
        view.scrollHandler();
        view.$('#new-comment').focus();
      }
    },

    render: function() {
//      EventDispatcher.trigger('comment:unPinAll');
      this.$el.empty();
      this.commentsList.each(this.renderComment);
      return this;
    }
  });

});
define( 'views/textView',[ 'models/text','models/comment',
          'text!templates/textItem.html','text!templates/footnote.html',
          'views/commentsView',
          'appConfig',  'eventDispatcher', 'console']

,function( TextModel,    CommentModel,
           TextItemTemplate,              FootnoteTemplate,
           CommentsView,
           AppConfig,    EventDispatcher ,  console){

  return Backbone.View.extend({

    tagName:  "div",
    events: {
      "click #createCommentButton": "createComment",
      "touchstart #createCommentButton": "createComment",
      "click #cancelCommentButton": "startCommentBack"
    },

    // Cache the template function for a single item.
    template: _.template(TextItemTemplate),
    footnoteTemplate : _.template(FootnoteTemplate),

    // true wenn Text so gespeichert werden soll
    // heisst: footnotes werden nur gerendert wenn editmode == false
    editMode: false,

    initialize: function( ) {
      _.bindAll(this);
      this.model = new TextModel({'TextID':this.options.TextID}),
      this._text_sent=false;
      this._events_bound=false;

      // holen des Textes vom Server
      // im Fehlerfall Textobjekt an Server senden
      // Die Changeevents des Models können erst an die renderfunktion gebunden werden, wenn das Model text enthält
      // entweder vom Server oder options.TextContentInitial (initialer Fall)
      this.model.fetch({
          error:this.sendTextInitial
          ,success:this.onTextReceived
      });

      EventDispatcher.on('comment:show',this.onShowComment,this);
      EventDispatcher.on('comment:hide',this.onHideComment,this);
      EventDispatcher.on('comment:cancel',this.cancelAddComment,this);
      EventDispatcher.on('comment:updateVote',this.renderFootnote,this);
      EventDispatcher.on('comment:complete',this.onCommentComplete,this);
      EventDispatcher.on('comments:arrived',this.renderComments,this);

      EventDispatcher.on('user:arrived',this.receiveUser,this);
      EventDispatcher.on('user:left', this.kickUser, this);

      EventDispatcher.on('range:show',this.onShowComment,this);
      EventDispatcher.on('range:showall',this.onShowAllRanges,this);
    },

    bindChangeEvents: function () {
      if( this._events_bound ) return;
      this.model.bind('change', this.render, this);
      this.model.comments.bind('reset', this.render, this);
      this.model.comments.bind('add', this.renderComments, this);
      this.model.comments.bind('destroy', this.render,this);

      this.commentsView = new CommentsView({commentsList:this.model.comments,textView:this});
      this._events_bound=true;
    },

    receiveUser: function(user) {
      console.log('All hail to the User!');
      this.User = user;
      if( this._text_sent ) {
        console.log('Text already sent.')
        this.model.comments.fetch({success:this.render});
      } else {
        console.log('sending initial text');
        this.model.fetch({
            error:this.sendTextInitial
            ,success:this.onTextReceived
        });
      }

    },
    kickUser: function(user) {
      this.User = user;
      EventDispatcher.trigger('comment:cancel');
      EventDispatcher.trigger('comment:complete');
      console.log('The User has left the App!');
      this.model.comments.fetch({success:this.render});
    },
    onTextReceived: function() {
      this._text_sent=true;
      this.bindChangeEvents();
      this.render();
    },

    // Fehlerfall von fetch Text (in initialize)
    // checken ob User eingeloggt
    sendTextInitial: function() {
      EventDispatcher.trigger('user:check',{success:this._sendTextInitial,error:this._startWithOriginalText});
    },

    // user eingeloggt, Text initial schicken
    _sendTextInitial: function() {
      this._text_sent=true;
      this.bindChangeEvents();
      this.model.set('Content', this.options.TextContentInitial);
      this.model.set('Version', 1);
      this.model.save();
    },

    // User nicht eingeloggt, mit vorhandenem Text auf der Seite starten
    _startWithOriginalText: function() {
      console.log('not sending text, not logged in');
      this._text_sent=false;
      this.bindChangeEvents();
      this.model.set('Content', this.options.TextContentInitial);
      this.model.set('Version', 1);
    },

    onShowComment: function(comment) {
      this.$('.savedComment').removeClass('current');
      this.$('.comment-'+comment.id).addClass('current');
    },

    onShowAllRanges: function() {
      _.each(this.commentsView.pinnedComments(), function(view){
        this.$('.comment-'+view.model.id).addClass('current');
      },this);
    },
    onHideComment: function(comment) {
      if( !comment.pinned ) {
        this.$('.comment-'+comment.id).removeClass('current');
      }
      this.onShowAllRanges();
    },
    // Nutzerführung anzeigen
    startComment: function() {
      this.$('.error').hide();
      this.creatingComment = true;
      EventDispatcher.trigger('user:login',{success:this._startComment,error:this.startCommentBack});
    },
    _startComment: function() {
      this.$('.comment_ui').show();
      this.unblockUI();
      var sel = rangy.getSelection();
      if( !_.isUndefined(sel) && ! sel.isCollapsed ) this.createComment();
    },
    // User hat 'zurück' geklickt
    startCommentBack: function() {
      this.$('.comment_ui').hide();
      EventDispatcher.trigger('comment:complete');
      this.renderFootnotes();
    },
    blockUI: function() {
        this.$('.blockui-shim').show();
    },
    unblockUI: function() {
        this.$('.blockui-shim').hide();
    },
    // User hat 'speichern' geklickt
    createComment: function() {
      this.blockUI();
      this.removeFootnotes();
      this.editMode = true;
      this.creatingComment = false;
      setTimeout(this._createComment,10);
    },
    _createComment: function(){
      // selection holen und überprüfen
      // setzt this.charSelection und this.currentSelection
      setTimeout( this.$('.comment_ui').hide, 10 );
      this.getSelection();

      if( this.charSelection ) {
        var comment = new CommentModel({
          StartIndex:    this.charSelection.range.start,
          EndIndex:      this.charSelection.range.end,
          TextID:        this.model.id,
          CommentedText: this.currentSelection.getRangeAt(0).toString(),
          User: this.User.toJSON()
        });
        this.renderCommentRange(comment);
        this.commentsView.renderComment(comment);
        comment.bind('change', this.addComment,this);
      } else {
        this.$('.comment_ui').show();
        this.$('#error_selection').show();

        this.unblockUI();
        this.renderFootnotes();
      }
    },
    getSelection: function( ) {
      this.currentSelection = rangy.getSelection();
      this.charSelection = null;

      // Leere Selection ist unbrauchbar
      if( this.currentSelection.isCollapsed ) return;

      // Der Anfang der Selection muss auf jeden Fall im Text liegen
      if( !$(this.currentSelection.anchorNode).parents('.commented_text').length ) return;

      var end_ok = $(this.currentSelection.focusNode).parents('.commented_text').length;
      var expandSelection = true; // falls selection-ende korrigiert werden muss, nicht mehr den wordselektor anwenden
      if( !end_ok ) {
      var range = this.currentSelection.getRangeAt(0);
        if( this.currentSelection.isBackwards() ) {
          console.log('correcting selection start');
          range.setStartBefore( this.$('.commented_text').get(0) );
        } else {
          console.log('correcting selection end');
          range.setEndAfter( this.$('.content_bodytext').get(0) );
          expandSelection = false;
        }
        this.currentSelection.removeAllRanges();
        this.currentSelection.addRange(range);
      }

      if(expandSelection) {
        this.currentSelection.expand("word", {
          wordRegex: AppConfig.wordRegex
        });
      }

      this.charSelection = this.currentSelection.saveCharacterRanges(this.el);
      if( this.charSelection ) {
        this.charSelection = this.charSelection[0]
      } else {
        this.currentSelection.detach();
      }
    },

    cancelAddComment: function(){
      this._removeNewCommentSpan();
      this.editMode = false;
      this.creatingComment = false;
      this.saveContentToModel(); // impliziert render()
    },

    // löscht temporären span aus Text, setzt endgültige Markierung rein
    // und speichert TextModel
    addComment: function(comment) {
      this._removeNewCommentSpan();
      this.model.comments.add(comment);
      this.renderCommentRange(comment);
      // speichern des Kommentars den wir in den Text rendern wollen
      // als lokale Variable, um im Fehlerfall darauf zugriff zu haben
      this.currentComment = comment;
      this.model.save({'CommentID':comment.id},{error:this.onTextsaveError,success:this.onTextsaveSuccess});
    },

    _removeNewCommentSpan: function() {
      this.$('.savedComment').removeClass('comment-new');
      this.$('.comment-new').replaceWith(function() {
        return $(this).contents();
      });
    },

    onTextsaveError: function(model,response){
      console.log('text save error');
      var newModel = JSON.parse(response.responseText);
      // auf 409 Conflict prüfen
      if( response.status == 409) {
        console.log('got version '+newModel.Version);
        console.log('have version '+this.model.get('Version'));
        EventDispatcher.trigger('comment:saveConflict');
        // aktuelle Version des Textes rendern
        // triggert change-event und damit render()
        this.model.set({'Version': newModel.Version
                       ,'Content': newModel.Content});

        // aktuelle liste der Kommentare holen
        // der aktuelle Kommentar ist da mit drin
        this.model.comments.fetch({success:this.textResave});
      }
      if( response.status == 401) {
        EventDispatcher.trigger('login:userExpected');
      }
    },
    textResave: function() {
        // und wieder versuchen zu speichern
        console.log('versuche Text neu zu speichern');
        this.renderCommentRange(this.currentComment);
        this.model.save({},{error:this.onTextsaveError,success:this.onTextsaveSuccess});
    },
    onTextsaveComplete: function() {
      console.log('Text save Complete');
      EventDispatcher.trigger('comment:complete');
      var commentView = this.commentsView.getView(this.currentComment);
      EventDispatcher.trigger('comment:show', commentView.model);
      EventDispatcher.trigger('comment:pin', commentView.model);

      delete this.currentComment;
    },
    onTextsaveSuccess: function(model,response){
      console.log('text save success');
      this.editMode = false;
      this.model.comments.fetch({success:this.onTextsaveComplete});
    },
    // Eventhandler für 'Kommentar erstellen fertig.' setzt eigentlich nur this.creatingComment = false
    // kann aber (über den event) auch von aussen aufgerufen werden
    onCommentComplete: function() {
      this.creatingComment = false;
    },
    removeFootnotes: function() {
      this.$('.footnote').remove();
    },

    renderFootnotes: function() {
      console.log('render footnotes');
      this.model.comments.each(this.renderFootnote);
    },

    renderFootnote: function(comment) {
      var footnote = $( this.footnoteTemplate(comment.toJSON() ) )
      footnote.mouseenter(function(){
        EventDispatcher.trigger('comment:show',comment);
      })
      footnote.mouseleave(function(){
        EventDispatcher.trigger('comment:hide',comment);
      })
      footnote.click(function(e){
        console.log('footnote.click '+comment.id);
        if( e.target == this ) {
          EventDispatcher.trigger('comment:togglePinning',comment);
        }
      })
      $('a',footnote).click(function(e){
        console.log('footnote.a.click '+comment.id);
        if( e.target == this ) {
          EventDispatcher.trigger('comment:togglePinning',comment);
          e.stopPropagation();
          return false;
        }
      })

      this.$('#footnote-comment-'+comment.id).remove();
      this.$('.comment-'+comment.id).last().append(footnote);

    },

    // alle Ranges im Text durchgehen und prüfen, ob in this.model.comments enthalten.
    // wenn nicht: rauslöschen. Nicht gleich speichern, das ist nur für die Anzeige
    // beim Erstellen eines neuen Kommentars wird diese Funktion auch aufgerufen, was dann bewirkt, dass die
    // neue Version des Textes die gelöschen Kommentare nicht mehr enthält
    removeDeletedRanges: function() {
      console.log('remove deleted ranges');
      var textView = this;
      this.$('.savedComment').each(function(){
        var commentClasses = $(this).attr('class').split(' ');
        var IDClass = _.filter(commentClasses,function(klass) { return klass.match(/^comment-/); });
        if( IDClass.length == 1 ) {
          commentID = IDClass[0].replace(/^comment-/,'');
          if( commentID != 'new') {
            if( textView.model.comments.get(commentID) ) {
//              console.log(commentID +' still visible.')
            } else {
//              console.log(commentID +' deleted.')
              textView.$('.comment-'+commentID).replaceWith(function() {
                return $(this).contents();
              });
            }
          }
        }
      });
    },

    render: function() {
      if( !this.model.get('Content')) return this;
      this.$el.html(this.template(this.model.toJSON()));
      this.$('.comment_ui').hide();
      this.removeDeletedRanges();
      this.renderComments();
      if( this.creatingComment ) {
        this.startComment();
      }
      $('body *').addClass('unselectable').attr('unselectable','on');
      this.$('.selectable *').removeAttr('unselectable').removeClass('unselectable');

      return this; // to enable chaining
    },

    renderComments: function() {
      if( !this.commentsView ) return; // wenn die kommentare zu früh ankommen, gibts noch keine commentsView
      this.$('.text_comments').empty();
      this.$('.text_comments').append(this.commentsView.render().el);
      if( !this.editMode ) {
        this.renderFootnotes();
        this.commentsView.firstRun();
      }
    },

    renderCommentRange: function(comment){
      var start = comment.get('StartIndex'),
          end   = comment.get('EndIndex'),
          sel = rangy.getSelection(),
          comment_class = comment.isNew() ? 'comment-new' : 'savedComment comment-'+comment.id;

        if( sel ) {
          sel.selectCharacters(this.el, start, end );
          rangeApplier = rangy.createCssClassApplier(comment_class,{normalize:true});
          rangeApplier.applyToSelection();
          rangy.getSelection().removeAllRanges();
          this.saveContentToModel();
        }
    },

    // Text aus DOM holen und ins model speichern
    saveContentToModel: function() {
      var newContent = $('.commented_text',$('#'+this.model.get('TextID')) ).html();
      this.model.set('Content', newContent); // triggert 'change' im model -> render() wird aufgerufen
    }
  });

});

define('text!templates/app.html',[],function () { return '<div class="bb-tool">\n    <div class="actionBar"></div>\n    <div class="textView"></div>\n</div>';});

define( 'models/user',[ 'appConfig','eventDispatcher','console']
,function( AppConfig,  eventDispatcher,  console ) {

  return Backbone.Model.extend({
    defaults: function() {
      return {
        Name:'',
        Logo: '',
        Verified:0,
        _logged_in: false
      };
    },
    url: function() {
      console.log('user.url');
      return AppConfig.REST.url+'/user'+'?cachebust='+ Math.random();
    },
    pwreset_url: '',
    register_url: '',

    toJSON: function(options) {
      var attrs = _.clone(this.attributes);
      attrs.pwreset_url = this.pwreset_url;
      attrs.register_url = this.register_url;
      return attrs;
    },
    kill: function() {
      this.set(this.defaults());
    }

  });
});

define('text!templates/actionbar.html',[],function () { return '<% if( User._logged_in ) { %>\n    <span class="user">\n        <span class="logo">\n            <a id="btn-logo" class="actionlink">\n                <img class="logo" src="<%= User.Logo %>">\n            </a>\n        </span>\n        <span class="user-name">\n            <a id="btn-name" class="actionlink">\n                <%- User.Name %>\n            </a>\n        </span>\n        <% if( User.Verified ) { %>\n            <span class="user-verified"></span>\n        <% } %>\n        <a id="btn-logout" class="actionlink">Logout</a>\n    </span>\n<% } %>\n<span class="buttons">\n    <input id="btn-start"    class="bbt-button <% if( commenting || readonly ){ %>disabled<% } %>" type="button" value="Kommentieren">\n    <% if( !User._logged_in ) { %>\n    <input id="btn-register" class="bbt-button " type="button" value="Anmelden">\n    <% } %>\n</span>\n';});

define( 'models/actionbar',[ 'appConfig','eventDispatcher','console']
,function( AppConfig,  eventDispatcher,  console ) {

  return Backbone.Model.extend({
    defaults: function() {
      return {
        commenting: false,
        logged_in: false,
        readonly:false
      };
    },
    toJSON: function(options) {
      var attrs = _.clone(this.attributes);
      attrs.User = this.get('User').toJSON();
      return attrs;
    },

  });
});
define( 'views/actionBar',[   'text!templates/actionbar.html','models/actionbar','appConfig','eventDispatcher', 'console']
  ,function( BarTemplate,                    ActionbarModel,    AppConfig,  EventDispatcher,   console){

return Backbone.View.extend({

  template: _.template(BarTemplate),
  model: new ActionbarModel(),

  events: {
    "touchstart #btn-start": "startComment",
    "click #btn-start": "startComment",
    "click #btn-register": "register",
    "click #btn-logout": "logout",
    "click #btn-logo, #btn-name": "editUser"
  },

  initialize: function() {
    _.bindAll(this);
    this.theUser = this.options.theUser;
    this.model.set('User',this.options.theUser);
    this.model.bind('change',this.render,this);
    this.theUser.bind('change',this.render,this);
    EventDispatcher.on('comment:complete', this.endComment, this);
    EventDispatcher.on('user:arrived',this.render);

    if( AppConfig.readonly ) this.model.set('readonly',true); // rendert durch bind auf change
    else this.render();

    $(window).scroll( this.scrollHandler );
  },
  startComment: function() {
    if( this.model.get('commenting') || this.model.get('readonly') ) return;
    this.model.set('commenting',true);
    EventDispatcher.trigger('action:startComment');
  },
  endComment: function() {
    this.model.set('commenting',false);
  },

  logout: function() {
    EventDispatcher.trigger('user:logout');
  },
  register: function() {
    EventDispatcher.trigger('user:login');
  },
  editUser: function() {
    EventDispatcher.trigger('user:edit');
  },
  scrollHandler: function() {
    var actionBar = this.$el;
    if( !actionBar.data('homePos')  ) {
      actionBar.data('homePos', actionBar.offset().top  );
    }
    var isScrolledOut = ($(window).scrollTop()) > actionBar.data('homePos');
    if( isScrolledOut )  {
        actionBar.addClass('fixed');
    } else {
        actionBar.removeClass('fixed');
    }
  },

  render: function() {
    if( this.model.get('readonly') ) return this;
    this.$el.html(this.template(this.model.toJSON()));
    return this; // to enable chaining
  }

});

});

define('text!templates/loginForm.html',[],function () { return '<div class="lightbox-block">\n  <div class="lightbox-container bbt-login-container">\n    <span class="close">&nbsp;</span>\n    <div class="bbt-login-form">\n        <h2>betatext Login</h2>\n        <div class="waitingForCredentials statusmessage" style="display:none;">Bitte melden Sie sich an.</div>\n        <div class="checkingCredentials statusmessage" style="display:none;">Prüfe Logindaten...</div>\n        <div class="invalidCredentials statusmessage error" style="display:none;">\n            <h2>Anmeldefehler</h2>\n            E-Mail Adresse oder Passwort falsch\n        </div>\n        <div class="login-row">\n            <label for="bbt-user">E-Mail Adresse:</label>\n            <input type="text" id="bbt-user" class="text selectable">\n        </div>\n        <div class="login-row">\n            <label for="bbt-pass">Passwort:</label>\n            <input type="password" id="bbt-pass" class="text selectable">\n        </div>\n        <input type="button" id="submitLoginButton" value="login" unselectable="on" class="button bigbutton unselectable"><br/>\n        <input type="button" id="cancelLoginButton" value="zurück" unselectable="on" class="button bigbutton unselectable"><br/>\n\n        <div class="actionlink">\n            <a href="<%= pwreset_url %>">Passwort vergessen?</a>\n        </div>\n        <div class="actionlink">\n            <a href="<%= register_url %>" class="actionlink">Noch nicht registriert?</a>\n        </div>\n    </div>\n  </div>\n</div>';});

define( 'views/userView',[ 'models/user',
          'text!templates/loginForm.html',
          'appConfig',  'eventDispatcher', 'console']

,function( User,
           LoginFormTemplate,
           AppConfig,    EventDispatcher ,  console){

    return Backbone.View.extend({


        events: {
          "keypress input.text"     : "sendOnEnter",
          "click #submitLoginButton": "checkCredentials",
          "click #cancelLoginButton": "cancelLogin",
          "click .lightbox-block"   : "cancelLogin",
          "click .close"            : "cancelLogin"

        },
        template: _.template(LoginFormTemplate),
        loginCallbacks: {},

        initialize: function() {
          _.bindAll(this);
          this.setElement($('<div></div>').appendTo('body').hide().get(0));
          this.model.fetch({success:this.fetchSuccess,error:this.fetchError});
          EventDispatcher.on('user:login',this.getLogin,this);
          EventDispatcher.on('user:check',this.checkLogin,this);
          EventDispatcher.on('user:logout',this.logout,this);
          EventDispatcher.on('user:edit',this.edit,this);
        },
        fetchSuccess: function(userModel,response) {
          this.model.set('_logged_in',true);
          console.log('The User has arrived!');
          EventDispatcher.trigger('user:arrived',this.model);
          if( this.loginCallbacks && this.loginCallbacks.success ) this.loginCallbacks.success.call();
        },
        fetchError: function(userModel,response) {
          if( response.status == 404 ) {
            console.log('User ist nicht eingeloggt');
            this.model.set('_logged_in', false);
            var parsedResponse = JSON.parse(response.responseText);

            this.model.register_url = parsedResponse.register_url+'&returnto='+pageUID;
            this.model.pwreset_url = parsedResponse.pwreset_url+'&returnto='+pageUID;
          }
        },
        logged_in: function(){
            return this.model.get('_logged_in');
        },
        getLogin: function(callbacks) {
          if( this.logged_in() ) {
            if( callbacks && callbacks.success ) callbacks.success.call();
          } else {
              this.$el.html(this.template(this.model.toJSON()));
              this.$el.show();
              this.$('#bbt-user').focus();
              this.$('.waitingForCredentials').show();
              this.loginCallbacks = callbacks;
          }
          return this;
        },
        checkLogin: function(callbacks) {
            if( this.logged_in() && callbacks && callbacks.success ) callbacks.success.call();
            if( !this.logged_in() && callbacks && callbacks.error ) callbacks.error.call();
        },
        sendOnEnter: function(e) {
          if (e.keyCode == 13){
            if( this.$('#bbt-user').val() == "" ) this.$('#bbt-user').focus();
            else if( this.$('#bbt-pass').val() == "" ) this.$('#bbt-pass').focus();
            else this.checkCredentials();
          }
        },
        checkCredentials: function() {
            var login = this.$('#bbt-user').val();
            var pass  = this.$('#bbt-pass').val();
            this.$('.statusmessage').hide();
            this.$('.checkingCredentials').show();
            var data = JSON.stringify( { username:login,password:pass });
            $.post( AppConfig.REST.login, data,null,'json' )
             .success(this.loginSuccess)
             .error(this.loginError)
        },
        loginSuccess: function() {
          this.model.fetch({success:this.fetchSuccess,error:this.fetchError});
          this.$el.hide();
        },
        loginError: function() {
            this.$('.statusmessage').hide();
            this.$('.invalidCredentials').show();
        },
        cancelLogin: function(e) {
          if( e.target.className == 'lightbox-block' || e.target.className == 'close' || e.target.id == 'cancelLoginButton') {
            this.$el.hide();
            if( this.loginCallbacks && this.loginCallbacks.error ) this.loginCallbacks.error.call();
          }
        },
        edit: function() {
          window.location=this.model.get('profile_url')+'&returnto='+pageUID;
        },
        logout: function() {
            $.post( AppConfig.REST.logout, null,null,'json' )
             .success(this.logoutSuccess)
        },
        logoutSuccess: function(response) {
          this.model.kill();
          this.model.register_url = response.register_url;
          this.model.pwreset_url = response.pwreset_url;
          EventDispatcher.trigger('user:left',this.model);
//          location.reload();
        }

    });
});


define('text!templates/processStep.html',[],function () { return '<% if(Link)  { %><a class="stepLink" href="<%= Link%>"><% } %>\n    <div class="processStep <% if(IsCurrent){ %>currentStep<%}%>">\n        <h2 class="stepIndex"><%= StepIndex %></h2>\n    </div>\n<% if(Link)  { %></a><% } %>\n<span class="tooltipContent"><%= Content %></span>\n<div class="lightbox-block" style="display:none;">\n    <div class="actionLink-Container lightbox-container">\n        <span class="close">&nbsp;</span>\n        <div class="actionLink-Content"></div>\n    </div>\n</div>';});

define(  'views/pstepView',['text!templates/processStep.html','appConfig','eventDispatcher','console']
,function(PstepItemTemplate,               AppConfig,  EventDispatcher , console ){

  return Backbone.View.extend({

    tagName:  "li",
    className: "pstepItem",
    events: {
      "mouseenter"            : 'showTooltip',
      "mouseleave"            : 'hideTooltip',
      "click .stepLink"       : 'linkAction',
      "click .close"          : 'linkActionClose',
      "click .lightbox-block" : 'linkActionClose',
      "click .lightbox-container" : 'contentClicked'
    },

    // Cache the template function for a single item.
    template: _.template(PstepItemTemplate),
    initialize: function( ) {
      _.bindAll(this);
      this.ttPaused=false;
    },
    showTooltip: function() {
      EventDispatcher.trigger('tooltip:show',{Content:this.$('.tooltipContent').html(),parentEl:this.$el});
    },

    hideTooltip: function(e) {
      EventDispatcher.trigger('tooltip:hide',e);
    },
    pauseTooltip: function() {
      this.ttPaused = true;
      this.hideTooltip();
    },
    resumeTooltip: function() {
      this.ttPaused=false;
    },

    linkAction: function() {
      var linkTarget = this.$('.stepLink').attr('href');
      if( !_.isEmpty( linkTarget) ) {
        EventDispatcher.trigger('tooltip:pause');
        this.$('.lightbox-block').show();
        // Inhalt nachladen: Bei Themenseiten aus #block_50_left
        // sonst aus #block_75_left
        this.$('.actionLink-Content').load(linkTarget +' '+ AppConfig.pstepsView.loadContent );
      }
      return false;
    },

    linkActionClose: function(){
        EventDispatcher.trigger('tooltip:resume');
        this.$('.lightbox-block').hide();
    },
    contentClicked: function(e) {
          e.stopPropagation();
    },
    render: function(isLast) {
      var tplData = this.model.toJSON();
      this.$el.html(this.template(tplData));
      if( this.model.get('IsPast') ) this.$el.addClass('pastStep');
      if( isLast ) this.$el.addClass('lastStep');
      return this;
    }

  });

});
define(  'models/pstep',['appConfig','eventDispatcher']
,function( AppConfig,  EventDispatcher){

  return Backbone.Model.extend({
    urlRoot: AppConfig.REST.url+'/pstep',
    defaults: function() {
      return {
        TextID: 0,
        Content: "default step content",
        StepIndex: "0"
      };
    }
  });

});
define('models/pstepList',['models/pstep','eventDispatcher','appConfig','console'],function(PstepModel,EventDispatcher,AppConfig,console){
return Backbone.Collection.extend({
    model: PstepModel,
    initialize: function(options) {
        this.url = options.url;
    }
  });
});

define('text!templates/parl_process.html',[],function () { return '\n<h2><% if( ProcessTitle ) print(ProcessTitle); else { %>Fortschritt im parlamentarischen Prozess<% } %></h2>\n<a href="#" class="btn_scroll nextStep">nächster Schritt</a>\n<a href="#" class="btn_scroll prevStep">voriger Schritt</a>\n<div class="processStepListContainer">\n    <ul class="processStepList"></ul>\n</div>';});

define(  'views/pstepsView',['views/pstepView','models/pstepList','text!templates/parl_process.html','appConfig','eventDispatcher', 'console'] ,
function(  PstepView,        PstepList,         PstepsTemplate,                    AppConfig , EventDispatcher,   console ){

  return Backbone.View.extend({
    template: _.template(PstepsTemplate),
    events: {
      "click .nextStep"            : 'scrollPrev',
      "click .prevStep"            : 'scrollNext'
    },

    initialize: function( ) {
      _.bindAll(this);
      this.TextID = this.options.TextID;
      this.pstepList = new PstepList({
        url : 'rest.php/psteps/'+this.TextID
      });

      this.pstepList.bind('reset',this.onStepsReceived);
      this.pstepList.fetch();

    },
    onStepsReceived: function() {
      var step = this.pstepList.where({IsCurrent:1})[0];
      this.currentStep = this.pstepList.indexOf(step);
      this.currentStep = this.checkBounds(this.currentStep-1);
      this.tplData = { ProcessTitle: step.get('ProcessTitle') };
      this.render();
      this.scrollTo( this.currentStep);
    },
    scrollTo: function( step ) {
      var scrollValue = this.checkBounds(step)*this.stepWidth;
      this.$('.processStepListContainer').animate({scrollLeft:scrollValue},500);
    },

    // es sind immer 5 Steps sichtbar, deshalb nie weiter scrollen
    checkBounds: function( step ) {
      this.$('.prevStep, .nextStep').removeClass('disabled');
      if( step >= this.pstepList.length-AppConfig.pstepsView.visibleSteps ){
        step = this.pstepList.length-AppConfig.pstepsView.visibleSteps;
        this.$('.prevStep').addClass('disabled');
      }
      if( step < 0 ){
        step = 0;
      }
      if( step == 0 ) this.$('.nextStep').addClass('disabled');

      // bei weniger als 6 schritten scrollpfeile verstecken
      if( this.pstepList.length<=5 ) this.$('.prevStep, .nextStep').addClass('not_shown');;
      return step;
    },
    scrollNext: function() {
      this.currentStep = this.checkBounds(this.currentStep + AppConfig.pstepsView.visibleSteps );
      this.scrollTo(this.currentStep);
      return false;
    },
    scrollPrev: function() {
      this.currentStep = this.checkBounds(this.currentStep - AppConfig.pstepsView.visibleSteps );
      this.scrollTo(this.currentStep);
      return false;
    },

    renderStep: function(step) {
      var view = new PstepView({model:step, tipContainer: this.tipContainer});
      var step = view.render(this.pstepList.last() == step);

      this.$('.processStepList').append( step.el );

      this.stepWidth = step.$el.outerWidth(true);
    },

    render: function() {
      this.$el.html(this.template(this.tplData));
      this.pstepList.each(this.renderStep);
      return this;
    }
  });

});

define('text!templates/tooltip.html',[],function () { return '<span class="bbt-tooltip"><span class="info">&nbsp;</span><%= Content %><span class="schnubbel">&nbsp;</span></span>\n';});

define(  'views/tooltipView',['text!templates/tooltip.html','appConfig','eventDispatcher','console']
,function(TooltipTemplate,             AppConfig,  EventDispatcher , console ){

  return Backbone.View.extend({
    // Cache the template function for a single item.
    template: _.template(TooltipTemplate),
    events: {
        'mouseleave' : 'hideTooltip'
    },
    initialize: function( ) {
      _.bindAll(this);
      this.setElement( $('<div class="bbt-tipContainer"></div>').appendTo('body') );
      this.ttPaused=false;

      EventDispatcher.on('tooltip:show',this.showTooltip,this);
      EventDispatcher.on('tooltip:hide',this.hideTooltip,this);
      EventDispatcher.on('tooltip:pause',this.pauseTooltip,this);
      EventDispatcher.on('tooltip:resume',this.resumeTooltip,this);
    },
    showTooltip: function(data) {
      if( this.ttPaused ) return;
      this.tipData = data;
      this.render();
      var off = this.tipData.parentEl.offset();
      this.$el.show();
      off.top -= this.$el.height()+15;
      off.left -= (this.$el.width()/2 - this.tipData.parentEl.width()/2);
      this.$el.offset(off);
    },
    hideTooltip: function(e) {
      // mouseout während über Tooltip ?
      if( e && $(e.toElement).parent('.bbt-tooltip').length) return;

      this.$el.hide();
    },
    pauseTooltip: function() {
      this.ttPaused = true;
      this.hideTooltip();
    },
    resumeTooltip: function() {
      this.ttPaused=false;
    },

    render: function() {
      this.$el.html(this.template(this.tipData));
      this.$el.attr('class','bbt-tipContainer');
      if( this.tipData.className ) this.$el.addClass(this.tipData.className);
      return this;
    }

  });

});
define( 'views/appView',[   'views/textView' ,'text!templates/app.html','models/user',
            'views/actionBar','views/userView'         ,'views/pstepsView','views/tooltipView',
            'appConfig',      'eventDispatcher','console']
,function(  TextView,         AppTemplate,              User,
            ActionBar,        UserView,                 PstepsView,        TooltipView,
            AppConfig,        EventDispatcher,  console){

return Backbone.View.extend({

  template: _.template(AppTemplate),

  initialize: function() {
    _.bindAll(this);
    EventDispatcher.on('comment:complete', this.unblockUI, this);
    EventDispatcher.on('action:startComment', this.startComment, this);
    this.setElement(this.options.commentableText);

    if(this.$el.length ) {
      this.TextID =  'bbt-'+this.$('.csc-default').eq(0).attr('id');
      this.$el.attr('id',this.TextID);
      this.TextContent = $('#'+this.TextID).html();
      this.theUser = new User();
      this.userView = new UserView({model:this.theUser});
      this.render();
      this.textView = new TextView({
        el: this.$el.find('.textView').get(0),
        TextID:this.TextID,
        TextContentInitial: this.TextContent
      });
      if( AppConfig.readonly ) {
        this.$('.actionBar').remove();
      } else {
        this.actionBar = new ActionBar({
          el: this.$el.find('.actionBar').get(0),
          theUser:this.theUser
        });
      }
      this.processStepsView = new PstepsView({
        el: $('.processView').get(0),
        TextID:this.TextID
      });
      this.tooltipView = new TooltipView({
        el: this.$el.find('.processView').get(0),
        TextID:this.TextID
      });

    } else {
//      console.log( 'this page contains no editable text');
    }
  },
  startComment: function() {
    console.log('appView on action startComment');
    EventDispatcher.trigger('comment:unPinAll');
    setTimeout( this.textView.startComment,10);
  },

  render: function() {
    this.$el.html(this.template());
    return this; // to enable chaining

  }

});

});

$(function() {
	requirejs.onError = function (err) {}

	require.config({
			baseUrl: 'typo3conf/ext/we_betatext/app',
			paths: {
				text: '../lib/requirejs/text'
			}
	});

	// wenn Tool aktiviert, dann auch noch Klasse im BODY
	if( bbt_enabled )
	{
		$('body').addClass('bbt_enabled')
		// UND body unselectierbar machen:
		.addClass('unselectable')
		// auch für den IE:
		.attr('unselectable', 'on');

	}

	// Start the main app logic.
	require(['views/appView'],
		function (AppView) {

			$(bbt_selector).wrapInner('<div class="commentable_text"></div>');
			rangy.init();
			var App = new AppView({
						commentableText: $(".commentable_text").get(0)
				});
		}
	);
});

define("app", function(){});

}());