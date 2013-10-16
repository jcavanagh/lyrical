if (typeof define !== 'function') { var define = require('amdefine')(module); }

/**
 * Angular footer directive
 * 
 * @class
 * @author Joe Cavanagh
 */
define([], function() {
    'use strict';
    
    return {
        name: 'footer',
        factory: function() {
            return {
                replace: true,
                restrict: 'E',
                templateUrl: '/views/_footer.html'
            };
        }
    };
});
