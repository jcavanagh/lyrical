//AMD!
if (typeof define !== 'function') { var define = require('amdefine')(module); }

//Setup Require
require.config({
    baseUrl: '/js',
    paths: {
        angular: 'lib/angular',
        angularRoute: 'lib/angular-route.min',
        angularResource: 'lib/angular-resource.min',
        bootstrapAngularUi: 'lib/ui-bootstrap.min'
    },
    shim: {
        angular: { exports: 'angular' },
        angularRoute: [ 'angular' ],
        bootstrapAngularUi: { deps: [ 'angular' ]}
    },
    priority: [
        'angular'
    ]
});

//Defer Angular bootstrap
window.name = 'NG_DEFER_BOOTSTRAP';

//Bootstrap libs and lyrical modules
require([
    'require',
    'angular',
    'bootstrapAngularUi'
], function(require, angular, bootstrapAngular) {
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