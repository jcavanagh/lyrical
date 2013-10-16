/**
 * App directives
 * 
 * @author Joe Cavanagh
 */
define([
    'angular',
    'lyrical/directives/Header',
    'lyrical/directives/Footer'
], function(angular, Header, Footer) {
    'use strict';

    return angular.module('lyrical.directives', [
            //No dependencies
        ]).directive(
            Header.name, Header.factory
        ).directive(
            Footer.name, Footer.factory
        );
});
