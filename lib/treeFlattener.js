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

    return {
        flatten: function(treeWrapper, treeObserver) {
            var items = [];

            if (treeObserver) {
                treeObserver.attach({
                    onAdd: function(parent, siblingLevelInsertIndex, newItem) {

                        var parentIndex = _.findIndex(items, function(itemContainer) {
                            return itemContainer.item == parent;
                        });
                        var parentDepth = items[parentIndex].depth;

                        var startIndex = parentIndex + 1;
                        var flattenedInsertIndex = findInsertIndexAtDepth(parentDepth + 1, items, startIndex, siblingLevelInsertIndex);

                        if (flattenedInsertIndex === -1) {
                            flattenedInsertIndex = items.length;
                        }

                        /*for (var depth = parentItemContainer.depth; depth >= 0; depth--) {
                            result = findInsertIndexAtDepth(depth, items, startIndex, parentItem, siblingLevelInsertIndex);
                            if (result.insertIndex !== -1) {
                                break;
                            }
                            startIndex += result.depthCount;
                            parentItem = parentItem.parent;
                        }

                        if (flattenedInsertIndex === -1) {
                            flattenedInsertIndex = items.length;
                        }*/
                        /*var siblingsSeen = 0;

                        var insertIndex = _.findIndex(items, function(flattenedItem) {
                            var isSibling = flattenedItem.item.parent == parent;
                            return isSibling && (insertIndex === siblingsSeen++);
                        });

                        // We may not find a sibling in the case of adding to end of a list of items
                        if (insertIndex === -1) {
                            throw new Error('Could not calculate insert index in flattened array');
                        }*/

                        items.splice(flattenedInsertIndex, null, {
                            depth: parentDepth + 1,
                            item: newItem
                        });

                        /*if (parentIndex === -1) {
                            throw new Error('Could not find parent item in flattened array');
                        }

                        var insertIndex = parentIndex + index + 1;


                        items.splice(insertIndex, null, {
                            depth: items[parentIndex].depth + 1,
                            item: newItem
                        });
                        */
                    }
                });
            }

            var initialJson = treeWrapper.unwrap();

            var reduceItem = function(item, depth) {

                var result = [{
                    depth: depth,
                    item: item
                }];

                for (var i = 0; i < (item.items || []).length; i++) {
                    var child = item.items[i];
                    result = result.concat(reduceItem(child, depth + 1));
                }

                return result;
            };

            items = reduceItem(initialJson, 0);
            return items;
        },
        createTreeObserver: function() {
            var handlers = {
                onAdd: noOp,
                onRemove: noOp,
                onUpdate: noOp,
                onMove: noOp
            };
            return {
                attach: function(delegate) {
                    handlers = delegate;
                },
                onAdd: function(parent, index, item) {
                    handlers.onAdd(parent, index, item);
                },
                onRemove: function(parent, index, item) {
                    handlers.onRemove(parent, index, item);
                },
                onMove: function(oldParent, oldIndex, newParent, newIndex, item) {
                    handlers.onMove(oldParent, oldIndex, newParent, newIndex, item);
                }
            };
        }
    };
}));
