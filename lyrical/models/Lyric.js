if (typeof define !== 'function') { var define = require('amdefine')(module); }

/**
 * Models a lyric
 * 
 * @author Joe Cavanagh
 */
define([
    'orm/orm',
    'models/Meaning'
], function(orm, Meaning) {
    'use strict';

    var Lyric = orm.define('Lyric', {
        title: orm.STRING,
        text: orm.TEXT,
        youtubeUrl: orm.STRING,
        soundcloudUrl: orm.STRING
    });

    Lyric.hasMany(Meaning);

    return Lyric;
});
