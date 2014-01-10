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
        function($compile, utils) {
            /**
             * Removes all meanings from a DOM node tree or HTML string
             */
            function removeAllMeanings(elementOrString) {
                if(!elementOrString) return;

                if(typeof elementOrString === 'string') {
                    return utils.string.stripTags(elementOrString);
                } else {
                    //Strip meaning tags
                    elementOrString.find('span').each(function(idx, meaning) {
                        meaning.remove();
                    });

                    return elementOrString;
                }
            }

            /**
             * Removes angular ng-scope garbage from a DOM node tree
             */
            function cleanMeaningMarkup(element) {
                if(!element) return;

                //FIXME: Angular inserts a bunch of garbage span tags around root-level text nodes
                //       when compiling.  Need to strip those out or everything dies.
                element.find('span[class="ng-scope"]').each(function(idx, garbageEl) {
                    var el = angular.element(garbageEl);
                    el.replaceWith(el.text());
                });

                //FIXME: Apparently it does this for empty br tags too
                element.find('br[class="ng-scope"]').each(function(idx, garbageEl) {
                    var el = angular.element(garbageEl);
                    el.replaceWith(document.createElement('br'));
                });
            }

            return {
                restrict: 'E',
                require: '?ngModel',
                templateUrl: '/directives/_lyric_editor.html',
                link: function($scope, $element, attrs, ngModel) {
                    if(!ngModel) {
                        console.warn('LyricEditor not bound to model!');
                        return;
                    }

                    function getEditorEl() {
                        return $element.find('.lyriceditor');
                    }

                    function sortMeanings(meanings) {
                        //Sort meanings ascending by start
                        meanings.sort(function(a, b) {
                            if(a.start < b.start) { return -1; }
                            if(a.start > b.start) { return 1; }
                            return 0;
                        });
                    }

                    //Returns a list of all meanings in the current editor view
                    function getMeanings() {
                        var editorEl = getEditorEl()
                            ,meanings = [];

                        if(editorEl) {
                            var children = editorEl.children();

                            for(var x = 0; x < children.length; x++) {
                                var el = children[x],
                                    start = parseInt(el.getAttribute('data-start'), 10),
                                    end = parseInt(el.getAttribute('data-end'), 10),
                                    description = el.getAttribute('data-description'),
                                    type = el.getAttribute('data-type');

                                meanings.push({
                                    start: start,
                                    end: end,
                                    description: description,
                                    type: type
                                });
                            }
                        } else {
                            console.error('Could not find lyric editor element!');
                        }

                        return meanings;
                    }

                    function insertMeanings(meanings) {
                        //Sort!
                        sortMeanings(meanings);

                        //Insert meanings into the lyric view
                        var editorEl = getEditorEl();
                        if(editorEl) {
                            var node = angular.element(editorEl.contents()[0])
                                ,lyricOffset = 0
                                ,currentMeaning = 0
                                ,meaning = meanings[currentMeaning];

                            debugger;
                            while(node && currentMeaning <= meanings.length) {
                                //If it's a text node
                                if(node.context.nodeType === 3) {
                                    //We might find our start/end point here
                                    for(var y = 0; y < node.text().length; y++) {
                                        //Found the start!
                                        if(lyricOffset == meaning.start) {
                                            debugger;
                                            //Create the start node
                                            var meaningNode = angular.element('<span ' +
                                                            'ng-click="meaningClick($event)" ' +
                                                            'data-start="' + meaning.start + '" ' +
                                                            'data-end="' + meaning.end + '" ' +
                                                            'data-type="' + meaning.type + '" ' +
                                                            'data-description="' + meaning.description + '" ' +
                                                            'class="meaning ' + meaning.type + '"' +
                                                            '></span>');

                                            //Split the current text node and append the new things
                                            var meaningLength = meaning.end - meaning.start
                                                ,leftNode = document.createTextNode(node.text().substr(0, y))
                                                ,rightNode = document.createTextNode(node.text().substr(y + meaningLength));

                                            meaningNode.text(node.text().substr(y, meaningLength));

                                            //Replace the current text node
                                            node.replaceWith([ leftNode, meaningNode, rightNode ]);

                                            //Adjust the next node and lyric text offset to continue the search
                                            node = angular.element(rightNode);
                                            y = meaning.end;

                                            //Move to the next meaning
                                            currentMeaning++;

                                            //Check to see if we're done
                                            if(currentMeaning >= meanings.length) break;

                                            //Otherwise carry on
                                            meaning = meanings[currentMeaning];
                                        }

                                        //Carry on...
                                        lyricOffset++;
                                    }
                                } else {
                                    //A Meaning
                                    lyricOffset += node.attr('data-end') - node.attr('data-start');

                                    //NEXT!
                                    node = node.next();
                                }
                            }

                            //Recompile angular directives
                            $compile(editorEl.contents())($scope);

                            // cleanMeaningMarkup(editorEl);
                        } else {
                            console.error('Could not find lyric editor element!');
                        }
                    }

                    //Fill element content when the model is updated
                    var oldRender = ngModel.$render;

                    ngModel.$render = function() {
                        if ( !!oldRender) {
                            oldRender();
                        }

                        getEditorEl().html(ngModel.$viewValue || '');
                    };

                    //Watch for meaning changes
                    $scope.$watchCollection('model.meanings', function(meanings) {
                        if(meanings && meanings.length) {
                            insertMeanings(meanings);
                        } else {
                            console.log('Not inserting null meanings');
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

                    function showCreateMeaningModal(controller) {
                        return $modal.open({
                            templateUrl: '/views/meaning/_meaning_create.html'
                            ,backdrop: false
                            ,controller: controller
                        });
                    }

                    function showEditMeaningModal(controller) {
                        return $modal.open({
                            templateUrl: '/views/meaning/_meaning_update.html'
                            ,backdrop: false
                            ,controller: controller
                        });
                    }

                    function findMeaning(newMeaning) {
                        if(newMeaning) {
                            if($scope.model && $scope.model.meanings) {
                                for(var x in $scope.model.meanings) {
                                    var meaning = $scope.model.meanings[x];

                                    if(newMeaning.start == meaning.start && newMeaning.end == meaning.end) {
                                        return x;
                                    }
                                }
                            }
                        }

                        return -1;
                    }

                    //Scope things
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
                                var text = removeAllMeanings(range.cloneContents()),
                                    start = null,
                                    end = null,
                                    startLine = 0,
                                    endLine = 0;

                                //Test to see if the range intersects any nodes that aren't text or line breaks
                                //If it does, that means we intersect another meaning, which is not allowed
                                var nodes = range.cloneContents();

                                var intersects = false
                                    ,lineLength = 0;

                                if(nodes) {
                                    for(var x = 0; x < nodes.childNodes.length; x++) {
                                        var node = nodes.childNodes[x];
                                        if(node) {
                                            var isLineBreak = node.nodeName.toLowerCase() == 'br',
                                                isTextNode = node instanceof Text;

                                            //Check for text node or line break
                                            if(!isTextNode && !isLineBreak) {
                                                intersects = true;
                                                break;
                                            } else if(!isLineBreak) {
                                                lineLength += node.text().length;
                                            }

                                            //If if is a line break, increment the endLine counter
                                            if(isLineBreak) {
                                                endLine++;
                                                lineLength = 0;
                                            }
                                        }
                                    }
                                }

                                //Finalize end offset

                                if(intersects) {
                                    $scope.alerts[0] = {
                                        type: 'danger'
                                        ,msg: 'Meanings cannot overlap!'
                                    };

                                    //Clear selections
                                    window.getSelection().removeAllRanges();

                                    return;
                                }

                                //Find all preceding nodes and offset the start/end by their combined lengths
                                var currentNode = range.startContainer
                                    ,offset = 0;

                                while(currentNode && currentNode.previousSibling)  {
                                    var sibling = currentNode.previousSibling,
                                        isText = sibling instanceof Text,
                                        isLineBreak = sibling.nodeName.toLowerCase() == 'br';
                                    
                                    if(isText) {
                                        offset += sibling.data.length;
                                    } else if (isLineBreak) {
                                        //Increment the start line counter
                                        startLine++;
                                    } else {
                                        offset += sibling.innerHTML.length;
                                    }

                                    currentNode = sibling;
                                }

                                start += offset;
                                end += offset;

                                //Add the startLine to the endLine, since the endLine is done before and does not include preceding nodes
                                endLine += startLine;

                                //Create a modal to create the meaning
                                var modal = showCreateMeaningModal(['$scope', '$modalInstance', function($modalScope, $modalInstance) {
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

                                        //Stash and render the Meaning
                                        var newMeaning = angular.copy($modalScope.model);
                                        if(!$scope.model.meanings) {
                                            $scope.model.meanings = [ newMeaning ];
                                        } else {
                                            $scope.model.meanings.push(newMeaning);
                                        }

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

                    $scope.meaningClick = function($event) {
                        var modal = showEditMeaningModal(['$scope', '$modalInstance', function($modalScope, $modalInstance) {
                            var eventEl = angular.element($event.currentTarget)
                                ,oldMeaning = {
                                    type: eventEl.attr('data-type')
                                    ,start: eventEl.attr('data-start')
                                    ,end: eventEl.attr('data-end')
                                    ,description: eventEl.attr('data-description')
                                };

                            //Stash existing data on the editing model
                            $modalScope.meaningText = eventEl.text();
                            $modalScope.model = {};
                            $modalScope.model.type = oldMeaning.type;
                            $modalScope.model.start = oldMeaning.start;
                            $modalScope.model.end = oldMeaning.end;
                            $modalScope.model.description = oldMeaning.description;

                            $modalScope.toolClick = function(type) {
                                $modalScope.model.type = type;
                            };

                            $modalScope.onSubmit = function() {
                                window.getSelection().removeAllRanges();

                                //Stash and render the Meaning
                                var newMeaning = angular.copy($modalScope.model);
                                if(!$scope.model.meanings) {
                                    $scope.model.meanings = [ newMeaning ];
                                } else {
                                    //Remove old meaning
                                    var index = findMeaning(oldMeaning);

                                    if(index !== -1) {
                                        $scope.model.meanings.splice(index, 1);

                                        //Insert new meaning
                                        $scope.model.meanings.push(newMeaning);
                                    } else {
                                        console.error('Could not remove old meaning when editing!');
                                    }
                                }

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

                            $modalScope.delete = function() {
                                //Remove old meaning
                                var index = findMeaning(oldMeaning);

                                if(index !== -1) {
                                    $scope.model.meanings.splice(index, 1);

                                    window.getSelection().removeAllRanges();

                                    try {
                                        //FIXME: ui-boostrap's modals are kind of broke, and this call always throws
                                        //       but seems benign
                                        $modalInstance.dismiss();
                                    } catch(e) {
                                        //Do nothing
                                    }
                                } else {
                                    console.error('Could not remove old meaning when deleting!');
                                }
                            };
                        }]);
                    };
                }
            };
        }
    );
});
