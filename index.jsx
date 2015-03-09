var React = require('react');
var Grid = require('./src/map/Grid');
var {Menu, MenuItem} = require('./src/Menu');
var M = require('mori');
var coexistances = require('./src/coexistances');
var dissocIn = require('./src/utils/dissocIn');
var randNth = require('./src/utils/randNth');
var findNeighbors = require('./src/findNeighbors');
var mapSeqToVec = require('./src/mapSeqToVec');
var positioner = require('./src/map/positioner');
var everyUnit = require('./src/everyUnit');

var map1 = require('./src/map/data/map1');

var js = M.toJs;
var clj = M.toClj;

// handy, see usage
function add(x) {
  return function(y) {
    return x + y;
  }
}

function filterMap(map, f) {
  var map = mapSeqToVec(map);

  return M.mapcat((row, i) => {
    var maybeCoords = M.map((cell, j) => {
      return f(cell, i, j) ? [i, j] : null;
    }, row, M.range());

    return M.filter(M.identity, maybeCoords);
  }, map, M.range());
}

// helper
function filterMapByColor(map, turn, f) {
  return filterMap(map, (cell, i, j) => {
    return M.get(cell, 'color') === turn && f(cell, i, j);
  });
}

function updateMap(map, coordsList, f) {
  map = mapSeqToVec(map);

  return M.reduce((map, coords) => {
    return M.updateIn(map, coords, (cell) => f(cell, ...coords));
  }, map, coordsList);
}

function getMaybeVillage(map, i, j) {
  var config = M.getIn(map, [i, j, 'units']);

  var hovel = M.get(config, 'Hovel');
  var town = M.get(config, 'Town');
  var fort = M.get(config, 'Fort');

  var type = hovel || town || fort;
  var typeName = hovel ? 'Hovel' :
    town ? 'Town':
    fort ? 'Fort'
    : null;

  return [type, typeName];
}

function getMaybeVillager(map, i, j) {
  var config = M.getIn(map, [i, j, 'units']);

  var peasant = M.get(config, 'Peasant');
  var infantry = M.get(config, 'Infantry');
  var soldier = M.get(config, 'Soldier');
  var knight = M.get(config, 'Knight');

  var type = peasant || infantry || soldier || knight;
  var typeName = peasant ? 'Peasant'
    : infantry ? 'Infantry'
    : soldier ? 'Soldier'
    : knight ? 'Knight'
    : null;

  return [type, typeName];
}

function canCoexist(map, unitName, i, j) {
  return M.every(
    potentialConflict => coexistances[potentialConflict][unitName],
    M.keys(M.getIn(map, [i, j, 'units']))
  );
}

// ----------- phases

function setInitialVillagesGold(map, amount) {
  var villageCoords = filterMap(map, (cell, i, j) => {
    return getMaybeVillage(map, i, j)[0];
  });

  return updateMap(map, villageCoords, (cell, i, j) => {
    var [type, typeName] = getMaybeVillage(map, i, j);

    return M.updateIn(cell, ['units', typeName, 'gold'], add(amount));
  });
}

function growTrees(map) {
  var map = mapSeqToVec(map);

  var treeCoords = filterMap(map, (cell) => M.getIn(cell, ['units', 'Tree']));
  treeCoords = M.filter(() => Math.random() > 0.5, treeCoords);

  return M.reduce((map, [i, j]) => {
    var emptyNeighbors = findNeighbors(map, i, j).filter(([i, j]) => {
      return canCoexist(map, 'Tree', i, j);
    });

    if (emptyNeighbors.length === 0) {
      return map;
    }

    var [i2, j2] = randNth(emptyNeighbors);
    return M.updateIn(map, [i2, j2, 'units'], (config) => {
      return M.assoc(config, 'Tree', clj(everyUnit.defaultConfig.Tree));
    });
  }, map, treeCoords);
}

function tombstonesToTrees(map, turn) {
  var tombstoneCoords = filterMapByColor(map, turn, (cell) => {
    return M.getIn(cell, ['units', 'Tombstone']);
  });
  return updateMap(map, tombstoneCoords, (cell) => {
    cell = dissocIn(cell, ['units', 'Tombstone']);
    return M.assocIn(cell, ['units', 'Tree'], clj(everyUnit.defaultConfig.Tree));
  });
}

function resetUnitMoves(map, turn) {
  var unitCoords = filterMapByColor(map, turn, (cell, i, j) => {
    return getMaybeVillager(map, i, j)[0];
  });
  return updateMap(map, unitCoords, (cell, i, j) => {
    var [type, typeName] = getMaybeVillager(map, i, j);
    return M.assocIn(cell, ['units', typeName, 'hasMoved'], false);
  });
}

