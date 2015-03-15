'use strict';

// [a, b] -> {a: true, b: true}
function arrToSet(arr) {
  return arr.reduce((acc, n) => {
    acc[n] = true;
    return acc;
  }, {});
}

module.exports = arrToSet;
