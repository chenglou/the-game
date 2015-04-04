'use strict';

var M = require('mori');
var findNeighbors = require('./findNeighbors');
var getColor = require('./getColor');
var dissocIn = require('./utils/dissocIn');
var findVillageInRegion = require('./findVillageInRegion');
var findRegion = require('./findRegion');
var hasConflict = require('./hasConflict');
var trampleOnMeadow = require('./trampleOnMeadow');
var rankers = require('./rankers');
var everyUnit = require('./everyUnit');
var updateMap = require('./updateMap');
var add = require('./utils/add');
var randNth = require('./utils/randNth');

var js = M.toJs;
var clj = M.toClj;

function findRegion2(map, i, j) {
  var color = getColor(map, i, j);

  var visited = M.set();
  var toVisit = [[i, j]];

  while (toVisit.length > 0) {
    let [i, j] = toVisit.pop();
    var unVisitedSameColorNeighbors = findNeighbors(map, i, j)
      .filter(([i, j]) => getColor(map, i, j) === color)
      .filter(([i, j]) => !M.get(visited, M.vector(i, j)));

    unVisitedSameColorNeighbors.forEach(([i, j]) => {
      visited = M.conj(visited, M.vector(i, j));
      toVisit.push([i, j]);
    });
  }

  return M.into(M.vector(), visited);
}

function coordsToRegion(map) {
  let coords = M.map((row, i) => {
    return M.map((cell, j) => M.vector(i, j), row, M.range());
  }, map, M.range());

  return M.reduce((thing, coords) => {
    if (M.get(thing, coords)) {
      return thing;
    }

    let [i, j] = M.toJs(coords);
    let region = findRegion2(map, i, j);

    return M.reduce((thing, coords) => {
      return M.assoc(thing, coords, region);
    }, thing, region);
  }, M.hashMap(), M.mapcat(M.identity, coords));
}

function findAllRegions(map) {
  return M.distinct(M.vals(coordsToRegion(map)));
}

function clearDeadRegions(map, i, j) {
  let neighbors = findNeighbors(map, i, j);
  let regions = M.map(a => {
    let i = M.first(a);
    let j = M.second(a);
    return findRegion(map, i, j);
  }, neighbors);

  return M.reduce((map, region) => {
    if (M.count(region) < 3) {
      return updateMap(map, region, cell => {
        cell = dissocIn(cell, ['units', 'Villager']);
        if (M.getIn(cell, ['units', 'Village'])) {
          cell = dissocIn(cell, ['units', 'Village']);
          cell = M.assocIn(cell, ['units', 'Tree'], clj(everyUnit.defaultConfig.Tree));
        }
        return M.assoc(cell, 'color', 'Gray');
      });
    }

    let villageCoords = findVillageInRegion(map, region);
    if (villageCoords) {
      // nothing to do here
      return map;
    }

    // no more village (killed), randomly place a hovel. wipe everything else
    // on tile (might be sea, might have conflicting units, etc.)
    let randCoords = randNth(region);
    return M.assocIn(map, [...randCoords, 'units'], M.hashMap(
      'Village', clj(everyUnit.defaultConfig.Village),
      'Grass', clj(everyUnit.defaultConfig.Grass)
    ));
  }, map, regions);
}

function moveSoldier(map, [di, dj], [ui, uj]) {
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

  var hasTree = M.getIn(destConfig, ['units', 'Tree']);
  var hasTombstone = M.getIn(destConfig, ['units', 'Tombstone']);

  map = dissocIn(map, [di, dj, 'units', 'Tombstone']);

  if (hasTree) {
    map = dissocIn(map, [di, dj, 'units', 'Tree']);

    let [vi, vj] = findVillageInRegion(map, findRegion(map, ui, uj));
    map = M.updateIn(map, [vi, vj, 'units', 'Village', 'wood'], add(1));
  }

  if (destColor !== ownColor && destColor !== 'Gray') {
    let units = M.get(destConfig, 'units');
    let canAttack = M.every(a => {
      let name = M.first(a);
      let config = M.second(a);
      if (!rankers.killable[name]) {
        return true;
      }
      let rank = M.get(config, 'rank');
      let unitName = name === 'Villager' ? rankers.villagerByRank[rank]
        : name === 'Village' ? rankers.villageByRank[rank]
        : name;

      return rankers.canAttack.Soldier[unitName];
    }, units);

    if (!canAttack) {
      return map;
    }

    map = dissocIn(map, [di, dj, 'units', 'Village']);
    map = dissocIn(map, [di, dj, 'units', 'Villager']);
  }

  // check if unit can coexist on dest tile. this must be done after removing
  // tombstone and tree and enemies
  if (hasConflict(map, 'Villager', di, dj)) {
    return map;
  }

  // at this point we don't have any more early return (aka invalid move). we
  // can safely mark unit as having already moved below

  // can't move anymore if picked tomb/tree/differently colored tile
  if (hasTree || hasTombstone || destColor !== ownColor) {
    // map = M.assocIn(map, [ui, uj, 'units', 'Villager', 'hasMoved'], true);
  }

  map = trampleOnMeadow(map, [di, dj]);

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

  map = clearDeadRegions(map, di, dj);

  // finally move. nice to do at the end, otherwise [ui ji] [di dj] gets
  // confusing halfway through
  // can't reuse type from above. we changed the map and unit afterward (e.g.
  // hasMoved)
  var unit = M.getIn(map, [ui, uj, 'units', 'Villager']);
  map = dissocIn(map, [ui, uj, 'units', 'Villager']);
  return M.assocIn(map, [di, dj, 'units', 'Villager'], unit);
}

module.exports = moveSoldier;
