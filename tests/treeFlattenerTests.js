var assert = require('chai').assert,
    treeWrap = require('../lib/index.js'),
    treeFlattener = require('../lib/treeFlattener.js');

describe('Tree Flattener', function() {

    describe('Static mapping', function() {

        it('flattens a nested json tree wrapper to array', function() {
            var root = {
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

            var item1 = root.items[0];
            var item2 = root.items[1];
            var item2_1 = item2.items[0];
            var item2_1_1 = item2_1.items[0];

            var treeWrapper = treeWrap.wrap(root);
            var items = treeFlattener.flatten(treeWrapper);

            assert.deepEqual(clone(items), clone([{
                depth: 0,
                item: root
            }, {
                depth: 1,
                item: item1
            }, {
                depth: 1,
                item: item2
            }, {
                depth: 2,
                item: item2_1
            }, {
                depth: 3,
                item: item2_1_1
            }]));
        });
    });

    describe('Dynamic mapping', function() {

        var treeWrapper, items;
        var root, item1, item2, item2_1, item2_1_1;

        beforeEach(function() {
            root = {
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

            item1 = root.items[0];
            item2 = root.items[1];
            item2_1 = item2.items[0];
            item2_1_1 = item2_1.items[0];

            var observer = treeFlattener.createTreeObserver();
            treeWrapper = treeWrap.wrap(root, observer);
            items = treeFlattener.flatten(treeWrapper, observer);
        });

        it('adds new root item into flattened array', function() {
            var newItem = {
                name: 'new item'
            };
            treeWrapper.add(1, newItem);

            assert.deepEqual(clone(items), clone([{
                depth: 0,
                item: root
            }, {
                depth: 1,
                item: item1
            }, {
                depth: 1,
                item: newItem
            }, {
                depth: 1,
                item: item2
            }, {
                depth: 2,
                item: item2_1
            }, {
                depth: 3,
                item: item2_1_1
            }]));
        });

        it('adds new nested item into flattened array', function() {
            var newItem = {
                name: 'new item'
            };

            var item2Wrapper = treeWrapper.get(1);
            item2Wrapper.add(0, newItem);

            assert.deepEqual(clone(items), clone([{
                depth: 0,
                item: root
            }, {
                depth: 1,
                item: item1
            }, {
                depth: 1,
                item: item2
            }, {
                depth: 2,
                item: newItem
            }, {
                depth: 2,
                item: item2_1
            }, {
                depth: 3,
                item: item2_1_1
            }]));
        });
    });
});

function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}




















