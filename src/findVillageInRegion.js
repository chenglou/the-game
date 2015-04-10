'use strict';

var M = require('mori');

function findVillageInRegion(map, region) {
  let coords = M.filter(coords => {
    let i = M.first(coords);
    let j = M.second(coords);
    return M.getIn(map, [i, j, 'units', 'Village']);
  }, region);

  return M.toJs(M.first(coords));
}

module.exports = findVillageInRegion;
