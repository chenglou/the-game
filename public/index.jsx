'use strict';

var React = require('react');
var Grid = require('./src/map/Grid');
var {Menu, MenuItem} = require('./src/Menu');
var M = require('mori');
var dissocIn = require('./src/utils/dissocIn');
var randNth = require('./src/utils/randNth');
var add = require('./src/utils/add');
var findNeighbors = require('./src/findNeighbors');
var hasConflict = require('./src/hasConflict');
var positioner = require('./src/map/positioner');
var {defaultConfig} = require('./src/everyUnit');
var rankers = require('./src/rankers');
var {pendingActions, immediateActions} = require('./src/actions');
var Firebase = require('firebase');
var UnitSelector = require('./src/debug/UnitSelector');
var surroundWithSea = require('./src/debug/surroundWithSea');
var forceAddNewUnit = require('./src/debug/forceAddNewUnit');
var getColor = require('./src/getColor');
var findVillageInRegion = require('./src/findVillageInRegion');
var {findRegion} = require('./src/findRegion');
var movePeasant = require('./src/movePeasant');
var moveInfantry = require('./src/moveInfantry');
var moveSoldier = require('./src/moveSoldier');
var moveKnight = require('./src/moveKnight');
var trampleOnMeadow = require('./src/trampleOnMeadow');
var canMoveToAura = require('./src/canMoveToAura');
var updateMap = require('./src/updateMap');

var map1 = require('./src/map/data/map1');

var js = M.toJs;
var clj = M.toClj;

function getUnitsByName(map, unitName) {
  return M.mapcat((row, i) => {
    var maybeCoords = M.map((cell, j) => {
      return M.getIn(map, [i, j, 'units', unitName]) ? [i, j] : null;
    }, row, M.range());

    return M.filter(M.identity, maybeCoords);
  }, map, M.range());
}

function getUnitsByColorAndName(map, turn, unitName) {
  return M.filter(
    ([i, j]) => M.getIn(map, [i, j, 'color']) === turn,
    getUnitsByName(map, unitName)
  );
}

function coordsInRegion(map, [i, j], [ti, tj]) {
  // ti, tj is the test coords. i, j actually in region
  return findRegion(map, i, j).some(([i2, j2]) => ti === i2 && tj === j2);
}

// these two functions are, like, syntax magic
function ve(i, j) {
  return [i, j, 'units', 'Village'];
}
function vr(i, j) {
  return [i, j, 'units', 'Villager'];
}
function getVillage(map, i, j) {
  return M.getIn(map, ve(i, j));
}

function getVillager(map, i, j) {
  return M.getIn(map, vr(i, j));
}

// ----------- phases

// peasant cultivateMeadow, enemy disconnects territory, meadow gray, never
// matures
// TODO: use after invasion cuts off land
function killGrayMeadowCooldowns(map) {
  return updateMap(
    map,
    getUnitsByColorAndName(map, 'Gray', 'Meadow'),
    cell => M.assocIn(cell, ['units', 'Meadow', 'cooldown'], 0)
  );
}

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
    return M.assocIn(map, [i2, j2, 'units', 'Tree'], clj(defaultConfig.Tree));
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
      var hasMeadow = M.getIn(cell, ['units', 'Meadow']);
      var hasRoad = M.getIn(cell, ['units', 'Road']);

      return hasMeadow || hasRoad
        ? cell
        : M.assocIn(cell, ['units', 'Tree'], clj(defaultConfig.Tree));
    }
  );
}

function resetUnitMoves(map, turn) {
  return updateMap(
    map,
    getUnitsByColorAndName(map, turn, 'Villager'),
    cell => M.assocIn(cell, ['units', 'Villager', 'hasMoved'], false)
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
      return M.updateIn(cell, ['units', unitName, 'cooldown'], cooldown => {
        return cooldown ? cooldown - 1 : 0;
      });
    }
  );
}

