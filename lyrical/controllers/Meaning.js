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
            Meaning.model.findAll().success(function(meanings) {
                res.json(meanings);
            }).error(function(error) {
                res.status(500).json(error);
            });
        },

        /*
         * GET /meaning/:id
         */
        get: function(req, res) {
            Meaning.model.find(req.params.id).success(function(meaning) {
                res.json(meaning);
            }).error(function(error) {
                res.status(500).json(error);
            });
        },

        /*
         * POST /meaning
         */
        post: function(req, res) {
            Meaning.model.create(req.body).success(function(meaning) {
                res.json(meaning);
            }).error(function(error) {
                res.status(500).json(error);
            });
        },

        /*
         * PUT /meaning/:id
         */
        put: function(req, res) {
            Meaning.model.find(req.params.id).success(function(meaning) {
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
            Meaning.model.find(req.params.id).success(function(meaning) {
                if(!meaning) return res.status(400).json({ msg: 'Could not find record with id: ' + req.params.id });
                meaning.destroy().success(function() {
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
