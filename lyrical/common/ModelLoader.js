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

                    //Require them all - modules should NOT specify their own dependencies
                    //
                    //Instead, models should define an associate() method that will be 
                    //passed a dictionary of all models after all are loaded, and then
                    //each model can set up its associations then
                    if(models.length > 0) {
                        require(models, function() {
                            var modelObjs = {};

                            //Map each model to a named key in an object
                            _.each(arguments, function(arg, index) {
                                var modelName = models[index].substr(models[index].lastIndexOf('/') + 1);
                                modelObjs[modelName] = arg;
                            });

                            console.log(modelObjs);

                            //Associate models if we need to
                            _.each(modelObjs, function(model) {
                                if(_.isFunction(model.associate)) {
                                    model.associate(modelObjs);
                                }
                            });

                            //Done!
                            if(_.isFunction(callback)) {
                                callback();
                            }
                        });
                    } else {
                        //Nothing to do - no models.  There should probably be models.
                        console.error('No models loaded!  This seems bad.');
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
