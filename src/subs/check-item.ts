import { Item } from '../core/item';

/**
 * Check Item
 * @type [T] Value Type
 */
class CheckItem<T = any> extends Item<T> {
  /**
   * From Item
   * @type [U] Value Type
   * @param [source] Source
   * @param [assign] Assign Default Check
   * @return Object
   */
  static fromItem<U = any>(source: Item<U>, assign?: (result: CheckItem<U>, origin: Item<U>) => ItemCheck | void): CheckItem<U> {
    let item = new this<U>(
      source.name,
      source.value,
      source.children?.map(a => CheckItem.fromItem(a, assign)),
      source.meta
    );
    Item._assignExtra(item, source);

    let origin = (source as CheckItem).check ?? {};
    item.check = Object.assign(assign?.(item, source) ?? item.check, origin);

    return item;
  }
  /**
   * Decorate Existed Item
   * @type [U] Value Type
   * @param [source] Source
   * @param [assign] Assign Default Check
   * @return Original Object
   */
  static decorateItem<U = any>(source: Item<U>, assign?: (origin: Item<U>) => ItemCheck | void): CheckItem<U> {
    for (let a of source.children) {
      this.decorateItem(a, assign);
    }

    let origin = (source as any).check ?? {};
    let item = source as CheckItem;
    Object.setPrototypeOf(item, CheckItem.prototype);
    item.check = Object.assign(assign?.(source) ?? new ItemCheck(item), origin);

    return item;
  }

  check: ItemCheck;

  /**
   * Constructor
   * @param [name] Name
   * @param [value] Value
   * @param [children] Children Nodes
   * @param [meta] Meta
   * @param [check] Check Data
   */
  constructor(name: Item['name'], value: Item['value'], children?: Item['children'], meta: Item['meta'] = {}, check?: ItemCheck) {
    super(name, value, children, meta);

    this.check = check ?? new ItemCheck(this);
  }
}

/**
 * Item Check
 */
class ItemCheck {
  _checked = false;
  item: CheckItem;
  unlink = false; // The parent and children do not affect each other.

  get checked(): boolean {
    if (this.unlink) {
      return this._checked;
    } else {
      if (this.item.children.length) {
        return this.item.children.every(a => a.check?.checked);
      } else {
        return this._checked;
      }
    }
  }
  set checked(value) {
    this._checked = value;

    if (!this.unlink && this.item) {
      // The item is undefined when constructing.
      for (let a of this.item.children) {
        if (a.check) {
          a.check.checked = value;
        }
      }
    }
  }
  get indeterminate() {
    if (this.unlink || !this.item.children.length) {
      return false;
    } else {
      let count = 0;
      for (let a of this.item.children) {
        if (a.check?.indeterminate) {
          return true;
        } else if (a.check?.checked) {
          count++;
        }
      }

      return count !== 0 && count !== this.item.children.length;
    }
  }

  /**
   * Constructor
   * @param [item] Host Item
   * @param [checked] Checked
   * @param [unlink] Unlink
   */
  constructor(item: Item, checked: ItemCheck['checked'] = false, unlink: ItemCheck['unlink'] = false) {
    this.checked = checked;
    this.unlink = unlink;
    this.item = item as CheckItem; // Lastly assigned to prevent children nodes from modifying by the checked assignment.
  }
}

export { CheckItem, ItemCheck };
