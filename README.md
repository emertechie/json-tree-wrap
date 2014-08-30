[![Build Status](https://travis-ci.org/emertechie/json-tree-wrap.svg)](https://travis-ci.org/emertechie/json-tree-wrap)

# json-tree-wrap

Wrappers for hierarchical JSON objects that support manipulation, events, traversal
and dynamic flattening to an array - useful for UI binding.

# Install

Available via npm and bower

`npm install json-tree-wrap`

`bower install json-tree-wrap`

Or you can just include the following script files to set up 'TreeWrapper', 'TreeFlattener' and 'TreeObserver' browser globals:

```html
  <script src="components/json-tree-wrap/lib/polyfills.js"></script>
  <script src="components/json-tree-wrap/lib/treeWrapper.js"></script>
  <script src="components/json-tree-wrap/lib/treeObserver.js"></script>
  <script src="components/json-tree-wrap/lib/treeFlattener.js"></script>
```

# Overview

## TreeWrapper

The `TreeWrapper` class is the core type used to wrap a JSON object. It returns `TreeItemWrapper` instances which have methods to add/move/remove child items under that item. An optional `TreeObserver` instance can be used to listen for modifications made via the API and fire callbacks.

### TreeWrapper Basic Usage
```js
var json = {
  name: 'Root item',
  items: [{
    name: 'Child item 1',
    items: [{
      name: 'Child item 2'
    }]
  }]
};

var observer = new TreeObserver();
var treeWrapper = new TreeWrapper({
    childrenProp: 'items' // the default
    observer: observer    // optional observer for changes made via API
});

var rootItemWrapper = treeWrapper.wrap(json);
rootItemWrapper.addChild(...)
```

The `TreeWrapper` type assumes each JSON object it wraps has a single root item as shown in example above. The `treeWrapper.wrap` function returns a `TreeItemWrapper` for that root item. You then use the `getChild` function to drill down and get `TreeItemWrapper` instances for other items in the tree.

If you have a reference to an item in the tree and it's parent, you can create a `TreeItemWrapper` instance at any time by calling the `TreeWrapper`'s `createItemWrapper` function.

## TreeFlattener

The `TreeFlattener` class uses the `TreeObserver` to dynamically maintain a flat `Array` of item wrappers for each item in the underlying hierarchical JSON object. Each flat item wrapper has the following properties:

Property | Description
---------|------------
depth    | 0-based integer of how nested the item is. Root items have depth 0, first level children have depth 1 etc. 
item     | reference to the item in the underlying JSON object
parent   | reference to the parent item (null for root items) in the underlying JSON object

You can pass the `item` and `parent` references into the `TreeWrapper` `createItemWrapper` function mentioned above to create a `TreeItemWrapper` instance for any item in the flat `Array`.

### Basic TreeFlattener Example:
```js
var json = {
  name: 'Root item',
  items: [{
    name: 'Child item 1',
    items: [{
      name: 'Child item 2'
    }]
  }]
};

var treeObserver = new TreeObserver();
var treeWrapper = new TreeWrapper({ observer: treeObserver });
var treeFlattener = new TreeFlattener(treeWrapper, treeObserver);

treeWrapper.wrap(json);

var flatItemWrappers = treeFlattener.getItems();
```

So `flatItemWrappers` from above example would contain:

    [{
        depth: 0,
        item: (ref to 'Root item')
        parent: null
    }, {
        depth: 1,
        item: (ref to 'Child item 1')
        parent: (ref to 'Root item')
    }, {
        depth: 2,
        item: (ref to 'Child item 2')
        parent: (ref to 'Child item 1')
    }]

## Extending the Flat Item Wrappers

The flat item wrapper instances are a handy place to add on additional UI-specific properties, like a temporary item ID or an 'isSelected' state for example, without interfering with the underlying JSON object.

#### Assigning a temporary ID

```
var json = {
  name: 'Root item',
  items: [{
    name: 'Child item 1'
  }]
};

var treeObserver = new TreeObserver();
var treeWrapper = new TreeWrapper({ observer: treeObserver });

var lastId = 99;
var treeFlattener = new TreeFlattener(treeWrapper, treeObserver, {
    onWrapperCreated: function(wrapper) {
        wrapper.id = ++lastId;
    }
});

treeWrapper.wrap(json);

var flatItemWrappers = treeFlattener.getItems();
```

`flatItemWrappers` would contain:

    [{
        id: 100,
        depth: 0,
        item: (ref to 'Root item')
        parent: null
    }, {
        id: 101,
        depth: 1,
        item: (ref to 'Child item 1')
        parent: (ref to 'Root item')
    }]

#### Set an 'isSelected' flag for all new items

```
var json = {
  name: 'Root item',
  items: []
};

var treeObserver = new TreeObserver();
var treeWrapper = new TreeWrapper({ observer: treeObserver });

var lastId = 99;
var treeFlattener = new TreeFlattener(treeWrapper, treeObserver, {
    onWrapperCreated: function(wrapper, stateObj) {
        wrapper.isSelected = stateObj ? !!stateObj.isSelected : false;
    }
});

var rootWrapper = treeWrapper.wrap(json);

var flatItemWrappers = treeFlattener.getItems();

rootWrapper.addChild(0, { name: 'New item' }, { isSelected: true });
```

`flatItemWrappers` would contain:

    [{
        isSelected: false,
        depth: 0,
        item: (ref to 'Root item')
        parent: null
    }, {
        isSelected: true,
        depth: 1,
        item: (ref to 'New item')
        parent: (ref to 'Root item')
    }]

# TreeObserver

Simple class that enables notifications when changes made to underlying JSON object via the `TreeItemWrapper API`.

#### new TreeObserver()

Constructor

#### attach(delegateObj)

`delegateObj` can define the following optional properties. 

  - `onInit` `function(parent, index, item, depth)` onInit is called for each existing item in the JSON object when it is first wrapped.
  - `onAdd` `function(parent, index, item, stateObj)`  
  - `onRemove` `(parent, index, item)`  
  - `onMove` `(oldParent, oldIndex, newParent, newIndex, item)` 

```js
var observer = new TreeObserver();
observer.attach({
    onAdd: function(parent, index, item, stateObj) {
    }
    // ...
});

```

# TreeWrapper API

#### `new TreeWrapper(options)`

Constructor with following options:

  - `childrenProp` Name of the child items property. Defaults to `'items'`
  - `observer` An optional `TreeObserver` instance that will be notified when the tree is manipulated via the TreeItemWrapper API.

#### `wrap(jsonObject)`
 
Returns a `TreeItemWrapper` that can be used to traverse / manipulate the _root_ item. 
From the root item you can navigate to all child items via `getChildItem` function.
 
If a `TreeObserver` instance is passed to the `TreeWrapper` constructor, then `wrap`
will also `traverse` the tree and call `TreeObserver.onInit` for each item.  

#### `createItemWrapper(item, parent)`

Returns a `TreeItemWrapper` instance for the given item and it's parent.

#### `traverse(jsonObject, callback)`

Traverses the hierarchical jsonObject and calls `callback` for each item encountered. 
If a custom `childrenProp` was configured in the constructor this is used to 
navigate the tree.

# TreeItemWrapper API

#### `getChild(index)`

Returns a `TreeItemWrapper` for the child at the given `index`.  

#### `addChild(index, newObj, stateObj)`

Inserts `newObj` at given `index` under this tree item.
Will call `TreeObserver.onAdd` if an observer was configured in the `TreeWrapper` constructor.
 
`stateObj` is an optional object that is passed through to `TreeObserver.onAdd`. It's 
useful for initializing properties on the flattened item wrappers created by `TreeFlattener`. 
See `TreeFlattener` section below for an example.

Example:
```js
var json = {
    name: 'root item',
    items: [{
        name: 'child item 1'
    }]
};

var treeWrapper = new TreeWrapper();
var rootWrapper = treeWrapper.wrap(json);
rootWrapper.addChild(0, {
    name: 'new item'
});

assert.deepEqual(json, {
    name: 'root item',
    items: [{
        name: 'new item'    
    }, {
        name: 'child item 1'
    }]
});
```

#### `addChildAtEnd(newObj, stateObj)`

Convenience function that calls `addChild` to insert `newObj` as the last child under this item.

#### `addAbove(newObj, stateObj)`

Convenience function that calls `addChild` to insert `newObj` directly above this item (under the same parent).

Example:
```js
var json = {
    name: 'root item',
    items: [{
        name: 'child item 1'
    }]
};

var treeWrapper = new TreeWrapper();
var rootWrapper = treeWrapper.wrap(json);
var child1Wrapper = rootWrapper.getChild(0);

child1Wrapper.addAbove({
    name: 'new item'
});

assert.deepEqual(json, {
    name: 'root item',
    items: [{
        name: 'new item'    
    }, {
        name: 'child item 1'
    }]
});
```

#### `addBelow(newObj, stateObj)`

Convenience function that calls `addChild` to insert `newObj` directly below this item (under the same parent).

Example:
```js
var json = {
    name: 'root item',
    items: [{
        name: 'child item 1'
    }]
};

var treeWrapper = new TreeWrapper();
var rootWrapper = treeWrapper.wrap(json);
var child1Wrapper = rootWrapper.getChild(0);

child1Wrapper.addBelow({
    name: 'new item'
});

assert.deepEqual(json, {
    name: 'root item',
    items: [{
        name: 'child item 1'
    }, {
       name: 'new item'    
   }]
});
```

#### `remove()`

Removes this item from it's parent.

Will call `TreeObserver.onRemove` if an observer was configured in the `TreeWrapper` constructor.

#### `removeChild(index)`

Removes the child item at the given `index`.

Will call `TreeObserver.onRemove` if an observer was configured in the `TreeWrapper` constructor.

#### `moveChild(removeIndex, insertIndex)`

This form moves a child item under this instance from `removeIndex` to `insertIndex`.

Will call `TreeObserver.onMove` if an observer was configured in the `TreeWrapper` constructor.

#### `moveChild(removeIndex, newParent, newParentInsertIndex)`

This form moves a child item from `removeIndex` under this instance and inserts it at `newParentInsertIndex`
under the `newParent` instance.

Will call `TreeObserver.onMove` if an observer was configured in the `TreeWrapper` constructor.

Example:
```js
var json = {
    items: [{
        name: 'item 1'
    },{
        name: 'item 2'
    }]
};

var rootWrapper = treeWrapper.wrap(json);
var item1Wrapper = rootWrapper.getChild(0);

// Move item 2 under item 1:
rootWrapper.moveChild(1, item1Wrapper, 0);

assert.deepEqual(rootWrapper.unwrap(), {
    items: [{
        name: 'item 1',
        items: [{
            name: 'item 2'
        }]
    }]
});
```

#### unwrap()

Returns the underlying JSON object.

#### traverse(callback)

Traverses the underlying hierarchical jsonObject and calls `callback` for each item encountered.   

# TreeFlattener API

#### new TreeFlattener(treeWrapper, treeObserver, options)

Constructor with following options:

  - `includeRoot` Whether the root item is included in the flattened items or not
  - `onWrapperCreated` `function(itemWrapper, stateObj)` Callback triggered each time a new wrapper is created, via `TreeObserver` callbacks. If wrapper created as a result of an `onInit` `TreeObserver` callback then `stateObj` will be null. If called as a result of `onAdd`, then the optional `stateObj` will be passed through.

#### getItems()

Returns a reference to the array of flattened items being maintained by the `TreeFlattener` instance. This array will be updated as items are added/removed/moved via the `TreeItemWrapper` API.

# Licence
MIT
