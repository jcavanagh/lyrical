if (typeof define !== 'function') { var define = require('amdefine')(module); }

/**
 * Playlists controller
 * 
 * @author Joe Cavanagh
 */
define([], function() {
    return angular.module('lyrical.controllers')
        .controller('PlaylistCtl', function($scope, PlaylistResource) {
            $scope.playlists = PlaylistResource.query();

            $scope.edit = function(playlist) {
                window.location = '#/playlists/' + playlist.id
            }
        });
});
