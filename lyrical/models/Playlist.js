if (typeof define !== 'function') { var define = require('amdefine')(module); }

/**
 * Models a set of lyrics
 * 
 * @author Joe Cavanagh
 */
define([
    'orm/orm',
    'models/Lyric'
], function(orm, Lyric) {
    'use strict';

    var Playlist = orm.define('Playlist', {
        title: orm.STRING
    });

    Playlist.hasMany(Lyric);

    return Playlist;
});
