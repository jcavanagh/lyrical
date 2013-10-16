if (typeof define !== 'function') { var define = require('amdefine')(module); }

/**
 * Playlist routes
 * 
 * @class
 * @author Joe Cavanagh
 */
define(['models/Playlist'], function(Playlist) {
	'use strict';

    return {
        /*
         * GET /playlist
         */
        index: function(req, res) {
            Playlist.findAll().success(function(playlists) {
                res.json(playlists);
            }).error(function(error) {
                res.status(500).json(error);
            });
        },

        /*
         * GET /playlist/:id
         */
        get: function(req, res) {
            Playlist.find(req.params.id).success(function(playlist) {
                res.json(playlist);
            }).error(function(error) {
                res.status(500).json(error);
            });
        },

        /*
         * POST /playlist
         */
        post: function(req, res) {
            Playlist.create(req.body).success(function(playlist) {
                res.json(playlist);
            }).error(function(error) {
                res.status(500).json(error);
            });
        },

        /*
         * PUT /playlist/:id
         */
        put: function(req, res) {
            Playlist.find(req.params.id).success(function(playlist) {
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
            Playlist.find(req.params.id).success(function(playlist) {
                playlist.destroy(req.body).success(function(deletedPlaylist) {
                    res.json(deletedPlaylist);
                }).error(function(error) {
                    res.status(500).json(error);
                });
            }).error(function(error) {
                res.status(500).json(error);
            });
        }
    };
});
