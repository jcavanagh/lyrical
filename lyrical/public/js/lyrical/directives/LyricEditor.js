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

                            while(node && currentMeaning < meanings.length) {
                                //If it's a text node
                                if(node.context.nodeType === 3) {
                                    if(node.text().length) {
                                        //We might find our start/end point here
                                        for(var y = 0; y < node.text().length; y++) {
                                            //Found the start!
                                            if(lyricOffset == meaning.start) {
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
                                                node = getNextSibling(node);
                                            }

                                            //Carry on...
                                            lyricOffset++;
                                        }
                                    } else {
                                        //Blank text node, skip it
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
                            removeAllMeanings(getEditorEl());
                        }
                    });
                },
                controller: function($scope, $modal, $element, LoadingStatus) {
                    //Helpers
                    function resetDrag() {
                        window.getSelection().removeAllRanges();
                    }

                    function saveMeanings() {
                        LoadingStatus.setSaving(true);

                        $scope.model.$update().then(function() {
                            LoadingStatus.setSaving(false);
                        });
                    }

                    /**
                     * Shows a meaning modal for editing or creations
                     *
                     * @param {Object} meaningData May contain the following properties:
                     * - start {Number} Meaning start (required)
                     * - end {Number} Meaning end (required)
                     * - type {String} Meaning type
                     * - description {String} Meaning description
                     * - text {String} Text of the meaning
                     * - editing {Boolean} Editing or not
                     */
                    function showMeaningModal(meaningData) {
                        if(!meaningData) {
                            console.error('Cannot launch modal - blank meaningData!');
                            return;
                        }

                        return $modal.open({
                            templateUrl: '/views/meaning/_meaning_modal.html'
                            ,backdrop: false
                            ,controller: ['$scope', '$modalInstance', function($modalScope, $modalInstance) {
                                //Set ALL THE DATAS
                                $modalScope.model = {};
                                $modalScope.model.start = meaningData.start;
                                $modalScope.model.end = meaningData.end;

                                //This is for display reference only - not saved with the meaning
                                $modalScope.meaningText = meaningData.text;

                                //Flag as editing if we need to
                                if(meaningData.editing) {
                                    $modalScope.editingMeaning = true;

                                    //Stash existing data on the editing model
                                    $modalScope.model.type = meaningData.type;
                                    $modalScope.model.description = meaningData.description || '';
                                }

                                $modalScope.onSubmit = function() {
                                    window.getSelection().removeAllRanges();

                                    //Stash and render the Meaning
                                    var newMeaning = angular.copy($modalScope.model);
                                    if(!$scope.model.meanings) {
                                        $scope.model.meanings = [ newMeaning ];
                                    } else {
                                        $scope.model.meanings.push(newMeaning);
                                    }

                                    //Save the new meanings to the backend
                                    saveMeanings();

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
                                    //Find and remove this meaning
                                    $scope.model.meanings = $scope.model.meanings.filter(function(item) {
                                        return !(item.start == $modalScope.model.start && item.end == $modalScope.model.end);
                                    });

                                    //Save new meaning collection
                                    saveMeanings();

                                    $modalScope.onCancel();
                                };

                                $modalScope.typeClicked = function(element) {
                                    $modalScope.model.type = element.target.value;
                                };
                            }]
                        });
                    }

                    function intersectsMeaning(start, end) {
                        var intersects = false;
                        angular.forEach($scope.model.meanings, function(meaning) {
                            //Start intersects
                            if(meaning.start <= start && meaning.end > start) {
                                console.debug('Meaning start intersects:', start, end, meaning);
                                intersects = true;
                            }

                            //End intersects
                            if(meaning.start < end && meaning.end >= end) {
                                console.debug('Meaning end intersects:', start, end, meaning);
                                intersects = true;
                            }

                            //Meaning fully contained
                            if(meaning.start >= start && meaning.end <= end) {
                                console.debug('Meaning contained:', start, end, meaning);
                                intersects = true;
                            }
                        });

                        return intersects;
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
                            var start = range.startOffset,
                                end = 0;

                            //Find all preceding nodes and offset the start/end by their combined lengths
                            //Don't wrap it, since jQuery is really bad at text nodes
                            var currentNode = range.startContainer
                                ,offset = 0;

                            //If we started our click in a meaning element, we need to manually account for that
                            //since it's down a level in the DOM tree and siblings become wrong
                            var tmpEl = angular.element(currentNode);
                            if(tmpEl.parent().hasClass('meaning')) {
                                currentNode = tmpEl.parent()[0];
                            }

                            while(currentNode)  {
                                var sibling = currentNode.previousSibling;
                                
                                //Increment the offset
                                offset += angular.element(sibling).text().length;

                                //Climb up the chain
                                currentNode = sibling;
                            }

                            start += offset;
                            end += start + range.toString().length;

                            //Test for intersection with other meanings
                            if(intersectsMeaning(start, end)) {
                                $scope.alerts[0] = {
                                    type: 'danger'
                                    ,msg: 'Meanings cannot overlap!'
                                };

                                //Clear selections
                                window.getSelection().removeAllRanges();

                                return;
                            }

                            //Create a modal to create the meaning
                            showMeaningModal({
                                editing: false
                                ,start: start
                                ,end: end
                                ,text: range.toString().trim()
                            });
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
                    };

                    $scope.meaningClick = function($event) {
                        var eventEl = angular.element($event.currentTarget);

                        showMeaningModal({
                            editing: true
                            ,start: eventEl.attr('data-start')
                            ,end: eventEl.attr('data-end')
                            ,text: eventEl.text().trim()
                            ,type: eventEl.attr('data-type')
                            ,description: eventEl.attr('data-description')
                        });
                    };
                }
            };
        }
    );
});
