var mapSeqToVec = require('../mapSeqToVec');
var coexistances = require('../coexistances');
var everyUnit = require('../everyUnit');
var dissocIn = require('../utils/dissocIn');
var M = require('mori');

function getConflicta(map, unitName, i, j) {
  return M.filter(conflict => {
    return coexistances[conflict][unitName] ? null : conflict;
  }, M.keys(M.getIn(map, [i, j, 'units'])));
}

// removes every conflicting unit on map
function forceAddNewUnit(map, i, j, color, unitName) {
  map = mapSeqToVec(map);

  map = M.reduce((map, unitName) => {
    return dissocIn(map, [i, j, 'units', unitName]);
  }, map, getConflicta(map, unitName, i, j));

  map = M.assocIn(map, [i, j, 'color'], color);

  var config = M.toClj(everyUnit.defaultConfig[unitName]);
  if (unitName === 'Meadow' || unitName === 'Road') {
    config = M.update(config, 'cooldown', 0);
  }

  return M.assocIn(map, [i, j, 'units', unitName], config);
}

module.exports = forceAddNewUnit;
