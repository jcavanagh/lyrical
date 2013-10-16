if (typeof define !== 'function') { var define = require('amdefine')(module); }

/**
 * Meaning routes
 * 
 * @class
 * @author Joe Cavanagh
 */
define(['models/Meaning'], function(Meaning) {
	'use strict';

    return {
        /*
         * GET /meaning
         */
        index: function(req, res) {
            Meaning.findAll().success(function(meanings) {
                res.json(meanings);
            }).error(function(error) {
                res.status(500).json(error);
            });
        },

        /*
         * GET /meaning/:id
         */
        get: function(req, res) {
            Meaning.find(req.params.id).success(function(meaning) {
                res.json(meaning);
            }).error(function(error) {
                res.status(500).json(error);
            });
        },

        /*
         * POST /meaning
         */
        post: function(req, res) {
            Meaning.create(req.body).success(function(meaning) {
                res.json(meaning);
            }).error(function(error) {
                res.status(500).json(error);
            });
        },

        /*
         * PUT /meaning/:id
         */
        put: function(req, res) {
            Meaning.find(req.params.id).success(function(meaning) {
                meaning.updateAttributes(req.body).success(function(updatedMeaning) {
                    res.json(updatedMeaning);
                }).error(function(error) {
                    res.status(500).json(error);
                });
            }).error(function(error) {
                res.status(500).json(error);
            });
        },

        /*
         * DELETE /meaning/:id
         */
        delete: function(req, res) {
            Meaning.find(req.params.id).success(function(meaning) {
                meaning.destroy(req.body).success(function(deletedMeaning) {
                    res.json(deletedMeaning);
                }).error(function(error) {
                    res.status(500).json(error);
                });
            }).error(function(error) {
                res.status(500).json(error);
            });
        }
    };
});
