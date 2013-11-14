if (typeof define !== 'function') { var define = require('amdefine')(module); }

/**
 * Lyric routes
 * 
 * @class
 * @author Joe Cavanagh
 */
define(['async', 'models/Lyric', 'models/Meaning'], function(async, Lyric, Meaning) {
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
                //Create meanings
                //This is done like this since Sequelize's bulk create can't tell me what it created
                var meaningsToCreate = req.body.meanings.map(function(meaning) {
                    return function(callback) {
                        Meaning.model.find(meaning.id).success(function(foundMeaning) {
                            if(meaning.id && foundMeaning) {
                                //If we found one, super
                                callback(null, foundMeaning);
                            } else {
                                //Otherwise, create it
                                Meaning.model.create(meaning).success(function(newMeaning) {
                                    callback(null, newMeaning);
                                }).error(function(error) {
                                    callback(true, error);
                                });
                            }
                        }).error(function(error) {
                            callback(true, error);
                        });
                    };
                });

                async.series(meaningsToCreate, function(error, newMeanings) {
                    if(error) {
                        var msg = 'Error updating lyric meanings:', error;
                        console.error(msg);
                        res.status(500).json(msg);
                        return;
                    }

                    //This will be called after updating meanings or skipping it
                    var updateLyric = function() {
                        lyric.updateAttributes(req.body).success(function(updatedLyric) {
                            res.json(updatedLyric);
                        }).error(function(error) {
                            res.status(500).json(error);
                        });
                    };

                    //Replace any meanings previously associated
                    if(newMeanings.length) {
                        lyric.setMeanings(newMeanings).success(updateLyric).error(function(error) {
                            res.status(500).json(error);
                        });
                    } else {
                        updateLyric();
                    }
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
