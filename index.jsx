var React = require('react');
var Grid = require('./src/map/Grid');
var M = require('mori');
var coexistances = require('./src/coexistances');
var randNth = require('./src/utils/randNth');
var findNeighbors = require('./src/findNeighbors');
var mapSeqToVec = require('./src/mapSeqToVec');

var map1 = require('./src/map/data/map1');

var js = M.toJs;

function getUnitCoords(map, f) {
  var map = mapSeqToVec(map);

  return M.mapcat((row, i) => {
    var maybeCoords = M.map((cell, j) => {
      return f(cell) ? [i, j] : null;
    }, row, M.range());

    return M.filter(M.identity, maybeCoords);
  }, map, M.range());
}

function updateVillagesGold(map, amount) {
  return M.map((row) => {
    return M.map((cell) => {
      var units = M.get(cell, 'units');

      var hovel = M.get(units, 'Hovel');
      var town = M.get(units, 'Town');
      var fort = M.get(units, 'Fort');

      var type = hovel || town || fort;
      var typeName = hovel ? 'Hovel' :
        town ? 'Town':
        fort ? 'Fort'
        : null;

      if (!type) {
        return cell;
      }

      return M.updateIn(cell, ['units', typeName, 'gold'], (oldAmount) => {
        return (oldAmount || 0) + amount;
      });
    }, row);
  }, map);
}

function growTrees(map) {
  var map = mapSeqToVec(map);

  var treeCoords = getUnitCoords(map, (cell) => M.getIn(cell, ['units', 'Tree']));

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
  return M.map((row) => {
    return M.map((cell) => {
      if (M.get(cell, 'color') !== turn) {
        return cell;
      }

      var tombstone = M.getIn(cell, ['units', 'Tombstone']);

      if (!tombstone) {
        return cell;
      }

      return M.updateIn(cell, ['units'], (config) => {
        config = M.dissoc(config, 'Tombstone');
        return M.assoc(config, 'Tree', M.hashMap());
      });
    }, row);
  }, map);
}

function matureTiles(map, turn) {
  map = matureMeadows(map, turn);
  return matureRoads(map, turn);
}

function matureMeadows(map, turn) {
  return M.map((row) => {
    return M.map((cell) => {
      if (M.get(cell, 'color') !== turn) {
        return cell;
      }

      var meadow = M.getIn(cell, ['units', 'Meadow']);

      if (!meadow) {
        return cell;
      }

      return M.updateIn(cell, ['units', 'Meadow', 'cooldown'], (cooldown) => {
        return cooldown ? cooldown - 1 : 0;
      });
    }, row);
  }, map);
}

function matureRoads(map, turn) {
  return M.map((row) => {
    return M.map((cell) => {
      if (M.get(cell, 'color') !== turn) {
        return cell;
      }

      var road = M.getIn(cell, ['units', 'Road']);

      if (!road) {
        return cell;
      }

      return M.updateIn(cell, ['units', 'Road', 'cooldown'], (cooldown) => {
        return cooldown ? cooldown - 1 : 0;
      });
    }, row);
  }, map);
}

function findRegionForVillage(map, [i, j]) {
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

  var villageCoords = getUnitCoords(map, (cell) => {
    return (
      (M.getIn(cell, ['units', 'Hovel']) ||
        M.getIn(cell, ['units', 'Town']) ||
        M.getIn(cell, ['units', 'Fort'])) &&
      M.get(cell, 'color') === turn
    );
  });

  return M.reduce((map, [i, j]) => {
    var sum = findRegionForVillage(map, [i, j]).reduce((sum, [i, j]) => {
      var config = M.getIn(map, [i, j, 'units']);
      var get = (unitName) => M.get(config, unitName);

      // this is only determined by the land type (sea, grass, meadow, tree)
      // conceptually tree is a landtype
      var amount = get('Tree')? 0
        : get('Meadow') && M.get(get('Meadow'), 'cooldown') === 0 ? 2
        : 1;

      return sum + amount;
    }, 0);

    return M.updateIn(map, [i, j, 'units'], (config) => {
      var hovel = M.get(config, 'Hovel');
      var town = M.get(config, 'Town');
      var fort = M.get(config, 'Fort');

      var typeName = hovel ? 'Hovel' :
        town ? 'Town':
        fort ? 'Fort'
        : null;

      return M.updateIn(config, [typeName, 'gold'], (oldAmount) => oldAmount + sum);
    });
  }, map, villageCoords);
}

var App = React.createClass({
  getInitialState: function() {
    return {
      hover: [0, 0],
      map: M.toClj(map1),
      turn: 'Red',
    };
  },

  componentDidMount: function() {
    setTimeout(() => {
      this.setState({
        map: updateVillagesGold(this.state.map, 7),
      });
    }, 100);

    setTimeout(() => {
      this.setState({
        map: growTrees(this.state.map),
      });
    }, 500);

    setTimeout(() => {
      this.setState({
        map: tombstonesToTrees(this.state.map, this.state.turn),
      });
    }, 1000);

    setTimeout(() => {
      this.setState({
        map: matureTiles(this.state.map, this.state.turn),
      });
    }, 1100);

    setTimeout(() => {
      this.setState({
        map: addIncome(this.state.map, this.state.turn),
      });
    }, 1300);
  },

  handleTileMouseDown: function(i, j) {
    //
  },

  handleTileHover: function(i, j) {
    this.setState({
      hover: [i, j],
    });
  },

  render: function() {
    var state = this.state;
    var hover = state.hover;

    var gridWrapper = {
      border: '1px solid black',
      width: 10000,
      top: 100,
      position: 'relative',
    };

    var consoleS = {
      height: 100,
    };

    return (
      <div>
        <div style={consoleS}>
          {JSON.stringify(hover)}
          <pre>
            {JSON.stringify(js(M.getIn(mapSeqToVec(state.map), hover)), null, 2)}
          </pre>
        </div>
        <div className="gridWrapper" style={gridWrapper}>
          <Grid
            tileConfigs={state.map}
            tileMouseDown={this.handleTileMouseDown}
            tileHover={this.handleTileHover} />
        </div>
      </div>
    );
  }
});

React.render(<App />, document.querySelector('#container'));
