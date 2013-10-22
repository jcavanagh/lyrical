if (typeof define !== 'function') { var define = require('amdefine')(module); }

/**
 * Playlists controller
 * 
 * @author Joe Cavanagh
 */
define(['angular'], function(angular) {
    'use strict';

    return angular.module('lyrical.controllers')
        .controller('PlaylistCtl', function($scope, $route, $location, PlaylistResource) {
            var playlistId = $route.current.params.id;
            if(playlistId) {
                //Detail
                $scope.playlist = PlaylistResource.get({ id: playlistId });
            } else {
                //List
                $scope.playlists = PlaylistResource.query();
            }

            $scope.create = function() {
                PlaylistResource.save({
                    title: $scope.title,
                    description: $scope.description
                }, function(playlist) {
                    $location.path('/playlists/' + playlist.id);
                });
            };

            $scope.edit = function(playlist) {
                $location.path('/playlists/' + playlist.id);
            };

            $scope.delete = function(playlist) {
                PlaylistResource.delete({ id: playlist.id });
                $location.path('/playlists');
            };
        });
});
