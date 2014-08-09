(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['lodash'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('lodash'));
    } else {
        root.returnExports = factory(root._);
    }
}(this, function (_) {

    var theDefaults;
    var childrenProp;
    var noOp = function(){};

    function setUpDefaults(defaults) {
        theDefaults = _.defaults(defaults || {}, {
            childrenProp: 'items',
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
            options = _.defaults(options || {}, theDefaults);
            return createWrapper(obj || {}, null, options);
        }
    };

    function createWrapper(obj, parent, options) {
        return {
            // parent: parent,   << untested
            options: options,
            get: function(index) {
                var items = getOrCreateChildItems(obj);
                return createWrapper(items[index], obj, options);
            },
            add: function(index, newObj) {
                var items = getOrCreateChildItems(obj);
                items.splice(index, null, newObj);
                options.onAdd(obj, index, newObj);
                return this;
            },
            remove: function(index) {
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
                    insertIndexOrNewParent.add(newParentInsertIndex, removedItem);
                    var newParent = insertIndexOrNewParent.unwrap();
                    options.onMove(obj, removeIndex, newParent, newParentInsertIndex, removedItem);
                }
                return this;
            },
            unwrap: function() {
                return obj;
            }
        };
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
