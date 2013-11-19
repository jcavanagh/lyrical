if (typeof define !== 'function') { var define = require('amdefine')(module); }

/**
 * Playlist routes
 * 
 * @class
 * @author Joe Cavanagh
 */
define(['models/Playlist', 'models/Lyric'], function(Playlist, Lyric) {
	'use strict';

    return {
        /*
         * GET /playlist
         */
        index: function(req, res) {
            Playlist.model.findAll().success(function(playlists) {
                res.json(playlists);
            }).error(function(error) {
                res.status(500).json(error);
            });
        },

        /*
         * GET /playlist/:id
         */
        get: function(req, res) {
            Playlist.model.find({ where: { id: req.params.id }, include: [ Lyric.model ] }).success(function(playlist) {
                res.json(playlist);
            }).error(function(error) {
                res.status(500).json(error);
            });
        },

        /*
         * POST /playlist
         */
        post: function(req, res) {
            Playlist.model.create(req.body).success(function(playlist) {
                res.json(playlist);
            }).error(function(error) {
                res.status(500).json(error);
            });
        },

        /*
         * PUT /playlist/:id
         */
        put: function(req, res) {
            Playlist.model.find(req.params.id).success(function(playlist) {
                playlist.updateAttributes(req.body).success(function(updatedPlaylist) {
                    res.json(updatedPlaylist);
                }).error(function(error) {
                    res.status(500).json(error);
                });
            }).error(function(error) {
                res.status(500).json(error);
            });
        },

        /*
         * DELETE /playlist/:id
         */
        delete: function(req, res) {
            Playlist.model.find(req.params.id).success(function(playlist) {
                if(!playlist) return res.status(400).json({ msg: 'Could not find record with id: ' + req.params.id });
                playlist.destroy().success(function() {
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
