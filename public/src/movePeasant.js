'use strict';

var M = require('mori');
var findNeighbors = require('./findNeighbors');
var getColor = require('./getColor');
var dissocIn = require('./utils/dissocIn');
var findVillageInRegion = require('./findVillageInRegion');
var findRegion = require('./findRegion');
var hasConflict = require('./hasConflict');
var add = require('./utils/add');

var js = M.toJs;
var clj = M.toClj;

function movePeasant(map, [di, dj], [ui, uj]) {
  // TODO: path finding
  var movingToNeighbor = findNeighbors(map, ui, uj).some(([i, j]) => {
    return i === di && j === dj;
  });
  if (!movingToNeighbor) {
    return map;
  }

  var destConfig = M.getIn(map, [di, dj]);
  var destColor = getColor(map, di, dj);
  var ownColor = getColor(map, ui, uj);

  var isEnemyColor = destColor !== 'Gray' && destColor !== ownColor;

  // peasant can't go on neighbor enemy tiles
  if (isEnemyColor) {
    return map;
  }

  var hasTree = M.getIn(destConfig, ['units', 'Tree']);
  var hasTombstone = M.getIn(destConfig, ['units', 'Tombstone']);

  map = dissocIn(map, [di, dj, 'units', 'Tombstone']);

  if (hasTree) {
    map = dissocIn(map, [di, dj, 'units', 'Tree']);

    let [vi, vj] = findVillageInRegion(map, findRegion(map, ui, uj));
    map = M.updateIn(map, [vi, vj, 'units', 'Village', 'wood'], add(1));
  }

  // check if unit can coexist on dest tile. this must be done after removing
  // tombstone and tree
  if (hasConflict(map, 'Villager', di, dj)) {
    return map;
  }

  // at this point we don't have any more early return (aka invalid move). we
  // can safely mark unit as having already moved below

  // can't move anymore if picked tomb/tree/differently colored tile
  if (hasTree || hasTombstone || destColor !== ownColor) {
    map = M.assocIn(map, [ui, uj, 'units', 'Villager', 'hasMoved'], true);
  }

  // might be joining 2/3 same-colored regions...
  if (destColor !== ownColor) {
    var regions = findNeighbors(map, di, dj)
      .filter(([i, j]) => getColor(map, i, j) === ownColor)
      .map(([i, j]) => findRegion(map, i, j));

    // will kill dupe villages
    var villageToRegionSize = M.zipmap(
      clj(regions.map(region => findVillageInRegion(map, region))),
      regions.map(region => region.length)
    );

    var bestVillagePack = M.reduce((pack1, pack2) => {
      // highest ranked village
      var [[i1, j1], size1] = js(pack1);
      var [[i2, j2], size2] = js(pack2);
      var rank1 = M.getIn(map, [i1, j1, 'units', 'Village', 'rank']);
      var rank2 = M.getIn(map, [i2, j2, 'units', 'Village', 'rank']);

      if (rank1 > rank2) {
        return pack1;
      } else if (rank1 < rank2) {
        return pack2;
      }
      // if same rank: biggest region village
      return size1 > size2 ? pack1 : pack2;
    }, villageToRegionSize);

    var [[bi, bj], size] = js(bestVillagePack);

    map = M.reduce((map, pack) => {
      var [[i, j], size] = js(pack);
      if (i === bi && j === bj) {
        return map;
      }

      var gold = M.getIn(map, [i, j, 'units', 'Village', 'gold']);
      var wood = M.getIn(map, [i, j, 'units', 'Village', 'wood']);

      map = M.updateIn(map, [bi, bj, 'units', 'Village', 'gold'], add(gold));
      map = M.updateIn(map, [bi, bj, 'units', 'Village', 'wood'], add(wood));
      return dissocIn(map, [i, j, 'units', 'Village']);
    }, map, villageToRegionSize);

    // claim land, mark color
    map = M.assocIn(map, [di, dj, 'color'], ownColor);
  }

  // finally move. nice to do at the end, otherwise [ui ji] [di dj] gets
  // confusing halfway through
  // can't reuse type from above. we changed the map and unit afterward (e.g.
  // hasMoved)
  var unit = M.getIn(map, [ui, uj, 'units', 'Villager']);
  map = dissocIn(map, [ui, uj, 'units', 'Villager']);
  return M.assocIn(map, [di, dj, 'units', 'Villager'], unit);
}

module.exports = movePeasant;
