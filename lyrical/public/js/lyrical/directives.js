/**
 * App directives
 * 
 * @author Joe Cavanagh
 */
define([
    'angular',
    'lyrical/directives/Home'
], function(angular, Home) {
    'use strict';

    return angular.module('lyrical.directives', [
            //No dependencies
        ]).directive(
            Home.name, Home.factory
        );
});
