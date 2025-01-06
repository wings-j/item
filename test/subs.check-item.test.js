import jest from 'jest-mock';
import { CheckItem, Item, ItemCheck } from '../dist';

const createCheckItem = () => new CheckItem('$', null, [new CheckItem('0', 0), new CheckItem('1', 1), new CheckItem('2', 2)], { x: 0 });

test('CheckItem.Constructor', () => {
  let checkItem = createCheckItem();

  expect(checkItem.check).toBeInstanceOf(ItemCheck);
  expect(checkItem.check.checked).toBe(false);
  expect(checkItem.check.unlink).toBe(false);
  expect(checkItem.check.indeterminate).toBe(false);
});

test('CheckItem.fromItem', () => {
  const item = new Item('$', null);
  const f = jest.fn(result => {
    result.check.checked = true;
  });
  const checkItem = CheckItem.fromItem(item, f);

  expect(checkItem).toBeInstanceOf(CheckItem);
  expect(checkItem).not.toBe(item);
  expect(f).toHaveBeenCalledWith(checkItem, item);
  expect(checkItem.check.checked).toBe(true);
});

test('CheckItem.decorateItem', () => {
  const item = new Item('$', null);
  const f = jest.fn(() => {
    return { checked: true };
  });
  const checkItem = CheckItem.decorateItem(item, f);

  expect(checkItem).toBeInstanceOf(CheckItem);
  expect(checkItem).toBe(item);
  expect(f).toHaveBeenCalledWith(item);
  expect(checkItem.check.checked).toBe(true);
});

test('CheckItem#check', () => {
  {
    let checkItem = createCheckItem();
    checkItem.check.checked = true;

    expect(checkItem.check.checked).toBe(true);
    expect(checkItem.check.indeterminate).toBe(false);
    expect(checkItem.children[0].check.checked).toBe(true);
    expect(checkItem.children[1].check.checked).toBe(true);
    expect(checkItem.children[2].check.checked).toBe(true);
  }
  {
    let checkItem = createCheckItem();
    checkItem.children[0].check.checked = true;

    expect(checkItem.check.checked).toBe(false);
    expect(checkItem.check.indeterminate).toBe(true);
    expect(checkItem.children[0].check.checked).toBe(true);
    expect(checkItem.children[1].check.checked).toBe(false);
    expect(checkItem.children[2].check.checked).toBe(false);
  }
});

test('CheckItem#unlink', () => {
  let checkItem = createCheckItem();
  checkItem.check.unlink = true;
  checkItem.check.checked = true;

  expect(checkItem.check.unlink).toBe(true);
  expect(checkItem.children[0].check.unlink).toBe(false);
  expect(checkItem.children[1].check.unlink).toBe(false);
  expect(checkItem.children[2].check.unlink).toBe(false);
});
