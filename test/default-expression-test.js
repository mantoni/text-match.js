/*eslint-env mocha*/
'use strict';

const assert = require('assert');
const tm = require('..');

describe('default-expression', () => {

  it('matches WORD', () => {
    const match = tm.matcher({
      test: 'Some ${WORD}'
    });

    const v = match('Some Test yo!');

    assert.deepEqual(v, { test: 'Test' });
  });

  it('matches WORDS', () => {
    const match = tm.matcher({
      test: 'Some ${WORDS}'
    });

    const v = match('Some Test yo!');

    assert.deepEqual(v, { test: 'Test yo' });
  });

  it('matches NUMBER', () => {
    const match = tm.matcher({
      one: 'One ${NUMBER}',
      two: 'Two ${NUMBER}'
    });

    const v = match('One 1\'234.56 Two 123,45');

    assert.deepEqual(v, { one: '1\'234.56', two: '123,45' });
  });

  it('matches PERCENT', () => {
    const match = tm.matcher({
      one: 'One ${PERCENT}',
      two: 'Two ${PERCENT}',
      three: 'Three ${PERCENT}'
    });

    const v = match('One 50% Two 25.75 % Three 17,8');

    assert.deepEqual(v, { one: '50', two: '25.75', three: '17,8' });
  });

  it('matches DATE', () => {
    const match = tm.matcher({
      one: 'One ${DATE}',
      two: 'Two ${DATE}',
      three: 'Three ${DATE}'
    });

    const v = match('One 13.09.2016 Two 13. Sep 2016 Three 9/13/16');

    assert.equal(v.one.toISOString(), '2016-09-12T22:00:00.000Z');
    assert.equal(v.two.toISOString(), '2016-09-12T22:00:00.000Z');
    assert.equal(v.three.toISOString(), '2016-09-12T22:00:00.000Z');
  });

  it('handles non-matching DATE', () => {
    const match = tm.matcher({
      failing: 'No match ${DATE}'
    });

    const v = match('Something without any dates in it');

    assert.equal(v, null);
  });

  it('matches multiline string', () => {
    const match = tm.matcher({
      test: 'some ${WORDS}'
    });

    const v = match(`Multiple line
      with some words to match
      yo!`);

    assert.equal(v.test, 'words to match');
  });

});
