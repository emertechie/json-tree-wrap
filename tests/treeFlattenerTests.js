var assert = require('chai').assert,
    _ = require('lodash'),
    TreeWrapper = require('../lib/treeWrap.js'),
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
                { depth: 0, name: '<root>' },
                { depth: 1, name: 'item 1' },
                { depth: 1, name: 'item 2' },
                { depth: 2, name: 'item 2 - 1' },
                { depth: 3, name: 'item 2 - 1 - 1' }
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
                { depth: 1, name: 'item 1' },
                { depth: 1, name: 'item 2' },
                { depth: 2, name: 'item 2 - 1' },
                { depth: 3, name: 'item 2 - 1 - 1' }
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
                    { depth: 0, name: '<root>' },
                    { depth: 1, name: 'new item' },
                    { depth: 1, name: 'item 1' },
                    { depth: 1, name: 'item 2' },
                    { depth: 2, name: 'item 2 - 1' }
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
                    { depth: 0, name: '<root>' },
                    { depth: 1, name: 'item 1' },
                    { depth: 1, name: 'new item' },
                    { depth: 1, name: 'item 2' },
                    { depth: 2, name: 'item 2 - 1' },
                    { depth: 3, name: 'item 2 - 1 - 1' }
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
                    { depth: 0, name: '<root>' },
                    { depth: 1, name: 'item 1' },
                    { depth: 1, name: 'item 2' },
                    { depth: 2, name: 'item 2 - 1' },
                    { depth: 3, name: 'item 2 - 1 - 1' },
                    { depth: 1, name: 'new item' }
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
                    { depth: 0, name: '<root>' },
                    { depth: 1, name: 'item 1' },
                    { depth: 1, name: 'item 2' },
                    { depth: 2, name: 'new item' },
                    { depth: 2, name: 'item 2 - 1' },
                    { depth: 3, name: 'item 2 - 1 - 1' }
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
                    { depth: 0, name: '<root>' },
                    { depth: 1, name: 'item 1' },
                    { depth: 1, name: 'item 2' },
                    { depth: 2, name: 'item 2 - 1' },
                    { depth: 3, name: 'item 2 - 1 - 1' },
                    { depth: 2, name: 'new item' },
                    { depth: 2, name: 'item 2 - 2' }
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
                    { depth: 0, name: '<root>' },
                    { depth: 1, name: 'item 1' },
                    { depth: 1, name: 'item 2' },
                    { depth: 2, name: 'item 2 - 1' },
                    { depth: 3, name: 'item 2 - 1 - 1' },
                    { depth: 2, name: 'item 2 - 2' },
                    { depth: 2, name: 'new item' }
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
                    { depth: 1, name: 'new item' },
                    { depth: 1, name: 'item 1' },
                    { depth: 1, name: 'item 2' },
                    { depth: 2, name: 'item 2 - 1' }
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
                    { depth: 0, name: '<root>' },
                    { depth: 1, name: 'item 2' },
                    { depth: 2, name: 'item 2 - 1' }
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
                    { depth: 0, name: '<root>' },
                    { depth: 1, name: 'item 1' },
                    { depth: 1, name: 'item 3' }
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
                    { depth: 0, name: '<root>' },
                    { depth: 1, name: 'item 1' },
                    { depth: 1, name: 'item 2' }
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
                    { depth: 0, name: '<root>' },
                    { depth: 1, name: 'item 1' },
                    { depth: 1, name: 'item 2' },
                    { depth: 1, name: 'item 3' }
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
                    { depth: 1, name: 'item 2' }
                ]);
            });
        });
    });

    describe('Integration with TreeWrapper', function() {
        var treeObserver, treeWrapper, treeFlattener;
        var getItemId;

        beforeEach(function() {
            treeObserver = new TreeObserver();

            var lastId = 99;
            getItemId = function() {
                return ++lastId;
            };

            treeWrapper = new TreeWrapper({
                observer: treeObserver,
                getItemId: getItemId
            });
            treeFlattener = new TreeFlattener(treeWrapper, treeObserver);
        });

        it('can copy item IDs to item wrappers', function() {
            var json = {
                items: [{
                    name: 'item 1'
                },{
                    name: 'item 2'
                }]
            };

            var rootWrapper = treeWrapper.wrap(json);
            var flattenedItems = treeFlattener.getItems();

            rootWrapper.addChild(1, { name: 'new item 1' });
            rootWrapper.addChild(2, { name: 'new item 2' });

            var compareArr = toShallowCompareArr(flattenedItems, 'id');

            assert.deepEqual(compareArr, [
                { depth: 0, name: '<root>', id: 100 },
                { depth: 1, name: 'item 1', id: 101 },
                { depth: 1, name: 'new item 1', id: 103 },
                { depth: 1, name: 'new item 2', id: 104 },
                { depth: 1, name: 'item 2', id: 102 }
            ]);
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
                assert.deepEqual(toShallowCompareArr(flattenedItems, 'id'), [
                    { depth: 0, name: '<root>', id: 100 },
                    { depth: 1, name: 'item 1', id: 101 },
                    { depth: 1, name: 'item 2', id: 102 }
                ]);

                var rootItemFlatWrapper = flattenedItems[0];

                // Get a wrapper for root item and use it to add new child:
                var recreatedRootWrapper = treeWrapper.getWrapper(rootItemFlatWrapper.item, rootItemFlatWrapper.id);
                recreatedRootWrapper.addChild(1, { name: 'new item 1' });

                assert.deepEqual(toShallowCompareArr(flattenedItems, 'id'), [
                    { depth: 0, name: '<root>', id: 100 },
                    { depth: 1, name: 'item 1', id: 101 },
                    { depth: 1, name: 'new item 1', id: 103 },
                    { depth: 1, name: 'item 2', id: 102 }
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
                assert.deepEqual(toShallowCompareArr(flattenedItems, 'id'), [
                    { depth: 0, name: '<root>', id: 100 },
                    { depth: 1, name: 'item 1', id: 101 },
                    { depth: 1, name: 'item 2', id: 102 },
                    { depth: 2, name: 'item 2 - 1', id: 103 },
                    { depth: 1, name: 'item 3', id: 104 }
                ]);

                var item2FlatWrapper = flattenedItems[2];

                // Get a wrapper for root item and use it to add new child:
                var recreatedItem2Wrapper = treeWrapper.getWrapper(item2FlatWrapper.item, item2FlatWrapper.id);
                recreatedItem2Wrapper.addChild(0, { name: 'new item 1' });

                // Verify what flat items are like now:
                assert.deepEqual(toShallowCompareArr(flattenedItems, 'id'), [
                    { depth: 0, name: '<root>', id: 100 },
                    { depth: 1, name: 'item 1', id: 101 },
                    { depth: 1, name: 'item 2', id: 102 },
                    { depth: 2, name: 'new item 1', id: 105 },
                    { depth: 2, name: 'item 2 - 1', id: 103 },
                    { depth: 1, name: 'item 3', id: 104 }
                ]);
            });
        });
    });
});

function toShallowCompareArr(flattenedItems, additionalProp) {
    return _.map(flattenedItems, function(itemWrap) {
        var compareObj = {
            name: itemWrap.item.name || '<root>',
            depth: itemWrap.depth
        };
        if (additionalProp) {
            compareObj[additionalProp] = itemWrap[additionalProp];
        }
        return compareObj;
    });
}