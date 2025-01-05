/**
 * Item Type
 * @type [T] Value Type
 */
interface ItemType<T = any> extends Record<any, any> {
  name: string;
  value?: T;
  children?: ItemType<T>[];
  meta?: Record<any, any>;
}

/**
 * Item
 * @type [T] Value Type
 */
class Item<T = any> implements ItemType<T> {
  /**
   * Assign Extra
   * @param [item] Item
   * @param [extra] Extra Data Excepts Name, Value, Children, Meta
   */
  private static assignExtra(item: Item, extra: any) {
    for (let i in extra) {
      if (!['childrenProxyHandler', '_children', 'children', 'name', 'value', 'parent', 'meta'].includes(i)) {
        (item as any)[i] = extra[i];
      }
    }
  }
  /**
   * From
   * @description Properties not in ItemType will be preserved.
   * @Type [U] Value Type
   * @param [object] Object
   * @return New Item
   */
  static from<U = any>(object: ItemType): Item<U> {
    let item = new Item<U>(
      object['name'],
      object['value'],
      object['children']?.map((a: any) => Item.from<U>(a)),
      object['meta']
    );

    Item.assignExtra(item, object);

    return item;
  }

  private _children: (typeof this)[] = [];
  private _childrenProxyHandler = {
    set: (target: Item[], key: string | symbol, value: any, receiver: any) => {
      let res = Reflect.set(target, key, value, receiver);
      for (let a of target) {
        a.parent = this;
      }

      return res;
    }
  };
  name: string;
  value: T;
  parent?: typeof this;
  meta: Record<any, any>;

  set children(v) {
    for (let a of v) {
      a.parent = this;
    }
    this._children = new Proxy<this[]>(v, this._childrenProxyHandler);
  }
  get children() {
    return this._children;
  }
  get chain() {
    let temp: Item[] = [];
    let current: Item | undefined = this;
    while (current) {
      temp.push(current);
      current = current.parent;
    }

    return temp.reverse();
  }
  get level() {
    let temp = 0;
    let current: Item = this;
    while (current.parent) {
      current = current.parent;
      temp++;
    }

    return temp;
  }

  /**
   * Constructor
   * @param [name] Name
   * @param [value] Value
   * @param [children] Children Items
   * @param [meta] Meta
   */
  constructor(name: Item['name'], value: Item['value'], children: Item['children'] = [], meta: Item['meta'] = {}) {
    this.name = name;
    this.value = value;
    this.children = children as (typeof this)[];
    this.meta = meta;
  }

