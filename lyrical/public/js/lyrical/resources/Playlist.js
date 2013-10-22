if (typeof define !== 'function') { var define = require('amdefine')(module); }

/**
 * Provides playlist data
 * 
 * @author Joe Cavanagh
 */
define(['angular'], function(angular) {
    return angular.module('lyrical.resources')
        .factory('PlaylistResource', function($resource) {
            return $resource('/api/playlists/:id', { id: '@id' }, { update: { method: 'PUT' } });
        }
    );
});
