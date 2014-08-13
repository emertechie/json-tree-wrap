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

    function TreeFlattener(treeObserver, options) {
        this.items = [];
        this.options = _.defaults(options || {}, {
            includeRoot: true
        });

        treeObserver.attach({
            onInit: function(parent, item, itemId, index, depth) {
                if (depth === 0 && !this.options.includeRoot) {
                    return;
                }
                var wrapper = createItemWrapper(item, itemId, depth);
                this.items.push(wrapper);
            }.bind(this),
            onAdd: function(parent, siblingLevelInsertIndex, newItem, itemId) {

                var parentIndex = _.findIndex(this.items, function(itemWrapper) {
                    return itemWrapper.item == parent;
                });

                var parentDepth;
                var startIndex;
                if (parentIndex === -1) {
                    // If parent not found, have to assume it's because root not included. Not way to totally verify that here though
                    if (options.includeRoot) {
                        throw new Error('Could not find matching parent. Tried to find: ' + JSON.stringify(parent));
                    }
                    parentDepth = 0;
                    startIndex = 0;
                } else {
                    parentDepth = this.items[parentIndex].depth;
                    startIndex = parentIndex + 1;
                }

                var flattenedInsertIndex = findInsertIndexAtDepth(parentDepth + 1, this.items, startIndex, siblingLevelInsertIndex);

                if (flattenedInsertIndex === -1) {
                    flattenedInsertIndex = this.items.length;
                }

                var wrapper = createItemWrapper(newItem, itemId, parentDepth + 1);
                this.items.splice(flattenedInsertIndex, null, wrapper);
            }.bind(this)
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

    return TreeFlattener;
}));