  /**
   * Create
   * @param [name] Name
   * @param [value] Value
   * @param [children] Children Items
   * @param [meta] Meta
   * @param [args] Rest Arguments
   * @return New Item
   */
  private _create(name: Item['name'], value: Item['value'], children: Item['children'] = [], meta: Item['meta'] = {}, ...args: any[]): typeof this {
    let object = new (Object.getPrototypeOf(this).constructor)(name, value, children, meta, ...args);
    Item.assignExtra(object, this);

    return object;
  }
  /**
   * Traverse Pre Order
   * @description By depth, root previously.
   * @param [process] Process Function (With `true` returned, the traversal stops.)
   * @return If Interrupted
   */
  traversePreOrder(process: (item: typeof this) => boolean | void): boolean {
    if (!process(this)) {
      if (this.children) {
        for (let a of this.children) {
          if (a.traversePreOrder(process)) {
            return true;
          }
        }
      }

      return false;
    } else {
      return true;
    }
  }
  /**
   * Traverse Post Order
   * @description By depth, root lately.
   * @param [process] Process Function (With `true` returned, the traversal stops.)
   * @return If Interrupted
   */
  traversePostOrder(process: (item: typeof this) => boolean | void): boolean {
    if (this.children) {
      for (let a of this.children) {
        if (a.traversePostOrder(process)) {
          return true;
        }
      }
    }

    return process(this) ?? false;
  }
  /**
   * Update
   * @description Replace the value with the given item. Identified by name.
   * @param [other] Other Item
   */
  update(other: typeof this): void {
    this.value = other.value;

    let temp: (typeof this)[] = [];
    for (let a of other.children) {
      let target = this.children.find(b => b.name === a.name);
      if (target) {
        target.update(a);
        temp.push(target);
      } else {
        temp.push(a);
      }
    }
    this.children = temp;
  }
  /**
   * Copy
   * @return New Item
   */
  copy(): typeof this {
    let item = this._create(
      this.name,
      this.value,
      this.children.map(a => a.copy()),
      Object.assign({}, this.meta)
    );

    Item.assignExtra(item, this);

    return item;
  }
  /**
   * Map
   * @param [transform] Transform Function which Returns the New Value
   * @return New Item
   */
  map(transform: (item: typeof this) => any): typeof this {
    let item = this._create(
      this.name,
      transform(this),
      this.children.map(a => a.map(transform)),
      Object.assign({}, this.meta)
    );

    Item.assignExtra(item, this);

    return item;
  }
  /**
   * Filter
   * @description Filtering by members out of the value is not supported.
   * @param [identify] Identify Function
   * @param [reserve] Reserve the Identified Children Items even if the Parent Node is not Identified
   * @return New Item
   */
  filter(identify: (item: typeof this) => boolean, reserve = true): typeof this {
    let item = this._create(
      this.name,
      this.value,
      this.children.map(a => a.filter(identify)).filter(a => identify(a) || (reserve && a.children.length)),
      Object.assign({}, this.meta)
    );

    Item.assignExtra(item, this);

    return item;
  }
  /**
   * Prune
   * @description Remove the items whose level is equal or larger than the targeted level.
   * @param [level] Level. Should Larger than or Equal 1
   * @return New Item
   */
  prune(level = 1): typeof this {
    let result = this.copy();
    result.traversePostOrder(a => {
      if (a.level === level - 1) {
        a.children = [];
      }
    });

    return result;
  }
  /**
   * All
   * @description Deep first, root first.
   * @return All Items of All Levels
   */
  all(): (typeof this)[] {
    let temp: any[] = [];
    this.traversePreOrder(a => void temp.push(a));

    return temp;
  }
  /**
   * Extract
   * @param [level] Level
   * @return Item Array
   */
  extract(level = 1) {
    let current = [this];
    for (let i = 1; i <= level; i++) {
      current = current.map(a => a.children ?? []).flat();
    }

    return current;
  }
  /**
   * Find
   * @param [identify] Identify Function
   * @return Target
   */
  find(identify: (item: typeof this) => boolean) {
    let result: typeof this | undefined;
    this.traversePreOrder(a => {
      if (identify(a)) {
        result = a;

        return true;
      } else {
        return false;
      }
    });

    return result;
  }
  /**
   * Trace
   * @param [target] Target
   * @return Item Array
   */
  trace(target: typeof this) {
    let temp: (typeof this)[] = [];
    const dfs = (current: typeof this) => {
      if (current == target) {
        temp.push(current);

        return true;
      }

      if (current.children != null) {
        for (let a of current.children!) {
          if (dfs(a)) {
            temp.push(current);

            return true;
          }
        }

        return false;
      } else {
        return false;
      }
    };

    if (dfs(this)) {
      return temp.reverse();
    } else {
      return null;
    }
  }
}

/**
 * Items
 */
