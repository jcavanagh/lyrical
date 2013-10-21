if (typeof define !== 'function') { var define = require('amdefine')(module); }

/**
 * Lyrics controller
 * 
 * @author Joe Cavanagh
 */
define(['angular'], function(angular) {
    'use strict';

    return angular.module('lyrical.controllers')
        .controller('LyricCtl', function($scope, LyricResource) {
            $scope.lyrics = LyricResource.query();

            $scope.edit = function(lyric) {
                window.location='#/lyrics/' + lyric.id;
            };
        });
});
