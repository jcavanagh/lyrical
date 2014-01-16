if (typeof define !== 'function') { var define = require('amdefine')(module); }

/**
 * Lyric routes
 * 
 * @class
 * @author Joe Cavanagh
 */
define(['sequelize', 'models/Lyric', 'models/Meaning'], function(Sequelize, Lyric, Meaning) {
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
            var chainer = new Sequelize.Utils.QueryChainer();

            //Replace all previously associated meanings
            chainer.add( Meaning.model, 'destroy', [{ LyricId: req.params.id }]);

            var meaningsToCreate = req.body.meanings;
            if(meaningsToCreate && meaningsToCreate.length) {
                for (var x = 0; x < meaningsToCreate.length; x++) {
                    //Get the IDs right
                    delete req.body.meanings[x].id;
                    req.body.meanings[x].LyricId = req.params.id;

                    chainer.add( Meaning.model, 'create', [ req.body.meanings[x] ]);
                }
            }

            //This will blow up the Lyric update if it's still on the body
            delete req.body.meanings;

            //Update lyric
            chainer.add( Lyric.model, 'update', [ req.body, { id: req.params.id } ]);

            chainer.runSerially().success(function() {
                //Find and return the lyric
                Lyric.model.find({ where: { id: req.params.id }, include: [ Meaning.model] }).success(function(lyric) {
                    res.status(200).json(lyric);
                }).error(function(error) {
                    console.error('Error associating lyric meanings:', error, error.stack);
                    res.status(500).json(error);
                });
            }).error(function(error) {
                console.error('Error updating lyric:', error, error.stack);
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
