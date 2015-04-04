'use strict';

var M = require('mori');

function findVillageInRegion(map, region) {
  return region.filter(([i, j]) => M.getIn(map, [i, j, 'units', 'Village']))[0];
}

module.exports = findVillageInRegion;
