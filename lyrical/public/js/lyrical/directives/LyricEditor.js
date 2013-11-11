if (typeof define !== 'function') { var define = require('amdefine')(module); }

/**
 * Angular lyric editor directive
 * 
 * @class
 * @author Joe Cavanagh
 */
define(['angular'], function(angular) {
    'use strict';
    
    return angular.module('lyrical.directives').directive(
        'lyriceditor',
        function(utils) {
            return {
                replace: true,
                restrict: 'E',
                templateUrl: '/directives/_lyric_editor.html',
                link: function($scope, $element, attrs) {
                    function getEditorEl() {
                        return $element.find('.lyriceditor');
                    }

                    //Returns a list of all meanings in the current editor view
                    function getMeanings() {
                        var editorEl = getEditorEl()
                            ,meanings = [];

                        if(editorEl) {
                            var children = editorEl.children();

                            for(var x = 0; x < children.length; x++) {
                                var el = children[x],
                                    html = editorEl.html(),
                                    elHtml = el.outerHTML,
                                    elText = el.innerHTML,
                                    start = html.indexOf(elHtml),
                                    end = start + elText.length;

                                meanings.push({
                                    start: start,
                                    end: end
                                });
                            }
                        } else {
                            console.error('Could not find lyric editor element!');
                        }

                        return meanings;
                    }

                    //Insert meanings into the editor markup
                    function insertMeaning(meaning) {
                        //Insert a meaning into the lyric view
                        var editorEl = getEditorEl();
                        if(editorEl) {
                            var html = editorEl.html(),
                                textNodes = editorEl.contents().filter(function(idx, val) {
                                    return val instanceof Text;
                                }),
                                text = '';

                            //Loop text nodes and create the string of non-wrapped data
                            //FIXME: It sure would be nice if jQuery had a reduce function
                            textNodes.each(function(idx, node) {
                                text += node.data;
                            });

                            //Check bounds on existing meanings
                            // if(!checkMeaningBounds(editorEl, meaning)) { return; }

                            //Snip out substrings and create highlight elements
                            var beforeStart = html.substr(0, meaning.start),
                                between = text.substr(meaning.start, meaning.end),
                                afterEnd = html.substr(meaning.end),
                                //Invent a meaningless unique ID so this can be reliably pulled from the DOM
                                uniqueId = (+ new Date() ).toString(36),
                                tagStart = '<span data-uniqueId="' + uniqueId + '" class="meaning ' + meaning.type + '">',
                                tagEnd = '</span>';

                            editorEl.html(beforeStart + tagStart + between + tagEnd + afterEnd);
                        } else {
                            console.error('Could not find lyric editor element!');
                        }
                    }

                    $scope.$watch('newMeaning', function(newMeaning) {
                        //Whenever a new meaning is saved from the modal, we need to render it
                        if(newMeaning) {
                            insertMeaning(newMeaning);
                        } else {
                            console.log('Not rendering null meaning.');
                        }
                    });
                },
                controller: function($scope, $modal, $element) {
                    //Tool/mouse state
                    var toolDragging = false
                        ,mouseContained = false
                        ,mouseContainTimeout = 1000
                        ,mouseContainTimeoutId = null;

                    //Helpers
                    function resetDrag() {
                        toolDragging = false;
                        window.getSelection().removeAllRanges();
                    }

                    function dragStart() {
                        toolDragging = true;
                    }

                    function dragEnd() {
                        toolDragging = false;
                    }

                    function createMeaningModal(controller) {
                        return $modal.open({
                            templateUrl: '/views/meaning/_meaning_create.html'
                            ,backdrop: false
                            ,controller: controller
                        });
                    }

                    //Scope things
                    $scope.activeTool = null;
                    $scope.alerts = [];

                    $scope.closeAlert = function(index) {
                        //Remove the alerts
                        $scope.alerts.splice(index, 1);
                    };

                    //Creates a new Meaning
                    function onTextSelected() {
                        var sel = window.getSelection(),
                            range = sel.getRangeAt(0);

                        //Make sure there's a selection
                        if(!range.collapsed) {
                            var activeTool = $scope.activeTool;

                            //If we have a tool
                            if(activeTool) {
                                //Extract selected text
                                var text = sel.toString(),
                                    start = range.startOffset,
                                    end = start + range.toString().length,
                                    ancestorContainer = angular.element(range.commonAncestorContainer);

                                //If the range's common ancestor container is the lyric editor, then
                                //we are intersecting an existing meaning element.  Don't allow this.
                                if(ancestorContainer.hasClass('lyriceditor')) {
                                    $scope.alerts[0] = {
                                        type: 'danger'
                                        ,msg: 'Meanings cannot overlap!'
                                    };
                                    return;
                                }

                                //Create a modal to create the meaning
                                var modal = createMeaningModal(['$scope', '$modalInstance', function($modalScope, $modalInstance) {
                                    //This is for display reference only - not saved with the meaning
                                    $modalScope.meaningText = text;

                                    //Set all the things we already know on the modal's model
                                    $modalScope.model = $modalScope.model || {};
                                    $modalScope.model.type = activeTool;
                                    $modalScope.model.start = start;
                                    $modalScope.model.end = end;
                                    $modalScope.model.LyricId = $scope.model.id;

                                    $modalScope.onSubmit = function() {
                                        window.getSelection().removeAllRanges();

                                        //Stash and renderthe Meaning
                                        $scope.newMeaning = angular.copy($modalScope.model);

                                        try {
                                            //FIXME: ui-boostrap's modals are kind of broke, and this call always throws
                                            //       but seems benign
                                            $modalInstance.dismiss();
                                        } catch(e) {
                                            //Do nothing
                                        }
                                    };

                                    $modalScope.onCancel = function() {
                                        window.getSelection().removeAllRanges();
                                        
                                        try {
                                            //FIXME: ui-boostrap's modals are kind of broke, and this call always throws
                                            //       but seems benign
                                            $modalInstance.dismiss();
                                        } catch(e) {
                                            //Do nothing
                                        }
                                    };
                                }]);
                            } else {
                                //Choose a tool, fool!
                                $scope.alerts[0] = {
                                    type: 'danger'
                                    ,msg: 'Please select a tool before annotating text!'
                                };
                            }
                        }
                    }

                    //Event handlers
                    $scope.$on('paste', function() {
                        console.log('paste!', arguments);
                    });

                    $scope.toolClick = function(toolCls) {
                        $scope.activeTool = toolCls;
                        resetDrag();
                    };

                    //Mouse tracking
                    $scope.editorMousedown = function() {
                        dragStart();
                    };

                    $scope.editorMouseup = function() {
                        dragEnd();

                        onTextSelected();
                    };

                    $scope.editorMouseenter = function() {
                        mouseContained = true;

                        if(mouseContainTimeoutId) {
                            clearTimeout(mouseContainTimeoutId);
                        }
                    };

                    $scope.editorMouseleave = function() {
                        mouseContained = false;

                        //If the mouse leaves, we can't detect mouseup
                        //Time out and pop up the editor window anyway
                        if(toolDragging) {
                            mouseContainTimeoutId = setTimeout(function() {
                                dragEnd();
                                onTextSelected();
                            }, mouseContainTimeout);
                        }
                    };
                }
            };
        }
    );
});
