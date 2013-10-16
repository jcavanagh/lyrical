//AMD!
if (typeof define !== 'function') { var define = require('amdefine')(module); }

//Setup Require
require.config({
    baseUrl: '/js',
    paths: {
        jquery: 'lib/jquery.min',
        bootstrap: 'lib/bootstrap.min',
        angular: 'lib/angular',
        angularRoute: 'lib/angular-route'
    },
    shim: {
        angular: { exports: 'angular' },
        angularRoute: [ 'angular' ],
        jquery: { exports: '$' },
        bootstrap: { deps: [ 'jquery' ], exports: 'bootstrap' }
    },
    priority: [
        'jquery',
        'bootstrap',
        'angular'
    ]
});

//Defer Angular bootstrap
window.name = 'NG_DEFER_BOOTSTRAP';

//Bootstrap Angular
require([
    'angular',
    'bootstrap',
    'jquery',
    'lyrical'
], function(angular, bootstrap, jquery, lyrical) {
    'use strict';

    var $html = angular.element(document.getElementsByTagName('html')[0]);

    angular.element().ready(function() {
        $html.addClass('ng-app');
        angular.bootstrap($html, [lyrical.name]);
    });
});