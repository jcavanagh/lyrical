if (typeof define !== 'function') { var define = require('amdefine')(module); }

/**
 * Lyrics controller
 * 
 * @author Joe Cavanagh
 */
define(['angular'], function(angular) {
    'use strict';

    return angular.module('lyrical.controllers')
        .controller('LyricCtl', function($scope, $route, $location, LyricResource) {
            var lyricId = $route.current.params.id;
            if(lyricId) {
                //Detail
                $scope.lyric = LyricResource.get({ id: lyricId });
            } else {
                //List
                $scope.lyrics = LyricResource.query();
            }

            $scope.create = function() {
                LyricResource.save({
                    title: $scope.title,
                    text: $scope.lyrics,
                    soundcloudUrl: $scope.soundcloudUrl,
                    youtubeUrl: $scope.youtubeUrl
                }, function(lyric) {
                    $location.path('/lyrics/' + lyric.id);
                });
            };

            $scope.edit = function(lyric) {
                $location.path('/lyrics/' + lyric.id);
            };

            $scope.delete = function(lyric) {
                LyricResource.delete({ id: lyric.id });
                $location.path('/lyrics');
            };
        });
});
