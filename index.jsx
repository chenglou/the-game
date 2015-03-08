var React = require('react');
var Grid = require('./src/map/Grid');
var Menu = require('./src/Menu');
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
  var pesant = M.get(config, 'Pesant');
  var infantry = M.get(config, 'Infantry');
  var soldier = M.get(config, 'Soldier');
  var knight = M.get(config, 'Knight');

  var type = pesant || infantry || soldier || knight;
  var typeName = pesant ? 'Pesant'
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

function findRegion(map, [i, j]) {
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

function addIncome(map, turn) {
  var map = mapSeqToVec(map);

  var villageCoords = filterMapByColor(map, turn, (cell) => {
    var config = M.get(cell, 'units');
    return getMaybeVillage(map, config)[0];
  });

  return M.reduce((map, [i, j]) => {
    var sum = findRegion(map, [i, j]).reduce((sum, [i, j]) => {
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
    var sum = findRegion(map, [i, j]).reduce((sum, [i, j]) => {
      var config = M.getIn(map, [i, j, 'units']);
      var [type, typeName] = getMaybeVillager(map, config);

      var amount = typeName === 'Pesant' ? 2
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
    var units = findRegion(map, [i, j]).filter(([i, j]) => {
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

var App = React.createClass({
  getInitialState: function() {
    return {
      hover: [0, 0],
      map: M.toClj(map1),
      turn: 'Red',
      phase: 'initGame',
      selectedCoords: null,
      destCoords: null,
      waitDestCoords: false,
    };
  },

  componentDidMount: function() {
    window.addEventListener('keydown', (e) => {
      // escape
      if (e.which === 27) {
        this.setState({
          selectedCoords: null,
        });
      }
    });

    setTimeout(() => {
      this.setState({
        map: setInitialVillagesGold(this.state.map, 7),
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

  handleMenuItemClick: function() {
    this.setState({
      waitDestCoords: true,
    });
  },

  handleTileMouseDown: function(i, j) {
    if (this.state.waitDestCoords) {
      var coords = findRegion(map, [i, j]);
      this.setState({
        destCoords: [i, j],
        // waitDestCoords: false,
      });
    } else {
      this.setState({
        selectedCoords: [i, j],
      });
    }
  },

  handleTileHover: function(i, j) {
    this.setState({
      hover: [i, j],
    });
  },

  render: function() {
    var state = this.state;
    var {hover, selectedCoords, map} = state;

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

    if (selectedCoords) {
      let [i, j] = selectedCoords;
      var config = M.getIn(map, [i, j, 'units']);
      var [type, typeName] = getMaybeVillager(map, config);
      var [type2, typeName2] = getMaybeVillage(map, config);

      let x = positioner.calcLeft(j, i);
      let y = positioner.calcTop(i);

      if (type) {
        maybeMenu = (
          <Menu items={[1,2,3]} pos={[x, y]}>
            asd
          </Menu>
        );
      } else if (type2) {
        maybeMenu = (
          <Menu pos={[x, y]}>
            <div onClick={this.handleMenuItemClick}>
              Train new villager
            </div>
          </Menu>
        );
      }
    }

    return (
      <div>
        <div style={consoleS}>
          <div>{state.phase} phase</div>
          {JSON.stringify(hover)}
          <pre>
            {JSON.stringify(js(M.getIn(mapSeqToVec(map), hover)), null, 2)}
          </pre>
        </div>
        <div className="gridWrapper" style={gridWrapper}>
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
