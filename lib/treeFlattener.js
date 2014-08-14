(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['lodash','./treeObserver.js', './polyfills.js'], factory);
    } else if (typeof exports === 'object') {
            module.exports = factory(require('lodash'), require('./treeObserver.js'), require('./polyfills.js'));
    } else {
        root.TreeFlattener = factory(root._, root.TreeObserver, root.jsonTreeWrapPolyfills);
    }
}(this, function (_, TreeObserver, polyfills) {

    polyfills();

    function TreeFlattener(treeWrapper, treeObserver, options) {
        this.items = [];
        this.options = _.defaults(options || {}, {
            includeRoot: true
        });

        var onInit = function(parent, item, itemId, index, depth) {
            if (depth === 0 && !this.options.includeRoot) {
                return;
            }
            var wrapper = createItemWrapper(item, itemId, depth);
            this.items.push(wrapper);
        }.bind(this);

        var onAdd = function(parent, siblingLevelInsertIndex, newItem, itemId) {
            var postParentPos = findPositionAfterParent(this.items, parent, options);
            var childDepth = postParentPos.parentDepth + 1;

            var conversionResult = treeIndexToFlatIndex(childDepth, siblingLevelInsertIndex, this.items, postParentPos.flatIndex);
            var flattenedInsertIndex = conversionResult ? conversionResult.flatIndex : this.items.length;

            var wrapper = createItemWrapper(newItem, itemId, childDepth);
            this.items.splice(flattenedInsertIndex, null, wrapper);
        }.bind(this);

        var onRemove = function(parent, siblingLevelRemoveIndex, removedItem) {
            var postParentPos = findPositionAfterParent(this.items, parent, options);
            var childDepth = postParentPos.parentDepth + 1;
            var conversionResult = treeIndexToFlatIndex(childDepth, siblingLevelRemoveIndex, this.items, postParentPos.flatIndex);

            if (!conversionResult || conversionResult.passedAllSiblings) {
                throw new Error('Could not find flattened item to remove at depth ' + childDepth + ', index ' + siblingLevelRemoveIndex);
            }

            var removeIndex = conversionResult.flatIndex;
            var countToRemove = calculateFlatLength(removedItem, treeWrapper);
            var removedItems = this.items.splice(removeIndex, countToRemove);

            if (removedItems.length !== countToRemove) {
                throw new Error('Failed to remove ' + countToRemove + ' items at flat index ' + removeIndex +
                    ', depth ' + childDepth + ', index ' + siblingLevelRemoveIndex + '. Removed ' + (removedItems || []).length);
            }
        }.bind(this);

        treeObserver.attach({
            onInit: onInit,
            onAdd: onAdd,
            onRemove: onRemove
        });
    }

    TreeFlattener.prototype.getItems = function() {
        return this.items;
    };

    function createItemWrapper(item, itemId, depth) {
        return {
            depth: depth,
            item: item,
            id: itemId
        };
    }

    function calculateFlatLength(item, treeWrapper) {
        var count = 0;
        treeWrapper.traverse(item, function() {
            ++count;
        });
        return count;
    }

    function findPositionAfterParent(items, parent, options) {

        var parentIndex = _.findIndex(items, function(itemWrapper) {
            return itemWrapper.item == parent;
        });

        if (parentIndex === -1) {
            // If parent not found, have to assume it's because root not included. Not way to totally verify that here though
            if (options.includeRoot) {
                throw new Error('Could not find matching parent. Tried to find: ' + JSON.stringify(parent));
            }
            return {
                parentDepth: 0,
                flatIndex: 0
            };
        } else {
            return {
                parentDepth: items[parentIndex].depth,
                flatIndex: parentIndex + 1
            };
        }
    }

    /*function findInsertIndexAtDepth(depth, flattenedItems, startIndex, siblingInsertIndex) {
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
    }*/

    function treeIndexToFlatIndex(depth, treeIndex, flattenedItems, flatItemsStartIndex) {
        if (treeIndex === 0) {
            return {
                siblingCount: 0,
                flatIndex: flatItemsStartIndex
            };
        }

        var i, siblingCount = 0;
        for (i = flatItemsStartIndex; i < flattenedItems.length; i++) {
            var itemContainer = flattenedItems[i];

            // Check if we've scanned past all other siblings and hit item from higher level in tree:
            if (itemContainer.depth < depth) {
                return {
                    passedAllSiblings: true,
                    siblingCount: 0,
                    flatIndex: flatItemsStartIndex
                };
            }

            if (itemContainer.depth === depth && treeIndex == siblingCount++) {
                return {
                    siblingCount: siblingCount,
                    flatIndex: i
                };
            }

            /*var done =
                // Check if we've scanned past all other siblings and hit item from higher level in tree:
                itemContainer.depth < depth ||
                // Are we a sibling and have we seen the right number of siblings yet:
                (itemContainer.depth === depth && treeIndex == siblingCount++);

            if (done) {
                return {
                    siblingCount: siblingCount,
                    flatIndex: i
                };
            }*/
        }

        return null;
    }

    /*function findRemoveIndexAtDepth(depth, flattenedItems, startIndex, siblingRemoveIndex) {
        if (siblingRemoveIndex === 0) {
            return startIndex;
        }

        var i, siblingCount = 0;
        for (i = startIndex; i < flattenedItems.length; i++) {
            var itemContainer = flattenedItems[i];

            // Check if we've scanned past all other siblings and hit item from higher level in tree:
            if (itemContainer.depth < depth) {
                throw new Error('Could not find any item to remove at depth ' + depth + ' with index ' + siblingRemoveIndex);
            }

            var isSibling = itemContainer.depth === depth;
            if (isSibling && siblingRemoveIndex == siblingCount++) {
                return i;
            }
        }

        return -1;
    }*/

    return TreeFlattener;
}));
