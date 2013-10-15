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
	var orm = new Sequelize();

    //FIXME: This might be the worst possible idea
    //       but it would be really handy if all the orm constants
    //       could be on the same object as the orm itself
    return _.extend(orm, Sequelize);
});
