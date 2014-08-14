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

            return removedItems;
        }.bind(this);

        var onMove = function(oldParent, oldIndex, newParent, newIndex, item) {
            var removedItems = onRemove(oldParent, oldIndex, item);

            var postParentPos = findPositionAfterParent(this.items, newParent, options);
            var newChildDepth = postParentPos.parentDepth + 1;
            var conversionResult = treeIndexToFlatIndex(newChildDepth, newIndex, this.items, postParentPos.flatIndex);
            var flatInsertIndex = conversionResult ? conversionResult.flatIndex : this.items.length;

            var depthDiff = newChildDepth - removedItems[0].depth;

            for (var i = 0; i < removedItems.length; i++) {
                var wrappedItemToInsert = removedItems[i];
                wrappedItemToInsert.depth += depthDiff;
                this.items.splice(flatInsertIndex + i, null, wrappedItemToInsert);
            }
        }.bind(this);

        treeObserver.attach({
            onInit: onInit,
            onAdd: onAdd,
            onRemove: onRemove,
            onMove: onMove
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
        }

        return null;
    }

    return TreeFlattener;
}));
