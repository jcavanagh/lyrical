if (typeof define !== 'function') { var define = require('amdefine')(module); }

/**
 * Lyric routes
 * 
 * @class
 * @author Joe Cavanagh
 */
define(['models/Lyric'], function(Lyric) {
	'use strict';

    return {
        /*
         * GET /lyric
         */
        index: function(req, res) {
            Lyric.findAll().success(function(lyrics) {
                res.json(lyrics);
            }).error(function(error) {
                res.status(500).json(error);
            });
        },

        /*
         * GET /lyric/:id
         */
        get: function(req, res) {
            Lyric.find(req.params.id).success(function(lyric) {
                res.json(lyric);
            }).error(function(error) {
                res.status(500).json(error);
            });
        },

        /*
         * POST /lyric
         */
        post: function(req, res) {
            Lyric.create(req.body).success(function(lyric) {
                res.json(lyric);
            }).error(function(error) {
                res.status(500).json(error);
            });
        },

        /*
         * PUT /lyric/:id
         */
        put: function(req, res) {
            Lyric.find(req.params.id).success(function(lyric) {
                lyric.updateAttributes(req.body).success(function(updatedLyric) {
                    res.json(updatedLyric);
                }).error(function(error) {
                    res.status(500).json(error);
                });
            }).error(function(error) {
                res.status(500).json(error);
            });
        },

        /*
         * DELETE /lyric/:id
         */
        delete: function(req, res) {
            Lyric.find(req.params.id).success(function(lyric) {
                lyric.destroy(req.body).success(function(deletedLyric) {
                    res.json(deletedLyric);
                }).error(function(error) {
                    res.status(500).json(error);
                });
            }).error(function(error) {
                res.status(500).json(error);
            });
        }
    };
});
