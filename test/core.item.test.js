import jest from 'jest-mock';
import { Item, Items } from '../dist';

const createItem = () => new Item('$', null, [new Item('0', 0), new Item('1', 1), new Item('2', 2)], { x: 0 });
const createItems = () => [
  new Item('$0', null, [new Item('0', 0), new Item('1', 1), new Item('2', 2)]),
  new Item('$1', null, [new Item('3', 3), new Item('4', 4), new Item('5', 5)])
];

test('Item.From', () => {
  const item = Item.from({
    name: '$',
    value: null,
    children: [
      { name: '0', value: 0 },
      { name: '1', value: 1 },
      { name: '2', value: 2 }
    ],
    meta: { x: 0 }
  });

  expect(item).toBeInstanceOf(Item);
});

test('Item.Constructor', () => {
  const item = createItem();

  expect(item.name).toBe('$');
  expect(item.value).toBe(null);
  expect(item.meta).toEqual({ x: 0 });
  expect(item.children).toHaveLength(3);
  for (let a of item.children) {
    expect(a).toBeInstanceOf(Item);
    expect(a.parent).toBe(item);
  }
  expect(item.children[0].name).toBe('0');
  expect(item.children[0].value).toBe(0);
  expect(item.children[1].name).toBe('1');
  expect(item.children[1].value).toBe(1);
  expect(item.children[2].name).toBe('2');
  expect(item.children[2].value).toBe(2);

  let chain = item.children[0].chain;

  expect(chain[0].name).toBe('$');
  expect(chain[0].level).toBe(0);
  expect(chain[1].name).toBe('0');
  expect(chain[1].level).toBe(1);
});

test('Item#traversePreOrder', () => {
  const item = createItem();
  const f = jest.fn();

  item.traversePreOrder(f);

  expect(f).toHaveBeenNthCalledWith(1, item);
  expect(f).toHaveBeenNthCalledWith(2, item.children[0]);
  expect(f).toHaveBeenNthCalledWith(3, item.children[1]);
  expect(f).toHaveBeenNthCalledWith(4, item.children[2]);
});

test('Item#traversePostOrder', () => {
  const item = createItem();
  const f = jest.fn();

  item.traversePostOrder(f);

  expect(f).toHaveBeenNthCalledWith(1, item.children[0]);
  expect(f).toHaveBeenNthCalledWith(2, item.children[1]);
  expect(f).toHaveBeenNthCalledWith(3, item.children[2]);
  expect(f).toHaveBeenNthCalledWith(4, item);
});

test('Item#update', () => {
  const item = createItem();

  let other = new Item('$', '', [new Item('0', 0), new Item('1', 10), new Item('2', 20)]);
  item.update(other);

  expect(item.value).toBe('');
  expect(item.children[0].value).toBe(0);
  expect(item.children[1].value).toBe(10);
  expect(item.children[2].value).toBe(20);
});

test('Item#copy', () => {
  const item = createItem();

  let copied = item.copy();

  expect(copied).not.toBe(item);
  expect(copied).toEqual(item);
});

test('Item#map', () => {
  const item = createItem();

  let mapped = item.map(a => a.value * 10);

  expect(mapped).not.toBe(item);
  expect(mapped.value).toBe(0);
  expect(mapped.children[0].value).toBe(0);
  expect(mapped.children[1].value).toBe(10);
  expect(mapped.children[2].value).toBe(20);
});

test('Item#filter', () => {
  const item = createItem();
  item.children[0].children = [new Item('0-0', 0), new Item('0-1', 1), new Item('0-2', 2)];

  {
    let filtered = item.filter(a => a.value > 0);

    expect(filtered).not.toBe(item);
    expect(filtered.children).toHaveLength(3);
    expect(filtered.children[0].value).toBe(0);
    expect(filtered.children[0].children[0].value).toBe(1);
    expect(filtered.children[0].children[1].value).toBe(2);
    expect(filtered.children[1].value).toBe(1);
    expect(filtered.children[2].value).toBe(2);
  }
  {
    let filtered = item.filter(a => a.value > 0, false);

    expect(filtered).not.toBe(item);
    expect(filtered.children).toHaveLength(2);
    expect(filtered.children[0].value).toBe(1);
    expect(filtered.children[1].value).toBe(2);
  }
});

test('Item#prune', () => {
  const item = createItem();
  item.children[0].children = [new Item('0-0', 0), new Item('0-1', 1), new Item('0-2', 2)];

  let pruned = item.prune(1);

  expect(pruned).not.toBe(item);
  expect(pruned.children).toHaveLength(0);
});

test('Item#all', () => {
  const item = createItem();

  let alled = item.all();

  expect(alled).toHaveLength(4);
});

test('Item#extract', () => {
  const item = createItem();

  let extracted = item.extract(1);

  expect(extracted).toHaveLength(3);
});

test('Item#find', () => {
  const item = createItem();

  let found = item.find(a => a.value === 0);

  expect(found).toBe(item.children[0]);
});

test('Item#trace', () => {
  const item = createItem();

  let traced = item.trace(item.children[0]);

  expect(traced).toHaveLength(2);
  expect(traced[0]).toBe(item);
  expect(traced[1]).toBe(item.children[0]);
});

test('Items.from', () => {
  const items = Items.from([
    {
      name: '$0',
      value: true,
      children: [
        { name: '0', value: 0 },
        { name: '1', value: 1 },
        { name: '2', value: 2 }
      ]
    },
    {
      name: '$1',
      value: false,
      children: [
        { name: '3', value: 0 },
        { name: '4', value: 1 },
        { name: '5', value: 2 }
      ]
    }
  ]);

  expect(items).toHaveLength(2);
  expect(items[0]).toBeInstanceOf(Item);
  expect(items[0].name).toBe('$0');
  expect(items[0].value).toBe(true);
  expect(items[0].children).toHaveLength(3);
  expect(items[1]).toBeInstanceOf(Item);
  expect(items[1].name).toBe('$1');
  expect(items[1].value).toBe(false);
  expect(items[1].children).toHaveLength(3);
});

