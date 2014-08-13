var assert = require('chai').assert,
    _ = require('lodash'),
    treeWrap = require('../lib/treeWrap.js'),
    TreeFlattener = require('../lib/treeFlattener.js'),
    TreeObserver = require('../lib/treeObserver.js');

describe('Tree Flattener', function() {

    var getFlattenedItems;

    beforeEach(function() {
        getFlattenedItems = function(json, options) {
            var treeObserver = new TreeObserver();
            var treeFlattener = new TreeFlattener(treeObserver, options || {});

            treeWrap.wrap(json, {
                observer: treeObserver
            });

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

        var treeObserver, treeFlattener;

        beforeEach(function() {
            treeObserver = new TreeObserver();
            treeFlattener = new TreeFlattener(treeObserver);
        });

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

            var treeWrapper = treeWrap.wrap(json, { observer: treeObserver });
            var flattenedItems = treeFlattener.getItems();

            treeWrapper.addChild(0, { name: 'new item' });

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

            var treeWrapper = treeWrap.wrap(json, { observer: treeObserver });
            var flattenedItems = treeFlattener.getItems();

            treeWrapper.addChild(1, { name: 'new item' });

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

            var treeWrapper = treeWrap.wrap(json, { observer: treeObserver });
            var flattenedItems = treeFlattener.getItems();

            treeWrapper.addChild(2, { name: 'new item' });

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

            var treeWrapper = treeWrap.wrap(json, { observer: treeObserver });
            var item2Wrapper = treeWrapper.getChild(1);
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

            var treeWrapper = treeWrap.wrap(json, { observer: treeObserver });
            var item2Wrapper = treeWrapper.getChild(1);
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

            var treeWrapper = treeWrap.wrap(json, { observer: treeObserver });
            var item2Wrapper = treeWrapper.getChild(1);
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

            var treeFlattener = new TreeFlattener(treeObserver, {
                includeRoot: false
            });
            var treeWrapper = treeWrap.wrap(json, { observer: treeObserver });
            var flattenedItems = treeFlattener.getItems();

            treeWrapper.addChild(0, { name: 'new item' });

            assert.deepEqual(toShallowCompareArr(flattenedItems), [
                { depth: 1, name: 'new item' },
                { depth: 1, name: 'item 1' },
                { depth: 1, name: 'item 2' },
                { depth: 2, name: 'item 2 - 1' }
            ]);
        });

        it('can assign IDs to items', function() {
            var json = {
                items: [{
                    name: 'item 1'
                },{
                    name: 'item 2'
                }]
            };

            var treeFlattener = new TreeFlattener(treeObserver);

            var lastId = 99;

            var treeWrapper = treeWrap.wrap(json, {
                observer: treeObserver,
                getItemId: function( /* item, parent */ ) {
                    return ++lastId;
                }
            });
            var flattenedItems = treeFlattener.getItems();

            treeWrapper.addChild(1, { name: 'new item 1' });
            treeWrapper.addChild(2, { name: 'new item 2' });

            var compareArr = toShallowCompareArr(flattenedItems, 'id');

            assert.deepEqual(compareArr, [
                { depth: 0, name: '<root>', id: 100 },
                { depth: 1, name: 'item 1', id: 101 },
                { depth: 1, name: 'new item 1', id: 103 },
                { depth: 1, name: 'new item 2', id: 104 },
                { depth: 1, name: 'item 2', id: 102 }
            ]);
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