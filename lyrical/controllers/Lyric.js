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
            chainer.add( Meaning.model.destroy({ LyricId: req.params.id }) );

            var meaningsToCreate = req.body.meanings;
            if(meaningsToCreate && meaningsToCreate.length) {
                for (var x = 0; x < meaningsToCreate.length; x++) {
                    chainer.add( Meaning.model.create(req.body.meanings[x]) );
                }
            }

            //Update lyric
            chainer.add( Lyric.model.update(req.body, { id: req.params.id }) );

            chainer.run().success(function(results) {
                //Associate meanings to updated lyric
                debugger;

                //Return
                res.status(200).json({});
            }).error(function(error) {
                console.error('Error updating lyric:', error, error.stack);
                res.status(500).json(error);
            });


            // Lyric.model.find(req.params.id).success(function(lyric) {
            //     //Create meanings
            //     //This is done like this since Sequelize's bulk create can't tell me what it created
            //     var meaningsToCreate = req.body.meanings.map(function(meaning) {
            //         return function(callback) {
            //             Meaning.model.find(meaning.id).success(function(foundMeaning) {
            //                 if(meaning.id && foundMeaning) {
            //                     //If we found one, super
            //                     callback(null, foundMeaning);
            //                 } else {
            //                     //Otherwise, create it
            //                     Meaning.model.create(meaning).success(function(newMeaning) {
            //                         callback(null, newMeaning);
            //                     }).error(function(error) {
            //                         callback(true, error);
            //                     });
            //                 }
            //             }).error(function(error) {
            //                 callback(true, error);
            //             });
            //         };
            //     });

            //     //This will be called after updating meanings
            //     var updateLyric = function() {
            //         lyric.updateAttributes(req.body).success(function(updatedLyric) {
            //             res.json(updatedLyric);
            //         }).error(function(error) {
            //             res.status(500).json(error);
            //         });
            //     };

            //     if(meaningsToCreate.length) {
            //         async.series(meaningsToCreate, function(error, newMeanings) {
            //             newMeanings = newMeanings || [];
                        
            //             if(error) {
            //                 var msg = 'Error updating lyric meanings:', error;
            //                 console.error(msg);
            //                 res.status(500).json(msg);
            //                 return;
            //             }

            //             //Replace any meanings previously associated
            //             lyric.setMeanings(newMeanings).success(updateLyric).error(function(error) {
            //                 res.status(500).json(error);
            //             });
            //         });
            //     } else {
            //         updateLyric();
            //     }
            // }).error(function(error) {
            //     res.status(500).json(error);
            // });
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
