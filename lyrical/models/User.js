if (typeof define !== 'function') { var define = require('amdefine')(module); }

/**
 * Models a user
 * 
 * @author Joe Cavanagh
 */
define([
    'orm/orm',
    'crypto'
], function(orm, crypto) {
    'use strict';

    var User = orm.define('User', {
        //Common profile data
        provider: orm.STRING,
        displayName: orm.STRING,
        firstName: orm.STRING,
        lastName: orm.STRING,
        email: orm.STRING,
        photo: orm.STRING,

        //Local
        l_id: orm.STRING,
        l_password: orm.STRING,
        l_salt: orm.STRING,

        //Google
        g_id: orm.STRING,

        //Soundcloud
        sc_id: orm.STRING,

        //YouTube
        yt_id: orm.STRING,

        //Facebook
        fb_id: orm.STRING,

        //Twitter
        t_id: orm.STRING
    },{
        classMethods: {
            hashPassword: function(password) {
                //SHA256
                var hash = crypto.getHash('sha256');
                hash.update(password, 'utf8');
                return hash.digest('hex');
            }
        }
    });

    return {
        model: User
        ,associate: function(models) {
            var Playlist = models.Playlist;
            if(Playlist) {
                User.hasMany(Playlist.model, { as: 'Playlists' });
            } else {
                console.error('Failed to associate Lyric with Playlist!');
            }

            var Meaning = models.Meaning;
            if(Meaning) {
                User.hasMany(Meaning.model, { as: 'Meanings', onDelete: 'cascade' });
            } else {
                console.error('Failed to associate Lyric with Meaning!');
            }
        }
    };
});