function addIncome(map, turn) {
  return M.reduce((map, [i, j]) => {
    var sum = findRegion(map, i, j).reduce((sum, [i, j]) => {
      let hasTree = M.getIn(map, [i, j, 'units', 'Tree']);
      let hasMeadowWith0Cooldown =
        M.getIn(map, [i, j, 'units', 'Meadow', 'cooldown']) === 0;

      // this is only determined by the land type (sea, grass, meadow, tree)
      // conceptually tree is a landtype
      let amount = hasTree ? 0
        : hasMeadowWith0Cooldown ? 2
        : 1;

      return sum + amount;
    }, 0);

    return M.updateIn(map, [i, j, 'units', 'Village', 'gold'], add(sum));
  }, map, getUnitsByColorAndName(map, turn, 'Village'));
}

function payTime(map, turn) {
  return M.reduce((map, [i, j]) => {
    var sum = findRegion(map, i, j).reduce((sum, [i, j]) => {
      let rank = M.getIn(map, [i, j, 'units', 'Villager', 'rank']);
      if (rank == null) {
        return sum;
      }

      let villagerName = rankers.villagerByRank[rank];

      return sum + rankers.upkeep[villagerName];
    }, 0);

    return M.updateIn(map, [i, j, 'units', 'Village', 'gold'], add(-sum));
  }, map, getUnitsByColorAndName(map, turn, 'Village'));
}

function dieTime(map, turn) {
  var poorVillageCoords = M.filter(
    ([i, j]) => M.getIn(map, [i, j, 'units', 'Village', 'gold']) < 0,
    getUnitsByColorAndName(map, turn, 'Village')
  );

  return M.reduce((map, [i, j]) => {
    // reset negative gold to 0
    map = M.assocIn(map, [i, j, 'units', 'Village', 'gold'], 0);

    // turn units into tombstones
    return findRegion(map, i, j)
      .filter(([i, j]) => getVillager(map, i, j))
      .reduce((map, [i, j]) => {
        map = dissocIn(map, [i, j, 'units', 'Villager']);
        return M.assocIn(
          map,
          [i, j, 'units', 'Tombstone'],
          clj(defaultConfig.Tombstone)
        );
      }, map);

  }, map, poorVillageCoords);
}

function payOrDie(map, turn) {
  map = payTime(map, turn);
  return dieTime(map, turn);
}

// -------------------------- phases over

