if (typeof define !== 'function') { var define = require('amdefine')(module); }

define([
    'angular',
    'angularRoute',
    'angularResource',
    'lyrical/controllers',
    'lyrical/directives',
    'lyrical/services',
    'lyrical/resources'
], function (angular, angularRoute, controllers, directives, services, resources) {
    'use strict';

    //Create main module
    return angular.module('lyrical', [
        'ngRoute',
        'lyrical.controllers',
        'lyrical.directives',
        'lyrical.services',
        'lyrical.resources'
    ]).config(function($routeProvider, $locationProvider) {
        //Index routes
        $routeProvider.when('/', {
            templateUrl: '/views/_home.html'
        });

        //Lyric routes
        $routeProvider.when('/lyrics', {
            templateUrl: '/views/lyric/_lyric.html'
        });

        $routeProvider.when('/lyric/create', {
            templateUrl: '/views/lyric/_lyric_create.html'
        });

        $routeProvider.when('/lyric/:id', {
            templateUrl: '/views/lyric/_lyric_edit.html'
        });

        //Playlist routes
        $routeProvider.when('/playlists', {
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