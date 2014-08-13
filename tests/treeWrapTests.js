var TreeWrapper = require('../lib/treeWrap.js'),
    assert = require('chai').assert;

describe('JsonTree', function() {

    describe('Adding', function() {

        describe('Adding to root item', function() {
            var json, rootWrapper;

            beforeEach(function() {
                json = {
                    items: [{
                        name: 'item 1'
                    },{
                        name: 'item 2'
                    }]
                };
                var treeWrapper = new TreeWrapper();
                rootWrapper = treeWrapper.wrap(json);
            });

            it('can add item at start', function() {
                rootWrapper.addChild(0, {
                    name: 'new item'
                });

                assert.deepEqual(rootWrapper.unwrap(), {
                    items: [{
                        name: 'new item'
                    },{
                        name: 'item 1'
                    },{
                        name: 'item 2'
                    }]
                });
            });

            it('can add item in middle', function() {
                rootWrapper.addChild(1, {
                    name: 'new item'
                });

                assert.deepEqual(rootWrapper.unwrap(), {
                    items: [{
                        name: 'item 1'
                    },{
                        name: 'new item'
                    },{
                        name: 'item 2'
                    }]
                });
            });

            it('can add item at end', function() {
                rootWrapper.addChild(2, {
                    name: 'new item'
                });

                assert.deepEqual(rootWrapper.unwrap(), {
                    items: [{
                        name: 'item 1'
                    },{
                        name: 'item 2'
                    },{
                        name: 'new item'
                    }]
                });
            });
        });

        describe('Adding to nested item', function() {
            var json, rootWrapper, nestedItemWrapper;

            beforeEach(function() {
                json = {
                    items: [{
                        name: 'item 1'
                    },{
                        name: 'item 2',
                        items: [{
                            name: 'item 2 - 1'
                        },{
                            name: 'item 2 - 2'
                        }]
                    }]
                };
                var treeWrapper = new TreeWrapper();
                rootWrapper = treeWrapper.wrap(json);
                nestedItemWrapper = rootWrapper.getChild(1);
            });

            it('can add item at start', function() {
                nestedItemWrapper.addChild(0, {
                    name: 'new item'
                });

                assert.deepEqual(rootWrapper.unwrap(), {
                    items: [{
                        name: 'item 1'
                    },{
                        name: 'item 2',
                        items: [{
                            name: 'new item'
                        },{
                            name: 'item 2 - 1'
                        },{
                            name: 'item 2 - 2'
                        }]
                    }]
                });
            });

            it('can add item in middle', function() {
                nestedItemWrapper.addChild(1, {
                    name: 'new item'
                });

                assert.deepEqual(rootWrapper.unwrap(), {
                    items: [{
                        name: 'item 1'
                    },{
                        name: 'item 2',
                        items: [{
                            name: 'item 2 - 1'
                        },{
                            name: 'new item'
                        },{
                            name: 'item 2 - 2'
                        }]
                    }]
                });
            });

            it('can add item at end', function() {
                nestedItemWrapper.addChild(2, {
                    name: 'new item'
                });

                assert.deepEqual(rootWrapper.unwrap(), {
                    items: [{
                        name: 'item 1'
                    },{
                        name: 'item 2',
                        items: [{
                            name: 'item 2 - 1'
                        },{
                            name: 'item 2 - 2'
                        },{
                            name: 'new item'
                        }]
                    }]
                });
            });
        });
    });

    describe('Removing', function() {

        describe('Removing from root item', function() {
            var json, rootWrapper;

            beforeEach(function() {
                json = {
                    items: [{
                        name: 'item 1'
                    },{
                        name: 'item 2'
                    },{
                        name: 'item 3'
                    }]
                };
                var treeWrapper = new TreeWrapper();
                rootWrapper = treeWrapper.wrap(json);
            });

            it('can remove from start of root item', function() {
                rootWrapper.removeChild(0);

                assert.deepEqual(rootWrapper.unwrap(), {
                    items: [{
                        name: 'item 2'
                    },{
                        name: 'item 3'
                    }]
                });
            });

            it('can remove from middle of root item', function() {
                rootWrapper.removeChild(1);

                assert.deepEqual(rootWrapper.unwrap(), {
                    items: [{
                        name: 'item 1'
                    },{
                        name: 'item 3'
                    }]
                });
            });

            it('can remove from end of root item', function() {
                rootWrapper.removeChild(2);

                assert.deepEqual(rootWrapper.unwrap(), {
                    items: [{
                        name: 'item 1'
                    },{
                        name: 'item 2'
                    }]
                });
            });
        });

        describe('Removing from nested item', function() {
            var json, rootWrapper, nestedItemWrapper;

            beforeEach(function() {
                json = {
                    items: [{
                        name: 'item 1'
                    },{
                        name: 'item 2',
                        items: [{
                            name: 'item 2 - 1'
                        },{
                            name: 'item 2 - 2'
                        },{
                            name: 'item 2 - 3'
                        }]
                    }]
                };
                var treeWrapper = new TreeWrapper();
                rootWrapper = treeWrapper.wrap(json);
                nestedItemWrapper = rootWrapper.getChild(1);
            });

            it('can remove from start of nested item', function() {
                nestedItemWrapper.removeChild(0);

                assert.deepEqual(rootWrapper.unwrap(), {
                    items: [{
                        name: 'item 1'
                    },{
                        name: 'item 2',
                        items: [{
                            name: 'item 2 - 2'
                        },{
                            name: 'item 2 - 3'
                        }]
                    }]
                });
            });

            it('can remove from middle of nested item', function() {
                nestedItemWrapper.removeChild(1);

                assert.deepEqual(rootWrapper.unwrap(), {
                    items: [{
                        name: 'item 1'
                    },{
                        name: 'item 2',
                        items: [{
                            name: 'item 2 - 1'
                        },{
                            name: 'item 2 - 3'
                        }]
                    }]
                });
            });

            it('can remove from end of nested item', function() {
                nestedItemWrapper.removeChild(2);

                assert.deepEqual(rootWrapper.unwrap(), {
                    items: [{
                        name: 'item 1'
                    },{
                        name: 'item 2',
                        items: [{
                            name: 'item 2 - 1'
                        },{
                            name: 'item 2 - 2'
                        }]
                    }]
                });
            });
        });
    });

    describe('Moving items', function() {
        var json, rootWrapper, item2Wrapper;

        beforeEach(function() {
            json = {
                items: [{
                    name: 'item 1'
                },{
                    name: 'item 2',
                    items: [{
                        name: 'item 2 - 1'
                    },{
                        name: 'item 2 - 2'
                    },{
                        name: 'item 2 - 3'
                    }]
                }]
            };
            var treeWrapper = new TreeWrapper();
            rootWrapper = treeWrapper.wrap(json);
            item2Wrapper = rootWrapper.getChild(1);
        });

        it('can move item up within same parent', function() {
            item2Wrapper.moveChild(2, 0);

            assert.deepEqual(rootWrapper.unwrap(), {
                items: [{
                    name: 'item 1'
                },{
                    name: 'item 2',
                    items: [{
                        name: 'item 2 - 3'  // <-- moved up
                    },{
                        name: 'item 2 - 1'
                    },{
                        name: 'item 2 - 2'
                    }]
                }]
            });
        });

        it('can move item down within same parent', function() {
            item2Wrapper.moveChild(1, 2);

            assert.deepEqual(rootWrapper.unwrap(), {
                items: [{
                    name: 'item 1'
                },{
                    name: 'item 2',
                    items: [{
                        name: 'item 2 - 1'
                    },{
                        name: 'item 2 - 3'
                    },{
                        name: 'item 2 - 2'  // <-- moved down
                    }]
                }]
            });
        });

        it('can move item from one parent to another', function() {

            // Move root item at index 0 to item2 at index 1
            rootWrapper.moveChild(0, item2Wrapper, 1);

            assert.deepEqual(rootWrapper.unwrap(), {
                items: [{
                    name: 'item 2',
                    items: [{
                        name: 'item 2 - 1'
                    },{
                        name: 'item 1'  // <-- moved here
                    },{
                        name: 'item 2 - 2'
                    },{
                        name: 'item 2 - 3'
                    }]
                }]
            });
        });

        it('throws if attempt to move parent under itself', function() {
            assert.throws(function() {
                item2Wrapper.moveChild(0, item2Wrapper, 1);
            }, 'Cannot move an item under itself');

            // Make sure nothing changed:
            assert.deepEqual(rootWrapper.unwrap(), {
                items: [{
                    name: 'item 1'
                },{
                    name: 'item 2',
                    items: [{
                        name: 'item 2 - 1'
                    },{
                        name: 'item 2 - 2'
                    },{
                        name: 'item 2 - 3'
                    }]
                }]
            });
        });
    });

    describe('Events', function() {
        var added, removed, moved;
        var options;

        beforeEach(function() {
            added = [];
            removed = [];
            moved = [];

            options = {
                onAdd: function (parent, index, item) {
                    added.push({ parent: parent, index: index, item: item });
                },
                onRemove: function (parent, index, item) {
                    removed.push({ parent: parent, index: index, item: item });
                },
                onMove: function (oldParent, oldIndex, newParent, newIndex, item) {
                    moved.push({
                        oldParent: oldParent,
                        oldIndex: oldIndex,
                        newParent: newParent,
                        newIndex: newIndex,
                        item: item
                    });
                }
            };
        });

        describe('Add event', function() {
            var json, rootWrapper;

            beforeEach(function() {
                json = {
                    items: [{
                        name: 'item 1'
                    },{
                        name: 'item 2'
                    }]
                };

                var treeWrapper = new TreeWrapper(options);
                rootWrapper = treeWrapper.wrap(json);
            });

            it('notifies when root item added', function() {
                rootWrapper.addChild(1, {
                    name: 'new item'
                });

                assert.deepEqual(added, [{
                    parent: rootWrapper.unwrap(),
                    index: 1,
                    item: {
                        name: 'new item'
                    }
                }]);
            });

            it('notifies when nested item added', function() {
                var item2Wrapper = rootWrapper.getChild(1);

                item2Wrapper.addChild(0, {
                    name: 'new item'
                });

                assert.deepEqual(added, [{
                    parent: item2Wrapper.unwrap(),
                    index: 0,
                    item: {
                        name: 'new item'
                    }
                }]);
            });
        });

        describe('Remove event', function() {
            var json, rootWrapper;

            beforeEach(function () {
                json = {
                    items: [{
                        name: 'item 1'
                    },{
                        name: 'item 2',
                        items: [{
                            name: 'item 2 - 1'
                        },{
                            name: 'item 2 - 2'
                        }]
                    }]
                };
                var treeWrapper = new TreeWrapper(options);
                rootWrapper = treeWrapper.wrap(json);
            });

            it('notifies when root item removed', function() {
                rootWrapper.removeChild(0);

                assert.deepEqual(removed, [{
                    parent: rootWrapper.unwrap(),
                    index: 0,
                    item: {
                        name: 'item 1'
                    }
                }]);
            });

            it('notifies when nested item removed', function() {
                var item2Wrapper = rootWrapper.getChild(1);

                item2Wrapper.removeChild(1);

                assert.deepEqual(removed, [{
                    parent: item2Wrapper.unwrap(),
                    index: 1,
                    item: {
                        name: 'item 2 - 2'
                    }
                }]);
            });
        });

        describe('Move event', function() {
            var json, rootWrapper, item2Wrapper;

            beforeEach(function() {
                json = {
                    items: [{
                        name: 'item 1'
                    },{
                        name: 'item 2',
                        items: [{
                            name: 'item 2 - 1'
                        },{
                            name: 'item 2 - 2'
                        },{
                            name: 'item 2 - 3'
                        }]
                    }]
                };
                var treeWrapper = new TreeWrapper(options);
                rootWrapper = treeWrapper.wrap(json);
                item2Wrapper = rootWrapper.getChild(1);
            });

            it('notifies when item moved within same parent', function() {
                item2Wrapper.moveChild(2, 0);

                var item2 = item2Wrapper.unwrap();

                assert.deepEqual(moved, [{
                    oldParent: item2,
                    oldIndex: 2,
                    newParent: item2,
                    newIndex: 0,
                    item: {
                        name: 'item 2 - 3'
                    }
                }]);
            });

            it('notifies when item moved to different parent', function() {

                // Move "Item 2 - 2" to the end
                item2Wrapper.moveChild(1, rootWrapper, 2);

                assert.deepEqual(moved, [{
                    oldParent: item2Wrapper.unwrap(),
                    oldIndex: 1,
                    newParent: rootWrapper.unwrap(),
                    newIndex: 2,
                    item: {
                        name: 'item 2 - 2'
                    }
                }]);
            });
        });
    });

    describe('Traversing', function() {
        it('can traverse wrapped item and child items', function() {

            var treeWrapper = new TreeWrapper();
            var rootWrapper = treeWrapper.wrap({
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
                }, {
                    name: 'item 3'
                }]
            });

            var actual = [];
            rootWrapper.traverse(function(item, parent, index, depth) {
                actual.push({
                    name: item.name || '<root>',
                    parent: parent ? (parent.name ? parent.name : '<root>') : null,
                    index: index,
                    depth: depth
                })
            });

            assert.deepEqual(actual, [
                { name: '<root>', parent: null, index: 0, depth: 0 },
                { name: 'item 1', parent: '<root>', index: 1, depth: 1 },
                { name: 'item 2', parent: '<root>', index: 2, depth: 1 },
                { name: 'item 2 - 1', parent: 'item 2', index: 3, depth: 2 },
                { name: 'item 2 - 1 - 1', parent: 'item 2 - 1', index: 4, depth: 3 },
                { name: 'item 2 - 2', parent: 'item 2', index: 5, depth: 2 },
                { name: 'item 3', parent: '<root>', index: 6, depth: 1 }
            ]);
        });
    });
});