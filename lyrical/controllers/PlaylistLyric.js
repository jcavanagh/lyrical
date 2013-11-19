if (typeof define !== 'function') { var define = require('amdefine')(module); }

/**
 * PlaylistLyric routes
 * 
 * @class
 * @author Joe Cavanagh
 */
define(['models/Playlist', 'models/Lyric'], function(Playlist, Lyric) {
    'use strict';

    return {
        /*
         * POST /playlist/:playlistId/lyric/:lyricId
         */
        post: function(req, res) {
            Lyric.model.find(req.params.lyricId).success(function(lyric) {
                Playlist.model.find(req.params.playlistId).success(function(playlist) {
                    playlist.addLyric(lyric).success(function() {
                        res.json({});
                    }).error(function(error) {
                        res.status(500).json(error);
                    });
                }).error(function(error) {
                    res.status(500).json(error);
                });
            }).error(function(error) {
                res.status(500).json(error);
            });
        },

        /*
         * DELETE /playlist/:playlistId/lyric/:lyricId
         */
        delete: function(req, res) {
            Lyric.model.find(req.params.lyricId).success(function(lyric) {
                Playlist.model.find(req.params.playlistId).success(function(playlist) {
                    playlist.removeLyric(lyric).success(function() {
                        res.json({});
                    }).error(function(error) {
                        res.status(500).json(error);
                    });
                }).error(function(error) {
                    res.status(500).json(error);
                });
            }).error(function(error) {
                res.status(500).json(error);
            });
        }
    };
});
