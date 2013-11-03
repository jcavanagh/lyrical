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
        function() {
            return {
                replace: true,
                restrict: 'E',
                templateUrl: '/directives/_lyric_editor.html',
                link: function($scope, $element, attrs) {
                    //Insert meanings into the editor markup
                    function insertMeanings() {
                        if($scope.model && $scope.model.meanings) {
                            //Remove all existing meanings from the markup
                            angular.forEach($element.find('.meaning'), function(element) {
                                element.remove();
                            });

                            //Sort and reverse
                            //We want to insert from the largest start index down to make things easy
                            var meanings = $scope.model.meanings.sort(function(a, b) {
                                if(a.start < b.start) { return -1; }
                                if(a.start > b.start) { return 1; }

                                return 0;
                            }).reverse();

                            //Add new meanings into the markup
                            var editorEl = $element.find('.lyriceditor');
                            if(editorEl) {
                                var appliedMeanings = [];

                                //FIXME: This logic probably needs to be factored out
                                angular.forEach(meanings, function(meaning) {
                                    var start = meaning.start,
                                        end = meaning.end,
                                        cls = meaning.type,
                                        html = editorEl.html();

                                    //Check basic bounds
                                    var boundsValid = true;
                                    if(start < 0) { console.warn('Negative meaning start:', meaning); boundsValid = false; }
                                    if(end > html.length) { console.warn('Meaning extends beyond lyric bounds:', meaning); boundsValid = false; }

                                    //Check to see if we intersect another meaning already rendered
                                    angular.forEach(appliedMeanings, function(appliedMeaning) {
                                        //One meaning's start may equal another's end, but starts may not match
                                        if(meaning.start >= appliedMeaning.start && meaning.start < appliedMeaning.end) {
                                            console.warn('Meaning start intersects already rendered meaning:', meaning, appliedMeaning);
                                            boundsValid = false;
                                        }

                                        if(meaning.end <= appliedMeaning.end && meaning.end > appliedMeaning.start) {
                                            console.warn('Meaning end intersects already rendered meaning:', meaning, appliedMeaning);
                                            boundsValid = false;
                                        }
                                    });

                                    //Skip to the next if we failed our bounds checks
                                    if(!boundsValid) { return; }

                                    //Snip out substrings and create highlight elements
                                    var beforeStart = html.substr(0, start),
                                        between = html.substr(start, end),
                                        afterEnd = html.substr(end),
                                        startHtml = '<span class="' + cls + '">',
                                        endHtml = '</span>';

                                    //Insert!
                                    editorEl.html(beforeStart + startHtml + between + endHtml + afterEnd);

                                    //We've inserted this one - stash it
                                    appliedMeanings.push(meaning);
                                });
                            } else {
                                console.error('Could not find lyric editor element!');
                            }
                        }
                    }

                    $scope.$watch('model.meanings', function() {
                        //Whenever the model updates, we need to rerender meanings
                        insertMeanings();
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
                        var sel = window.getSelection()
                            ,range = sel.getRangeAt(0);

                        //Make sure there's a selection
                        if(!range.collapsed) {
                            var activeTool = $scope.activeTool;

                            //If we have a tool
                            if(activeTool) {
                                //Extract selected text
                                var text = sel.toString()
                                    ,start = range.startOffset
                                    ,end = range.endOffset;

                                //Create a modal to create the meaning
                                var modal = createMeaningModal(['$scope', '$modalInstance', 'LyricResource', 'MeaningResource', function($modalScope, $modalInstance, LyricResource, MeaningResource) {
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

                                        //Save the Meaning
                                        //FIXME: I should probably push down the CRUD stuff to services
                                        MeaningResource.save($modalScope.model, function(meaning) {
                                            //Reload the lyric model
                                            LyricResource.get({ id: meaning.LyricId }, function(lyric) {
                                                $scope.model = lyric;
                                            });

                                            try {
                                                //FIXME: ui-boostrap's modals are kind of broke, and this call always throws
                                                //       but seems benign
                                                $modalInstance.dismiss();
                                            } catch(e) {
                                                //Do nothing
                                            }
                                        });
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
                                $scope.alerts.push({
                                    type: 'danger'
                                    ,msg: 'Please select a tool before annotating text!'
                                });
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
