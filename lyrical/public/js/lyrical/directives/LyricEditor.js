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
                controller: function($scope, $modal, $rootScope) {
                    //Tool/mouse state
                    var toolDragging = false
                        ,mouseContained = false
                        ,mouseContainTimeout = 1000
                        ,mouseContainTimeoutId = null;

                    //Scope things
                    $scope.activeTool = null;
                    $scope.alerts = [];

                    $scope.closeAlert = function(index) {
                        //Remove the alerts
                        $scope.alerts.splice(index, 1);
                    };

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
                                var modal = createMeaningModal(['$scope', '$modalInstance', 'MeaningResource', function($modalScope, $modalInstance, MeaningResource) {
                                    //This is for display reference only - not saved with the meaning
                                    $modalScope.meaningText = text;

                                    //Set all the things we already know on the modal's model
                                    $modalScope.model = $modalScope.model || {};
                                    $modalScope.model.type = activeTool;
                                    $modalScope.model.start = start;
                                    $modalScope.model.end = end;
                                    $modalScope.model.LyricId = $scope.model.id;

                                    $modalScope.onSubmit = function() {
                                        try {
                                            //FIXME: ui-boostrap's modals are kind of broke, and this call always throws
                                            //       but seems benign
                                            $modalInstance.dismiss();
                                        } catch(e) {
                                            //Do nothing
                                        }

                                        //Save the Meaning
                                        //FIXME: I should probably push down the CRUD stuff to services from controllers
                                        debugger;
                                        MeaningResource.save($modalScope.model);
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
                        console.log('toolclick:', toolCls);
                        $scope.activeTool = toolCls;
                        resetDrag();
                    };

                    //Mouse tracking
                    $scope.editorMousedown = function() {
                        console.log('mousedown');
                        dragStart();
                    };

                    $scope.editorMouseup = function() {
                        console.log('mouseup');
                        dragEnd();

                        onTextSelected();
                    };

                    $scope.editorMouseenter = function() {
                        console.log('mouseenter');
                        mouseContained = true;

                        if(mouseContainTimeoutId) {
                            clearTimeout(mouseContainTimeoutId);
                        }
                    };

                    $scope.editorMouseleave = function() {
                        console.log('mouseleave');
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
