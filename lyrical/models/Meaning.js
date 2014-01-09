if (typeof define !== 'function') { var define = require('amdefine')(module); }

/**
 * The meaning for a lyric fragment
 * 
 * @author Joe Cavanagh
 */
define([
    'orm/orm'
], function(orm) {
    var Meaning = orm.define('Meaning', {
        //The character index at which it starts/ends, relative to the entire lyric text
        start: orm.INTEGER,
        end: orm.INTEGER,

        //The meaning importance
        type: orm.STRING,

        //What it means
        description: orm.TEXT
    });

    return {
        model: Meaning
        ,associate: function(models) {
            //Nothing to associate
        }
    };
});
