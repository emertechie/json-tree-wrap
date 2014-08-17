(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['lodash', './polyfills.js'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('lodash'), require('./polyfills.js'));
    } else {
        root.TreeWrapper = factory(root._, root.jsonTreeWrapPolyfills);
    }
}(this, function (_, polyfills) {

    polyfills();

    function TreeWrapper(options) {
        options = options || {};

        var noOp = function() {};
        this.options = _.defaults(options, {
            childrenProp: 'items',
            onAdd: noOp,
            onRemove: noOp,
            onMove: noOp
        });

        // TODO: simplify all this crap!
        if (options.observer) {
            if (options.observer.onInit) this.options.onInit = options.observer.onInit.bind(options.observer);
            if (options.observer.onAdd) this.options.onAdd = options.observer.onAdd.bind(options.observer);
            if (options.observer.onRemove) this.options.onRemove = options.observer.onRemove.bind(options.observer);
            if (options.observer.onMove) this.options.onMove = options.observer.onMove.bind(options.observer);
        }

        this.childrenProp = this.options.childrenProp;
    }

    TreeWrapper.prototype = {
        wrap: function(obj) {
            if (!obj) {
                throw new Error('Object to wrap was null');
            }

            var parent = null;

            if (this.options.onInit) {
                traverse(obj, parent, 0, 0, this.childrenProp, function(item, parent, index, depth) {
                    this.options.onInit(parent, item, index, depth);
                }.bind(this));
            }

            return createWrapper(obj, parent, this.options);
        },
        getWrapper: function(item, parent) {
            return createWrapper(item, parent, this.options);
        },
        // TODO: this is a bit of a smell. Just here to reuse the childrenProp config
        traverse: function(item, callback) {
            traverseSimple(item, null, this.childrenProp, callback);
        }
    };

    return TreeWrapper;

    function createWrapper(obj, parent, options) {
        return {
            getChild: function(index) {
                var items = getOrCreateChildItems(obj, options.childrenProp);
                return createWrapper(items[index], obj, options);
            },
            addChild: function(index, newObj) {
                var items = getOrCreateChildItems(obj, options.childrenProp);
                items.splice(index, null, newObj);
                options.onAdd(obj, index, newObj);
            },
            removeChild: function(index) {
                var items = getOrCreateChildItems(obj, options.childrenProp);
                var removed = items.splice(index, 1);
                if (removed.length) {
                    options.onRemove(obj, index, removed[0]);
                }
                return removed[0];
            },
            moveChild: function(removeIndex, insertIndexOrNewParent, newParentInsertIndex) {
                if (insertIndexOrNewParent == this) {
                    throw new Error('Cannot move an item under itself');
                }

                var items = getOrCreateChildItems(obj, options.childrenProp);
                var removed = items.splice(removeIndex, 1);
                if (!removed.length) {
                    return;
                }

                var removedItem = removed[0];

                if (typeof insertIndexOrNewParent === 'number') {
                    items.splice(insertIndexOrNewParent, null, removedItem);
                    options.onMove(obj, removeIndex, obj, insertIndexOrNewParent, removedItem);
                } else {
                    var newParent = insertIndexOrNewParent.unwrap();

                    var newParentItems = getOrCreateChildItems(newParent, options.childrenProp);
                    newParentItems.splice(newParentInsertIndex, null, removedItem);

                    options.onMove(obj, removeIndex, newParent, newParentInsertIndex, removedItem);
                }
            },
            unwrap: function() {
                return obj;
            },
            traverse: function(callback) {
                traverse(obj, parent, 0, 0, options.childrenProp, callback);
            }
        };
    }

    function traverseSimple(item, parent, childrenProp, callback) {
        callback(item, parent);

        var children = item[childrenProp];
        if (!children) {
            return;
        }

        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            traverseSimple(child, item, childrenProp, callback);
        }
    }

    function traverse(item, parent, index, depth, childrenProp, callback) {
        callback(item, parent, index++, depth);

        var children = item[childrenProp];
        if (!children) {
            return index;
        }

        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            index = traverse(child, item, index, depth + 1, childrenProp, callback);
        }

        return index;
    }

    function getOrCreateChildItems(obj, childrenProp) {
        var arr = obj[childrenProp];
        if (!arr) {
            arr = [];
            obj[childrenProp] = arr;
        }
        return arr;
    }
}));
