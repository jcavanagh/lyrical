if (typeof define !== 'function') { var define = require('amdefine')(module); }

/**
 * ORM initialization
 * 
 * @author Joe Cavanagh
 */
define([
    'underscore',
    'common/Config',
    'sequelize'
], function(_, Config, Sequelize) {
    'use strict';

	var dev = Config.get('lyrical.developmentMode'),
        dbName = dev ? Config.get('orm.development.database') : Config.get('orm.production.database'),
        dbUser = dev ? Config.get('orm.development.username') : Config.get('orm.production.username'),
        dbPw = dev ? Config.get('orm.development.password') : Config.get('orm.production.password'),
        dbHost = dev ? Config.get('orm.development.host') : Config.get('orm.production.host');

    var orm = new Sequelize(dbName, dbUser, dbPw, {
        host: dbHost,
        dialect: 'postgres'
    });

    //FIXME: This might be the worst possible idea
    //       but it would be really handy if all the orm constants
    //       could be on the same object as the orm itself
    return _.extend(orm, Sequelize);
});
