if (typeof define !== 'function') { var define = require('amdefine')(module); }

/**
 * Provides lyric data
 * 
 * @author Joe Cavanagh
 */
define(['angular'], function(angular) {
    return angular.module('lyrical.resources')
        .factory('LyricResource', function($resource) {
            return $resource('/api/lyrics/:id', { id: '@id' }, { update: { method: 'PUT' } });
        }
    );
});
