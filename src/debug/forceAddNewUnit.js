'use strict';

var everyUnitDefaultConfigDebug = require('./everyUnitDefaultConfigDebug');
var getConflicts = require('../getConflicts');
var dissocIn = require('../utils/dissocIn');
var M = require('mori');

// removes every conflicting unit on map and add the new unit
// special processing for meadow and road (0 cooldown)
function forceAddNewUnit(map, i, j, color, unitName) {
  map = M.reduce((map, unitName) => {
    return dissocIn(map, [i, j, 'units', unitName]);
  }, map, getConflicts(map, unitName, i, j));

  map = M.assocIn(map, [i, j, 'color'], color);

  var config = M.get(everyUnitDefaultConfigDebug, unitName);

  return M.assocIn(map, [i, j, 'units', unitName], config);
}

module.exports = forceAddNewUnit;
