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
        .directive('contenteditable', function(utils) {
            return {
                restrict: 'A',
                require: '?ngModel',
                link: function($scope, $element, attrs, ngModel) {
                    // don't do anything unless this is actually bound to a model
                    if (!ngModel) {
                        return;
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

                    $element.bind('keypress', function(e) {
                        //Ensure the last element of the CE is always a BR, to replicate expected enter key behavior
                        var childCount = $element.contents().length
                            ,lastChild =  childCount ? $element.contents()[childCount - 1] : null;

                        if (!lastChild || lastChild.nodeName.toLowerCase() != "br") {
                            $element.append(document.createElement("br"));
                        }

                        //Snag the enter event to prevent the divs from being inserted
                        if(e.which == 13) {
                            e.preventDefault();
                            e.stopPropagation();

                            //Intercept enter press
                            $scope.$apply(function() {
                                if(attrs.brAsBreak !== 'false') {
                                    //http://stackoverflow.com/questions/3080529/make-a-br-instead-of-div-div-by-pressing-enter-on-a-contenteditable
                                    var selection = window.getSelection(),
                                        range = selection.rangeCount ? selection.getRangeAt(0) : null,
                                        br = document.createElement("br");

                                    if(range) {
                                        range.deleteContents();
                                        range.insertNode(br);
                                        range.setStartAfter(br);
                                        range.setEndAfter(br);
                                        range.collapse(false);
                                        selection.removeAllRanges();
                                        selection.addRange(range);
                                    }

                                    return false;
                                }
                            });
                        }
                    });

                    $element.bind('paste', function(e) {
                        $scope.$apply(function() {
                            var clipboardData = e.clipboardData || e.originalEvent.clipboardData,
                                pasteData = clipboardData.getData('text/plain');

                            e.preventDefault();

                            if(attrs.stripOnPaste && attrs.stripOnPaste !== 'false') {
                                //Sanitize input
                                pasteData = utils.string.stripTags(pasteData);

                                //Replace newlines with <br> tags
                                pasteData = pasteData.replace(/\n/g, '<br>');

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