function matureTiles(map, turn) {
  map = matureBuilt(map, turn, 'Meadow');
  return matureBuilt(map, turn, 'Road');
}

function matureBuilt(map, turn, unitName) {
  var meadowCoords = filterMapByColor(map, turn, (cell) => {
    return M.getIn(cell, ['units', unitName]);
  });
  return updateMap(map, meadowCoords, (cell) => {
    return M.updateIn(cell, ['units', unitName, 'cooldown'], (cooldown) => {
      return cooldown ? cooldown - 1 : 0;
    });
  });
}

function findRegion(map, i, j) {
  var map = mapSeqToVec(map);

  var color = M.getIn(map, [i, j, 'color']);

  var visited = M.set();
  var toVisit = [[i, j]];

  while (toVisit.length > 0) {
    var [i, j] = toVisit.pop();
    var unVisitedSameColorNeighbors = findNeighbors(map, i, j)
      .filter(([i, j]) => M.getIn(map, [i, j, 'color']) === color)
      .filter(([i, j]) => !M.get(visited, M.vector(i, j)));

    unVisitedSameColorNeighbors.forEach(([i, j]) => {
      visited = M.conj(visited, M.vector(i, j));
      toVisit.push([i, j]);
    });
  }

  return js(visited);
}

function addIncome(map, turn) {
  var map = mapSeqToVec(map);

  var villageCoords = filterMapByColor(map, turn, (cell, i, j) => {
    return getMaybeVillage(map, i, j)[0];
  });

  return M.reduce((map, [i, j]) => {
    var sum = findRegion(map, i, j).reduce((sum, [i, j]) => {
      var config = M.getIn(map, [i, j, 'units']);
      var get = (unitName) => M.get(config, unitName);

      // this is only determined by the land type (sea, grass, meadow, tree)
      // conceptually tree is a landtype
      var amount = get('Tree') ? 0
        : get('Meadow') && M.get(get('Meadow'), 'cooldown') === 0 ? 2
        : 1;

      return sum + amount;
    }, 0);

    var [type, typeName] = getMaybeVillage(map, i, j);
    return M.updateIn(map, [i, j, 'units', typeName, 'gold'], add(sum));
  }, map, villageCoords);
}

function payTime(map, turn) {
  var map = mapSeqToVec(map);

  var villageCoords = filterMapByColor(map, turn, (cell, i, j) => {
    return getMaybeVillage(map, i, j)[0];
  });

  return M.reduce((map, [i, j]) => {
    var sum = findRegion(map, i, j).reduce((sum, [i, j]) => {
      var [type, typeName] = getMaybeVillager(map, i, j);

      var amount = typeName === 'Peasant' ? 2
        : typeName === 'Infantry' ? 6
        : typeName === 'Soldier' ? 18
        : typeName === 'Knight' ? 54
        : 0;

      return sum + amount;
    }, 0);

    var [type, typeName] = getMaybeVillage(map, i, j);
    return M.updateIn(map, [i, j, 'units', typeName, 'gold'], add(-sum));
  }, map, villageCoords);
}

function dieTime(map, turn) {
  var map = mapSeqToVec(map);

  var villageCoords = filterMapByColor(map, turn, (cell, i, j) => {
    return getMaybeVillage(map, i, j)[0];
  });

  return M.reduce((map, [i, j]) => {
    var config = M.getIn(map, [i, j, 'units']);

    var [type, typeName] = getMaybeVillage(map, i, j);

    var gold = M.getIn(config, [typeName, 'gold']);
    if (gold >= 0) {
      return map;
    }

    // reset negative gold to 0
    map = M.assocIn(map, [i, j, 'units', typeName, 'gold'], 0);

    // turn units into tombstones
    var units = findRegion(map, i, j).filter(([i, j]) => {
      var [type, typeName] = getMaybeVillager(map, i, j);

      if (typeName) {
        return [i, j];
      }
    }, 0);

    return units.reduce((map, [i, j]) => {
      var [type, typeName] = getMaybeVillager(map, i, j);

      map = dissocIn(map, [i, j, 'units', typeName]);
      return M.assocIn(
        map,
        [i, j, 'units', 'Tombstone'],
        clj(everyUnit.defaultConfig.Tombstone)
      );
    }, map);
  }, map, villageCoords);
}

function payOrDie(map, turn) {
  var map = mapSeqToVec(map);

  map = payTime(map, turn);
  return dieTime(map, turn);
}

// -------------------------- phases over

