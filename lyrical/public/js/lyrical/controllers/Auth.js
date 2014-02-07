if (typeof define !== 'function') { var define = require('amdefine')(module); }

/**
 * Auth controller
 * 
 * @class
 * @author Joe Cavanagh
 */
define([], function() {
    'use strict';

    return angular.module('lyrical.controllers')
        .controller('AuthCtl', function($scope, $route, $location, $modal) {
            $scope.authenticated = false;

            $scope.login = function() {
                $modal.open({
                    templateUrl: '/views/auth/_login.html'
                    ,backdrop: false
                    ,controller: ['$scope', function($modalScope) {
                        $modalScope.onCancel = function() {
                            try {
                                //FIXME: ui-boostrap's modals are kind of broke, and this call always throws
                                //       but seems benign
                                $modalInstance.dismiss();
                            } catch(e) {
                                //Do nothing
                            }
                        };
                    }]
                });
            }

            $scope.logout = function() {

            }
        });
});
