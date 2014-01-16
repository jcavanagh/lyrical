if (typeof define !== 'function') { var define = require('amdefine')(module); }

/**
 * Loading status service
 * 
 * @class
 * @author Joe Cavanagh
 */
define([], function() {
    angular.module('lyrical.services').factory('LoadingStatus', function($rootScope) {
        var isSaving = false;

        return {
            isSaving: function() {
                return isSaving;
            },

            setSaving: function(saving) {
                isSaving = saving;

                $rootScope.$broadcast('savingChanged', isSaving);
            }
        }
    });
});
