//AMD!
if (typeof define !== 'function') { var define = require('amdefine')(module); }

//Setup Require
require.config({
    baseUrl: '/js/lyrical',
    paths: {
        jquery: '//code.jquery.com/jquery.min',
        underscore: '/lib/underscore.min',
        bootstrap: '/lib/bootstrap.min',
        angular: '//ajax.googleapis.com/ajax/libs/angularjs/1.2.0-rc.2/angular',
        angularRoute: '//code.angularjs.org/1.2.0-rc.2/angular-route',
        lyrical: '/js/lyrical'
    }
    ,shim: {
        angular: { exports: 'angular' },
        angularRoute: [ 'angular' ]
    }
    ,priority: [
        'angular'
    ]
});

//Defer Angular bootstrap
window.name = 'NG_DEFER_BOOTSTRAP';

//Bootstrap Angular
require([
    'angular',
    'lyrical',
    'routes'
], function(angular, lyrical, routes) {
    'use strict';

    var $html = angular.element(document.getElementsByTagName('html')[0]);

    angular.element().ready(function() {
        $html.addClass('ng-app');
        angular.bootstrap($html, [lyrical['name']]);
    });
});