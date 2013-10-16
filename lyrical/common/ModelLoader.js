if (typeof define !== 'function') { var define = require('amdefine')(module); }

/**
 * Helper to load ORM models
 * 
 * @author Joe Cavanagh
 */
define([
    'require',
    'underscore',
    'fs',
    'path'
], function(require, _, fs, path) {
    'use strict';

	var ModelLoader = {
        /**
         * Loads all modules, and executes the callback once complete
         *
         * @param {Function} callback Load complete callback
         */
        loadAll: function(callback) {
            var models = []
                ,modelPath = path.join(__dirname, '..', 'models');

            //Load 'em up
            fs.readdir(modelPath, function(err, files) {
                if(err) {
                    console.error('Failed to load models:');
                    console.error(err);

                    if(_.isFunction(callback)) {
                        callback();
                    }

                    return;
                } else {
                    models = _.map(
                        _.filter(files, function(file) {
                            //JS files only
                            return _.str.endsWith(file, '.js');
                        }),
                        function(file) {
                            //Assemble path and strip extension
                            return 'models/' + file.replace('.js', '');
                        }
                    );

                    //Require them all - should specify their own dependencies
                    //as normal
                    if(models.length > 0) {
                        require(models, function() {
                            if(_.isFunction(callback)) {
                                callback();
                            }
                        });
                    } else {
                        if(_.isFunction(callback)) {
                            callback();
                        }
                    }
                }
            });
        }
    };

    return ModelLoader;
});
