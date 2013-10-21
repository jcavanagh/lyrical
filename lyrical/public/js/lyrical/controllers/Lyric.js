if (typeof define !== 'function') { var define = require('amdefine')(module); }

/**
 * Lyrics controller
 * 
 * @author Joe Cavanagh
 */
define([], function() {
    return angular.module('lyrical.controllers')
        .controller('LyricCtl', function($scope, LyricResource) {
            $scope.lyrics = LyricResource.query();
        });
});
