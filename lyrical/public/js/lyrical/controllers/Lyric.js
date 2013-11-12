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
                LyricResource.save({
                    title: $scope.model.title
                }, function(lyric) {
                    $location.path('/lyrics/' + lyric.id);
                });
            };
        })
        .controller('LyricUpdateCtl', function($scope, $route, $location, LyricResource) {
            var lyricId = $route.current.params.id;

            $scope.model = LyricResource.get({ id: lyricId }, function(lyric) {
                $scope.existingMeanings = lyric.meanings;
            });

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
        });
});
