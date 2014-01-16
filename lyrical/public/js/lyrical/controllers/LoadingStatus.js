if (typeof define !== 'function') { var define = require('amdefine')(module); }

/**
 * Loading indicator controller
 * 
 * @class
 * @author Joe Cavanagh
 */
define([], function() {
    'use strict';

    return angular.module('lyrical.controllers')
        .controller('LoadingStatusCtl', function($scope, $route, $location, LoadingStatus) {
            $scope.saving = LoadingStatus.isSaving();

            $scope.$on('savingChanged', function(event, saving) {
                $scope.saving = saving;
            });
        });
});
