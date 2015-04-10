'use strict';

var React = require('react');
var Grid = require('./src/map/Grid');
var {Menu, MenuItem} = require('./src/Menu');
var M = require('mori');
var dissocIn = require('./src/utils/dissocIn');
var randNth = require('./src/utils/randNth');
var arr2D = require('./src/utils/arr2D');
var add = require('./src/utils/add');
var findNeighbors = require('./src/findNeighbors');
var hasConflict = require('./src/hasConflict');
var positioner = require('./src/map/positioner');
var {defaultConfig} = require('./src/everyUnit');
var rankers = require('./src/rankers');
var {immediateActions} = require('./src/actions');
var UnitSelector = require('./src/debug/UnitSelector');
var surroundWithSea = require('./src/debug/surroundWithSea');
var forceAddNewUnit = require('./src/debug/forceAddNewUnit');
var findVillageInRegion = require('./src/findVillageInRegion');
var {findRegion, findRegionM} = require('./src/findRegion');
var trampleOnMeadow = require('./src/trampleOnMeadow');
var canMoveToAura = require('./src/canMoveToAura');
var updateMap = require('./src/updateMap');
var inCoordsList = require('./src/inCoordsList');
var getMenuItems = require('./src/getMenuItems');
var aStar = require('./src/aStar');
var {getMapPlayerColors} = require('./src/getMapPlayerColors');
var allMaps = require('./src/allMaps');

let js = M.toJs;
let clj = M.toClj;
let {getIn, get, assoc, assocIn, updateIn} = M;
let p = React.PropTypes;

function getUnitsByName(map, unitName) {
  return M.mapcat((row, i) => {
    var maybeCoords = M.map((cell, j) => {
      return getIn(map, [i, j, 'units', unitName]) ? [i, j] : null;
    }, row, M.range());

    return M.filter(M.identity, maybeCoords);
  }, map, M.range());
}

function getUnitsByColorAndName(map, turn, unitName) {
  return M.filter(
    ([i, j]) => getIn(map, [i, j, 'color']) === turn,
    getUnitsByName(map, unitName)
  );
}

// ----------- phases

function growTrees(map) {
  let treeCoords = M.filter(
    () => Math.random() > 0.5,
    getUnitsByName(map, 'Tree')
  );

  return M.reduce((map, [i, j]) => {
    var emptyNeighbors = findNeighbors(map, i, j)
      .filter(([i, j]) => !hasConflict(map, 'Tree', i, j));

    if (emptyNeighbors.length === 0) {
      return map;
    }

    var [i2, j2] = randNth(emptyNeighbors);
    return assocIn(map, [i2, j2, 'units', 'Tree'], get(defaultConfig, 'Tree'));
  }, map, treeCoords);
}

function killTombstones(map, turn) {
  return updateMap(
    map,
    getUnitsByColorAndName(map, turn, 'Tombstone'),
    cell => {
      cell = dissocIn(cell, ['units', 'Tombstone']);
      // become a tree usually. if it's on a road/meadow, then just make it
      // disappear (tree can't be on road/meadow)
      var hasMeadow = getIn(cell, ['units', 'Meadow']);
      var hasRoad = getIn(cell, ['units', 'Road']);

      return hasMeadow || hasRoad
        ? cell
        : assocIn(cell, ['units', 'Tree'], get(defaultConfig, 'Tree'));
    }
  );
}

function resetUnitMoves(map, turn) {
  map = updateMap(
    map,
    getUnitsByColorAndName(map, turn, 'Cannon'),
    cell => assocIn(cell, ['units', 'Cannon', 'hasMoved'], false)
  );
  return updateMap(
    map,
    getUnitsByColorAndName(map, turn, 'Villager'),
    cell => assocIn(cell, ['units', 'Villager', 'hasMoved'], false)
  );
}

function matureTiles(map, turn) {
  map = matureBuilt(map, turn, 'Meadow');
  map = matureBuilt(map, turn, 'Villager');
  return matureBuilt(map, turn, 'Road');
}

function matureBuilt(map, turn, unitName) {
  return updateMap(
    map,
    getUnitsByColorAndName(map, turn, unitName),
    cell => {
      return updateIn(cell, ['units', unitName, 'cooldown'], cooldown => {
        return cooldown ? cooldown - 1 : 0;
      });
    }
  );
}

function addIncome(map, turn) {
  return M.reduce((map, [i, j]) => {
    var sum = findRegion(map, i, j).reduce((sum, [i, j]) => {
      let hasTree = getIn(map, [i, j, 'units', 'Tree']);
      let hasMeadowWith0Cooldown =
        getIn(map, [i, j, 'units', 'Meadow', 'cooldown']) === 0;

      // this is only determined by the land type (sea, grass, meadow, tree)
      // conceptually tree is a landtype
      let amount = hasTree ? 0
        : hasMeadowWith0Cooldown ? 2
        : 1;

      return sum + amount;
    }, 0);

    return updateIn(map, [i, j, 'units', 'Village', 'gold'], add(sum));
  }, map, getUnitsByColorAndName(map, turn, 'Village'));
}

