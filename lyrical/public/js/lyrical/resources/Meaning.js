if (typeof define !== 'function') { var define = require('amdefine')(module); }

/**
 * Provides meaning data
 * 
 * @author Joe Cavanagh
 */
define(['angular'], function(angular) {
    return angular.module('lyrical.resources')
        .factory('MeaningResource', function($resource) {
            return $resource('/api/meanings/:id', { id: '@id' }, { update: { method: 'PUT' } });
        }
    );
});
