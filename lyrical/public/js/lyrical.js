define([
    'angular',
    'angularRoute',
    'controllers',
    'directives',
    'filters',
    'services'
], function (angular, angularRoute, controllers, directives, filters, services) {
    'use strict';

    return angular.module('lyrical', [
        'ngRoute',
        'lyrical.controllers',
        'lyrical.directives',
        'lyrical.filters',
        'lyrical.services'
    ]);
});