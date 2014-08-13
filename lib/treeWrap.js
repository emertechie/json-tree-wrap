(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['lodash', './polyfills.js'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('lodash'), require('./polyfills.js'));
    } else {
        root.treeWrap = factory(root._, root.jsonTreeWrapPolyfills);
    }
}(this, function (_, polyfills) {

    polyfills();

    var theDefaults;
    var childrenProp;
    var noOp = function(){};

    function setUpDefaults(defaults) {
        theDefaults = _.defaults(defaults || {}, {
            childrenProp: 'items',
            onAdd: noOp,
            onRemove: noOp,
            onMove: noOp,
            getItemId: noOp
        });

        childrenProp = theDefaults.childrenProp || 'items';
    }

    setUpDefaults();

    return {
        defaults: function(options) {
            setUpDefaults(options);
        },
        wrap: function(obj, options) {
            if (!obj) {
                throw new Error('Object to wrap was null');
            }

            options = _.defaults(options || {}, theDefaults);

            if (options.observer) {
                if (options.observer.onInit) options.onInit = options.observer.onInit.bind(options.observer);
                if (options.observer.onAdd) options.onAdd = options.observer.onAdd.bind(options.observer);
                if (options.observer.onRemove) options.onRemove = options.observer.onRemove.bind(options.observer);
                if (options.observer.onMove) options.onMove = options.observer.onMove.bind(options.observer);
            }

            var parentsByChildKey = {};
            var parent = null;

            if (options.onInit) {
                traverse(obj, parent, 0, 0, function(item, parent, index, depth) {
                    var itemId = options.getItemId(item, parent);
                    parentsByChildKey[itemId] = parent;
                    options.onInit(parent, item, itemId, index, depth);
                });
            }

            return createWrapper(obj, parent, parentsByChildKey, options);
        }
    };

    function createWrapper(obj, parent, parentsByChildKey, options) {
        return {
            options: options,
            getChild: function(index) {
                var items = getOrCreateChildItems(obj);
                return createWrapper(items[index], obj, parentsByChildKey, options);
            },
            addChild: function(index, newObj) {
                var items = getOrCreateChildItems(obj);
                items.splice(index, null, newObj);
                var itemId = options.getItemId(newObj, obj);
                parentsByChildKey[itemId] = obj;
                options.onAdd(obj, index, newObj, itemId);  // TODO: Tidy up order of arguments
                return this;
            },
            removeChild: function(index) {
                var items = getOrCreateChildItems(obj);
                var removed = items.splice(index, 1);
                if (removed.length) {
                    options.onRemove(obj, index, removed[0]);
                }
                return this;
            },
            moveChild: function(removeIndex, insertIndexOrNewParent, newParentInsertIndex) {
                if (insertIndexOrNewParent == this) {
                    throw new Error('Cannot move an item under itself');
                }

                var items = getOrCreateChildItems(obj);
                var removed = items.splice(removeIndex, 1);
                if (!removed.length) {
                    return this;
                }

                var removedItem = removed[0];

                if (typeof insertIndexOrNewParent === 'number') {
                    items.splice(insertIndexOrNewParent, null, removedItem);
                    options.onMove(obj, removeIndex, obj, insertIndexOrNewParent, removedItem);
                } else {
                    insertIndexOrNewParent.addChild(newParentInsertIndex, removedItem);
                    var newParent = insertIndexOrNewParent.unwrap();
                    options.onMove(obj, removeIndex, newParent, newParentInsertIndex, removedItem);
                }
                return this;
            },
            unwrap: function() {
                return obj;
            },
            traverse: function(callback) {
                traverse(obj, parent, 0, 0, callback);
            }
        };
    }

    function traverse(item, parent, index, depth, callback) {
        callback(item, parent, index++, depth);

        var children = item[childrenProp];
        if (!children) {
            return index;
        }

        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            index = traverse(child, item, index, depth + 1, callback);
        }

        return index;
    }

    function getOrCreateChildItems(obj) {
        var arr = obj[childrenProp];
        if (!arr) {
            arr = [];
            obj[childrenProp] = arr;
        }
        return arr;
    }
}));