function payTime(map, turn) {
  return M.reduce((map, [i, j]) => {
    var sum = findRegion(map, i, j).reduce((sum, [i, j]) => {
      return sum + M.reduce((sum, a) => {
        let name = M.first(a);
        let config = M.second(a);

        let unitName = name === 'Village' ? rankers.villageByRank[get(config, 'rank')]
          : name === 'Villager' ? rankers.villagerByRank[get(config, 'rank')]
          : name;

        return sum + (rankers.upkeep[unitName] || 0);
      }, 0, getIn(map, [i, j, 'units']));
    }, 0);

    return updateIn(map, [i, j, 'units', 'Village', 'gold'], add(-sum));
  }, map, getUnitsByColorAndName(map, turn, 'Village'));
}

function unitToTombstone(cell) {
  cell = dissocIn(cell, ['units', 'Villager']);
  // TODO: does cannon turn to tombstone?
  cell = dissocIn(cell, ['units', 'Cannon']);
  return assocIn(
    cell,
    ['units', 'Tombstone'],
    get(defaultConfig, 'Tombstone')
  );
}

// TODO: cannon logic added. Check which other phase affects cannon
function dieTime(map, turn) {
  var poorVillageCoords = M.filter(
    ([i, j]) => getIn(map, [i, j, 'units', 'Village', 'gold']) < 0,
    getUnitsByColorAndName(map, turn, 'Village')
  );

  return M.reduce((map, [i, j]) => {
    // reset negative gold to 0
    map = assocIn(map, [i, j, 'units', 'Village', 'gold'], 0);

    // turn units into tombstones
    return findRegion(map, i, j)
      .filter(([i, j]) => getIn(map, [i, j, 'units', 'Villager']) || getIn(map, [i, j, 'units', 'Cannon']))
      .reduce(
        (map, [i, j]) => updateIn(map, [i, j], cell => unitToTombstone(cell)),
        map
      );

  }, map, poorVillageCoords);
}

function payOrDie(map, turn) {
  map = payTime(map, turn);
  return dieTime(map, turn);
}

// -------------------------- phases over

function newVillager(map, [di, dj], [vi, vj], {gold, name}) {
  if (!inCoordsList(findRegion(map, vi, vj), [di, dj]) ||
      hasConflict(map, 'Villager', di, dj)) {
    return map;
  }
  if (rankers.trample[name]) {
    map = trampleOnMeadow(map, [di, dj]);
  }

  map = updateIn(map, [vi, vj, 'units', 'Village', 'gold'], add(-gold));
  var rank = rankers.villagerByRank.indexOf(name);

  return assocIn(
    map,
    [di, dj, 'units', 'Villager'],
    assoc(get(defaultConfig, 'Villager'), 'rank', rank)
  );
}

function newWatchtower(map, [di, dj], [vi, vj], {gold, wood}) {
  if (!inCoordsList(findRegion(map, vi, vj), [di, dj]) ||
      hasConflict(map, 'Watchtower', di, dj)) {
    return map;
  }

  map = updateIn(map, [vi, vj, 'units', 'Village', 'gold'], add(-gold));
  map = updateIn(map, [vi, vj, 'units', 'Village', 'wood'], add(-wood));

  return assocIn(
    map,
    [di, dj, 'units', 'Watchtower'],
    get(defaultConfig, 'Watchtower')
  );
}

function newCannon(map, [di, dj], [vi, vj], {gold, wood}) {
  if (!inCoordsList(findNeighbors(map, vi, vj), [di, dj]) ||
    !inCoordsList(findRegion(map, vi, vj), [di, dj]) ||
    hasConflict(map, 'Cannon', di, dj)) {
    return map;
  }
  if (rankers.trample[name]) {
    map = trampleOnMeadow(map, [di, dj]);
  }

  map = updateIn(map, [vi, vj, 'units', 'Village', 'gold'], add(-gold));
  map = updateIn(map, [vi, vj, 'units', 'Village', 'wood'], add(-wood));

  return assocIn(
    map,
    [di, dj, 'units', 'Cannon'],
    get(defaultConfig, 'Cannon')
  );
}

function combineVillagers(map, [di, dj], [ui, uj]) {
  if (!inCoordsList(findRegion(map, ui, uj), [di, dj]) ||
      !getIn(map, [di, dj, 'units', 'Villager'])) {
    return map;
  }

  // 'merge rank': Peasant + Peasant = Infantry => 1 + 1 = 2
  var v1MergeRank = getIn(map, [ui, uj, 'units', 'Villager', 'rank']) + 1;
  var v2MergeRank = getIn(map, [di, dj, 'units', 'Villager', 'rank']) + 1;
  var mergedRank = v1MergeRank + v2MergeRank;
  var actualRank = mergedRank - 1;
  var mergedName = rankers.villagerByRank[actualRank];

  var [vi, vj] = findVillageInRegion(map, findRegion(map, ui, uj));
  var villageRank = getIn(map, [vi, vj, 'units', 'Village', 'rank']);
  var villageName = rankers.villageByRank[villageRank];

  if (!rankers.producibleVillagers[villageName][mergedName]) {
    return map;
  }

  // merge to the destination coordinates. clears cooldown, hasMoved
  map = dissocIn(map, [ui, uj, 'units', 'Villager']);
  return assocIn(
    map,
    [di, dj, 'units', 'Villager'],
    assoc(get(defaultConfig, 'Villager'), 'rank', actualRank)
  );
}

