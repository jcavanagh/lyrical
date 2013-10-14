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
         * GET home page.
         */
        index: function(req, res) {
            res.render('index', { title: 'Express' });
        }

        /**
         * GET a lyric
         */
        ,lyric: function(req, res) {
            res.render('lyric', {});
        }

        /**
         * GET a set of lyrics
         */
        ,lyric: function(req, res) {
            res.render('set', {});
        }
    };
});