function getMenuItemsForVillage(typeName, gold, wood, cb) {
  var items;
  if (typeName === 'Hovel') {
    items = [
      ['New Peasant', 'newPeasant', 10, 0],
      ['New Infantry', 'newInfantry', 20, 0],
      ['Upgrade to Town', 'upgradeToTown', 0, 8],
    ];
  } else if (typeName === 'Town') {
    items = [
      ['New Peasant', 'newPeasant', 10, 0],
      ['New Infantry', 'newInfantry', 20, 0],
      ['New Soldier', 'newSoldier', 30, 0],
      ['New Watchtower', 'newWatchtower', 0, 5],
      ['Upgrade to Fort', 'upgradeToFort', 0, 8],
    ];
  } else if (typeName === 'Fort') {
    items = [
      ['New Peasant', 'newPeasant', 10, 0],
      ['New Infantry', 'newInfantry', 20, 0],
      ['New Soldier', 'newSoldier', 30, 0],
      ['New Knight', 'newKnight', 40, 0],
      ['New Watchtower', 'newWatchtower', 0, 5],
      ['Upgrade to Fort', 'upgradeToFort', 0, 8],
    ];
  }

  return items.map(([desc, action, goldReq, woodReq]) => {
    if (gold >= goldReq && wood >= woodReq) {
      return (
        <MenuItem key={action} onClick={cb.bind(null, action)} disabled={false}>
          {desc}
        </MenuItem>
      );
    }

    return (
      <MenuItem key={action} disabled={true}>
        {desc}
      </MenuItem>
    );
  });
}

function getMenuItemsForVillager(typeName, {hasMoved, cooldown}, cb) {
  if (hasMoved) {
    return [
      <MenuItem key="hasMoved" disabled={true}>
        Already Moved
      </MenuItem>
    ];
  }
  if (cooldown > 0) {
    return [
      <MenuItem key="cooldown" disabled={true}>
        Cooldown ({cooldown})
      </MenuItem>
    ];
  }
  var items;
  if (typeName === 'Peasant') {
    items = [
      // can't invade
      ['Move', 'move'],
      ['Cultivate Meadow', 'cultivateMeadow'],
      ['Build Road', 'buildRoad'],
    ];
  } else if (typeName === 'Infantry') {
    items = [
      ['Move', 'move'],
      ['Kill', 'kill'],
    ];
  } else if (typeName === 'Soldier') {
    items = [
      // tramples meadow unless there's a road
      ['Move', 'move'],
      ['Kill', 'kill'],
    ];
  } else if (typeName === 'Knight') {
    items = [
      // can't move into tree, etc. tramples meadow unless road
      ['Move', 'move'],
      ['Kill', 'kill'],
    ];
  }

  return items.map(([desc, action]) => {
    return (
      <MenuItem key={action} onClick={cb.bind(null, action)} disabled={false}>
        {desc}
      </MenuItem>
    );
  });
}

// state returners

function newVillager(map, destCoords, villageCoords, unitName, gold) {
  var [di, dj] = destCoords;
  var [vi, vj] = villageCoords;

  var clickedInRegion = findRegion(map, vi, vj)
    .some(([i2, j2]) => di === i2 && dj === j2);

  if (!clickedInRegion || !canCoexist(map, unitName, di, dj)) {
    return map;
  }

  var [type, typeName] = getMaybeVillage(map, vi, vj);

  map = M.updateIn(map, [vi, vj, 'units', typeName, 'gold'], add(-gold));

  return M.assocIn(
    map,
    [di, dj, 'units', unitName],
    clj(everyUnit.defaultConfig[unitName])
  );
}

function findVillageInRegion(map, region) {
  return region.filter(([i, j]) => {
    return getMaybeVillage(map, i, j)[0];
  })[0];
}

