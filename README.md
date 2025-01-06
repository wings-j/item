Item with name, value and children (like a tree). Especially useful for selections whose text for the users are different with the data for programmes.

Items can be used in selections which has a name for users to view and a corresponding value for codes. By property `children`, whose elements are also `Item`, an item can be treated as a tree node. By methods of the `Item` and static methods of the `Items`, items can be operated like a tree.

# Installation

```sh
npm install @wings-j/item
```

# Usage

Example:

```js
let item = new Item('$', null, [new Item('0', 0), new Item('1', 1), new Item('2', 2)], { x: 0 });
```

More examples can be found in [test/core.item.test.js](test/core.item.test.js).

# API

## Constructor

```ts
/**
 * Constructor
 * @param [name] Name
 * @param [value] Value
 * @param [children] Children Items
 * @param [meta] Meta
 */
constructor(name: Item['name'], value: Item['value'], children: Item['children'] = [], meta: Item['meta'] = {})
```

## Instance Properties

| Name | Type | Description |
| ---- | ---- | ----------- |

// TODO

## Static Methods

### From

```ts
/**
 * From
 * @description Properties not in ItemType will be preserved.
 * @Type [U] Value Type
 * @param [object] Object
 * @return New Item
 */
static from<U = any>(object: ItemType): Item<U>
```
