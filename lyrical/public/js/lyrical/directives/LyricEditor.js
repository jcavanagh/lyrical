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
                    var activeTool = null
                        ,toolDragging = false
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

                    //Creates a new Meaning
                    function onTextSelected() {
                        var sel = window.getSelection()
                            ,range = sel.getRangeAt(0);

                        if(!range.collapsed) {
                            //Extract selected text
                            var text = sel.toString()
                                ,start = range.startOffset
                                ,end = range.endOffset;

                            //Create a modal to create the meaning
                            var modal = createMeaningModal(function($scope, $modalInstance) {
                                $scope.meaningText = text; 

                                $scope.onSubmit = function() {
                                    $modalInstance.dismiss($scope.model);
                                };

                                $scope.onCancel = function() {
                                    $modalInstance.dismiss();
                                };
                            });
                        }
                    }

                    //Event handlers
                    $scope.$on('paste', function() {
                        console.log('paste!', arguments);
                    });

                    $scope.toolClick = function(toolCls) {
                        console.log('toolclick:', toolCls);
                        activeTool = toolCls;
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