function move(map, [di, dj], [ui, uj]) {
  var [type, typeName] = getMaybeVillager(map, ui, uj);
  var destConfig = M.getIn(map, [di, dj]);
  var destColor = M.get(destConfig, 'color');
  var ownColor = M.getIn(map, [ui, uj, 'color']);

  var isEnemyColor = destColor !== 'Gray' && destColor !== ownColor;

  // peasant can't go on neighbor enemy tiles
  if (typeName === 'Peasant' && isEnemyColor) {
    return map;
  }

  var hasTree = M.getIn(destConfig, ['units', 'Tree']);
  var hasTombstone = M.getIn(destConfig, ['units', 'Tombstone']);

  // only knight can't gather wood & clear tombstone
  if (typeName === 'Knight' && (hasTree || hasTombstone)) {
    return map;
  }

  var movingToNeighbor = findNeighbors(map, ui, uj).some(([i, j]) => {
    return i === di && j === dj;
  });
  if (!movingToNeighbor) {
    return map;
  }

  map = dissocIn(map, [di, dj, 'units', 'Tombstone']);

  if (hasTree) {
    map = dissocIn(map, [di, dj, 'units', 'Tree']);

    let [vi, vj] = findVillageInRegion(map, findRegion(map, ui, uj))
    let [type, typeName] = getMaybeVillage(map, vi, vj);

    map = M.updateIn(map, [vi, vj, 'units', typeName, 'wood'], add(1));
  }

  // check if unit can coexist on dest tile. this must be done after removing
  // tombstone and tree
  if (!canCoexist(map, typeName, di, dj)) {
    return map;
  }

  // at this point we don't have any more early return (aka invalid move). we
  // can safely mark unit as having already moved below

  // can't move anymore if picked tomb/tree/differently colored tile
  if (hasTree || hasTombstone || destColor !== ownColor) {
    map = M.assocIn(map, [ui, uj, 'units', typeName, 'hasMoved'], true);
  }

  // might be joining 2/3 same-colored regions...
  if (destColor !== ownColor) {
    var regions = findNeighbors(map, di, dj)
      .filter(([i, j]) => M.getIn(map, [i, j, 'color']) === ownColor)
      .map(([i, j]) => findRegion(map, i, j));

    // will kill dupe villages
    var villageToRegionSizeM = M.zipmap(
      clj(regions.map(region => findVillageInRegion(map, region))),
      regions.map(region => region.length)
    );

    var bestVillagePack = M.reduce((pack1, pack2) => {
      // highest ranked village
      var [[i1, j1], size1] = js(pack1);
      var [[i2, j2], size2] = js(pack2);
      var typeName1 = getMaybeVillage(map, i1, j1)[1];
      var typeName2 = getMaybeVillage(map, i2, j2)[1];
      var rank1 = everyUnit.rank[typeName1];
      var rank2 = everyUnit.rank[typeName2];

      if (rank1 > rank2) {
        return pack1;
      } else if (rank1 < rank2) {
        return pack2;
      }
      // if same rank: biggest region village
      return size1 > size2 ? pack1 : pack2;
    }, villageToRegionSizeM);

    var [[bi, bj], size] = js(bestVillagePack);
    var bestTypeName = getMaybeVillage(map, bi, bj)[1];

    map = M.reduce((map, pack) => {
      var [[i, j], size] = js(pack);
      if (i === bi && j === bj) {
        return map;
      }

      var typeName = getMaybeVillage(map, i, j)[1];
      var gold = M.getIn(map, [i, j, 'units', typeName, 'gold']);
      var wood = M.getIn(map, [i, j, 'units', typeName, 'wood']);

      map = M.updateIn(map, [bi, bj, 'units', bestTypeName, 'gold'], add(gold));
      map = M.updateIn(map, [bi, bj, 'units', bestTypeName, 'wood'], add(wood));
      return dissocIn(map, [i, j, 'units', typeName]);
    }, map, villageToRegionSizeM);

    // claim land, mark color
    map = M.assocIn(map, [di, dj, 'color'], ownColor);
  }

  // finally move. nice to do at the end, otherwise [ui ji] [di dj] gets
  // confusing halfway through
  // can't reuse type from above. we changed the map and unit afterward (e.g.
  // hasMoved)
  var unit = M.getIn(map, [ui, uj, 'units', typeName]);
  map = dissocIn(map, [ui, uj, 'units', typeName]);
  return M.assocIn(map, [di, dj, 'units', typeName], unit);
}

// -------------------------- menu actions over

var cancelPendingActionState = {
  selectedCoords: null,
  pendingAction: null,
  showMenu: false,
};

