var jsonTree = require('../lib/index.js'),
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
                rootWrapper = jsonTree.wrap(json);
            });

            it('can add item at start', function() {
                rootWrapper.add(0, {
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
                rootWrapper.add(1, {
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
                rootWrapper.add(2, {
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
                rootWrapper = jsonTree.wrap(json);
                nestedItemWrapper = rootWrapper.get(1);
            });

            it('can add item at start', function() {
                nestedItemWrapper.add(0, {
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
                nestedItemWrapper.add(1, {
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
                nestedItemWrapper.add(2, {
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
                rootWrapper = jsonTree.wrap(json);
            });

            it('can remove from start of root item', function() {
                rootWrapper.remove(0);

                assert.deepEqual(rootWrapper.unwrap(), {
                    items: [{
                        name: 'item 2'
                    },{
                        name: 'item 3'
                    }]
                });
            });

            it('can remove from middle of root item', function() {
                rootWrapper.remove(1);

                assert.deepEqual(rootWrapper.unwrap(), {
                    items: [{
                        name: 'item 1'
                    },{
                        name: 'item 3'
                    }]
                });
            });

            it('can remove from end of root item', function() {
                rootWrapper.remove(2);

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
                rootWrapper = jsonTree.wrap(json);
                nestedItemWrapper = rootWrapper.get(1);
            });

            it('can remove from start of nested item', function() {
                nestedItemWrapper.remove(0);

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
                nestedItemWrapper.remove(1);

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
                nestedItemWrapper.remove(2);

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
            rootWrapper = jsonTree.wrap(json);
            item2Wrapper = rootWrapper.get(1);
        });

        it('can move item up within same parent', function() {
            item2Wrapper.move(2, 0);

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
            item2Wrapper.move(1, 2);

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
            rootWrapper.move(0, item2Wrapper, 1);

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
                item2Wrapper.move(0, item2Wrapper, 1);
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
                rootWrapper = jsonTree.wrap(json, options);
            });

            it('notifies when root item added', function() {
                rootWrapper.add(1, {
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
                var item2Wrapper = rootWrapper.get(1);

                item2Wrapper.add(0, {
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
                rootWrapper = jsonTree.wrap(json, options);
            });

            it('notifies when root item removed', function() {
                rootWrapper.remove(0);

                assert.deepEqual(removed, [{
                    parent: rootWrapper.unwrap(),
                    index: 0,
                    item: {
                        name: 'item 1'
                    }
                }]);
            });

            it('notifies when nested item removed', function() {
                var item2Wrapper = rootWrapper.get(1);

                item2Wrapper.remove(1);

                assert.deepEqual(removed, [{
                    parent: item2Wrapper.unwrap(),
                    index: 1,
                    item: {
                        name: 'item 2 - 2'
                    }
                }]);
            });
        });
    });
});