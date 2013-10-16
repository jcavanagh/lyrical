define([
    'angular',
    'angularRoute',
    'lyrical/controllers',
    'lyrical/directives',
    'lyrical/filters',
    'lyrical/services'
], function (angular, angularRoute, controllers, directives, filters, services) {
    'use strict';

    return angular.module('lyrical', [
        'ngRoute',
        'lyrical.controllers',
        'lyrical.directives',
        'lyrical.filters',
        'lyrical.services'
    ]).config(function($routeProvider, $locationProvider) {
        //Index routes
        $routeProvider.when('/', {
            templateUrl: '/views/_home.html'
        });

        //Lyric routes
        $routeProvider.when('/lyric', {
            templateUrl: '/views/lyric/_lyric.html'
        });

        $routeProvider.when('/lyric/create', {
            templateUrl: '/views/lyric/_lyric_create.html'
        });

        $routeProvider.when('/lyric/:id', {
            templateUrl: '/views/lyric/_lyric_edit.html'
        });

        //Playlist routes
        $routeProvider.when('/playlist', {
            templateUrl: '/views/playlist/_playlist.html'
        });

        $routeProvider.when('/playlist/create', {
            templateUrl: '/views/playlist/_playlist_create.html'
        });

        $routeProvider.when('/playlist/:id', {
            templateUrl: '/views/playlist/_playlist_edit.html'
        });
    });
});