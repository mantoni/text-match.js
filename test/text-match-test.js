/*eslint-env mocha*/
'use strict';

const assert = require('assert');
const sinon = require('sinon');
const tm = require('..');

describe('matcher', () => {

  it('returns match for WORD', () => {
    const match = tm.matcher({
      test: 'Some ${WORD}!'
    });

    const v = match('Some Test!');

    assert.deepEqual(v, { test: 'Test' });
  });

  it('returns null if WORD is not found', () => {
    const match = tm.matcher({
      test: 'Some ${WORD}!'
    });

    const v = match('Something else');

    assert.strictEqual(v, null);
  });

  it('returns match for two WORDs', () => {
    const match = tm.matcher({
      one: 'Some ${WORD}',
      two: 'Other ${WORD}'
    });

    const v = match('Some Test!\nOther Thing matching');

    assert.deepEqual(v, { one: 'Test', two: 'Thing' });
  });

  it('returns null if only one WORD matches', () => {
    const match = tm.matcher({
      one: 'Some ${WORD}',
      two: 'Other ${WORD}'
    });

    const v = match('Some Test\nUnknown Thing');

    assert.strictEqual(v, null);
  });

  it('matches custom expression', () => {
    const match = tm.matcher({
      test: 'That ${FOO}!'
    }, {
      expressions: {
        FOO: tm.expression(/(Foo)/)
      }
    });

    const v = match('That Foo!');

    assert.deepEqual(v, { test: 'Foo' });
  });

  it('mismatches custom expression', () => {
    const match = tm.matcher({
      test: 'That ${FOO}!'
    }, {
      expressions: {
        FOO: tm.expression(/(Foo)/)
      }
    });

    const v = match('That Bar!');

    assert.strictEqual(v, null);
  });

  it('throws for unknown expression', () => {
    assert.throws(() => {
      tm.matcher({
        test: 'That ${UNKNOWN}!'
      });
    }, /Error: Unknown expression "UNKNOWN"/);
  });

  it('throws if regexp uses flags', () => {
    assert.throws(() => {
      tm.matcher({
        test: 'That ${FOO}!'
      }, {
        expressions: {
          FOO: tm.expression(/(foo)/i)
        }
      });
    }, /Error: Regex flags are not supported: \/\(foo\)\/i/);
  });

  it('invokes given expression handler function with match', () => {
    const spy = sinon.spy();
    const match = tm.matcher({
      test: 'That ${FOO}!'
    }, {
      expressions: {
        FOO: tm.expression(/(Foo)/, spy)
      }
    });

    match('That Foo!');

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWithMatch(spy, {
      0: 'That Foo!',
      1: 'Foo'
    });
  });

  it('invokes given expression handler function with merged configs', () => {
    const spy = sinon.spy();
    const match = tm.matcher({
      test: 'That ${FOO}!'
    }, {
      expressions: {
        FOO: tm.expression(/(Foo)/, spy)
      }
    });

    match('That Foo!');

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, sinon.match.any, {
      expressions: sinon.match({
        FOO: sinon.match.object,
        WORD: sinon.match.object
      })
    });
  });

});
