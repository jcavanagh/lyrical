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
                        var el = angular.element(meaning);
                        el.replaceWith(el.text());
                    });

                    //Merge all text nodes in the original element
                    var node = elementOrString[0].childNodes[0],
                        text = '';

                    do {
                        text += angular.element(node).text();
                        node = node.nextSibling;
                    } while (node);

                    angular.element(elementOrString).text(text);

                    return elementOrString;
                }
            }

            /**
             * Removes angular ng-scope garbage from a DOM node tree
             */
            function cleanMeaningMarkup(element) {
                if(!element) return;

                //FIXME: Angular inserts a bunch of garbage span tags around text nodes
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

            function isEditorEl(element) {
                return element && element.hasClass && element.hasClass('lyriceditor');
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
                        //Returns the next sibling for an jQuery node, respecting text nodes as real things
                        function getNextSibling(node) {
                            var sibling = node[0].nextSibling;

                            return sibling ? angular.element(sibling) : null;
                        }

                        //Sort!
                        sortMeanings(meanings);

                        //Insert meanings into the lyric view
                        var editorEl = getEditorEl();
                        if(editorEl) {
                            //Nuke existing entries
                            removeAllMeanings(editorEl);

                            var node = angular.element(editorEl.contents()[0])
                                ,lyricOffset = 0
                                ,currentMeaning = 0
                                ,meaning = meanings[currentMeaning];

                            debugger;
                            while(node && currentMeaning < meanings.length) {
                                //If it's a text node
                                if(node.context.nodeType === 3) {
                                    if(node.text().length) {
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
                                                lyricOffset += meaningLength;

                                                //Move to the next meaning
                                                currentMeaning++;

                                                if(currentMeaning < meanings.length) {
                                                    meaning = meanings[currentMeaning];
                                                }

                                                //We've changed the node - break out and begin from the top
                                                break;
                                            } else if(y === node.text().length - 1) {
                                                //If this is the last character, and we don't have a lyric start, then go to the next node
                                                debugger;
                                                node = getNextSibling(node);
                                            }

                                            //Carry on...
                                            lyricOffset++;
                                        }
                                    } else {
                                        //Blank text node, skip it
                                        debugger;
                                        node = getNextSibling(node);
                                    }
                                } else {
                                    //A Meaning
                                    lyricOffset += node.attr('data-end') - node.attr('data-start');

                                    //NEXT!
                                    node = getNextSibling(node);
                                }
                            }

                            //Recompile angular directives
                            $compile(editorEl.contents())($scope);
                            cleanMeaningMarkup(editorEl);
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
                    //Helpers
                    function resetDrag() {
                        window.getSelection().removeAllRanges();
                    }

                    function showMeaningModal(controller) {
                        return $modal.open({
                            templateUrl: '/views/meaning/_meaning_modal.html'
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

                        //TODO: Make sure the selection starts and ends in the editor
                        var isEditorSelection = true;

                        //Make sure there's a selection and that it starts and ends in the editor
                        if(!range.collapsed && isEditorSelection) {
                            //Extract selected text
                            var start = 0,
                                end = 0;

                            //Find all preceding nodes and offset the start/end by their combined lengths
                            //Don't wrap it, since jQuery is really bad at text nodes
                            var currentNode = range.startContainer
                                ,offset = 0;

                            while(currentNode)  {
                                var sibling = currentNode.previousSibling;
                                
                                //Increment the offset
                                offset += angular.element(sibling).text().length;

                                //Climb up the chain
                                currentNode = sibling;
                            }

                            start += offset + range.startOffset;
                            end += start + range.toString().length;

                            //Test for intersection with other meanings
                            // if(intersectsMeaning(start, end)) {
                            //     $scope.alerts[0] = {
                            //         type: 'danger'
                            //         ,msg: 'Meanings cannot overlap!'
                            //     };

                            //     //Clear selections
                            //     window.getSelection().removeAllRanges();

                            //     return;
                            // }

                            //Create a modal to create the meaning
                            var modal = showMeaningModal(['$scope', '$modalInstance', function($modalScope, $modalInstance) {
                                //This is for display reference only - not saved with the meaning
                                $modalScope.meaningText = range.toString().replace(/^[\r\n]+|\.|[\r\n]+$/g, "").trim();

                                //Set all the things we already know on the modal's model
                                $modalScope.model = $modalScope.model || {};
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

                                $modalScope.typeClicked = function(element) {
                                    $modalScope.model.type = element.target.value;
                                }
                            }]);
                        }
                    }

                    //Event handlers
                    $scope.$on('paste', function() {
                        console.log('paste!', arguments);
                    });

                    //Mouse tracking
                    $scope.editorDrag = false;
                    $scope.editorMouseup = function() {
                        if($scope.editorDrag) {
                            onTextSelected();
                            $scope.editorDrag = false;
                        }
                    };

                    $scope.editorMousedown = function() {
                        $scope.editorDrag = true;
                    }

                    $scope.meaningClick = function($event) {
                        var modal = showMeaningModal(['$scope', '$modalInstance', function($modalScope, $modalInstance) {
                            var eventEl = angular.element($event.currentTarget)
                                ,oldMeaning = {
                                    type: eventEl.attr('data-type')
                                    ,start: eventEl.attr('data-start')
                                    ,end: eventEl.attr('data-end')
                                    ,description: eventEl.attr('data-description')
                                };

                            //Flag as editing
                            $modalScope.editingMeaning = true;

                            //Stash existing data on the editing model
                            $modalScope.meaningText = eventEl.text().trim();
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

                            $modalScope.typeClicked = function(element) {
                                $modalScope.model.type = element.target.value;
                            }
                        }]);
                    };
                }
            };
        }
    );
});
