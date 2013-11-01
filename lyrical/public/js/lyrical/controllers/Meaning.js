if (typeof define !== 'function') { var define = require('amdefine')(module); }

/**
 * Playlists controller
 * 
 * @author Joe Cavanagh
 */
define(['angular'], function(angular) {
    'use strict';

    return angular.module('lyrical.controllers')
        .controller('MeaningCreateCtl', function($scope, $route, $location, MeaningResource) {
            $scope.create = function() {
                MeaningResource.save({
                    title: $scope.model.title
                }, function(meaning) {
                    $location.path('/meanings/' + meaning.id);
                });
            };
        })
        .controller('MeaningUpdateCtl', function($scope, $route, $location, MeaningResource) {
            var meaningId = $route.current.params.id;

            $scope.model = MeaningResource.get({ id: meaningId });

            $scope.update = function() {
                //Trim title
                $scope.model.title = $scope.model.title.replace(/&nbsp;/g, ' ').trim();
                
                MeaningResource.update($scope.model);
                $location.path('/meanings');
            };
        })
        .controller('MeaningDeleteCtl', function($scope, $route, $location, MeaningResource) {
            $scope.delete = function() {
                if($scope.model && $scope.model.id) {
                    MeaningResource.delete({ id: $scope.model.id });
                    $location.path('/meanings');
                }
            };
        });
});