function build(map, [i, j], {name, cooldown}) {
  if (hasConflict(map, name, i, j)) {
    return map;
  }

  map = assocIn(map, [i, j, 'units', name], get(defaultConfig, 'name'));
  return assocIn(map, [i, j, 'units', 'Villager', 'cooldown'], cooldown);
}

// move helpers ===========
function coordsToRegion(map) {
  let coords = M.map((row, i) => {
    return M.map((cell, j) => M.vector(i, j), row, M.range());
  }, map, M.range());

  return M.reduce((thing, coords) => {
    let [i, j] = M.toJs(coords);
    if (get(thing, coords)) {
      return thing;
    }

    let region = findRegionM(map, i, j);

    return M.reduce((thing, coords) => {
      return assoc(thing, coords, region);
    }, thing, region);
  }, M.hashMap(), M.mapcat(M.identity, coords));
}

function findAllRegions(map) {
  return M.distinct(M.vals(coordsToRegion(map)));
}

// move =======

function genericMovePath(map, [di, dj], [ui, uj], name) {
  let destColor = getIn(map, [di, dj, 'color']);
  let ownColor = getIn(map, [ui, uj, 'color']);

  if (destColor === 'Gray') {
    map = assocIn(map, [di, dj, 'color'], ownColor);
  }
  if (isEnemyColor(map, [di, dj], [ui, uj]) &&
    canMoveToAura(map, name, destColor, [di, dj]) &&
    canDefeat(map, [di, dj], name)) {
    map = kill(map, [di, dj], [ui, uj]);
    map = assocIn(map, [di, dj, 'color'], ownColor);
  }

  return findPath(map, [di, dj], [ui, uj]);
}

let findMovePath = {
  Peasant: (map, [di, dj], [ui, uj]) => {
    map = cleanTreeAndTombstone(map, [di, dj], [ui, uj]);

    let destColor = getIn(map, [di, dj, 'color']);
    let ownColor = getIn(map, [ui, uj, 'color']);
    if (destColor === 'Gray') {
      map = assocIn(map, [di, dj, 'color'], ownColor);
    }

    if (hasConflict(map, 'Villager', di, dj) ||
      isEnemyColor(map, [di, dj], [ui, uj])) {
      return [];
    }

    return findPath(map, [di, dj], [ui, uj]);
  },

  Infantry: (map, [di, dj], [ui, uj]) => {
    map = cleanTreeAndTombstone(map, [di, dj], [ui, uj]);
    return genericMovePath(map, [di, dj], [ui, uj], 'Infantry');
  },

  Soldier: (map, [di, dj], [ui, uj]) => {
    map = cleanTreeAndTombstone(map, [di, dj], [ui, uj]);
    return genericMovePath(map, [di, dj], [ui, uj], 'Soldier');
  },

  Knight: (map, [di, dj], [ui, uj]) => {
    return genericMovePath(map, [di, dj], [ui, uj], 'Knight');
  },

  Cannon: (map, [di, dj], [ui, uj]) => {
    if (hasConflict(map, 'Cannon', di, dj) ||
      !inCoordsList(findNeighbors(map, ui, uj), [di, dj]) ||
      isEnemyColor(map, [di, dj], [ui, uj]) ||
      hasTreeOrTombstone(map, [di, dj])) {
      return [];
    }

    return [[ui, uj], [di, dj]];
  },
};

function hasTreeOrTombstone(map, [di, dj]) {
  return getIn(map, [di, dj, 'units', 'Tree']) ||
    getIn(map, [di, dj, 'units', 'Tombstone']);
}

// doesn't assume friend/foe (color) on dest tile
function canDefeat(map, [di, dj], name) {
  return M.every(a => {
    let enemyName = M.first(a);
    let config = M.second(a);
    if (!rankers.killable[enemyName]) {
      return true;
    }
    let rank = get(config, 'rank');
    let enemyPreciseName = enemyName === 'Villager' ? rankers.villagerByRank[rank]
      : enemyName === 'Village' ? rankers.villageByRank[rank]
      : enemyName;

    return rankers.canAttack[name][enemyPreciseName];
  }, getIn(map, [di, dj, 'units']));
}

//  move----------===================

function isEnemyColor(map, [di, dj], [oi, oj]) {
  let ownColor = getIn(map, [oi, oj, 'color']);
  let destColor = getIn(map, [di, dj, 'color']);
  return destColor !== 'Gray' && ownColor !== destColor;
}

function findPath(map, [di, dj], [ui, uj]) {
  // check actions.js signature for move
  let height = M.count(map);
  let width = M.count(M.first(map));
  let region = findRegion(map, ui, uj);

  let coordsMap = region.reduce((coordsMap, [i, j]) => {
    // doesn't check color and all. assume pre-checked
    if (hasConflict(map, 'Villager', i, j)) {
      return coordsMap;
    }
    coordsMap[i][j] = 0;
    return coordsMap;
  }, arr2D(() => 1, width, height));

  return aStar(clj(coordsMap), [ui, uj], [di, dj]);
}

function stopVillagerUnderConditions(map, [di, dj], [ui, uj]) {
  let destColor = getIn(map, [di, dj, 'color']);
  let ownColor = getIn(map, [ui, uj, 'color']);
  if (hasTreeOrTombstone(map, [di, dj]) || destColor !== ownColor) {
    map = assocIn(map, [ui, uj, 'units', 'Villager', 'hasMoved'], true);
  }
  return map;
}

