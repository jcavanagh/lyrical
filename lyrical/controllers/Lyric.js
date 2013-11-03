if (typeof define !== 'function') { var define = require('amdefine')(module); }

/**
 * Lyric routes
 * 
 * @class
 * @author Joe Cavanagh
 */
define(['models/Lyric', 'models/Meaning'], function(Lyric, Meaning) {
	'use strict';

    return {
        /*
         * GET /lyric
         */
        index: function(req, res) {
            Lyric.model.findAll({ include: [ Meaning.model ] }).success(function(lyrics) {
                res.json(lyrics);
            }).error(function(error) {
                res.status(500).json(error);
            });
        },

        /*
         * GET /lyric/:id
         */
        get: function(req, res) {
            Lyric.model.find({ where: { id: req.params.id }, include: [ Meaning.model ] }).success(function(lyric) {
                res.json(lyric);
            }).error(function(error) {
                res.status(500).json(error);
            });
        },

        /*
         * POST /lyric
         */
        post: function(req, res) {
            Lyric.model.create(req.body).success(function(lyric) {
                res.json(lyric);
            }).error(function(error) {
                res.status(500).json(error);
            });
        },

        /*
         * PUT /lyric/:id
         */
        put: function(req, res) {
            Lyric.model.find(req.params.id).success(function(lyric) {
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
            Lyric.model.find(req.params.id).success(function(lyric) {
                if(!lyric) return res.status(400).json({ msg: 'Could not find record with id: ' + req.params.id });
                lyric.destroy().success(function() {
                    res.json({});
                }).error(function(error) {
                    res.status(500).json(error);
                });
            }).error(function(error) {
                res.status(500).json(error);
            });
        }
    };
});
