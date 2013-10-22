if (typeof define !== 'function') { var define = require('amdefine')(module); }

/**
 * Models a lyric
 * 
 * @author Joe Cavanagh
 */
define([
    'orm/orm'
], function(orm) {
    'use strict';

    var Lyric = orm.define('Lyric', {
        title: orm.STRING,
        text: orm.TEXT,
        youtubeUrl: orm.STRING,
        soundcloudUrl: orm.STRING
    });

    return {
        model: Lyric
        ,associate: function(models) {
            var Playlist = models.Playlist;
            if(Playlist) {
                Lyric.hasMany(Playlist.model);
            } else {
                console.error('Failed to associate Lyric with Playlist!');
            }

            var Meaning = models.Meaning;
            if(Meaning) {
                Lyric.hasMany(Meaning.model);
            } else {
                console.error('Failed to associate Lyric with Meaning!');
            }
        }
    };
});
