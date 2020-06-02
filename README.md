# benchmark-suite
> Suite to benchmark things.

[![Build Status](https://travis-ci.com/dxos/benchmark-suite.svg?branch=master)](https://travis-ci.com/dxos/benchmark-suite)
[![Coverage Status](https://coveralls.io/repos/github/dxos/benchmark-suite/badge.svg?branch=master)](https://coveralls.io/github/dxos/benchmark-suite?branch=master)
![npm (scoped)](https://img.shields.io/npm/v/@dxos/benchmark-suite)
[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/standard/semistandard)
[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

## Install

```
$ npm install @dxos/benchmark-suite
```

## Usage

```javascript
import { Suite } from '@wirelineio/benchmark-suite';

const suite = new Suite();

// prepare your tests
suite.beforeAll(() => {
  // Set an optional context data that will be shared across each benchmark test
  suite.setContext({
    list: [...Array(10000).keys()]
  });
});

suite.test('forEach', () => {
  const { list } = suite.context;
  list.forEach(() => {});
});

suite.test('for-of', () => {
  const { list } = suite.context;
  for (const i of list) {}
});

const results = await suite.run();

suite.print(results);
```

Prints:

```
# forEach
ok ~294 μs (0 s + 293701 ns)

# for-of
ok ~498 μs (0 s + 498171 ns)

wins: forEach
ok ~2.45 ms (0 s + 2449887 ns)
```

## API

## Contributing

PRs accepted.

## License

GPL-3.0 © dxos
