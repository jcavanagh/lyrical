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
        start: orm.INTEGER,
        end: orm.INTEGER,
        type: orm.STRING,
        description: orm.TEXT
    });

    return {
        model: Meaning
        ,associate: function(models) {
            //Nothing to associate
        }
    };
});