function cleanTreeAndTombstone(map, [di, dj], [ui, uj]) {
  var hasTree = getIn(map, [di, dj, 'units', 'Tree']);

  map = dissocIn(map, [di, dj, 'units', 'Tombstone']);
  map = dissocIn(map, [di, dj, 'units', 'Tree']);

  if (hasTree) {
    let [vi, vj] = findVillageInRegion(map, findRegion(map, ui, uj));
    map = updateIn(map, [vi, vj, 'units', 'Village', 'wood'], add(1));
  }

  return map;
}

function trampleOnMeadowOnPath(path) {
  return function(map) {
    return path.reduce(trampleOnMeadow, map);
  };
}

function stopCannon(map, [di, dj], [ui, uj]) {
  return assocIn(map, [ui, uj, 'units', 'Cannon', 'hasMoved'], true);
}

function kill(map, [di, dj], [ui, uj]) {
  if (!isEnemyColor(map, [di, dj], [ui, uj])) {
    return map;
  }
  map = dissocIn(map, [di, dj, 'units', 'Village']);
  map = dissocIn(map, [di, dj, 'units', 'Villager']);
  return map;
}

function joinLands(map, [di, dj], [ui, uj]) {
  var destColor = getIn(map, [di, dj, 'color']);
  var ownColor = getIn(map, [ui, uj, 'color']);

  if (destColor !== ownColor) {
    var regions = findNeighbors(map, di, dj)
      .filter(([i, j]) => getIn(map, [i, j, 'color']) === ownColor)
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
      var rank1 = getIn(map, [i1, j1, 'units', 'Village', 'rank']);
      var rank2 = getIn(map, [i2, j2, 'units', 'Village', 'rank']);

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

      var gold = getIn(map, [i, j, 'units', 'Village', 'gold']);
      var wood = getIn(map, [i, j, 'units', 'Village', 'wood']);

      map = updateIn(map, [bi, bj, 'units', 'Village', 'gold'], add(gold));
      map = updateIn(map, [bi, bj, 'units', 'Village', 'wood'], add(wood));
      return dissocIn(map, [i, j, 'units', 'Village']);
    }, map, villageToRegionSize);

    // claim land, mark color
    map = assocIn(map, [di, dj, 'color'], ownColor);
  }

  return map;
}

function moveUnit(name) {
  return function(map, [di, dj], [ui, uj]) {
    let unit = getIn(map, [ui, uj, 'units', name]);
    map = dissocIn(map, [ui, uj, 'units', name]);
    return assocIn(map, [di, dj, 'units', name], unit);
  };
}

function clearDeadRegions(map) {
  // discard gray ones
  let regions = M.filter(region => {
    let [i, j] = js(M.first(region));

    return getIn(map, [i, j, 'color']) !== 'Gray';
  }, findAllRegions(map));

  return M.reduce((map, region) => {
    if (M.count(region) < 3) {
      return updateMap(map, region, cell => {
        if (getIn(cell, ['units', 'Village'])) {
          cell = dissocIn(cell, ['units', 'Village']);
          cell = assocIn(cell, ['units', 'Tree'], get(defaultConfig, 'Tree'));
        }
        return assoc(cell, 'color', 'Gray');
      });
    }

    let villageCoords = findVillageInRegion(map, region);
    if (villageCoords) {
      // nothing to do here
      return map;
    }

    // no more village (killed), randomly place a hovel. wipe everything else
    // on tile (might be sea, might have conflicting units, etc.)
    let randCoords = js(randNth(region));
    return assocIn(map, [...randCoords, 'units'], M.hashMap(
      'Village', get(defaultConfig, 'Village'),
      'Grass', get(defaultConfig, 'Grass')
    ));
  }, map, regions);
}

// peasant cultivateMeadow, enemy disconnects territory, meadow gray, never
// matures
function killGrayMeadowCooldowns(map) {
  return updateMap(
    map,
    getUnitsByColorAndName(map, 'Gray', 'Meadow'),
    cell => assocIn(cell, ['units', 'Meadow', 'cooldown'], 0)
  );
}

// strangled units after land cut-off, use after invasion
function killGrayUnits(map) {
 map = updateMap(
   map,
   getUnitsByColorAndName(map, 'Gray', 'Cannon'),
   unitToTombstone
 );

 return updateMap(
   map,
   getUnitsByColorAndName(map, 'Gray', 'Villager'),
   unitToTombstone
 );
}

function move(map, [di, dj], [ui, uj], {name}) {
  let path = findMovePath[name](map, [di, dj], [ui, uj]);
  if (path.length === 0) {
    return map;
  }

  let cleanup = [clearDeadRegions, killGrayMeadowCooldowns, killGrayUnits];
  let villagerAttack = [kill, joinLands, moveUnit('Villager')];

  let ops = {
    Peasant: [
      stopVillagerUnderConditions,
      cleanTreeAndTombstone,

      joinLands,
      moveUnit('Villager'),
    ],
    Infantry: [
      stopVillagerUnderConditions,
      cleanTreeAndTombstone,
      ...villagerAttack,
      ...cleanup
    ],
    Soldier: [
      stopVillagerUnderConditions,
      cleanTreeAndTombstone,

      trampleOnMeadowOnPath(path),
      ...villagerAttack,
      ...cleanup
    ],
    Knight: [
      stopVillagerUnderConditions,
      trampleOnMeadowOnPath(path),

      ...villagerAttack,
      ...cleanup
    ],
    Cannon: [
      stopCannon,
      trampleOnMeadow,
      joinLands,
      moveUnit('Cannon'),
    ],
  };

  let res = map;
  for (var i = 0; i < ops[name].length; i++) {
    res = ops[name][i](res, [di, dj], [ui, uj]);
  }

  return res;
}

