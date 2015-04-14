'use strict';

var M = require('mori');
var clj = M.toClj;
var aStar = require('./aStar');
var map4 = clj(require('./map/data/map4'));
var arr2D = require('./utils/arr2D');
var {findRegion} = require('./findRegion');
var hasConflict = require('./hasConflict');
var aStar = require('./aStar');
var dissocIn = require('./utils/dissocIn');
var {defaultConfig} = require('./everyUnit');

function bench(map, [di, dj], [ui, uj]) {
  let height = M.count(map);
  let width = M.count(M.first(map));
  let region = findRegion(map, ui, uj);

  let total = 0;
  let i = 0;

  while (i++ < 99) {
    map = M.map((row, i) => {
      let newRow = M.map((cell, j) => {
        if (hasConflict(map, 'Tree', i, j) || Math.random() > 0.15) {
          return dissocIn(cell, ['units', 'Tree']);
        }
        return M.assocIn(cell, ['units', 'Tree'], defaultConfig.Tree);
      }, row, M.range());

      return M.into(M.vector(), newRow);
    }, map, M.range());

    map = M.into(M.vector(), map);

    let coordsMap = region.reduce((coordsMap, [i, j]) => {
      // doesn't check color and all. assume pre-checked
      if (hasConflict(map, 'Villager', i, j)) {
        return coordsMap;
      } else if (M.getIn(map, [i, j, 'units', 'Meadow'])) {
        coordsMap[i][j] = 50;
        return coordsMap;
      }
      coordsMap[i][j] = 0;
      return coordsMap;
    }, arr2D(() => 100, width, height));


    let keke = clj(coordsMap);
    let now = Date.now();
    aStar(keke, [ui, uj], [di, dj]);
    let asd = Date.now() - now;
    total += asd;
  }
  return total;
}

module.exports = bench;

// console.log(bench(map4, [2, 4], [6, 1]));
