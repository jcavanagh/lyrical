if (typeof define !== 'function') { var define = require('amdefine')(module); }

/**
 * Generic helper things
 * 
 * @author Joe Cavanagh
 */
define(['angular'], function(angular) {
    angular.module('lyrical.services').factory('utils', function() {
        return {
            string: {
                //Adapted from: https://github.com/kvz/phpjs/blob/master/functions/strings/strip_tags.js
                stripTags: function(input, allowed) {
                    allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('');
                    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
                        commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
                        
                    return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
                        return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
                    });
                }
            }
        }
    });
});
