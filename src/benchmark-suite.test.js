//
// Copyright 2019 DxOS.
//

import { Suite } from './benchmark-suite';

test('Basic', async () => {
  expect.assertions(4);

  const suite = new Suite();

  const beforeAll = jest.fn(() => {
    suite.setContext({
      list: [...Array(10000).keys()]
    });
  });
  const afterAll = jest.fn();

  suite.beforeAll(beforeAll);
  suite.afterAll(afterAll);

  suite.test('forEach', async () => {
    const { list } = suite.context;
    let count = 0;
    list.forEach(() => count++);
    expect(count).toBe(list.length);
  });

  suite.test('for-of', async () => {
    const { list } = suite.context;
    let count = 0;
    // eslint-disable-next-line
    for (const i of list) {
      count++;
    }
    expect(count).toBe(list.length);
  });

  suite.print(await suite.run());

  expect(beforeAll).toHaveBeenCalledTimes(1);
  expect(afterAll).toHaveBeenCalledTimes(1);
});
