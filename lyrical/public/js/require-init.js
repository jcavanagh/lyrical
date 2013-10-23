//AMD!
if (typeof define !== 'function') { var define = require('amdefine')(module); }

//Setup Require
require.config({
    baseUrl: '/js',
    paths: {
        angular: 'lib/angular',
        angularRoute: 'lib/angular-route.min',
        angularResource: 'lib/angular-resource.min',
        bootstrap: 'lib/bootstrap.min',
        bootstrapAngularUi: 'lib/ui-bootstrap.min',
        jquery: 'lib/jquery.min'
    },
    shim: {
        angular: { exports: 'angular' },
        angularRoute: [ 'angular' ],
        bootstrap: { deps: [ 'jquery' ], exports: 'bootstrap' },
        bootstrapAngularUi: { deps: [ 'angular', 'bootstrap' ]},
        jquery: { exports: '$' }
    },
    priority: [
        'jquery',
        'bootstrap',
        'angular'
    ]
});

//Defer Angular bootstrap
window.name = 'NG_DEFER_BOOTSTRAP';

//Bootstrap libs and lyrical modules
require([
    'require',
    'angular',
    'bootstrap',
    'bootstrapAngularUi',
    'jquery'
], function(require, angular, bootstrap, bootstrapAngular, jquery) {
    'use strict';

    //Create submodules
    angular.module('lyrical.controllers', []);
    angular.module('lyrical.directives', []);
    angular.module('lyrical.resources', ['ngResource']);
    angular.module('lyrical.services', []);

    require(['lyrical'], function(lyrical) {
        var $html = angular.element(document.getElementsByTagName('html')[0]);

        angular.element().ready(function() {
            $html.addClass('ng-app');
            angular.bootstrap($html, [lyrical.name]);
        });
    });
});