if (typeof define !== 'function') { var define = require('amdefine')(module); }

/**
 * Local configuration provider
 * 
 * @class common.Config
 * @author Joe Cavanagh
 */
define([
    'underscore',
    'async',
    'fs',
    'path'
], function(_, async, fs, path) {
    'use strict';
    
    var CONFIG_PATH = path.join(__dirname, '..', 'config.json')
        ,ORM_CONFIG_PATH = path.join(__dirname, '..', 'orm', 'config', 'config.json');

    /**
     * Constructs a Config object
     * 
     * @method
     * @param {Object} configPaths Map of configuration key to filename
     */
    var Config = function(configPaths) {
        //Sanitize
        if(!_.isObject(configPaths)) {
            console.error('Cannot load config: Malformed paths');
            return;
        }

        //Stash config paths
        this.configPaths = configPaths;

        this.configLoaded = false;
        this.configLoadedListeners = [];

        //Load config
        this.readConfig(function() {
            //Watch config file
            _.each(this.configPaths, function(path) {
                fs.watchFile(path, this.onConfigChanged.bind(this));
            }, this);
        });
    };

    Config.prototype = {
        /**
         * Retrieves a config value by key string.
         * 
         * @param {String} key Path to key, dot separated
         * @return {Object} Value if found, or null
         */
        get: function(key) {
            if(this.config && key && typeof key === 'string') {
                var keys = key.split('.')
                    ,configScope = this.config;

                //Loop through each provided key and attempt to delve through the config object
                for (var i = 0; i < keys.length; i++) {
                    var currentKey = keys[i];

                    //Check to see if the key is present at the current nesting level
                    if(configScope.hasOwnProperty(currentKey)) {
                        var nextScope = configScope[currentKey];

                        //If this is the final iteration, this is our return value
                        if(i === keys.length - 1) {
                            return nextScope;
                        } else {
                            configScope = nextScope;
                        }
                    } else {
                        //Nothing to find - key does not exist
                        console.warn('Could not find config entry for key: ', key);
                        break;
                    }
                }

                return null;
            } else {
                if(!this.config) {
                    console.error('Configuration not loaded!  Ensure config.json is present and valid JSON.');
                }

                if(!key) {
                    console.warn('Invalid key passed to Config.get: ', key);
                }

                return null;
            }
        }

        /**
         * Returns all configuration
         */
        ,getAll: function() {
            return this.config;
        }

        /**
         * Event handler for fs.watch.  Reloads configuration.
         * 
         * @param {String} current Current stat
         * @param {String} prev Previous stat
         */
        ,onConfigChanged: function(current, previous) {
            console.log('Reloading configuration...');
            this.readConfig();
        }

        /**
         * Fires when configuration is loaded and ready.
         * If configuration has been loaded, callback will execute immediately.
         * 
         * @param {Function} callback The callback to execute
         * @param {Object} scope The scope to execute the callback in
         */
        ,onConfigLoaded: function(callback, scope) {
            var applyScope = scope || this;

            if(this.configLoaded) {
                try {
                    //Execute cached callbacks
                    if(this.configLoadedListeners) {
                        while(this.configLoadedListeners.length > 0) {
                            var fn = this.configLoadedListeners.pop();
                            fn();
                        }
                    }

                    //Execute passed callback immediately
                    if(typeof callback === 'function') {
                        callback.apply(applyScope);
                    }
                } catch(e) {
                    console.error('Error executing config load callback:');
                    console.error(e.stack);
                }
            } else {
                //Cache the function, bound to its scope
                if(typeof callback === 'function') {
                    this.configLoadedListeners.push(callback.bind(applyScope));
                }
            }
        }

        /**
         * Reads configuration from file
         * 
         * @param {Function} callback Callback once file has been read in.
         */
        ,readConfig: function(callback) {
            //Get file handle, read, and parse
            var me = this,
                fileLoadFns = [];

            me.config = {};

            _.each(_.pairs(me.configPaths), function(kv, index, list) {
                var key = kv[0],
                    path = kv[1],
                    generator = function(key, path) {
                        return function(callback) {
                            fs.readFile(path, function(err, data) {
                                if(err) {
                                    console.error('Error loading config:');
                                    console.error(err);
                                    return;
                                }

                                //Load config
                                try {
                                    me.config[key] = JSON.parse(data.toString());
                                } catch(e) {
                                    console.error('Failed to parse config file:', path);
                                    console.error(e);
                                }

                                //Execute callback
                                if(callback && typeof callback === 'function') {
                                    callback.apply(me);
                                }
                            });
                        };
                    };

                fileLoadFns.push(generator(key, path));
            });

            //Load all files, fire load when done
            async.parallel(fileLoadFns, function() {
                //Fire initial load
                if(!me.configLoaded) {
                    me.configLoaded = true;
                    me.onConfigLoaded();
                }

                console.log(me.config);
            });
        }
    };

    return new Config({
        lyrical: CONFIG_PATH,
        orm: ORM_CONFIG_PATH
    });
});