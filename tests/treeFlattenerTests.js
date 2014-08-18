var assert = require('chai').assert,
    _ = require('lodash'),
    TreeWrapper = require('../lib/treeWrapper.js'),
    TreeFlattener = require('../lib/treeFlattener.js'),
    TreeObserver = require('../lib/treeObserver.js');

describe('Tree Flattener', function() {

    var getFlattenedItems;

    beforeEach(function() {
        getFlattenedItems = function(json, options) {
            var treeObserver = new TreeObserver();
            var treeWrapper = new TreeWrapper({
                observer: treeObserver
            });
            var treeFlattener = new TreeFlattener(treeWrapper, treeObserver, options || {});

            treeWrapper.wrap(json);

            return treeFlattener.getItems();
        };
    });

    describe('Static mapping', function() {

        it('flattens a nested json tree wrapper to array, including root', function() {
            var json = {
                items: [{
                    name: 'item 1'
                },{
                    name: 'item 2',
                    items: [{
                        name: 'item 2 - 1',
                        items: [{
                            name: 'item 2 - 1 - 1'
                        }]
                    }]
                }]
            };

            var flattenedItems = getFlattenedItems(json);

            assert.deepEqual(toShallowCompareArr(flattenedItems), [
                { depth: 0, name: '<root>', parent: null },
                { depth: 1, name: 'item 1', parent: '<root>' },
                { depth: 1, name: 'item 2', parent: '<root>' },
                { depth: 2, name: 'item 2 - 1', parent: 'item 2' },
                { depth: 3, name: 'item 2 - 1 - 1', parent: 'item 2 - 1' }
            ]);
        });

        it('flattens a nested json tree wrapper to array, excluding root', function() {
            var json = {
                items: [{
                    name: 'item 1'
                },{
                    name: 'item 2',
                    items: [{
                        name: 'item 2 - 1',
                        items: [{
                            name: 'item 2 - 1 - 1'
                        }]
                    }]
                }]
            };

            var flattenedItems = getFlattenedItems(json, {
                includeRoot: false
            });

            assert.deepEqual(toShallowCompareArr(flattenedItems), [
                { depth: 1, name: 'item 1', parent: '<root>' },
                { depth: 1, name: 'item 2', parent: '<root>' },
                { depth: 2, name: 'item 2 - 1', parent: 'item 2' },
                { depth: 3, name: 'item 2 - 1 - 1', parent: 'item 2 - 1' }
            ]);
        });
    });

    describe('Dynamic mapping', function() {

        var treeObserver, treeFlattener, treeWrapper;

        beforeEach(function() {
            treeObserver = new TreeObserver();
            treeWrapper = new TreeWrapper({
                observer: treeObserver
            });
            treeFlattener = new TreeFlattener(treeWrapper, treeObserver);
        });

        describe('Inserts', function() {

            it('inserts root item added at start index', function() {
                var json = {
                    items: [{
                        name: 'item 1'
                    },{
                        name: 'item 2',
                        items: [{
                            name: 'item 2 - 1'
                        }]
                    }]
                };

                var rootWrapper = treeWrapper.wrap(json);
                var flattenedItems = treeFlattener.getItems();

                rootWrapper.addChild(0, { name: 'new item' });

                assert.deepEqual(toShallowCompareArr(flattenedItems), [
                    { depth: 0, name: '<root>', parent: null },
                    { depth: 1, name: 'new item', parent: '<root>' },
                    { depth: 1, name: 'item 1', parent: '<root>' },
                    { depth: 1, name: 'item 2', parent: '<root>' },
                    { depth: 2, name: 'item 2 - 1', parent: 'item 2' }
                ]);
            });

            it('inserts root item added at mid index', function() {
                var json = {
                    items: [{
                        name: 'item 1'
                    },{
                        name: 'item 2',
                        items: [{
                            name: 'item 2 - 1',
                            items: [{
                                name: 'item 2 - 1 - 1'
                            }]
                        }]
                    }]
                };

                var rootWrapper = treeWrapper.wrap(json);
                var flattenedItems = treeFlattener.getItems();

                rootWrapper.addChild(1, { name: 'new item' });

                assert.deepEqual(toShallowCompareArr(flattenedItems), [
                    { depth: 0, name: '<root>', parent: null },
                    { depth: 1, name: 'item 1', parent: '<root>' },
                    { depth: 1, name: 'new item', parent: '<root>' },
                    { depth: 1, name: 'item 2', parent: '<root>' },
                    { depth: 2, name: 'item 2 - 1', parent: 'item 2' },
                    { depth: 3, name: 'item 2 - 1 - 1', parent: 'item 2 - 1' }
                ]);
            });

            it('inserts root item added at end index', function() {
                var json = {
                    items: [{
                        name: 'item 1'
                    },{
                        name: 'item 2',
                        items: [{
                            name: 'item 2 - 1',
                            items: [{
                                name: 'item 2 - 1 - 1'
                            }]
                        }]
                    }]
                };

                var rootWrapper = treeWrapper.wrap(json);
                var flattenedItems = treeFlattener.getItems();

                rootWrapper.addChild(2, { name: 'new item' });

                assert.deepEqual(toShallowCompareArr(flattenedItems), [
                    { depth: 0, name: '<root>', parent: null },
                    { depth: 1, name: 'item 1', parent: '<root>' },
                    { depth: 1, name: 'item 2', parent: '<root>' },
                    { depth: 2, name: 'item 2 - 1', parent: 'item 2' },
                    { depth: 3, name: 'item 2 - 1 - 1', parent: 'item 2 - 1' },
                    { depth: 1, name: 'new item', parent: '<root>' }
                ]);
            });

            it('inserts nested item added at start index', function() {
                var json = {
                    items: [{
                        name: 'item 1'
                    },{
                        name: 'item 2',
                        items: [{
                            name: 'item 2 - 1',
                            items: [{
                                name: 'item 2 - 1 - 1'
                            }]
                        }]
                    }]
                };

                var rootWrapper = treeWrapper.wrap(json);
                var item2Wrapper = rootWrapper.getChild(1);
                var flattenedItems = treeFlattener.getItems();

                item2Wrapper.addChild(0, { name: 'new item' });

                assert.deepEqual(toShallowCompareArr(flattenedItems), [
                    { depth: 0, name: '<root>', parent: null },
                    { depth: 1, name: 'item 1', parent: '<root>' },
                    { depth: 1, name: 'item 2', parent: '<root>' },
                    { depth: 2, name: 'new item', parent: 'item 2' },
                    { depth: 2, name: 'item 2 - 1', parent: 'item 2' },
                    { depth: 3, name: 'item 2 - 1 - 1', parent: 'item 2 - 1' }
                ]);
            });

            it('inserts nested item added at mid index', function() {
                var json = {
                    items: [{
                        name: 'item 1'
                    },{
                        name: 'item 2',
                        items: [{
                            name: 'item 2 - 1',
                            items: [{
                                name: 'item 2 - 1 - 1'
                            }]
                        }, {
                            name: 'item 2 - 2'
                        }]
                    }]
                };

                var rootWrapper = treeWrapper.wrap(json);
                var item2Wrapper = rootWrapper.getChild(1);
                var flattenedItems = treeFlattener.getItems();

                item2Wrapper.addChild(1, { name: 'new item' });

                assert.deepEqual(toShallowCompareArr(flattenedItems), [
                    { depth: 0, name: '<root>', parent: null },
                    { depth: 1, name: 'item 1', parent: '<root>' },
                    { depth: 1, name: 'item 2', parent: '<root>' },
                    { depth: 2, name: 'item 2 - 1', parent: 'item 2' },
                    { depth: 3, name: 'item 2 - 1 - 1', parent: 'item 2 - 1' },
                    { depth: 2, name: 'new item', parent: 'item 2' },
                    { depth: 2, name: 'item 2 - 2', parent: 'item 2' }
                ]);
            });

            it('inserts nested item added at end index', function() {
                var json = {
                    items: [{
                        name: 'item 1'
                    },{
                        name: 'item 2',
                        items: [{
                            name: 'item 2 - 1',
                            items: [{
                                name: 'item 2 - 1 - 1'
                            }]
                        },{
                            name: 'item 2 - 2'
                        }]
                    }]
                };

                var rootWrapper = treeWrapper.wrap(json);
                var item2Wrapper = rootWrapper.getChild(1);
                var flattenedItems = treeFlattener.getItems();

                item2Wrapper.addChild(2, { name: 'new item' });

                assert.deepEqual(toShallowCompareArr(flattenedItems), [
                    { depth: 0, name: '<root>', parent: null },
                    { depth: 1, name: 'item 1', parent: '<root>' },
                    { depth: 1, name: 'item 2', parent: '<root>' },
                    { depth: 2, name: 'item 2 - 1', parent: 'item 2' },
                    { depth: 3, name: 'item 2 - 1 - 1', parent: 'item 2 - 1' },
                    { depth: 2, name: 'item 2 - 2', parent: 'item 2' },
                    { depth: 2, name: 'new item', parent: 'item 2' }
                ]);
            });

            it('can skip root index', function() {
                var json = {
                    items: [{
                        name: 'item 1'
                    },{
                        name: 'item 2',
                        items: [{
                            name: 'item 2 - 1'
                        }]
                    }]
                };

                var treeFlattener = new TreeFlattener(treeWrapper, treeObserver, {
                    includeRoot: false
                });
                var rootWrapper = treeWrapper.wrap(json);
                var flattenedItems = treeFlattener.getItems();

                rootWrapper.addChild(0, { name: 'new item' });

                assert.deepEqual(toShallowCompareArr(flattenedItems), [
                    { depth: 1, name: 'new item', parent: '<root>' },
                    { depth: 1, name: 'item 1', parent: '<root>' },
                    { depth: 1, name: 'item 2', parent: '<root>' },
                    { depth: 2, name: 'item 2 - 1', parent: 'item 2' }
                ]);
            });

            it('can notify when new wrapper item created', function() {
                var json = {
                    items: [{
                        name: 'item 1'
                    }]
                };

                var lastId = 99;

                var treeFlattener = new TreeFlattener(treeWrapper, treeObserver, {
                    includeRoot: false,
                    onWrapperCreated: function(wrapper) {
                        wrapper.id = ++lastId;
                    }
                });

                var rootWrapper = treeWrapper.wrap(json);
                var flattenedItems = treeFlattener.getItems();

                rootWrapper.addChild(1, { name: 'new item' });

                assert.deepEqual(toShallowCompareArr(flattenedItems, 'id'), [
                    { depth: 1, name: 'item 1', parent: '<root>', id: 100 },
                    { depth: 1, name: 'new item', parent: '<root>', id: 101 }
                ]);
            });

            it('can use passthrough state obj to set additional props on flattened item', function() {
                var json = {
                    items: [{
                        name: 'item 1'
                    }]
                };

                var treeFlattener = new TreeFlattener(treeWrapper, treeObserver, {
                    includeRoot: false,
                    onWrapperCreated: function(wrapper, stateObj) {
                        if (stateObj) {
                            _.assign(wrapper, stateObj);
                        }
                    }
                });

                var rootWrapper = treeWrapper.wrap(json);
                var flattenedItems = treeFlattener.getItems();

                var optionalStateObj = { selected: true };
                rootWrapper.addChild(1, { name: 'new item' }, optionalStateObj);

                assert.deepEqual(toShallowCompareArr(flattenedItems, 'selected'), [
                    { depth: 1, name: 'item 1', parent: '<root>', selected: undefined },
                    { depth: 1, name: 'new item', parent: '<root>', selected: true }
                ]);
            });
        });

        describe('Removes', function() {

            it('removes flat item and children when item removed at start index', function() {
                var json = {
                    items: [{
                        name: 'item 1'
                    },{
                        name: 'item 2',
                        items: [{
                            name: 'item 2 - 1'
                        }]
                    }]
                };

                var rootWrapper = treeWrapper.wrap(json);
                var flattenedItems = treeFlattener.getItems();

                rootWrapper.removeChild(0);

                assert.deepEqual(toShallowCompareArr(flattenedItems), [
                    { depth: 0, name: '<root>', parent: null },
                    { depth: 1, name: 'item 2', parent: '<root>' },
                    { depth: 2, name: 'item 2 - 1', parent: 'item 2' }
                ]);
            });

            it('removes flat item and children when item removed at mid index', function() {
                var json = {
                    items: [{
                        name: 'item 1'
                    },{
                        name: 'item 2',
                        items: [{
                            name: 'item 2 - 1'
                        }]
                    },{
                        name: 'item 3'
                    }]
                };

                var rootWrapper = treeWrapper.wrap(json);
                var flattenedItems = treeFlattener.getItems();

                rootWrapper.removeChild(1);

                assert.deepEqual(toShallowCompareArr(flattenedItems), [
                    { depth: 0, name: '<root>', parent: null },
                    { depth: 1, name: 'item 1', parent: '<root>' },
                    { depth: 1, name: 'item 3', parent: '<root>' }
                ]);
            });

            it('removes flat item and children when item removed at end index', function() {
                var json = {
                    items: [{
                        name: 'item 1'
                    },{
                        name: 'item 2'
                    },{
                        name: 'item 3',
                        items: [{
                            name: 'item 3 - 1'
                        }]
                    }]
                };

                var rootWrapper = treeWrapper.wrap(json);
                var flattenedItems = treeFlattener.getItems();

                rootWrapper.removeChild(2);

                assert.deepEqual(toShallowCompareArr(flattenedItems), [
                    { depth: 0, name: '<root>', parent: null },
                    { depth: 1, name: 'item 1', parent: '<root>' },
                    { depth: 1, name: 'item 2', parent: '<root>' }
                ]);
            });

            it('removes flat item and children when nested item removed', function() {
                var json = {
                    items: [{
                        name: 'item 1'
                    },{
                        name: 'item 2',
                        items: [{
                            name: 'item 2 - 1'
                        }]
                    },{
                        name: 'item 3'
                    }]
                };

                var rootWrapper = treeWrapper.wrap(json);
                var item2Wrapper = rootWrapper.getChild(1);
                var flattenedItems = treeFlattener.getItems();

                item2Wrapper.removeChild(0);

                assert.deepEqual(toShallowCompareArr(flattenedItems), [
                    { depth: 0, name: '<root>', parent: null },
                    { depth: 1, name: 'item 1', parent: '<root>' },
                    { depth: 1, name: 'item 2', parent: '<root>' },
                    { depth: 1, name: 'item 3', parent: '<root>' }
                ]);
            });

            it('removes flat item and children when item removed at start index, when skipping root', function() {
                var json = {
                    items: [{
                        name: 'item 1',
                        items: [{
                            name: 'item 1 - 1'
                        }]
                    },{
                        name: 'item 2'
                    }]
                };

                var treeFlattener = new TreeFlattener(treeWrapper, treeObserver, {
                    includeRoot: false
                });

                var rootWrapper = treeWrapper.wrap(json);
                var flattenedItems = treeFlattener.getItems();

                rootWrapper.removeChild(0);

                assert.deepEqual(toShallowCompareArr(flattenedItems), [
                    { depth: 1, name: 'item 2', parent: '<root>' }
                ]);
            });
        });

        describe('Moves', function() {

            it('moves flat items and children when item moved from lower index to higher within same parent', function() {
                var json = {
                    items: [{
                        name: 'item 1',
                        items: [{
                            name: 'item 1 - 1',
                            items: [{
                                name: 'item 1 - 1 - 1'
                            }]
                        }, {
                            name: 'item 1 - 2'
                        }]
                    },{
                        name: 'item 2'
                    },{
                        name: 'item 3',
                        items: [{
                            name: 'item 3 - 1'
                        }]
                    }]
                };

                var rootWrapper = treeWrapper.wrap(json);
                var flattenedItems = treeFlattener.getItems();

                assert.deepEqual(toShallowCompareArr(flattenedItems), [
                    { depth: 0, name: '<root>', parent: null },
                    { depth: 1, name: 'item 1', parent: '<root>' },
                    { depth: 2, name: 'item 1 - 1', parent: 'item 1' },
                    { depth: 3, name: 'item 1 - 1 - 1', parent: 'item 1 - 1' },
                    { depth: 2, name: 'item 1 - 2', parent: 'item 1' },
                    { depth: 1, name: 'item 2', parent: '<root>' },
                    { depth: 1, name: 'item 3', parent: '<root>' },
                    { depth: 2, name: 'item 3 - 1', parent: 'item 3' }
                ]);

                rootWrapper.moveChild(0, 2);

                assert.deepEqual(toShallowCompareArr(flattenedItems), [
                    { depth: 0, name: '<root>', parent: null },
                    { depth: 1, name: 'item 2', parent: '<root>' },
                    { depth: 1, name: 'item 3', parent: '<root>' },
                    { depth: 2, name: 'item 3 - 1', parent: 'item 3' },
                    { depth: 1, name: 'item 1', parent: '<root>' },
                    { depth: 2, name: 'item 1 - 1', parent: 'item 1' },
                    { depth: 3, name: 'item 1 - 1 - 1', parent: 'item 1 - 1' },
                    { depth: 2, name: 'item 1 - 2', parent: 'item 1' }
                ]);
            });

            it('moves flat items and children when item moved from higher index to lower within same parent', function() {
                var json = {
                    items: [{
                        name: 'item 1'
                    },{
                        name: 'item 2',
                        items: [{
                            name: 'item 2 - 1'
                        }]
                    },{
                        name: 'item 3',
                        items: [{
                            name: 'item 3 - 1',
                            items: [{
                                name: 'item 3 - 1 - 1'
                            }]
                        }, {
                            name: 'item 3 - 2'
                        }]
                    }]
                };

                var rootWrapper = treeWrapper.wrap(json);
                var flattenedItems = treeFlattener.getItems();

                assert.deepEqual(toShallowCompareArr(flattenedItems), [
                    { depth: 0, name: '<root>', parent: null },
                    { depth: 1, name: 'item 1', parent: '<root>' },
                    { depth: 1, name: 'item 2', parent: '<root>' },
                    { depth: 2, name: 'item 2 - 1', parent: 'item 2' },
                    { depth: 1, name: 'item 3', parent: '<root>' },
                    { depth: 2, name: 'item 3 - 1', parent: 'item 3' },
                    { depth: 3, name: 'item 3 - 1 - 1', parent: 'item 3 - 1' },
                    { depth: 2, name: 'item 3 - 2', parent: 'item 3' }
                ]);

                rootWrapper.moveChild(2, 0);

                assert.deepEqual(toShallowCompareArr(flattenedItems), [
                    { depth: 0, name: '<root>', parent: null },
                    { depth: 1, name: 'item 3', parent: '<root>' },
                    { depth: 2, name: 'item 3 - 1', parent: 'item 3' },
                    { depth: 3, name: 'item 3 - 1 - 1', parent: 'item 3 - 1' },
                    { depth: 2, name: 'item 3 - 2', parent: 'item 3' },
                    { depth: 1, name: 'item 1', parent: '<root>' },
                    { depth: 1, name: 'item 2', parent: '<root>' },
                    { depth: 2, name: 'item 2 - 1', parent: 'item 2' }
                ]);
            });

            it('moves flat items and children when item moved from lower parent to higher parent', function() {
                var json = {
                    items: [{
                        name: 'item 1',
                        items: [{
                            name: 'item 1 - 1'
                        }]
                    },{
                        name: 'item 2'
                    },{
                        name: 'item 3',
                        items: [{
                            name: 'item 3 - 1'
                        }]
                    }]
                };

                var rootWrapper = treeWrapper.wrap(json);
                var flattenedItems = treeFlattener.getItems();

                assert.deepEqual(toShallowCompareArr(flattenedItems), [
                    { depth: 0, name: '<root>', parent: null },
                    { depth: 1, name: 'item 1', parent: '<root>' },
                    { depth: 2, name: 'item 1 - 1', parent: 'item 1' },
                    { depth: 1, name: 'item 2', parent: '<root>' },
                    { depth: 1, name: 'item 3', parent: '<root>' },
                    { depth: 2, name: 'item 3 - 1', parent: 'item 3' }
                ]);

                var item3Wrapper = rootWrapper.getChild(2);
                rootWrapper.moveChild(0, item3Wrapper, 0);

                assert.deepEqual(toShallowCompareArr(flattenedItems), [
                    { depth: 0, name: '<root>', parent: null },
                    { depth: 1, name: 'item 2', parent: '<root>' },
                    { depth: 1, name: 'item 3', parent: '<root>' },
                    { depth: 2, name: 'item 1', parent: 'item 3' },
                    { depth: 3, name: 'item 1 - 1', parent: 'item 1' },
                    { depth: 2, name: 'item 3 - 1', parent: 'item 3' }
                ]);
            });

            it('moves flat items and children when item moved from higer parent to lower parent', function() {
                var json = {
                    items: [{
                        name: 'item 1'
                    },{
                        name: 'item 2'
                    },{
                        name: 'item 3',
                        items: [{
                            name: 'item 3 - 1',
                            items: [{
                                name: 'item 3 - 1 - 1'
                            }]
                        }]
                    }]
                };

                var rootWrapper = treeWrapper.wrap(json);
                var flattenedItems = treeFlattener.getItems();

                assert.deepEqual(toShallowCompareArr(flattenedItems), [
                    { depth: 0, name: '<root>', parent: null },
                    { depth: 1, name: 'item 1', parent: '<root>' },
                    { depth: 1, name: 'item 2', parent: '<root>' },
                    { depth: 1, name: 'item 3', parent: '<root>' },
                    { depth: 2, name: 'item 3 - 1', parent: 'item 3' },
                    { depth: 3, name: 'item 3 - 1 - 1', parent: 'item 3 - 1' }
                ]);

                var item3Wrapper = rootWrapper.getChild(2);
                item3Wrapper.moveChild(0, rootWrapper, 1);

                assert.deepEqual(toShallowCompareArr(flattenedItems), [
                    { depth: 0, name: '<root>', parent: null },
                    { depth: 1, name: 'item 1', parent: '<root>' },
                    { depth: 1, name: 'item 3 - 1', parent: '<root>' },
                    { depth: 2, name: 'item 3 - 1 - 1', parent: 'item 3 - 1' },
                    { depth: 1, name: 'item 2', parent: '<root>' },
                    { depth: 1, name: 'item 3', parent: '<root>' }
                ]);
            });
        });
    });

    describe('Integration with TreeWrapper', function() {
        var treeObserver, treeWrapper, treeFlattener;

        beforeEach(function() {
            treeObserver = new TreeObserver();
            treeWrapper = new TreeWrapper({
                observer: treeObserver
            });
            treeFlattener = new TreeFlattener(treeWrapper, treeObserver);
        });

        describe('Getting item wrappers', function() {

            it('can use item ID to get wrapper for root item', function() {
                var json = {
                    items: [{
                        name: 'item 1'
                    },{
                        name: 'item 2'
                    }]
                };

                treeWrapper.wrap(json);
                var flattenedItems = treeFlattener.getItems();

                // Verify what flat items are like now:
                assert.deepEqual(toShallowCompareArr(flattenedItems), [
                    { depth: 0, name: '<root>', parent: null },
                    { depth: 1, name: 'item 1', parent: '<root>' },
                    { depth: 1, name: 'item 2', parent: '<root>' }
                ]);

                var rootItemFlatWrapper = flattenedItems[0];

                // Get a wrapper for root item and use it to add new child:
                var recreatedRootWrapper = treeWrapper.getWrapper(rootItemFlatWrapper.item, rootItemFlatWrapper.parent);
                recreatedRootWrapper.addChild(1, { name: 'new item 1' });

                assert.deepEqual(toShallowCompareArr(flattenedItems), [
                    { depth: 0, name: '<root>', parent: null },
                    { depth: 1, name: 'item 1', parent: '<root>' },
                    { depth: 1, name: 'new item 1', parent: '<root>' },
                    { depth: 1, name: 'item 2', parent: '<root>' }
                ]);
            });

            it('can use item ID to get wrapper for nested item', function() {
                var json = {
                    items: [{
                        name: 'item 1'
                    },{
                        name: 'item 2',
                        items: [{
                            name: 'item 2 - 1'
                        }]
                    },{
                        name: 'item 3'
                    }]
                };

                treeWrapper.wrap(json);
                var flattenedItems = treeFlattener.getItems();

                // Verify what flat items are like now:
                assert.deepEqual(toShallowCompareArr(flattenedItems), [
                    { depth: 0, name: '<root>', parent: null },
                    { depth: 1, name: 'item 1', parent: '<root>' },
                    { depth: 1, name: 'item 2', parent: '<root>' },
                    { depth: 2, name: 'item 2 - 1', parent: 'item 2' },
                    { depth: 1, name: 'item 3', parent: '<root>' }
                ]);

                var item2FlatWrapper = flattenedItems[2];

                // Get a wrapper for root item and use it to add new child:
                var recreatedItem2Wrapper = treeWrapper.getWrapper(item2FlatWrapper.item, item2FlatWrapper.parent);
                recreatedItem2Wrapper.addChild(0, { name: 'new item 1' });

                // Verify what flat items are like now:
                assert.deepEqual(toShallowCompareArr(flattenedItems), [
                    { depth: 0, name: '<root>', parent: null },
                    { depth: 1, name: 'item 1', parent: '<root>' },
                    { depth: 1, name: 'item 2', parent: '<root>' },
                    { depth: 2, name: 'new item 1', parent: 'item 2' },
                    { depth: 2, name: 'item 2 - 1', parent: 'item 2' },
                    { depth: 1, name: 'item 3', parent: '<root>' }
                ]);
            });
        });
    });
});

function toShallowCompareArr(flattenedItems, additionalProp) {
    return _.map(flattenedItems, function(itemWrap) {
        var comparable = {
            name: itemWrap.item.name || '<root>',
            depth: itemWrap.depth,
            parent: itemWrap.parent ? (itemWrap.parent.name ? itemWrap.parent.name : '<root>') : null
        };
        if (additionalProp) {
            comparable[additionalProp] = itemWrap[additionalProp];
        }
        return comparable;
    });
}