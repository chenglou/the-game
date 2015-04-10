'use strict';

var M = require('mori');
var getConflicts = require('./getConflicts');

function hasConflict(map, unitName, i, j) {
  return !M.isEmpty(getConflicts(map, unitName, i, j));
}

module.exports = hasConflict;