test('Items.fromWith', () => {
  const items = Items.fromWith(
    [
      {
        text: '$0',
        data: true,
        list: [
          { text: '0', data: 0 },
          { text: '1', data: 1 },
          { text: '2', data: 2 }
        ]
      },
      {
        text: '$1',
        data: false,
        list: [
          { text: '3', data: 0 },
          { text: '4', data: 1 },
          { text: '5', data: 2 }
        ]
      }
    ],
    a => a['text'],
    a => a['data'],
    a => a['list']
  );

  expect(items).toHaveLength(2);
  expect(items[0]).toBeInstanceOf(Item);
  expect(items[0].name).toBe('$0');
  expect(items[0].value).toBe(true);
  expect(items[0].children).toHaveLength(3);
  expect(items[1]).toBeInstanceOf(Item);
  expect(items[1].name).toBe('$1');
  expect(items[1].value).toBe(false);
  expect(items[1].children).toHaveLength(3);
});

test('Items.traversePreOrder', () => {
  const items = createItems();
  const f = jest.fn();

  Items.traversePreOrder(items, f);

  expect(f).toHaveBeenNthCalledWith(1, items[0]);
  expect(f).toHaveBeenNthCalledWith(2, items[0].children[0]);
  expect(f).toHaveBeenNthCalledWith(3, items[0].children[1]);
  expect(f).toHaveBeenNthCalledWith(4, items[0].children[2]);
  expect(f).toHaveBeenNthCalledWith(5, items[1]);
  expect(f).toHaveBeenNthCalledWith(6, items[1].children[0]);
  expect(f).toHaveBeenNthCalledWith(7, items[1].children[1]);
  expect(f).toHaveBeenNthCalledWith(8, items[1].children[2]);
});

test('Items.traversePostOrder', () => {
  const items = createItems();
  const f = jest.fn();

  Items.traversePostOrder(items, f);

  expect(f).toHaveBeenNthCalledWith(1, items[0].children[0]);
  expect(f).toHaveBeenNthCalledWith(2, items[0].children[1]);
  expect(f).toHaveBeenNthCalledWith(3, items[0].children[2]);
  expect(f).toHaveBeenNthCalledWith(4, items[0]);
  expect(f).toHaveBeenNthCalledWith(5, items[1].children[0]);
  expect(f).toHaveBeenNthCalledWith(6, items[1].children[1]);
  expect(f).toHaveBeenNthCalledWith(7, items[1].children[2]);
  expect(f).toHaveBeenNthCalledWith(8, items[1]);
});

test('Items.update', () => {
  const items = createItems();

  let others = [new Item('$0', '', [new Item('0', 10)])];
  Items.update(items, others);

  expect(items[0].value).toBe('');
  expect(items[0].children[0].value).toBe(10);
});

test('Items.copy', () => {
  const items = createItems();

  let copied = Items.copy(items);

  expect(copied).not.toBe(items);
  expect(copied).toEqual(items);
});

test('Items.map', () => {
  const items = createItems();

  let mapped = Items.map(items, a => a.value * 10);

  expect(mapped).not.toBe(items);
  expect(mapped[0].value).toBe(0);
  expect(mapped[0].children[0].value).toBe(0);
  expect(mapped[0].children[1].value).toBe(10);
  expect(mapped[0].children[2].value).toBe(20);
  expect(mapped[1].value).toBe(0);
  expect(mapped[1].children[0].value).toBe(30);
  expect(mapped[1].children[1].value).toBe(40);
  expect(mapped[1].children[2].value).toBe(50);
});

test('Items.filter', () => {
  const items = createItems();

  {
    let filtered = Items.filter(items, a => a.value > 0);

    expect(filtered).not.toBe(items);
    expect(filtered[0].children).toHaveLength(2);
    expect(filtered[0].children[0].value).toBe(1);
    expect(filtered[0].children[1].value).toBe(2);
    expect(filtered[1].children).toHaveLength(3);
    expect(filtered[1].children[0].value).toBe(3);
    expect(filtered[1].children[1].value).toBe(4);
    expect(filtered[1].children[2].value).toBe(5);
  }
  {
    let filtered = Items.filter(items, a => a.value > 0, false);

    expect(filtered).not.toBe(items);
    expect(filtered).toHaveLength(0);
  }
});

test('Items.prune', () => {
  const items = createItems();

  let pruned = Items.prune(items, 1);

  expect(pruned).not.toBe(items);
  expect(pruned[0].children).toHaveLength(0);
  expect(pruned[1].children).toHaveLength(0);
});

test('Items.all', () => {
  const items = createItems();

  let alled = Items.all(items);

  expect(alled).toHaveLength(8);
});

test('Items.extract', () => {
  const items = createItems();

  let extracted = Items.extract(items, 1);

  expect(extracted).toHaveLength(6);
});

test('Items.find', () => {
  const items = createItems();

  let found = Items.find(items, a => a.value === 0);

  expect(found).toBe(items[0].children[0]);
});

test('Items.trace', () => {
  const items = createItems();

  let traced = Items.trace(items, items[0].children[0]);

  expect(traced).toHaveLength(2);
  expect(traced[0]).toBe(items[0]);
  expect(traced[1]).toBe(items[0].children[0]);
});
