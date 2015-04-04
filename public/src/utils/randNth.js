'use strict';

var M = require('mori');

function randNth(arr) {
  if (arr instanceof Array) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  return M.nth(arr, Math.floor(Math.random() * M.count(arr)));
}

module.exports = randNth;
