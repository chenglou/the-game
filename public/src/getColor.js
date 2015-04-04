'use strict';

var M = require('mori');

function getColor(map, i, j) {
  return M.getIn(map, [i, j, 'color']);
}

module.exports = getColor;
