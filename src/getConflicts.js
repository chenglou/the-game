'use strict';

var M = require('mori');
var coexistances = require('./coexistances');

function getConflicts(map, unitName, i, j) {
  return M.filter(conflict => {
    return coexistances[conflict][unitName] ? null : conflict;
  }, M.keys(M.getIn(map, [i, j, 'units'])));
}

module.exports = getConflicts;
