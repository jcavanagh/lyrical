if (typeof define !== 'function') { var define = require('amdefine')(module); }

/**
 * Angular header directive
 * 
 * @class
 * @author Joe Cavanagh
 */
define([], function() {
    'use strict';
    
    return {
        name: 'header',
        factory: function() {
            return {
                replace: true,
                restrict: 'E',
                templateUrl: '/views/_header.html'
            };
        }
    };
});
