if (typeof define !== 'function') { var define = require('amdefine')(module); }

/**
 * A ContentEditable directive
 * 
 * @author Joe Cavanagh
 */
define([], function() {
    'use strict';

    /**
     * https://github.com/akatov/angular-contenteditable
     *
     * @see http://docs.angularjs.org/guide/concepts
     * @see http://docs.angularjs.org/api/ng.directive:ngModel.NgModelController
     * @see https://github.com/angular/angular.js/issues/528#issuecomment-7573166
     */
    angular.module('lyrical.directives')
        .directive('contenteditable', function() {
            return {
                restrict: 'A',
                require: '?ngModel',
                link: function($scope, $element, attrs, ngModel) {
                    // don't do anything unless this is actually bound to a model
                    if (!ngModel) {
                        return;
                    }

                    //Adapted from: https://github.com/kvz/phpjs/blob/master/functions/strings/strip_tags.js
                    function stripTags (input, allowed) {
                        allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('');
                        var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
                            commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
                        return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
                            return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
                        });
                    }

                    // view -> model
                    $element.bind('input', function(e) {
                        $scope.$apply(function() {
                            var html, html2, rerender;

                            html = $element.html();
                            rerender = false;

                            if (attrs.stripBr && attrs.stripBr !== 'false') {
                                html = html.replace(/<br>$/, '');
                            }

                            if (attrs.noLineBreaks && attrs.noLineBreaks !== 'false') {
                                html2 = html.replace(/<div>/g, '').replace(/<br>/g, '').replace(/<\/div>/g, '');
                                if (html2 !== html) {
                                    rerender = true;
                                    html = html2;
                                }
                            }

                            if(attrs.retainSpace !== 'false') {
                                //Keep a single space to retain layout
                                if(html === '') {
                                    html = '&nbsp;';
                                    rerender = true;
                                }
                            }

                            ngModel.$setViewValue(html);

                            if (rerender) {
                                ngModel.$render();
                            }
                        });
                    });

                    $element.bind('paste', function(e) {
                        $scope.$apply(function() {
                            var pasteData = e.clipboardData.getData('text/plain');

                            e.preventDefault();

                            if(attrs.stripOnPaste && attrs.stripOnPaste !== 'false') {
                                //Sanitize input
                                pasteData = stripTags(pasteData);

                                try {
                                    var range = window.getSelection().getRangeAt(0);

                                    var divValue = range.startContainer.textContent || ''
                                        ,valueLeft = divValue.substr(0, range.startOffset)
                                        ,valueRight = divValue.substr(range.endOffset);

                                    pasteData = valueLeft + pasteData + valueRight;
                                } catch(e) {
                                    console.error('Error stripping tags on contenteditable paste:', e);
                                }
                            }

                            ngModel.$setViewValue(pasteData);
                            ngModel.$render();

                            $scope.$emit('paste', pasteData);
                        });
                    });

                    // model -> view
                    var oldRender = ngModel.$render;

                    ngModel.$render = function() {
                        var el, el2, range, sel;

                        if ( !! oldRender) {
                            oldRender();
                        }

                        $element.html(ngModel.$viewValue || '');
                        el = $element[0];
                        range = document.createRange();
                        sel = window.getSelection();

                        if (el.childNodes.length > 0) {
                            el2 = el.childNodes[el.childNodes.length - 1];
                            range.setStartAfter(el2);
                        } else {
                            range.setStartAfter(el);
                        }

                        range.collapse(true);
                        sel.removeAllRanges();
                        sel.addRange(range);
                    };

                    if (attrs.selectNonEditable && attrs.selectNonEditable !== 'false') {
                        $element.bind('click', function(e) {
                            var range, sel, target;

                            target = e.toElement;

                            if (target !== this && angular.element(target).attr('contenteditable') === 'false') {
                                range = document.createRange();
                                sel = window.getSelection();
                                range.setStartBefore(target);
                                range.setEndAfter(target);
                                sel.removeAllRanges();
                                sel.addRange(range);
                            }
                        });
                    }
                }
            };
        });
});