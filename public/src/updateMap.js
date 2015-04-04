'use strict';

var M = require('mori');

function updateMap(map, coordsList, f) {
  return M.reduce(
    (map, coords) => M.updateIn(map, coords, f),
    map,
    coordsList
  );
}

module.exports = updateMap;
