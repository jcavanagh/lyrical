if (typeof define !== 'function') { var define = require('amdefine')(module); }

/**
 * Lyrics controller
 * 
 * @author Joe Cavanagh
 */
define(['angular'], function(angular) {
    'use strict';

    return angular.module('lyrical.controllers')
        .controller('LyricCreateCtl', function($scope, $route, $location, LyricResource) {
            $scope.create = function() {
                LyricResource.save($scope.model, function(lyric) {
                    //Go to editor
                    $location.path('/lyrics/' + lyric.id + '/edit');
                });
            };
        })
        .controller('LyricUpdateCtl', function($scope, $route, $location, LyricResource) {
            var lyricId = $route.current.params.id;

            $scope.model = LyricResource.get({ id: lyricId });

            $scope.update = function() {
                //Trim title
                $scope.model.title = $scope.model.title.replace(/&nbsp;/g, ' ').trim();
                
                LyricResource.update($scope.model);
                $location.path('/lyrics');
            };
        })
        .controller('LyricDeleteCtl', function($scope, $route, $location, LyricResource) {
            $scope.delete = function() {
                if($scope.model && $scope.model.id) {
                    LyricResource.delete({ id: $scope.model.id });
                    $location.path('/lyrics');
                }
            };
        })
        .controller('LyricIndexCtl', function($scope, $route, $location, LyricResource) {
            $scope.lyrics = LyricResource.query();

            $scope.select = function(lyric) {
                $location.path('/lyrics/' + lyric.id);
            };
        })
        .controller('LyricShowCtl', function($scope, $route, $location, LyricResource, PlaylistLyricResource) {
            var lyricId = $route.current.params.id;

            $scope.model = LyricResource.get({ id: lyricId });

            $scope.edit = function() {
                $location.path('/lyrics/' + lyricId + '/edit');
            };

            $scope.addToPlaylist = function(playlist, event) {
                //Prevent the row click handler from tripping
                event.stopPropagation();

                //Add to playlist
                PlaylistLyricResource.create({
                    playlistId: playlist.id,
                    lyricId: lyricId
                });
            };
        });
});
