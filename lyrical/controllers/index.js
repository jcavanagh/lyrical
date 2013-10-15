if (typeof define !== 'function') { var define = require('amdefine')(module); }

/**
 * Index routes
 * 
 * @author Joe Cavanagh
 **/
define([
    'common/Config'
], function(Config) {
    'use strict';

    return {
        /*
         * GET /
         */
        index: function(req, res) {
            res.render('index', { 
                developmentMode: Config.get('lyrical.developmentMode')
            });
        }
    };
});