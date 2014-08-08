(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['lodash'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('lodash'));
    } else {
        root.returnExports = factory(root._);
    }
}(this, function (_) {

    var options;
    var childrenProp;
    var noOp = function(){};

    function setUpDefaults(options) {
        options = options || {};
        childrenProp = options.childrenProp || 'items';
    }

    setUpDefaults();

    return {
        defaults: function(options) {
            setUpDefaults(options);
        },
        wrap: function(obj, options) {
            options = _.defaults(options || {}, {
                onAdd: noOp,
                onRemove: noOp,
                onUpdate: noOp,
                onMove: noOp
            });

            return createWrapper(obj || {}, null, options);
        }
    };

    function createWrapper(obj, parent, options) {
        return {
            // parent: parent,   << untested
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
            move: function(removeIndex, insertIndex) {
                var items = getOrCreateChildItems(obj);
                var removed = items.splice(removeIndex, 1);
                if (!removed.length) {
                    return;
                }
                items.splice(insertIndex, null, removed[0]);
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
