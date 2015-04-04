'use strict';

var dissocIn = require('./utils/dissocIn');
var M = require('mori');

function trampleOnMeadow(map, [i, j]) {
  var hasMeadow = M.getIn(map, [i, j, 'units', 'Meadow']);
  var hasRoadWith0Cooldown =
    M.getIn(map, [i, j, 'units', 'Road', 'cooldown']) === 0;

  // trample like an asshole
  if (hasMeadow && !hasRoadWith0Cooldown) {
    map = dissocIn(map, [i, j, 'units', 'Meadow']);
  }

  return map;
}

module.exports = trampleOnMeadow;