function getMenuItemsForVillage(typeName, gold, wood, cb) {
  return pendingActions.Village[typeName].map(([desc, action, goldReq, woodReq]) => {
    if (gold >= goldReq && wood >= woodReq) {
      return (
        <MenuItem key={action} onClick={cb.bind(null, action)}>
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

function getMenuItemsForVillager(unitName, {hasMoved, cooldown}, gold, wood, cb) {
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
        {`Cooldown (${cooldown})`}
      </MenuItem>
    ];
  }

  return pendingActions.Villager[unitName].map(([desc, action, goldReq, woodReq]) => {
    if (gold >= goldReq && wood >= woodReq) {
      return (
        <MenuItem key={action} onClick={cb.bind(null, action)}>
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

function getMenuItemsForCannon({hasMoved}, gold, wood, cb) {
  if (hasMoved) {
    return [
      <MenuItem key="hasMoved" disabled={true}>
        Already Moved
      </MenuItem>
    ];
  }

  return pendingActions.Cannon.map(([desc, action, goldReq, woodReq]) => {
    if (gold >= goldReq && wood >= woodReq) {
      return (
        <MenuItem key={action} onClick={cb.bind(null, action)}>
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



// ---------------- state returners

function newVillager(map, [di, dj], [vi, vj], unitName, gold) {
  if (!coordsInRegion(map, [vi, vj], [di, dj]) ||
      hasConflict(map, 'Villager', di, dj)) {
    return map;
  }

  if (unitName === 'Knight' || unitName === 'Soldier') {
    map = trampleOnMeadow(map, unitName, [di, dj]);
  }

  map = M.updateIn(map, [vi, vj, 'units', 'Village', 'gold'], add(-gold));
  var rank = rankers.villagerByRank.indexOf(unitName);

  return M.assocIn(
    map,
    [di, dj, 'units', 'Villager'],
    M.assoc(clj(defaultConfig.Villager), 'rank', rank)
  );
}

function newWatchtower(map, [di, dj], [vi, vj]) {
  if (!coordsInRegion(map, [vi, vj], [di, dj]) ||
      hasConflict(map, 'Watchtower', di, dj)) {
    return map;
  }

  map = M.updateIn(map, [vi, vj, 'units', 'Village', 'wood'], add(-5));

  return M.assocIn(
    map,
    [di, dj, 'units', 'Watchtower'],
    clj(defaultConfig.Watchtower)
  );
}

function combineVillagers(map, [di, dj], [ui, uj]) {
  if (!coordsInRegion(map, [ui, uj], [di, dj]) ||
      !getVillager(map, di, dj)) {
    return map;
  }

  // 'merge rank': Peasant + Peasant = Infantry => 1 + 1 = 2
  var v1MergeRank = M.getIn(map, [ui, uj, 'units', 'Villager', 'rank']) + 1;
  var v2MergeRank = M.getIn(map, [di, dj, 'units', 'Villager', 'rank']) + 1;
  var mergedRank = v1MergeRank + v2MergeRank;
  var actualRank = mergedRank - 1;
  var mergedName = rankers.villagerByRank[actualRank];

  var [vi, vj] = findVillageInRegion(map, findRegion(map, ui, uj));
  var villageRank = M.getIn(map, [vi, vj, 'units', 'Village', 'rank']);
  var villageName = rankers.villageByRank[villageRank];

  if (!rankers.villageCanProduce[villageName][mergedName]) {
    return map;
  }

  // merge to the destination coordinates. clears cooldown, hasMoved
  map = dissocIn(map, [ui, uj, 'units', 'Villager']);
  return M.assocIn(
    map,
    [di, dj, 'units', 'Villager'],
    M.assoc(clj(defaultConfig.Villager), 'rank', actualRank)
  );
}

function build(map, [i, j], unitName, unitCooldown) {
  if (hasConflict(map, unitName, i, j)) {
    return map;
  }

  map = M.assocIn(map, [i, j, 'units', unitName], clj(defaultConfig[unitName]));
  return M.assocIn(map, [i, j, 'units', 'Villager', 'cooldown'], unitCooldown);
}

function move(map, unitName, [di, dj], [ui, uj]) {
  var destColor = getColor(map, di, dj);
  var ownColor = getColor(map, ui, uj);

  // if enemy tile, check aura, might have many auras
  if (destColor !== ownColor &&
      destColor !== 'Gray' &&
      !canMoveToAura(map, unitName, destColor, [di, dj])) {
    return map;
  }

  return {
    Peasant: movePeasant,
    Infantry: moveInfantry,
    Soldier: moveSoldier,
    Knight: moveKnight,
  }[unitName](map, [di, dj], [ui, uj]);
}


function upgradeVillage(map, [i, j]) {
  map = M.updateIn(map, [i, j, 'units', 'Village', 'wood'], add(-8));
  return M.updateIn(map, [i, j, 'units', 'Village', 'rank'], add(1));
}

function upgradeVillager(map, [vi, vj], [si, sj]) {
  let villageRank = M.getIn(map, [vi, vj, 'units', 'Village', 'rank']);
  let villageName = rankers.villageByRank[villageRank];
  let nextUnitRank = M.getIn(map, [si, sj, 'units', 'Villager', 'rank']) + 1;
  let nextUnitName = rankers.villagerByRank[nextUnitRank];

  if (!rankers.villageCanProduce[villageName][nextUnitName]) {
    return map;
  }

  map = M.updateIn(map, [vi, vj, 'units', 'Village', 'gold'], add(-10));
  return M.updateIn(map, [si, sj, 'units', 'Villager', 'rank'], add(1));
}

// -------------------------- menu actions over

var cancelPendingActionState = {
  pendingAction: null,
  showMenu: false,
};

var veryFirstState = {
  map: clj(map1),
  currTurn: 0,
  phase: 'Player',
  selfTurn: 0,
};

var App = React.createClass({
  getInitialState: function() {
    var map = M.vector(M.vector());
    var fireBaseBaseUrl = '';

    return {
      // to sync. the real initialization is in didMount
      map: map,
      currTurn: 0,
      phase: '',

      fbState: function() {},
      fbEmptySlots: function() {},
      // fbState: new Firebase(fireBaseBaseUrl + 'state'),
      // fbEmptySlots: new Firebase(fireBaseBaseUrl + 'emptySlots'),

      // who am I. modified once by fireBase
      selfTurn: -1,

      history: [map],
      historyIndex: 0,
      hover: [0, 0],
      turns: ['Red', 'Blue'],
      selectedCoords: null,
      pendingAction: null,
      showMenu: false,

      // debug purposes
      cheatMode: true,
      mouseDown: false,
      creatingUnit: false,
      consoleSelectedUnit: 'Grass',
      consoleSelectedColor: 'Gray',
      // useFirebase: true,
      useFirebase: false,
    };
  },

  setFb: function() {
    var {useFirebase, fbState, currTurn, map, phase} = this.state;

    if (useFirebase) {
      fbState.set({
        map: JSON.stringify(js(map)),
        currTurn: currTurn,
        phase: phase,
      });
    }
  },

  repeatCycle: function() {
    var {turns, currTurn, phase} = this.state;
    // currTurn is really previous turn here
    var newRound = currTurn === turns.length - 1;

    if (phase !== 'initGame') {
      this.setState({
        currTurn: newRound ? 0 : currTurn + 1,
      }, this.setFb);
    }

    var steps = [
      [growTrees, 'Tree Growth', 0],
      [resetUnitMoves, '', 0],
      [killTombstones, 'Kill Tombstones', 0],
      [matureTiles, 'Builds', 400],
      [addIncome, 'Generate Income', 400],
      [payOrDie, 'Payment', 400],
    ];

    let doStep = (steps) => {
      if (steps.length === 0) {
        this.setState({
          phase: 'Player',
        }, this.setFb);
        return;
      }

      var [[action, nextPhase, startDelay], ...rest] = steps;
      setTimeout(() => {
        var {map, history, currTurn, turns} = this.state;

        var newMap = action(map, turns[currTurn]);
        this.setState({
          map: newMap,
          phase: nextPhase,
          history: history.concat([newMap]),
        }, () => {
          this.setFb();
          doStep(rest);
        });
      }, startDelay);
    };

    doStep(newRound ? steps : steps.slice(1));
  },

  componentDidMount: function() {
    var {
      useFirebase,
      fbState,
      fbEmptySlots,
    } = this.state;

    window.addEventListener('keydown', (e) => {
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
      if (e.which === 16) {
        this.setState({
          creatingUnit: false,
        });
      }
    });

    window.addEventListener('mouseup', () => {
      this.setState({
        mouseDown: false,
      });
    });

    if (!useFirebase) {
      this.setState(veryFirstState);
      return;
    }

    fbEmptySlots.once('value', (dataSnapshot) => {
      var emptySlots = dataSnapshot.val();
      if (emptySlots <= 0 || emptySlots === 2) {
        // either way, new game
        fbEmptySlots.set(1);
        this.setState({
          selfTurn: 1,
        });
      } else {
        fbEmptySlots.set(emptySlots - 1);
        this.setState({
          selfTurn: emptySlots - 1,
        });
      }

      fbState.once('value', (dataSnapshot) => {
        var {map, currTurn, phase} = dataSnapshot.val();
        var JSMap = JSON.parse(map);

        if (JSMap == null || currTurn == null || phase == null || phase === '') {
          // first time, send back some legit value and start
          this.setState(veryFirstState, this.setFb);
          fbEmptySlots.set(2);
          return;
        }

        // existing data
        var newMap = clj(JSMap);
        this.setState({
          history: [newMap],
          map: newMap,
          currTurn: currTurn,
          phase: phase,
        });
      });

      fbState.on('value', (dataSnapshot) => {
        var s = this.state;
        var {map, currTurn, phase} = dataSnapshot.val();
        var newMap = clj(JSON.parse(map));

        // careful about infinite recursive calls
        if (M.equals(s.map, newMap) &&
          s.currTurn === currTurn &&
          s.phase === phase) {
          return;
        }

        this.setState({
          map: newMap,
          currTurn: currTurn,
          phase: phase,
          history: s.history.concat([newMap]),
        });
      });
    });
  },

  // for testing purposes, reset firebase map data
  handleResetGame: function() {
    this.setState({
      ...veryFirstState,
      selfTurn: this.state.selfTurn,
    }, this.setFb);
  },

  handleCheatClick: function() {
    this.setState({
      cheatMode: !this.state.cheatMode,
    });
  },

  handleRangeChange: function(e) {
    var value = parseInt(e.target.value);
    this.setState({
      historyIndex: value,
      map: this.state.history[value],
    });
  },

  handleDoneClick: function() {
    this.setState(cancelPendingActionState, this.repeatCycle);
  },

  handleMenuItemClick: function(action) {
    var {map, selectedCoords} = this.state;

    if (!immediateActions[action]) {
      this.setState({
        pendingAction: action,
        showMenu: false,
      });
      return;
    }

    var newMap;
    if (action === 'upgradeVillage') {
      newMap = upgradeVillage(map, selectedCoords);
    } else if (action === 'cultivateMeadow') {
      newMap = build(map, selectedCoords, 'Meadow', 2);
    } else if (action === 'buildRoad') {
      newMap = build(map, selectedCoords, 'Road', 1);
    } else if (action === 'upgradeVillager') {
      let region = findRegion(map, ...selectedCoords);
      let villageCoords = findVillageInRegion(map, region);
      newMap = upgradeVillager(map, villageCoords, selectedCoords);
    }

    this.setState({
      ...cancelPendingActionState,
      map: newMap,
    }, this.setFb);
  },

  handleTileMouseDown: function(i, j) {
    var {
      map,
      pendingAction,
      selectedCoords,
      phase,
      currTurn,
      turns,
      history,
      selfTurn,
      creatingUnit,
      consoleSelectedColor,
      consoleSelectedUnit,
    } = this.state;

    if (creatingUnit) {
      this.setState({
        ...cancelPendingActionState,
        mouseDown: true,
        map: forceAddNewUnit(map, i, j, consoleSelectedColor, consoleSelectedUnit),
      });
      return;
    }

    // TODO: test. remove this and uncomment next code block
    if (phase !== 'Player') {
      this.setState(cancelPendingActionState);
      return;
    }

    // if (phase !== 'Player' ||
    //   (!pendingAction && getColor(map, i, j) !== turns[currTurn]) ||
    //   (currTurn !== selfTurn) {
    //   this.setState(cancelPendingActionState);
    //   return;
    // }

    if (!pendingAction) {
      this.setState({
        ...cancelPendingActionState,
        selectedCoords: [i, j],
        showMenu: true,
      });
      return;
    }

    var newMap;
    if (pendingAction === 'newPeasant') {
      // TODO money already in actions
      newMap = newVillager(map, [i, j], selectedCoords, 'Peasant', 10);
    } else if (pendingAction === 'newInfantry') {
      newMap = newVillager(map, [i, j], selectedCoords, 'Infantry', 20);
    } else if (pendingAction === 'newSoldier') {
      newMap = newVillager(map, [i, j], selectedCoords, 'Soldier', 30);
    } else if (pendingAction === 'newKnight') {
      newMap = newVillager(map, [i, j], selectedCoords, 'Knight', 40);
    } else if (pendingAction === 'movePeasant') {
      newMap = move(map, 'Peasant', [i, j], selectedCoords);
    } else if (pendingAction === 'moveInfantry') {
      newMap = move(map, 'Infantry', [i, j], selectedCoords);
    } else if (pendingAction === 'moveSoldier') {
      newMap = move(map, 'Soldier', [i, j], selectedCoords);
    } else if (pendingAction === 'moveKnight') {
      newMap = move(map, 'Knight', [i, j], selectedCoords);
    } else if (pendingAction === 'newWatchtower') {
      newMap = newWatchtower(map, [i, j], selectedCoords);
    } else if (pendingAction === 'combineVillagers') {
      newMap = combineVillagers(map, [i, j], selectedCoords);
    }

    this.setState({
      ...cancelPendingActionState,
      map: newMap,
      history: history.concat([newMap]),
    }, this.setFb);
  },

  handleTileHover: function(i, j) {
    var {map, creatingUnit, consoleSelectedColor, consoleSelectedUnit, mouseDown} = this.state;

    this.setState({
      hover: [i, j],
      map: creatingUnit && mouseDown
        ? forceAddNewUnit(map, i, j, consoleSelectedColor, consoleSelectedUnit)
        : map,
    });
  },

  handleConsoleTextAreaChange: function(e) {
    this.setState({
      map: clj(JSON.parse(e.target.value)),
    });
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

    var map = this.state.map;
    var grassConfig = clj({
      units: {
        Grass: defaultConfig.Grass,
      },
      color: 'Gray',
    });

    if (prop === 'w') {
      map = M.map((row) => {
        return M.take(val, M.concat(row, M.repeat(grassConfig)));
      }, map);
    } else {
      var row = M.repeat(val, grassConfig);
      map = M.take(val, M.concat(map, M.repeat(row)));
    }

    this.setState({
      map: surroundWithSea(map),
    });
  },

  render: function() {
    var {
      hover,
      selectedCoords,
      map,
      phase,
      // pendingAction,
      showMenu,
      turns,
      currTurn,
      history,
      historyIndex,
      selfTurn,

      cheatMode,
      consoleSelectedUnit,
      consoleSelectedColor,
    } = this.state;

    var maybeMenu;

    if (showMenu) {
      let [i, j] = selectedCoords;
      let villager = getVillager(map, i, j);
      let village = getVillage(map, i, j);
      let cannon = M.getIn(map, [i, j, 'units', 'Cannon']);

      let x = positioner.calcLeft(j, i);
      let y = positioner.calcTop(i);

      if (villager) {
        let [vi, vj] = findVillageInRegion(map, findRegion(map, i, j));
        maybeMenu = (
          <Menu pos={[x, y]}>
            {getMenuItemsForVillager(
              rankers.villagerByRank[M.get(villager, 'rank')],
              js(villager),
              M.getIn(map, [vi, vj, 'units', 'Village', 'gold']),
              M.getIn(map, [vi, vj, 'units', 'Village', 'wood']),
              this.handleMenuItemClick
            )}
          </Menu>
        );
      } else if (village) {
        maybeMenu = (
          <Menu pos={[x, y]}>
            {getMenuItemsForVillage(
              rankers.villageByRank[M.get(village, 'rank')],
              M.get(village, 'gold'),
              M.get(village, 'wood'),
              this.handleMenuItemClick
            )}
          </Menu>
        );
      } else if (cannon) {
        maybeMenu = (
          <Menu pos={[x, y]}>
            {getMenuItemsForCannon(
              js(cannon),
              M.get(village, 'gold'),
              M.get(village, 'wood'),
              this.handleMenuItemClick
            )}
          </Menu>
        );
      }
    }

    var currTurnColor = turns[currTurn];

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

    return (
      <div>
        <div style={clickS} onClick={this.handleCheatClick}>Cheat Mode</div>
        {doneClick}
        {maybeConsole}
        <Grid
          hover={hover}
          turn={currTurnColor}
          tileConfigs={map}
          onTileMouseDown={this.handleTileMouseDown}
          onTileHover={this.handleTileHover}>
            {maybeMenu}
        </Grid>
      </div>
    );
  }
});

React.render(<App />, document.querySelector('#container'));
