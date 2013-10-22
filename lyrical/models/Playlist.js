if (typeof define !== 'function') { var define = require('amdefine')(module); }

/**
 * Models a set of lyrics
 * 
 * @author Joe Cavanagh
 */
define([
    'orm/orm'
], function(orm) {
    'use strict';

    var Playlist = orm.define('Playlist', {
        title: orm.STRING,
        description: orm.TEXT
    });

    return {
        model: Playlist
        ,associate: function(models) {
            var Lyric = models.Lyric;
            if(Lyric) {
                Playlist.hasMany(Lyric.model);
            } else {
                console.error('Failed to associate Playlist with Lyric!');
            }
        }
    };
});