var App = React.createClass({
  getInitialState: function() {
    return {
      hover: [0, 0],
      map: clj(map1),
      turn: 'Red',
      phase: 'initGame',
      selectedCoords: null,
      pendingAction: null,
      showMenu: false,
    };
  },

  componentDidMount: function() {
    window.addEventListener('keydown', (e) => {
      // escape
      if (e.which === 27) {
        this.setState(cancelPendingActionState);
      }
    });

    setTimeout(() => {
      this.setState({
        map: setInitialVillagesGold(this.state.map, 70),
        phase: 'treeGrowth',
      });
    }, 100);

    setTimeout(() => {
      this.setState({
        map: growTrees(this.state.map, this.state.turn),
        phase: 'resetUnitMoves',
      });
    }, 500);

    // player phase specific. each player round, not each total round
    setTimeout(() => {
      this.setState({
        map: resetUnitMoves(this.state.map, this.state.turn),
        phase: 'tombstone',
      });
    }, 750);

    setTimeout(() => {
      this.setState({
        map: tombstonesToTrees(this.state.map, this.state.turn),
        phase: 'build',
      });
    }, 1000);

    setTimeout(() => {
      this.setState({
        map: matureTiles(this.state.map, this.state.turn),
        phase: 'income',
      });
    }, 1100);

    setTimeout(() => {
      this.setState({
        map: addIncome(this.state.map, this.state.turn),
        phase: 'payment',
      });
    }, 1300);

    setTimeout(() => {
      this.setState({
        map: payOrDie(this.state.map, this.state.turn),
        phase: 'moveAndPurchase',
      });
    }, 1600);
  },

  handleMenuItemClick: function(action) {
    this.setState({
      pendingAction: action,
      showMenu: false,
    });
  },

  handleTileMouseDown: function(i, j) {
    var {map, pendingAction, selectedCoords} = this.state;

    if (!pendingAction) {
      this.setState({
        ...cancelPendingActionState,
        selectedCoords: [i, j],
        showMenu: true,
      });
      return;
    }

    if (pendingAction === 'newPeasant') {
      // assume `selectedCoords` to be village coordinates
      // assume enough gold (otherwise menu itema disabled in render)
      this.setState({
        ...cancelPendingActionState,
        map: newVillager(map, [i, j], selectedCoords, 'Peasant', 10),
      });
    } else if (pendingAction === 'newInfantry') {
      this.setState({
        ...cancelPendingActionState,
        map: newVillager(map, [i, j], selectedCoords, 'Infantry', 20),
      });
    } else if (pendingAction === 'newSoldier') {
      this.setState({
        ...cancelPendingActionState,
        map: newVillager(map, [i, j], selectedCoords, 'Soldier', 30),
      });
    } else if (pendingAction === 'newKnight') {
      this.setState({
        ...cancelPendingActionState,
        map: newVillager(map, [i, j], selectedCoords, 'Knight', 40),
      });
    } else if (pendingAction === 'upgradeToTown') {
      this.setState({
        ...cancelPendingActionState,
        map: newVillager(map, [i, j], selectedCoords, 'Knight', 40),
      });
    } else if (pendingAction === 'upgradeToFort') {
      //
    } else if (pendingAction === 'move') {
      // assume `selectedCoords` to be unit coordinates
      this.setState({
        ...cancelPendingActionState,
        map: move(map, [i, j], selectedCoords),
      });
    } else if (pendingAction === 'cultivateMeadow') {
      // TODO: this
    } else {
      throw 'umimplemented ' + pendingAction;
    }
  },

  handleTileHover: function(i, j) {
    this.setState({
      hover: [i, j],
    });
  },

  render: function() {
    var state = this.state;
    var {hover, selectedCoords, map, phase, pendingAction, showMenu} = state;

    var gridWrapper = {
      border: '1px solid black',
      width: 10000,
      top: 100,
      position: 'relative',
    };

    var consoleS = {
      height: 100,
    };

    var maybeMenu;

    if (showMenu) {
      let [i, j] = selectedCoords;
      var [type, typeName] = getMaybeVillager(map, i, j);
      var [type2, typeName2] = getMaybeVillage(map, i, j);

      let x = positioner.calcLeft(j, i);
      let y = positioner.calcTop(i);

      if (typeName) {
        maybeMenu = (
          <Menu pos={[x, y]}>
            {getMenuItemsForVillager(typeName, js(type), this.handleMenuItemClick)}
          </Menu>
        );
      } else if (typeName2) {
        var config = M.getIn(map, [i, j, 'units']);
        var gold = M.getIn(config, [typeName2, 'gold']);
        var wood = M.getIn(config, [typeName2, 'wood']);
        maybeMenu = (
          <Menu pos={[x, y]}>
            {getMenuItemsForVillage(typeName2, gold, wood, this.handleMenuItemClick)}
          </Menu>
        );
      }
    }

    return (
      <div>
        <div style={consoleS}>
          <div>Phase: {phase}. Pending action: {pendingAction || 'none'}</div>
          <pre>
            {JSON.stringify(js(M.getIn(mapSeqToVec(map), hover)), null, 2)}
          </pre>
        </div>
        <div style={gridWrapper}>
          <Grid
            active={hover}
            tileConfigs={map}
            tileMouseDown={this.handleTileMouseDown}
            tileHover={this.handleTileHover}>
              {maybeMenu}
          </Grid>
        </div>
      </div>
    );
  }
});

React.render(<App />, document.querySelector('#container'));
