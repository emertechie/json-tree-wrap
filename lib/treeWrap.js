(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['lodash'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('lodash'));
    } else {
        root.treeWrap = factory(root._);
    }
}(this, function (_) {

    var theDefaults;
    var childrenProp;
    var noOp = function(){};

    function setUpDefaults(defaults) {
        theDefaults = _.defaults(defaults || {}, {
            childrenProp: 'items',
            onInit: noOp,
            onAdd: noOp,
            onRemove: noOp,
            onMove: noOp
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

            var parent = null;
            return createWrapper(obj, parent, options);
        }
    };

    function createWrapper(obj, parent, options) {
        return {
            options: options,
            getChild: function(index) {
                var items = getOrCreateChildItems(obj);
                return createWrapper(items[index], obj, options);
            },
            addChild: function(index, newObj) {
                var items = getOrCreateChildItems(obj);
                items.splice(index, null, newObj);
                options.onAdd(obj, index, newObj);
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