function upgradeVillage(map, [i, j], {gold, wood, nextName}) {
  let hpBoost = rankers.villageUpgradeHp[nextName];
  map = updateIn(map, [i, j, 'units', 'Village', 'gold'], add(-gold));
  map = updateIn(map, [i, j, 'units', 'Village', 'wood'], add(-wood));
  map = updateIn(map, [i, j, 'units', 'Village', 'hp'], add(hpBoost));
  return updateIn(map, [i, j, 'units', 'Village', 'rank'], add(1));
}

function upgradeVillager(map, [vi, vj], [si, sj], {gold, wood, nextName}) {
  let villageRank = getIn(map, [vi, vj, 'units', 'Village', 'rank']);
  let villageName = rankers.villageByRank[villageRank];

  if (!rankers.producibleVillagers[villageName][nextName]) {
    return map;
  }

  map = updateIn(map, [vi, vj, 'units', 'Village', 'gold'], add(-gold));
  map = updateIn(map, [vi, vj, 'units', 'Village', 'wood'], add(-wood));
  return updateIn(map, [si, sj, 'units', 'Villager', 'rank'], add(1));
}

function shootCannon(map, [di, dj], [ui, uj], {gold, wood}) {
  let area = M.into(
    M.set(),
    M.mapcat(
      M.identity,
      clj(findNeighbors(map, ui, uj).map(([i, j]) => findNeighbors(map, i, j)))
    )
  );

  if (!inCoordsList(js(area), [di, dj])) {
    return map;
  }

  let village = getIn(map, [di, dj, 'units', 'Village']);
  let villager = getIn(map, [di, dj, 'units', 'Villager']);
  if (!village && !villager) {
    return map;
  }

  let [oi, oj] = findVillageInRegion(map, findRegion(map, ui, uj));
  map = updateIn(map, [oi, oj, 'units', 'Village', 'gold'], add(-gold));
  map = updateIn(map, [oi, oj, 'units', 'Village', 'wood'], add(-wood));

  if (villager) {
    map = dissocIn(map, [di, dj, 'units', 'Villager']);
    map = updateIn(map, [di, dj], unitToTombstone);
  } else if (village) {
    // assuming village and villager can't coexist. meh
    map = updateIn(map, [di, dj, 'units', 'Village', 'hp'], add(-1));
    if (getIn(map, [di, dj, 'units', 'Village', 'hp']) === 0) {
      map = dissocIn(map, [di, dj, 'units', 'Village']);
    }
  }

  return clearDeadRegions(map);
}

// -------------------------- menu actions over

var cancelPendingActionState = {
  pendingAction: null,
  showMenu: false,
};

// var veryFirstState = {
//   map: map1,
//   currTurn: 0,
//   phase: 'Player',
//   selfTurn: 0,
// };

