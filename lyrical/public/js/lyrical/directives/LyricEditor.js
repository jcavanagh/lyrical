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
            return {
                replace: true,
                restrict: 'E',
                templateUrl: '/directives/_lyric_editor.html',
                link: function($scope, $element, attrs) {
                    function getEditorEl() {
                        return $element.find('.lyriceditor');
                    }

                    function sortMeanings(meanings) {
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
                                    startLine = parseInt(el.getAttribute('data-start-line'), 10),
                                    endLine = parseInt(el.getAttribute('data-end-line'), 10),
                                    line = el.getAttribute('data-description'),
                                    type = el.getAttribute('data-type');

                                meanings.push({
                                    start: start,
                                    end: end,
                                    startLine: startLine,
                                    endLine: endLine,
                                    description: description,
                                    type: type
                                });
                            }
                        } else {
                            console.error('Could not find lyric editor element!');
                        }

                        return meanings;
                    }

                    function cleanMeaningMarkup(html) {
                        if(html) {
                            //Strip non line break tags
                            return utils.string.stripTags(html, '<br>');
                        }

                        return '';
                    }

                    //Insert meanings into the editor markup
                    function insertMeaning(meaning) {
                        //Insert a meaning into the lyric view
                        var editorEl = getEditorEl();
                        if(editorEl) {
                            var html = editorEl.html(),
                                text = cleanMeaningMarkup(html)

                            //Snip out substrings and create highlight elements
                            var beforeStart = html.substr(0, meaning.start),
                                between = text.substr(meaning.start, meaning.end - meaning.start + 1),
                                afterEnd = html.substr(meaning.end),
                                tagStart = '<span ' +
                                            'ng-click="meaningClick($event)" ' +
                                            'data-start="' + meaning.start + '" ' +
                                            'data-end="' + meaning.end + '" ' +
                                            'data-start-line="' + meaning.startLine + '" ' +
                                            'data-end-line="' + meaning.endLine + '" ' +
                                            'data-type="' + meaning.type + '" ' +
                                            'data-description="' + meaning.description + '" ' +
                                            'class="meaning ' + meaning.type + '"' +
                                            '>',
                                tagEnd = '</span>';

                            //Re-append all the things
                            editorEl.contents().remove();
                            editorEl.html(beforeStart + tagStart + between + tagEnd + afterEnd);
                            $compile(editorEl.contents())($scope);

                            //FIXME: Angular inserts a bunch of garbage span tags around root-level text nodes
                            //       when compiling.  Need to strip those out or everything dies.
                            editorEl.find('span[class="ng-scope"]').each(function(idx, garbageEl) {
                                var el = angular.element(garbageEl);
                                el.replaceWith(el.text());
                            });
                        } else {
                            console.error('Could not find lyric editor element!');
                        }
                    }

                    function insertMeanings(meanings) {
                        //Strip existing meanings from editor
                        var editorEl = getEditorEl()
                        editorEl.html(cleanMeaningMarkup(editorEl.html()));

                        //Sort and insert
                        sortMeanings(meanings);

                        if(meanings) {
                            //Must be reverse inserted or all the text parsing is hosed
                            //Stupid contenteditables
                            for(var x = meanings.length - 1; x >= 0; x--) {
                                insertMeaning(meanings[x]);
                            }
                        }
                    }

                    //Watch for meaning changes
                    $scope.$watchCollection('model.meanings', function(meanings) {
                        if(meanings) {
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
                                    startLine = 0,
                                    endLine = 0;

                                //Test to see if the range intersects any nodes that aren't text or line breaks
                                //If it does, that means we intersect another meaning, which is not allowed
                                var nodes = range.cloneContents();

                                var intersects = false;
                                if(nodes) {
                                    for(var x = 0; x < nodes.childNodes.length; x++) {
                                        var node = nodes.childNodes[x];
                                        if(node) {
                                            var isLineBreak = node.nodeName.toLowerCase() == "br";

                                            //Check for text node or line break
                                            if(!(node instanceof Text) && !isLineBreak) {
                                                intersects = true;
                                                break;
                                            }

                                            //If if is a line break, increment the endLine counter
                                            if(isLineBreak) {
                                                endLine++;
                                            }
                                        }
                                    }
                                }

                                if(intersects) {
                                    $scope.alerts[0] = {
                                        type: 'danger'
                                        ,msg: 'Meanings cannot overlap!'
                                    };

                                    //Clear selections
                                    window.getSelection().removeAllRanges();

                                    return;
                                }

                                //Find all preceding text nodes and offset the start/end by their combined lengths
                                var currentNode = range.startContainer
                                    ,offset = 0;

                                while(currentNode && currentNode.previousSibling)  {
                                    var sibling = currentNode.previousSibling,
                                        isText = sibling instanceof Text
                                        isLineBreak = sibling.nodeName.toLowerCase() == "br";
                                    
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
                                    $modalScope.model.startLine = startLine;
                                    $modalScope.model.endLine = endLine;
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
                                    ,startLine: eventEl.attr('data-start-line')
                                    ,endLine: eventEl.attr('data-end-line')
                                    ,description: eventEl.attr('data-description')
                                };

                            //Stash existing data on the editing model
                            $modalScope.meaningText = eventEl.text();
                            $modalScope.model = {};
                            $modalScope.model.type = oldMeaning.type;
                            $modalScope.model.start = oldMeaning.start;
                            $modalScope.model.end = oldMeaning.end;
                            $modalScope.model.startLine = oldMeaning.startLine;
                            $modalScope.model.endLine = oldMeaning.endLine;
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
