(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.TreeObserver = factory();
    }
}(this, function () {

    function TreeObserver() {
        var noOp = function(){};

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

    return TreeObserver;
}));
