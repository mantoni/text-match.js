'use strict';

const xtend = require('xtend');
const moment = require('moment');
const escapeRegExp = require('escape-string-regexp');

function expression(regex, fn) {
  const re = regex.toString().replace(/(^\/)|(\/[igm]{0,3}$)/g, (g) => {
    if (g === '/') {
      return '';
    }
    throw new Error(`Regex flags are not supported: ${regex}`);
  });
  return { re, fn };
}

function parser(str, config) {
  let exp = null;
  const a = escapeRegExp(str).replace(/\\\$\\{([a-zA-Z_]+)\\}/, (_, name) => {
    exp = config.expressions[name];
    if (!exp) {
      throw new Error(`Unknown expression "${name}"`);
    }
    return exp.re;
  });
  const re = new RegExp(a);
  return function (text) {
    const m = text.match(re);
    if (exp && exp.fn) {
      return exp.fn(m, config);
    }
    return m ? m[1] || m[0] : null;
  };
}

const DATE_FORMATS = [
  'DD.MM.YYYY',
  'DD.MMM.YYYY',
  'MM/DD/YYYY',
  'MMM DD, YYYY'
];

const DEFAULT_EXPRESSIONS = {
  WORD: expression(/(\w+)/),
  WORDS: expression(/([\w \t]+)/),
  NUMBER: expression(/([\d,\.']+)/),
  PERCENT: expression(/([\d,\.]+)/),
  // eslint-disable-next-line max-len
  DATE: expression(/((?:\d{1,2}[\.\/\-]\d{1,2}[\.\/\-]\d{2,4})|(?:\d{1,2}[\.\/ ]{1,2}\w{3,}[\.\/ ]{1,2}\d{2,4})|(?:\w{3,}[\. ]{1,2}\d{1,2}[\., ]{1,3}\d{2,4}))/, (_) => {
    if (!_) {
      return null;
    }
    const m = moment(_[1], DATE_FORMATS);
    return m.isValid() ? m : null;
  }),
};

exports.matcher = function (map, config) {
  const expressions = config && config.expressions
    ? xtend(DEFAULT_EXPRESSIONS, config.expressions)
    : DEFAULT_EXPRESSIONS;
  const m = {};
  Object.keys(map).forEach((key) => {
    m[key] = parser(map[key], { expressions });
  });
  return function (text) {
    const values = {};
    if (Object.keys(m).every((key) => {
      const v = m[key](text);
      if (v === null) {
        return false;
      }
      values[key] = v;
      return true;
    })) {
      return values;
    }
    return null;
  };
};

exports.expression = expression;
