import jest from 'jest-mock';
import { Item } from '../dist/index';

const create = () => new Item('$', null, [new Item('0', 0), new Item('1', 1), new Item('2', 2)], { x: 0 });

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
  const item = create();

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
  const item = create();
  const f = jest.fn();

  item.traversePreOrder(f);

  expect(f).toHaveBeenNthCalledWith(1, item);
  expect(f).toHaveBeenNthCalledWith(2, item.children[0]);
  expect(f).toHaveBeenNthCalledWith(3, item.children[1]);
  expect(f).toHaveBeenNthCalledWith(4, item.children[2]);
});

test('Item#traversePostOrder', () => {
  const item = create();
  const f = jest.fn();

  item.traversePostOrder(f);

  expect(f).toHaveBeenNthCalledWith(1, item.children[0]);
  expect(f).toHaveBeenNthCalledWith(2, item.children[1]);
  expect(f).toHaveBeenNthCalledWith(3, item.children[2]);
  expect(f).toHaveBeenNthCalledWith(4, item);
});

test('Item#update', () => {
  const item = create();

  let other = new Item('$', '', [new Item('0', 0), new Item('1', 10), new Item('2', 20)]);
  item.update(other);

  expect(item.value).toBe('');
  expect(item.children[0].value).toBe(0);
  expect(item.children[1].value).toBe(10);
  expect(item.children[2].value).toBe(20);
});

test('Item#copy', () => {
  const item = create();

  let copied = item.copy();

  expect(copied).not.toBe(item);
  expect(copied).toEqual(item);
});

test('Item#map', () => {
  const item = create();

  let mapped = item.map(a => a.value * 10);

  expect(mapped).not.toBe(item);
  expect(mapped.value).toBe(0);
  expect(mapped.children[0].value).toBe(0);
  expect(mapped.children[1].value).toBe(10);
  expect(mapped.children[2].value).toBe(20);
});

test('Item#filter', () => {
  const item = create();
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
  const item = create();
  item.children[0].children = [new Item('0-0', 0), new Item('0-1', 1), new Item('0-2', 2)];

  let pruned = item.prune(1);

  expect(pruned).not.toBe(item);
  expect(pruned.children).toHaveLength(0);
});

test('Item#all', () => {
  const item = create();

  let alled = item.all();

  expect(alled).toHaveLength(4);
});

test('Item#extract', () => {
  const item = create();

  let extracted = item.extract(1);

  expect(extracted).toHaveLength(3);
});

test('Item#find', () => {
  const item = create();

  let found = item.find(a => a.value === 0);

  expect(found).toBe(item.children[0]);
});

test('Item#trace', () => {
  const item = create();

  let traced = item.trace(item.children[0]);

  expect(traced).toHaveLength(2);
  expect(traced[0]).toBe(item);
  expect(traced[1]).toBe(item.children[0]);
});
