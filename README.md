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

## Item

### Static Methods

#### From

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

### Constructor

```ts
/**
 * Constructor
 * @param [name] Name
 * @param [value] Value
 * @param [children] Children Items
 * @param [meta] Meta
 */
constructor(name: string, value: any, children: Item[] = [], meta: Record<any, any> = {})
```

### Instance Properties

| Name     | Type              | Description                          |
| -------- | ----------------- | ------------------------------------ |
| name     | string            | Text for label.                      |
| value    | any               | Value.                               |
| meta     | Record            | Any extra custom data.               |
| parent   | Item \| undefined | Ascendant item.                      |
| children | Item[]            | Descendant items.                    |
| chain    | Item[]            | Items from root item to this item.   |
| level    | int               | Level in tree structure, 0 for root. |

### Instance Methods

#### traversePreOrder

```ts
/**
 * Traverse Pre Order
 * @description By depth, root previously.
 * @param [process] Process Function (With `true` returned, the traversal stops.)
 * @return If Interrupted
 */
traversePreOrder(process: (item: Item) => boolean | void): boolean
```

#### traversePostOrder

```ts
/**
 * Traverse Post Order
 * @description By depth, root lately.
 * @param [process] Process Function (With `true` returned, the traversal stops.)
 * @return If Interrupted
 */
traversePostOrder(process: (item: Item) => boolean | void): boolean
```

#### update

```ts
/**
 * Update
 * @description Replace the value with the given item. Identified by name.
 * @param [other] Other Item
 */
update(other: Item): void
```

#### copy

```ts
/**
 * Copy
 * @return New Item
 */
copy(): Item
```

#### map

```ts
/**
 * Map
 * @param [transform] Transform Function which Returns the New Value
 * @return New Item
 */
map(transform: (item: Item) => any): Item
```

#### filter

```ts
/**
 * Filter
 * @description Filtering by members out of the value is not supported.
 * @param [identify] Identify Function
 * @param [reserve] Reserve the Identified Children Items even if the Parent Node is not Identified
 * @return New Item
 */
filter(identify: (item: Item) => boolean, reserve = true): Item
```

#### prune

```ts
/**
 * Prune
 * @description Remove the items whose level is equal or larger than the targeted level.
 * @param [level] Level. Should Larger than or Equal 1
 * @return New Item
 */
prune(level = 1): Item
```

#### all

```ts
/**
 * All
 * @description All Items of All Levels
 * @return Item Array
 */
all(): Item[]
```

#### extract

```ts
/**
 * Extract
 * @param [level] Level
 * @return Item Array
 */
extract(level = 1): Item[]
```

#### find

```ts
/**
 * Find
 * @param [identify] Identify Function
 * @return Target
 */
find(identify: (item: Item) => boolean): Item | undefined
```

#### trace

```ts
/**
 * Trace
 * @param [target] Target
 * @return Item Array
 */
trace(target: Item): Item[] | undefined
```

## Items

### Static Methods

#### from

```ts
/**
 * Resolve from Json Array
 * @type [T] Value Type
 * @param [array] Array
 * @return New Item Array
 */
static from<T = any>(array: ItemType[]): Item<T>[]
```

#### fromWith

```ts
/**
 * From With
 * @description Map from Any Array Tree
 * @type [T] Value Type
 * @param [array] Array
 * @param [identifyName] Identify Name
 * @param [identifyValue] Identify Value
 * @param [identifyChildren] Identify Children
 * @return New Item Array
 */
static fromWith<T = any>(array: any[], identifyName: (origin: any) => string, identifyValue: (origin: any) => any, identifyChildren: (origin: any) => []): Item<T>[]
```

#### traversePreOrder

```ts
/**
 * Traverse Pre Order
 * @type [T] Item Type
 * @param [array] Array
 * @param [process] Process Function (With `true` returned, the traversal stops.)
 * @return If Interrupted
 */
static traversePreOrder<T extends Item = Item>(array: T[], process: (item: T) => boolean | void): boolean
```

#### traversePostOrder

```ts
/**
 * Traverse Post Order
 * @type [T] Item Type
 * @param [array] Array
 * @param [process] Process Function (With `true` returned, the traversal stops.)
 * @return If Interrupted
 */
static traversePostOrder<T extends Item = Item>(array: T[], process: (item: T) => boolean | void): boolean
```

#### update

```ts
/**
 * Update
 * @type [T] Item Type
 * @param [array] Array
 * @param [others] Other Array
 */
static update<T extends Item = Item>(array: T[], others: T[]): void
```

#### copy

```ts
/**
 * Copy
 * @type [T] Item Type
 * @param [array] Array
 * @return New Item Array
 */
static copy<T extends Item = Item>(array: T[]): T[]
```

#### map

```ts
/**
 * Map
 * @type [T] Item Type
 * @param [array] Array
 * @return New Item Array
 */
static map<T extends Item = Item, U extends Item = Item>(array: T[], transform: (item: T) => any): U[]
```

#### filter

```ts
/**
 * Filter
 * @type [T] Item Type
 * @param [array] Array
 * @param [identify] Identify Function
 * @param [reserve] Reserve
 * @return New Item Array
 */
static filter<T extends Item = Item>(array: T[], identify: (item: T) => boolean, reserve = true): T[]
```

#### prune

```ts
/**
 * Prune
 * @type [T] Item Type
 * @param [array] Array
 * @param [level] Level
 * @return New Item Array
 */
static prune<T extends Item = Item>(array: T[], level = 1): T[]
```

#### all

```ts
/**
 * All
 * @type [T] Item Type
 * @param [array] Array
 * @return All Nodes
 */
static all<T extends Item = Item>(array: T[]): T[]
```

#### extract

```ts
/**
 * Extract
 * @type [T] Item Type
 * @param [array] Array
 * @param [level] Level
 * @return Item Array
 */
static extract<T extends Item = Item>(array: T[], level = 1): T[]
```

#### find

```ts
/** Find
 * @type [T] Item Type
 * @param [array] Array
 * @param [identify] Identify Function
 * @return Target
 */
static find<T extends Item = Item>(array: T[], identifier: (item: T) => boolean): T | undefined
```

#### trace

```ts
/**
 * Trace
 * @type [T] Item Type
 * @param [array] Array
 * @param [target] Target
 * @return Item Array
 */
static trace<T extends Item = Item>(array: T[], target: T): T[] | undefined
```
