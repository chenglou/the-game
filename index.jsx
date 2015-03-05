var React = require('react');
var Grid = require('./src/map/Grid');
var M = require('mori');
var coexistances = require('./src/coexistances');
var randNth = require('./src/utils/randNth');
var findNeighbors = require('./src/findNeighbors');
var mapSeqToVec = require('./src/mapSeqToVec');

var map1 = require('./src/map/data/map1');

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

  var treeCoords = M.mapcat((row, i) => {
    var maybeTreeCoordsRow = M.map((cell, j) => {
      return M.getIn(cell, ['units', 'Tree']) ? [i, j] : null;
    }, row, M.range());

    return M.filter(M.identity, maybeTreeCoordsRow);
  }, map, M.range());

  return M.reduce((map, coords) => {
    var [i, j] = coords;
    var emptyNeighbors = findNeighbors(map, i, j).filter((coords) => {
      var [i, j] = coords;

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

var App = React.createClass({
  getInitialState: function() {
    return {
      hover: [0, 0],
      map: M.toClj(map1),
    };
  },

  componentDidMount: function() {
    setTimeout(() => {
      this.setState({
        map: updateVillagesGold(this.state.map, 7),
      });
    }, 500);

    setTimeout(() => {
      this.setState({
        map: growTrees(this.state.map),
      });
    }, 1000);
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

    var gridWrapper = {
      border: '1px solid black',
      width: 10000,
      top: 100,
      position: 'relative',
    };

    var consoleS = {
      height: 100,
    };

        // <svg width="65" height="89" viewBox="0 0 560 645">
        //   <polygon style={{stroke:'purple', strokeWidth:2}} fill="#64dcff" points="268,0 0,158 0,483 268,644 558,483 558,158" transform="translate(1, 1)" />
        // </svg>

    var [i, j] = state.hover;

    return (
      <div>
        <div style={consoleS}>
          {i}, {j}
          <pre>
            {JSON.stringify(M.toJs(M.getIn(mapSeqToVec(state.map), [i, j])), null, 2)}
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
