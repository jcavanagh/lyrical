if (typeof define !== 'function') { var define = require('amdefine')(module); }

/**
 * Playlists controller
 * 
 * @author Joe Cavanagh
 */
define(['angular'], function(angular) {
    'use strict';

    return angular.module('lyrical.controllers')
        .controller('PlaylistCreateCtl', function($scope, $route, $location, PlaylistResource) {
            $scope.create = function() {
                PlaylistResource.save({
                    title: $scope.model.title
                }, function(playlist) {
                    $location.path('/playlists/' + playlist.id);
                });
            };
        })
        .controller('PlaylistUpdateCtl', function($scope, $route, $location, PlaylistResource) {
            var playlistId = $route.current.params.id;

            $scope.model = PlaylistResource.get({ id: playlistId });

            $scope.update = function() {
                //Trim title
                $scope.model.title = $scope.model.title.replace(/&nbsp;/g, ' ').trim();
                
                PlaylistResource.update($scope.model);
                $location.path('/playlists');
            };
        })
        .controller('PlaylistDeleteCtl', function($scope, $route, $location, PlaylistResource) {
            $scope.delete = function() {
                if($scope.model && $scope.model.id) {
                    PlaylistResource.delete({ id: $scope.model.id });
                    $location.path('/playlists');
                }
            };
        })
        .controller('PlaylistIndexCtl', function($scope, $route, $location, PlaylistResource) {
            $scope.playlists = PlaylistResource.query();

            $scope.select = function(playlist) {
                $location.path('/playlists/' + playlist.id);
            };
        });
});
