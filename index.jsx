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

var map1 = require('./src/map/data/map1');

var js = M.toJs;

function filterMap(map, f) {
  var map = mapSeqToVec(map);

  return M.mapcat((row, i) => {
    var maybeCoords = M.map((cell, j) => {
      return f(cell) ? [i, j] : null;
    }, row, M.range());

    return M.filter(M.identity, maybeCoords);
  }, map, M.range());
}

// helper
function filterMapByColor(map, turn, f) {
  return filterMap(map, (cell) => M.get(cell, 'color') === turn && f(cell));
}

function updateMap(map, coords, f) {
  map = mapSeqToVec(map);

  return M.reduce((map, coords) => M.updateIn(map, coords, f), map, coords);
}

function getMaybeVillage(map, config) {
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

function getMaybeVillager(map, config) {
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

function setInitialVillagesGold(map, amount) {
  var villageCoords = filterMap(map, (cell) => {
    var config = M.get(cell, 'units');
    return getMaybeVillage(map, config)[0];
  });

  return updateMap(map, villageCoords, (cell) => {
    var config = M.get(cell, 'units');
    var [type, typeName] = getMaybeVillage(map, config);
    return M.updateIn(cell, ['units', typeName, 'gold'], (oldAmount) => {
      return (oldAmount || 0) + amount;
    });
  });
}

function growTrees(map) {
  var map = mapSeqToVec(map);

  var treeCoords = filterMap(map, (cell) => M.getIn(cell, ['units', 'Tree']));

  return M.reduce((map, [i, j]) => {
    // TODO: filter first
    if (Math.random() > 0.5) {
      return map;
    }

    var emptyNeighbors = findNeighbors(map, i, j).filter(([i, j]) => {
      return M.every((unitName) => {
        return coexistances[unitName].Tree;
      }, M.keys(M.getIn(map, [i, j, 'units'])));
    });

    if (emptyNeighbors.length === 0) {
      return map;
    }

    var [i2, j2] = randNth(emptyNeighbors);
    return M.updateIn(map, [i2, j2, 'units'], (config) => {
      return M.assoc(config, 'Tree', M.hashMap());
    });
  }, map, treeCoords);
}

function tombstonesToTrees(map, turn) {
  var tombstoneCoords = filterMapByColor(map, turn, (cell) => {
    return M.getIn(cell, ['units', 'Tombstone']);
  });
  return updateMap(map, tombstoneCoords, (cell) => {
    cell = dissocIn(cell, ['units', 'Tombstone']);
    return M.assocIn(cell, ['units', 'Tree'], M.hashMap());
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

  var visited = {};
  var toVisit = [[i, j]];

  while (toVisit.length > 0) {
    var [i, j] = toVisit.pop();
    var unVisitedSameColorNeighbors = findNeighbors(map, i, j)
      .filter(([i, j]) => M.getIn(map, [i, j, 'color']) === color)
      .filter((coords) => !visited[coords.join('|')]);

    unVisitedSameColorNeighbors.forEach((coords) => {
      visited[coords.join('|')] = true;
      toVisit.push(coords);
    });
  }

  return Object.keys(visited)
    .map((hash) => hash.split('|'))
    .map(([i, j]) => [parseInt(i), parseInt(j)]);
}

// region + outer ring (explore outside land)
// function findOuterRegion(map, i, j) {
//   var map = mapSeqToVec(map);

//   var color = M.getIn(map, [i, j, 'color']);

//   var coords = findRegion(map, i, j);
//   var outers = coords.map(([i, j]) => {
//     return findNeighbors(map, i, j).filter(([i, j]) => {
//       return M.getIn(map, [i, j, 'color']) !== color;
//     });
//   });
//   outers = [].concat.apply([], outers);
//   debugger;

//   return outers;
// }

function addIncome(map, turn) {
  var map = mapSeqToVec(map);

  var villageCoords = filterMapByColor(map, turn, (cell) => {
    var config = M.get(cell, 'units');
    return getMaybeVillage(map, config)[0];
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

    return M.updateIn(map, [i, j, 'units'], (config) => {
      var [type, typeName] = getMaybeVillage(map, config);

      return M.updateIn(config, [typeName, 'gold'], (oldAmount) => oldAmount + sum);
    });
  }, map, villageCoords);
}

function payTime(map, turn) {
  var map = mapSeqToVec(map);

  var villageCoords = filterMapByColor(map, turn, (cell) => {
    var config = M.get(cell, 'units');
    return getMaybeVillage(map, config)[0];
  });

  return M.reduce((map, [i, j]) => {
    var sum = findRegion(map, i, j).reduce((sum, [i, j]) => {
      var config = M.getIn(map, [i, j, 'units']);
      var [type, typeName] = getMaybeVillager(map, config);

      var amount = typeName === 'Peasant' ? 2
        : typeName === 'Infantry' ? 6
        : typeName === 'Soldier' ? 18
        : typeName === 'Knight' ? 54
        : 0;

      return sum + amount;
    }, 0);

    return M.updateIn(map, [i, j, 'units'], (config) => {
      var [type, typeName] = getMaybeVillage(map, config);

      return M.updateIn(config, [typeName, 'gold'], (oldAmount) => oldAmount - sum);
    });
  }, map, villageCoords);
}

function dieTime(map, turn) {
  var map = mapSeqToVec(map);

  var villageCoords = filterMapByColor(map, turn, (cell) => {
    var config = M.get(cell, 'units');
    return getMaybeVillage(map, config)[0];
  });

  return M.reduce((map, [i, j]) => {
    var config = M.getIn(map, [i, j, 'units']);

    var [type, typeName] = getMaybeVillage(map, config);

    var gold = M.getIn(config, [typeName, 'gold']);
    if (gold >= 0) {
      return map;
    }

    // reset negative gold to 0
    map = M.assocIn(map, [i, j, 'units', typeName, 'gold'], 0);

    // turn units into tombstones
    var units = findRegion(map, i, j).filter(([i, j]) => {
      var config = M.getIn(map, [i, j, 'units']);

      var [type, typeName] = getMaybeVillager(map, config);

      if (type) {
        return [i, j];
      }
    }, 0);

    return units.reduce((map, [i, j]) => {
      var config = M.getIn(map, [i, j, 'units']);

      var [type, typeName] = getMaybeVillager(map, config);

      map = dissocIn(map, [i, j, 'units', typeName]);
      return M.assocIn(map, [i, j, 'units', 'Tombstone'], M.hashMap());
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

  // hovel: overtaken by enemy soldier
  // town: overtaken by enemy soldier
  // fort: overtaken by knight
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

function getMenuItemsForVillager(typeName, cb) {
  var items;
  if (typeName === 'Peasant') {
    items = [
      // can't invade
      ['Move', 'move'],
      ['Gather Wood', 'gatherWood'],
      ['Clear Tombstone', 'clearTombstone'],
      ['Cultivate Meadow', 'cultivateMeadow'],
      ['Build Road', 'buildRoad'],
    ];
  } else if (typeName === 'Infantry') {
    items = [
      ['Move', 'move'],
      ['Gather Wood', 'gatherWood'],
      ['Clear Tombstone', 'clearTombstone'],
      ['Kill', 'kill'],
    ];
  } else if (typeName === 'Soldier') {
    items = [
      // tramples meadow unless there's a road
      ['Move', 'move'],
      ['Gather Wood', 'gatherWood'],
      ['Clear Tombstone', 'clearTombstone'],
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

  if (!clickedInRegion) {
    return map;
  }

  var config = M.getIn(map, [vi, vj, 'units']);
  var [type, typeName] = getMaybeVillage(map, config);

  var noConflictInDest = M.every((potentialConflictName) => {
    return coexistances[potentialConflictName][unitName];
  }, M.keys(M.getIn(map, [di, dj, 'units'])));

  if (!noConflictInDest) {
    return map;
  }

  map = M.updateIn(map, [vi, vj, 'units', typeName, 'gold'], (oldAmount) => {
    return (oldAmount || 0) - gold;
  });

  return M.assocIn(map, [di, dj, 'units', unitName], M.hashMap());
}

function gatherWood(map, destCoords, unitCoords) {
  var [di, dj] = destCoords;
  var [ui, uj] = unitCoords;

  // TODO: peasant can't go on neighbor enemy tiles
  var canMoveToDest = findNeighbors(map, ui, uj).some(([i, j]) => {
    return i === di && j === dj;
  });

  if (!canMoveToDest) {
    return map;
  }

  var [vi, vj] = findRegion(map, ui, uj).filter(([i, j]) => {
    // TODO refactor getMaybeVillage(r), type never used, abstract away config
    var config = M.getIn(map, [i, j, 'units']);
    return getMaybeVillage(map, config)[0];
  })[0];

  var config = M.getIn(map, [vi, vj, 'units']);
  var [type, typeName] = getMaybeVillage(map, config);

  map = M.updateIn(map, [vi, vj, 'units', typeName, 'wood'], (oldAmount) => {
    return (oldAmount || 0) + 1;
  });
  // TODO: is there a tree?
  map = dissocIn(map, [di, dj, 'units', 'Tree']);

  var config2 = M.getIn(map, [ui, uj, 'units']);
  var [type2, typeName2] = getMaybeVillager(map, config2);

  map = dissocIn(map, [ui, uj, 'units', typeName2]);
  return M.assocIn(map, [di, dj, 'units', typeName2], type2);
}

function move(map, destCoords, unitCoords) {
  var [di, dj] = destCoords;
  var [ui, uj] = unitCoords;

  // TODO: peasant can't go on neighbor enemy tiles
  var canMoveToDest = findNeighbors(map, ui, uj).some(([i, j]) => {
    return i === di && j === dj;
  });

  if (!canMoveToDest) {
    return map;
  }

  var config = M.getIn(map, [ui, uj, 'units']);
  var [type, typeName] = getMaybeVillager(map, config);

  map = dissocIn(map, [ui, uj, 'units', typeName]);
  map = M.assocIn(map, [di, dj, 'units', typeName], type);

  // might be neutral tile
  return map;
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
      map: M.toClj(map1),
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
        map: growTrees(this.state.map),
        phase: 'tombstone',
      });
    }, 500);

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
      //
    } else if (pendingAction === 'upgradeToFort') {
      //
    } else if (pendingAction === 'move') {
      // assume `selectedCoords` to be unit coordinates
      this.setState({
        ...cancelPendingActionState,
        map: move(map, [i, j], selectedCoords),
      });
    } else if (pendingAction === 'gatherWood') {
      this.setState({
        ...cancelPendingActionState,
        map: gatherWood(map, [i, j], selectedCoords),
      });
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
      var config = M.getIn(map, [i, j, 'units']);
      var [type, typeName] = getMaybeVillager(map, config);
      var [type2, typeName2] = getMaybeVillage(map, config);

      let x = positioner.calcLeft(j, i);
      let y = positioner.calcTop(i);

      if (type) {
        maybeMenu = (
          <Menu pos={[x, y]}>
            {getMenuItemsForVillager(typeName, this.handleMenuItemClick)}
          </Menu>
        );
      } else if (type2) {
        // TODO: need default values
        var gold = M.getIn(config, [typeName2, 'gold']) || 0;
        var wood = M.getIn(config, [typeName2, 'wood']) || 0;
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
          <div>Phase: {phase}</div>
          <div>Pending action: {pendingAction}</div>
          {JSON.stringify(hover)}
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
