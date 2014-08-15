(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['./polyfills.js'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('./polyfills.js'));
    } else {
        root.TreeObserver = factory(root.jsonTreeWrapPolyfills);
    }
}(this, function (polyfills) {

    polyfills();

    function TreeObserver() {
        this.handlers = [];
    }

    TreeObserver.prototype = {
        attach: function(delegates) {
            this.handlers.push(delegates);
        },
        onInit: function(parent, item, index, depth) {
            for (var i = 0; i < this.handlers.length; i++) {
                var handlers = this.handlers[i];
                if (handlers.onInit) {
                    handlers.onInit(parent, item, index, depth);
                }
            }
        },
        onAdd: function(parent, index, item) {
            for (var i = 0; i < this.handlers.length; i++) {
                var handlers = this.handlers[i];
                if (handlers.onAdd) {
                    handlers.onAdd(parent, index, item);
                }
            }
        },
        onRemove: function(parent, index, item) {
            for (var i = 0; i < this.handlers.length; i++) {
                var handlers = this.handlers[i];
                if (handlers.onRemove) {
                    handlers.onRemove(parent, index, item);
                }
            }
        },
        onMove: function(oldParent, oldIndex, newParent, newIndex, item) {
            for (var i = 0; i < this.handlers.length; i++) {
                var handlers = this.handlers[i];
                if (handlers.onMove) {
                    handlers.onMove(oldParent, oldIndex, newParent, newIndex, item);
                }
            }
        }
    };

    return TreeObserver;
}));
