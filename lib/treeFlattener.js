(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['lodash'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('lodash'));
    } else {
        root.treeFlattener = factory(root._);
    }
}(this, function (_) {
    var noOp = function(){};

    function findInsertIndexAtDepth(depth, flattenedItems, startIndex, siblingInsertIndex) {
        if (siblingInsertIndex === 0) {
            return startIndex;
        }

        var i, siblingCount = 0;
        for (i = startIndex; i < flattenedItems.length; i++) {
            var itemContainer = flattenedItems[i];

            // Check if we've scanned past all other siblings and hit item from higher level in tree:
            if (itemContainer.depth < depth) {
                return i;
            }

            var isSibling = itemContainer.depth === depth;
            if (isSibling && siblingInsertIndex == siblingCount++) {
                return i;
            }
        }

        return -1;
    }

    function TreeObserver() {
        this.handlers = {
            onAdd: noOp,
            onRemove: noOp,
            onUpdate: noOp,
            onMove: noOp
        };
    }
    TreeObserver.prototype = {
        attach: function(delegate) {
            this.handlers = delegate;
        },
        onAdd: function(parent, index, item) {
            this.handlers.onAdd(parent, index, item);
        },
        onRemove: function(parent, index, item) {
            this.handlers.onRemove(parent, index, item);
        },
        onMove: function(oldParent, oldIndex, newParent, newIndex, item) {
            this.handlers.onMove(oldParent, oldIndex, newParent, newIndex, item);
        }
    };

    return {
        flatten: function(treeWrapper, treeObserverOrOptions, options) {
            var treeObserver;
            if (treeObserverOrOptions instanceof TreeObserver) {
                treeObserver = treeObserverOrOptions;
            } else {
                treeObserver = options;
                options = treeObserverOrOptions;
            }

            options = _.defaults(options || {}, {
                includeRoot: true
            });

            function createItemWrapper(depth, item) {
                var itemWrapper = {
                    depth: depth,
                    item: item
                };
                if (options.onNew) {
                    options.onNew(itemWrapper);
                }
                return itemWrapper;
            }

            var root = treeWrapper.unwrap();
            var items = [];

            if (treeObserver) {
                treeObserver.attach({
                    onAdd: function(parent, siblingLevelInsertIndex, newItem) {
                        var parentIndex = _.findIndex(items, function(itemContainer) {
                            return itemContainer.item == parent;
                        });

                        var parentDepth;
                        var startIndex;
                        if (parentIndex === -1) {
                            if (options.includeRoot || parent != root) {
                                throw new Error('Could not find matching parent. Tried to find: ' + JSON.stringify(parent));
                            }
                            parentDepth = 0;
                            startIndex = 0;
                        } else {
                            parentDepth = items[parentIndex].depth;
                            startIndex = parentIndex + 1;
                        }

                        var flattenedInsertIndex = findInsertIndexAtDepth(parentDepth + 1, items, startIndex, siblingLevelInsertIndex);

                        if (flattenedInsertIndex === -1) {
                            flattenedInsertIndex = items.length;
                        }

                        var wrapper = createItemWrapper(parentDepth + 1, newItem);
                        items.splice(flattenedInsertIndex, null, wrapper);
                    }
                });
            }

            var initialJson = treeWrapper.unwrap();

            var reduceItem = function(item, depth, options) {

                var result = (depth > 0 || options.includeRoot)
                    ? [ createItemWrapper(depth, item) ]
                    : [];

                for (var i = 0; i < (item.items || []).length; i++) {
                    var child = item.items[i];
                    result = result.concat(reduceItem(child, depth + 1, options));
                }

                return result;
            };

            items = reduceItem(initialJson, 0, options);
            return items;
        },
        createTreeObserver: function() {
            return new TreeObserver();
        }
    };
}));
