if (typeof define !== 'function') { var define = require('amdefine')(module); }

define([
    'angularRoute',
    'angularResource',
    'angularSanitize',
    'bootstrapAngularUi',
    'lyrical/controllers',
    'lyrical/directives',
    'lyrical/filters',
    'lyrical/services',
    'lyrical/resources'
], function (angularRoute, angularSanitize, bootstrapAngularUi, controllers, directives, filters, services, resources) {
    'use strict';

    //Create main module
    return angular.module('lyrical', [
        'ngRoute',
        'ui.bootstrap',
        'ngSanitize',
        'ngResource',
        'lyrical.controllers',
        'lyrical.directives',
        'lyrical.filters',
        'lyrical.services',
        'lyrical.resources'
    ]).config(function($routeProvider, $locationProvider) {
        //Index routes
        $routeProvider.when('/', {
            templateUrl: '/views/_home.html'
        });

        //Lyric routes
        $routeProvider.when('/lyrics', {
            templateUrl: '/views/lyric/_lyric_list.html'
        });

        $routeProvider.when('/lyrics/create', {
            templateUrl: '/views/lyric/_lyric_create.html'
        });

        $routeProvider.when('/lyrics/:id', {
            templateUrl: '/views/lyric/_lyric_show.html'
        });

        $routeProvider.when('/lyrics/:id/edit', {
            templateUrl: '/views/lyric/_lyric_update.html'
        });

        //Playlist routes
        $routeProvider.when('/playlists', {
            templateUrl: '/views/playlist/_playlist_list.html'
        });

        $routeProvider.when('/playlists/create', {
            templateUrl: '/views/playlist/_playlist_create.html'
        });

        $routeProvider.when('/playlists/:id', {
            templateUrl: '/views/playlist/_playlist_show.html'
        });

        $routeProvider.when('/playlists/:id/edit', {
            templateUrl: '/views/playlist/_playlist_update.html'
        });
    });
});