var Game = React.createClass({
  propTypes: {
    map: p.object.isRequired,
    phase: p.string.isRequired,
    currTurn: p.number.isRequired,
    selfTurn: p.number.isRequired,
    originalMapIndex: p.number.isRequired,
    onWin: p.func.isRequired,

    syncProps: p.func.isRequired,
  },

  getInitialState: function() {
    // var map = M.vector(M.vector());
    // var fireBaseBaseUrl = 'https://blistering-heat-9706.firebaseio.com';

    return {
      // to sync. the real initialization is in didMount
      // map: map,
      // currTurn: 0,
      // phase: '',

      fbState: function() {},
      fbEmptySlots: function() {},
      // fbState: new Firebase(fireBaseBaseUrl + 'state'),
      // fbEmptySlots: new Firebase(fireBaseBaseUrl + 'emptySlots'),

      // who am I. modified once by fireBase
      // selfTurn: -1,

      history: [this.props.map],
      historyIndex: 0,
      hover: [0, 0],
      // turns: ['Red', 'Blue', 'Orange'],
      selectedCoords: null,
      pendingAction: null,
      showMenu: false,

      // debug purposes
      cheatMode: false,
      // cheatMode: true,
      mouseDown: false,
      creatingUnit: false,
      consoleSelectedUnit: 'Grass',
      consoleSelectedColor: 'Gray',
      // useFirebase: true,
      useFirebase: false,
    };
  },

  setFb: function() {
    // var {useFirebase, fbState, currTurn, map, phase} = this.state;

    // if (useFirebase) {
    //   fbState.set({
    //     map: JSON.stringify(js(map)),
    //     currTurn: currTurn,
    //     phase: phase,
    //   });
    // }
  },

  repeatCycle: function() {
    let {phase, currTurn, originalMapIndex} = this.props;
    let turnColors = getMapPlayerColors(allMaps[originalMapIndex]);
    // currTurn is really previous turn here
    var newRound = currTurn === turnColors.length - 1;

    if (phase !== 'initGame') {
      this.props.syncProps({
        currTurn: newRound ? 0 : currTurn + 1,
      });
      // this.setState({
      //   currTurn: newRound ? 0 : currTurn + 1,
      // }, this.setFb);
    }

    var steps = [
      [growTrees, 'Tree Growth', 0],
      [resetUnitMoves, '', 0],
      [killTombstones, 'Kill Tombstones', 0],
      [matureTiles, 'Builds', 400],
      [addIncome, 'Generate Income', 400],
      [payOrDie, 'Payment', 400],
    ];

    let doStep = steps => {
      if (steps.length === 0) {
        this.props.syncProps({
          phase: 'Player',
        });
        // this.setState({
        //   phase: 'Player',
        // }, this.setFb);
        return;
      }

      var [[action, nextPhase, startDelay], ...rest] = steps;
      setTimeout(() => {
        let {history} = this.state;
        let {map, currTurn} = this.props;

        var newMap = action(map, turnColors[currTurn]);
        this.setState({
          // map: newMap,
          // phase: nextPhase,
          history: history.concat([newMap]),
        }, () => {
          // this.setFb();
          this.props.syncProps({
            map: newMap,
            phase: nextPhase,
          });
          doStep(rest);
        });
      }, startDelay);
    };

    doStep(newRound ? steps : steps.slice(1));
  },

  componentDidMount: function() {
    // var {
    //   useFirebase,
    //   fbState,
    //   fbEmptySlots,
    // } = this.state;

    window.addEventListener('keydown', (e) => {
      if (!this.isMounted()) {
        return;
      }
      if (e.which === 27) {
        // escape
        this.setState(cancelPendingActionState);
      } else if (e.which === 13) {
        // enter, done own turn
        this.setState(cancelPendingActionState, this.repeatCycle);
      } else if (e.which === 16) {
        // shift
        this.setState({
          creatingUnit: true,
        });
      }
    });

    window.addEventListener('keyup', (e) => {
      if (!this.isMounted()) {
        return;
      }
      if (e.which === 16) {
        this.setState({
          creatingUnit: false,
        });
      }
    });

    window.addEventListener('mouseup', () => {
      if (!this.isMounted()) {
        return;
      }
      this.setState({
        mouseDown: false,
      });
    });

    // if (!useFirebase) {
    //   this.setState(veryFirstState);
    //   return;
    // }

    // fbEmptySlots.once('value', (dataSnapshot) => {
    //   var emptySlots = dataSnapshot.val();
    //   if (emptySlots <= 0 || emptySlots === 2) {
    //     // either way, new game
    //     fbEmptySlots.set(1);
    //     this.setState({
    //       selfTurn: 1,
    //     });
    //   } else {
    //     fbEmptySlots.set(emptySlots - 1);
    //     this.setState({
    //       selfTurn: emptySlots - 1,
    //     });
    //   }

    //   fbState.once('value', (dataSnapshot) => {
    //     var {map, currTurn, phase} = dataSnapshot.val();
    //     var JSMap = JSON.parse(map);

    //     if (JSMap == null || currTurn == null || phase == null || phase === '') {
    //       // first time, send back some legit value and start
    //       this.setState(veryFirstState, this.setFb);
    //       fbEmptySlots.set(2);
    //       return;
    //     }

    //     // existing data
    //     var newMap = clj(JSMap);
    //     this.setState({
    //       history: [newMap],
    //       map: newMap,
    //       currTurn: currTurn,
    //       phase: phase,
    //     });
    //   });

    //   fbState.on('value', (dataSnapshot) => {
    //     var s = this.state;
    //     var {map, currTurn, phase} = dataSnapshot.val();
    //     var newMap = clj(JSON.parse(map));

    //     // careful about infinite recursive calls
    //     if (M.equals(s.map, newMap) &&
    //       s.currTurn === currTurn &&
    //       s.phase === phase) {
    //       return;
    //     }

    //     this.setState({
    //       map: newMap,
    //       currTurn: currTurn,
    //       phase: phase,
    //       history: s.history.concat([newMap]),
    //     });
    //   });
    // });
  },

  // for testing purposes, reset firebase map data
  // handleResetGame: function() {
  //   this.setState({
  //     ...veryFirstState,
  //     selfTurn: this.state.selfTurn,
  //   }, this.setFb);
  // },

  handleCheatClick: function() {
    this.setState({
      cheatMode: !this.state.cheatMode,
    });
  },

  handleRangeChange: function(e) {
    var value = parseInt(e.target.value);
    // TODO: better history navigation
    this.setState({
      historyIndex: value,
      // map: this.state.history[value],
    });
  },

  handleDoneClick: function() {
    this.setState(cancelPendingActionState, this.repeatCycle);
  },

  handleMenuItemClick: function([action, rest]) {
    let {selectedCoords} = this.state;
    let {map} = this.props;

    if (!immediateActions[action]) {
      this.setState({
        pendingAction: [action, rest],
        showMenu: false,
      });
      return;
    }

    var newMap;
    if (action === 'upgradeVillage') {
      newMap = upgradeVillage(map, selectedCoords, rest);
    } else if (action === 'build') {
      newMap = build(map, selectedCoords, rest);
    } else if (action === 'upgradeVillager') {
      let region = findRegion(map, ...selectedCoords);
      let villageCoords = findVillageInRegion(map, region);
      newMap = upgradeVillager(map, villageCoords, selectedCoords, rest);
    }

    this.setState(cancelPendingActionState, () => {
      this.props.syncProps({
        map: newMap,
      });
    });
    // this.setState({
    //   ...cancelPendingActionState,
    //   map: newMap,
    // }, this.setFb);
  },

  handleTileMouseDown: function(i, j) {
    let {
      // map,
      pendingAction,
      selectedCoords,
      // phase,
      // currTurn,
      // turns,
      history,
      // selfTurn,
      creatingUnit,
      consoleSelectedColor,
      consoleSelectedUnit,
    } = this.state;
    let {map, phase, currTurn, selfTurn, originalMapIndex} = this.props;

    if (creatingUnit) {
      this.setState({
        ...cancelPendingActionState,
        mouseDown: true,
      }, () => {
        this.props.syncProps({
          map: forceAddNewUnit(map, i, j, consoleSelectedColor, consoleSelectedUnit),
        });
      });
      // this.setState({
      //   ...cancelPendingActionState,
      //   mouseDown: true,
      //   map: forceAddNewUnit(map, i, j, consoleSelectedColor, consoleSelectedUnit),
      // });
      return;
    }

    // TODO: test. remove this and uncomment next code block
    // if (phase !== 'Player') {
    //   this.setState(cancelPendingActionState);
    //   return;
    // }

    let turnColors = getMapPlayerColors(allMaps[originalMapIndex]);
    if (phase !== 'Player' ||
      (!pendingAction && getIn(map, [i, j, 'color']) !== turnColors[currTurn]) ||
      (currTurn !== selfTurn)) {
      this.setState(cancelPendingActionState);
      return;
    }

    if (!pendingAction) {
      this.setState({
        ...cancelPendingActionState,
        selectedCoords: [i, j],
        showMenu: true,
      });
      return;
    }

    let newMap;
    let [action, rest] = pendingAction;
    if (action === 'newVillager') {
      newMap = newVillager(map, [i, j], selectedCoords, rest);
    } else if (action === 'move') {
      newMap = move(map, [i, j], selectedCoords, rest);
    } else if (action === 'newWatchtower') {
      newMap = newWatchtower(map, [i, j], selectedCoords, rest);
    } else if (action === 'newCannon') {
      newMap = newCannon(map, [i, j], selectedCoords, rest);
    } else if (action === 'combineVillagers') {
      newMap = combineVillagers(map, [i, j], selectedCoords);
    } else if (action === 'shootCannon') {
      newMap = shootCannon(map, [i, j], selectedCoords, rest);
    }

    this.setState({
      ...cancelPendingActionState,
      history: history.concat([newMap]),
    }, () => {
      this.props.syncProps({
        map: newMap,
      });
    });
    // this.setState({
    //   ...cancelPendingActionState,
    //   map: newMap,
    //   history: history.concat([newMap]),
    // }, this.setFb);
  },

  handleTileHover: function(i, j) {
    let {
      creatingUnit, consoleSelectedColor, consoleSelectedUnit, mouseDown
    } = this.state;
    let {map} = this.props;

    if (creatingUnit && mouseDown) {
      this.setState({
        hover: [i, j],
      }, () => {
        this.props.syncProps({
          map: forceAddNewUnit(map, i, j, consoleSelectedColor, consoleSelectedUnit),
        });
      });
    } else {
      this.setState({
        hover: [i, j],
      });
    }
    // this.setState({
    //   hover: [i, j],
    //   map: creatingUnit && mouseDown
    //     ? forceAddNewUnit(map, i, j, consoleSelectedColor, consoleSelectedUnit)
    //     : map,
    // });
  },

  handleConsoleTextAreaChange: function(e) {
    this.props.syncProps({
      map: clj(JSON.parse(e.target.value)),
    });
    // this.setState({
    //   map: clj(JSON.parse(e.target.value)),
    // });
  },

  handleConsoleColorClick: function(color) {
    this.setState({
      consoleSelectedColor: color,
    });
  },

  handleConsoleUnitSelect: function(unitName) {
    this.setState({
      consoleSelectedUnit: unitName,
    });
  },

  handleConsoleWHChange: function(prop, e) {
    var val = parseInt(e.target.value);
    if (val < 1 || val > 50) {
      return;
    }

    var map = this.props.map;
    var grassConfig = clj({
      units: {
        Grass: js(get(defaultConfig, 'Grass')),
      },
      color: 'Gray',
    });

    if (prop === 'w') {
      map = M.map(
        row => M.take(val, M.concat(row, M.repeat(grassConfig))),
        map
      );
    } else {
      var row = M.repeat(val, grassConfig);
      map = M.take(val, M.concat(map, M.repeat(row)));
    }

    this.props.syncProps({
      map: surroundWithSea(map),
    });
    // this.setState({
    //   map: surroundWithSea(map),
    // });
  },

  render: function() {
    var {
      hover,
      selectedCoords,
      // map,
      // phase,
      pendingAction,
      showMenu,
      // turns,
      // currTurn,
      history,
      historyIndex,
      // selfTurn,

      cheatMode,
      consoleSelectedUnit,
      consoleSelectedColor,
    } = this.state;
    let {map, phase, currTurn, selfTurn, originalMapIndex} = this.props;

    var maybeMenu;

    if (showMenu) {
      let [i, j] = selectedCoords;
      let villager = getIn(map, [i, j, 'units', 'Villager']);
      let village = getIn(map, [i, j, 'units', 'Village']);
      let cannon = getIn(map, [i, j, 'units', 'Cannon']);

      let x = positioner.calcLeft(j, i);
      let y = positioner.calcTop(i);

      if (villager) {
        let [vi, vj] = findVillageInRegion(map, findRegion(map, i, j));
        maybeMenu = (
          <Menu pos={[x, y]}>
            {getMenuItems.villager(
              rankers.villagerByRank[get(villager, 'rank')],
              js(villager),
              getIn(map, [vi, vj, 'units', 'Village', 'gold']),
              getIn(map, [vi, vj, 'units', 'Village', 'wood']),
              this.handleMenuItemClick
            )}
          </Menu>
        );
      } else if (village) {
        maybeMenu = (
          <Menu pos={[x, y]}>
            {getMenuItems.village(
              rankers.villageByRank[get(village, 'rank')],
              get(village, 'gold'),
              get(village, 'wood'),
              this.handleMenuItemClick
            )}
          </Menu>
        );
      } else if (cannon) {
        let [vi, vj] = findVillageInRegion(map, findRegion(map, i, j));
        maybeMenu = (
          <Menu pos={[x, y]}>
            {getMenuItems.cannon(
              js(cannon),
              getIn(map, [vi, vj, 'units', 'Village', 'gold']),
              getIn(map, [vi, vj, 'units', 'Village', 'wood']),
              this.handleMenuItemClick
            )}
          </Menu>
        );
      }
    }

    let turnColors = getMapPlayerColors(allMaps[originalMapIndex]);
    var currTurnColor = turnColors[currTurn];

    var clickS = {
      color: 'white',
      float: 'right',
    };

    let disabled = !(phase === 'Player' && selfTurn === currTurn);
    let handleDoneClick = disabled ? function() {} : this.handleDoneClick;
    var doneClick = (
      <MenuItem onClick={handleDoneClick} disabled={disabled}>
        {disabled ? currTurnColor + ': ' + phase : 'End Turn'}
      </MenuItem>
    );

    var consoleS = {
      color: 'white',
      display: cheatMode ? 'flex' : 'none',
      flexDirection: 'column',
    };

    var maybeConsole;
    if (cheatMode) {
      let stateToDisplay = {
        ...this.state,
        map: '...',
        fbState: '...',
        fbEmptySlots: '...',
        history: '...',
      };
      let h = M.count(map);
      let w = M.count(M.first(map));

      maybeConsole =
        <div style={consoleS}>
          <input
            type="range"
            value={historyIndex}
            onChange={this.handleRangeChange}
            min={0}
            max={history.length - 1} />

          <div onClick={this.handleResetGame}>Reset Game</div>
          <pre style={{fontSize: 12, overflow: 'scroll', height: 50, float: 'left'}}>
            {JSON.stringify(stateToDisplay, null, 2)}
          </pre>
          <textarea
            style={{WebkitUserSelect: 'inherit', width: 350, height: 60}}
            value={JSON.stringify(js(map))}
            onChange={this.handleConsoleTextAreaChange} />
          <UnitSelector
            unitName={consoleSelectedUnit}
            color={consoleSelectedColor}
            onColorClick={this.handleConsoleColorClick}
            onUnitClick={this.handleConsoleUnitSelect} />

          <input
            type="range"
            value={w}
            max={40}
            onChange={this.handleConsoleWHChange.bind(null, 'w')} />
          <span>width {w}</span>
          <input
            type="range"
            value={h}
            max={40}
            onChange={this.handleConsoleWHChange.bind(null, 'h')} />
          <span>height {h}</span>
        </div>;
    }

    let origMap = allMaps[originalMapIndex];
    let colors = getMapPlayerColors(map);
    let origColors = getMapPlayerColors(origMap);
    let maybeWin;
    if (colors.length !== origColors.length) {
      let w = positioner.calcLeft(M.count(M.first(map)) / 2, 0) - 115;
      let h = positioner.calcTop(M.count(map) / 2) - 95;
      let s = {
        color: 'white',
        fontSize: 80,
        fontWeight: 'bold',
        position: 'absolute',
        textShadow: '0px 0px 10px #ff0000',
        zIndex: 999,
        top: h,
        left: w,
        textAlign: 'center',
        width: 230,
        height: 190,
      };
      maybeWin =
        <div style={s}>
          Game Over!
        </div>;

      doneClick =
        <MenuItem onClick={this.props.onWin}>
          Go back
        </MenuItem>;
    }

    // trail only for Villager
    let moveTrail = [];
    if (pendingAction && pendingAction[1].move) {
      let rank = M.getIn(map, [...selectedCoords, 'units', 'Villager', 'rank']);
      let name = rankers.villagerByRank[rank];
      moveTrail = findMovePath[name](map, hover, selectedCoords);
      if (moveTrail.length > 0) {
        map = move(map, hover, selectedCoords, {name});
      }
    }

    return (
      <div>
        <div style={clickS} onClick={this.handleCheatClick}>Cheat Mode</div>
        {doneClick}
        {maybeConsole}
        <Grid
          hover={hover}
          moveTrail={moveTrail}
          turn={currTurnColor}
          tileConfigs={map}
          onTileMouseDown={this.handleTileMouseDown}
          onTileHover={this.handleTileHover}>
            {maybeMenu}
            {maybeWin}
        </Grid>
      </div>
    );
  }
});

module.exports = Game;
