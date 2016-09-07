# Text Match

Match words, numbers and dates in text documents.

## Usage

```js
const text_match = require('text-match');

const match = text_match.matcher({
  name: 'Customer: ${WORD}',
  date: 'Invoice date: ${DATE}',
  amount: 'Total: ${NUMBER}'
});

const v = match(text);
if (v) {
  console.log(`Name: ${v.name}`);
  console.log(`Date: ${v.date}`);
  console.log(`Amount: ${v.amount}`);
} else {
  console.log('No match');
}
```

## API

- `matcher(map[, config])`: Creates a matcher for the given map of expressions.
  All entries in the map have to match. Returns a function that receives
  `(text)`. The returned function will return the matched values or `null`. The
  optional config is passed to the expressions and may have these common
  properties:
    - `expressions`: A map of custom expressions.
- `expression(regex[, fn])`: Creates a new custom expression from a regular
  expression. The first group in the regular expression is used to extract the
  value unless `fn` is given. If `fn` is given, it is invoked with `(match,
  config)` and is expected to return the extracted value. If `null` is
  returned, the expression does not match. These default aliases are supported:
    - `WORD`: Returns a string
    - `WORDS`: Returns a string
    - `NUMBER`: Returns a string
    - `PERCENT`: Returns a string
    - `DATE`: = Returns a [moment.js][1] date object

[1]: http://momentjs.com/
