//
// Copyright 2019 DxOS.
//

import assert from 'assert';
import hrtime from 'browser-process-hrtime';
import prettyHrtime from 'pretty-hrtime';
import mutexify from 'mutexify/promise';

const noop = () => {};

const printTime = hr => `~${prettyHrtime(hr)} (${hr[0]} s + ${hr[1]} ns)`;

const toNanoseconds = hr => (hr[0] * 1e9) + hr[1];

export class BenchmarkTest {
  constructor (title, test) {
    assert(title, 'title is required');
    assert(typeof test === 'function', 'test must be a function and is required');

    this._title = title;
    this._test = test;
    this._timeStart = null;
    this._timeEnd = null;
    this._lock = mutexify();
  }

  get title () {
    return this._title;
  }

  get test () {
    return this._test;
  }

  get timeStart () {
    return this._timeStart;
  }

  get timeEnd () {
    return this._timeEnd;
  }

  async run () {
    const release = await this._lock();
    this._timeStart = hrtime();

    try {
      await this._test({ timeStart: this._timeStart, hrtime, prettyHrtime });
      this._timeEnd = hrtime(this._timeStart);
      release();
      return this._timeEnd;
    } catch (err) {
      release();
      throw err;
    }
  }
}

export class Suite {
  constructor () {
    this._tests = new Map();
    this._beforeAll = noop;
    this._afterAll = noop;
    this._context = {};
    this._logger = {
      info (msg) {
        console.log(`# ${msg}`);
      },
      success (msg) {
        console.log(`ok ${msg}\n`);
      },
      fail (msg) {
        console.log(`fail ${msg}\n`);
      }
    };
  }

  get tests () {
    return Array.from(this._tests.values());
  }

  get logger () {
    return this._logger;
  }

  get context () {
    return this._context;
  }

  beforeAll (handler) {
    this._beforeAll = handler;
    return this;
  }

  afterAll (handler) {
    this._afterAll = handler;
    return this;
  }

  setContext (context) {
    assert(typeof context === 'object');

    this._context = Object.freeze({ ...context });
    return this;
  }

  test (title, test) {
    this._tests.set(title, new BenchmarkTest(title, test));
    return this;
  }

  async run () {
    if (this._tests.size === 0) throw new Error('benchmark tests not found');

    const results = {
      timeStart: hrtime(),
      winner: null,
      tests: []
    };

    await this._beforeAll();

    let winner = null;
    for (const test of this._tests.values()) {
      try {
        const timeEnd = await test.run();

        if (winner === null || toNanoseconds(winner.timeEnd) > toNanoseconds(timeEnd)) {
          winner = test;
        }

        results.tests.push({ title: test.title, timeEnd });
      } catch (err) {
        results.tests.push({ title: test.title, error: err });
        return results;
      }
    }

    results.timeEnd = hrtime(results.timeStart);
    results.winner = winner;

    await this._afterAll(results);

    return results;
  }

  print (results = {}) {
    const { winner, tests = [], timeEnd } = results;

    for (const test of tests) {
      this._logger.info(test.title);

      if (test.error) {
        this._logger.fail(test.error);
        return;
      }

      this._logger.success(printTime(test.timeEnd));
    }

    console.log(`wins: ${winner.title}`);
    this._logger.success(printTime(timeEnd));
  }
}
