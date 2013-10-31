if (typeof define !== 'function') { var define = require('amdefine')(module); }

/**
 * Angular lyric editor directive
 * 
 * @class
 * @author Joe Cavanagh
 */
define(['angular'], function(angular) {
    'use strict';
    
    return angular.module('lyrical.directives').directive(
        'lyriceditor',
        function() {
            return {
                replace: true,
                restrict: 'E',
                templateUrl: '/directives/_lyric_editor.html',
                controller: function($scope) {
                    $scope.$on('paste', function() {
                        console.log('paste!', arguments);
                    });

                    $scope.toolClick = function(toolId) {
                        console.log('toolclick:', toolId);
                    }
                }
            };
        }
    );
});
