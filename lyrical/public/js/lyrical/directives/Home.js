if (typeof define !== 'function') { var define = require('amdefine')(module); }

/**
 * Angular Home directive
 * 
 * @class
 * @author Joe Cavanagh
 */
define([], function() {
    'use strict';
    
    return {
        name: 'home',
        factory: function() {
            return {
                replace: true,
                restrict: 'E',
                templateUrl: '/views/_home.html'
            };
        }
    };
});
