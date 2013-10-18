if (typeof define !== 'function') { var define = require('amdefine')(module); }

/**
 * Angular header directive
 * 
 * @class
 * @author Joe Cavanagh
 */
define(['angular'], function(angular) {
    'use strict';

    return angular.module('lyrical.directives').directive(
        'header',
        function() {
            return {
                replace: true,
                restrict: 'E',
                templateUrl: '/views/_header.html'
            };
        }
    );
});
