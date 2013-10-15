if (typeof define !== 'function') { var define = require('amdefine')(module); }

/**
 * Index routes
 * 
 * @author Joe Cavanagh
 **/
define([], function() {
    'use strict';

    return {
        /*
         * GET /
         */
        index: function(req, res) {
            res.render('index', { title: 'Express' });
        }
    };
});