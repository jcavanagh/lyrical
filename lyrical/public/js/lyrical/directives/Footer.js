if (typeof define !== 'function') { var define = require('amdefine')(module); }

/**
 * Angular footer directive
 * 
 * @class
 * @author Joe Cavanagh
 */
define(['angular'], function(angular) {
    'use strict';
    
    return angular.module('lyrical.directives').directive(
        'footer',
        function() {
            return {
                replace: true,
                restrict: 'E',
                templateUrl: '/views/_footer.html'
            };
        }
    );
});
