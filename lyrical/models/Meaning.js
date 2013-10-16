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
        type: orm.INTEGER,
        text: orm.TEXT
    });

    return Meaning;
});