class Items {
  /**
   * Resolve from Json Array
   * @type [T] Value Type
   * @param [array] Array
   * @return New Item Array
   */
  static from<T = any>(array: ItemType[]) {
    return array.map((a: any) => Item.from<T>(a));
  }
  /**
   * From With
   * @description Map from Any Array to Item Array
   * @type [T] Value Type
   * @param [array] Array
   * @param [identifyName] Identify Name
   * @param [identifyValue] Identify Value
   * @return New Item Array
   */
  static fromWith<T = any>(array: any[], identifyName: (origin: any) => string, identifyValue: (origin: any) => any = (origin: any) => origin): Item<T>[] {
    return array.map(a => new Item<T>(identifyName(a), identifyValue(a)));
  }
  /**
   * From Tree
   * @description Map from Any Array Tree
   * @type [T] Value Type
   * @param [array] Array
   * @param [identifyName] Identify Name
   * @param [identifyValue] Identify Value
   * @param [identifyChildren] Identify Children
   * @return New Item Array
   */
  static fromTree<T = any>(array: any[], identifyName: (origin: any) => string, identifyValue: (origin: any) => any, identifyChildren: (origin: any) => []): Item<T>[] {
    return array.map(a => {
      let children = identifyChildren(a) ?? [];

      return new Item<T>(identifyName(a), identifyValue(a), children.length ? Items.fromTree(children, identifyName, identifyValue, identifyChildren) : []);
    });
  }
  /**
   * Traverse Pre Order
   * @type [T] Item Type
   * @param [array] Array
   * @param [process] Process Function (With `true` returned, the traversal stops.)
   * @return If Interrupted
   */
  static traversePreOrder<T extends Item = Item>(array: T[], process: (item: T) => boolean | void): boolean {
    for (let a of array) {
      if (a.traversePreOrder(process)) {
        return true;
      }
    }

    return false;
  }
  /**
   * Traverse Post Order
   * @type [T] Item Type
   * @param [array] Array
   * @param [process] Process Function (With `true` returned, the traversal stops.)
   * @return If Interrupted
   */
  static traversePostOrder<T extends Item = Item>(array: T[], process: (item: T) => boolean | void): boolean {
    for (let a of array) {
      if (a.traversePostOrder(process)) {
        return true;
      }
    }

    return false;
  }
  /**
   * Update
   * @type [T] Item Type
   * @param [array] Array
   * @param [others] Other Array
   */
  static update<T extends Item = Item>(array: T[], others: T[]): void {
    for (let a of others) {
      let target = array.find(b => b.name === a.name);
      if (target) {
        target.update(a);
      }
    }
  }
  /**
   * Copy
   * @type [T] Item Type
   * @param [array] Array
   * @return New Item Array
   */
  static copy<T extends Item = Item>(array: T[]) {
    return array.map(a => a.copy());
  }
  /**
   * Map
   * @type [T] Item Type
   * @param [array] Array
   * @return New Item Array
   */
  static map<T extends Item = Item, U extends Item = Item>(array: T[], transform: (item: T) => any) {
    return array.map(a => a.map(transform)) as unknown as U[];
  }
  /**
   * Filter
   * @type [T] Item Type
   * @param [array] Array
   * @param [identify] Identify Function
   * @param [reserve] Reserve
   * @return New Item Array
   */
  static filter<T extends Item = Item>(array: T[], identify: (item: T) => boolean, reserve = true) {
    return array.map(a => a.filter(identify, reserve)).filter(a => identify(a) || (reserve && a.children.length));
  }
  /**
   * Prune
   * @type [T] Item Type
   * @param [array] Array
   * @param [level] Level
   * @return New Item Array
   */
  static prune<T extends Item = Item>(array: T[], level = 1) {
    return array.map(a => a.prune(level));
  }
  /**
   * All
   * @type [T] Item Type
   * @param [array] Array
   * @return All Nodes
   */
  static all<T extends Item = Item>(array: T[]) {
    return array.map(a => a.all()).flat();
  }
  /**
   * Extract
   * @type [T] Item Type
   * @param [array] Array
   * @param [level] Level
   * @return Item Array
   */
  static extract<T extends Item = Item>(array: T[], level = 1) {
    return array.map(a => a.extract(level)).flat();
  }
  /** Find
   * @type [T] Item Type
   * @param [array] Array
   * @param [identify] Identify Function
   * @return Target
   */
  static find<T extends Item = Item>(array: T[], identifier: (item: T) => boolean) {
    for (let a of array) {
      let target = a.find(identifier);
      if (target) {
        return target;
      }
    }

    return undefined;
  }
  /**
   * Trace
   * @type [T] Item Type
   * @param [array] Array
   * @param [target] Target
   * @return Item Array
   */
  static trace<T extends Item = Item>(array: T[], target: T) {
    for (let a of array) {
      let temp = a.trace(target);
      if (temp) {
        return temp;
      }
    }

    return null;
  }
}

export { Item, Items, ItemType };
