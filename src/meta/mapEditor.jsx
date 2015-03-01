var M = require('mori');
var Grid = require('../map/Grid');
var positioner = require('../map/positioner');
var React = require('react');
var colorConfig = require('../../colorConfig');
var url = require('../utils/imgUrl');
var coexistances = require('../coexistances');

var assetDims = require('../assetDims');
var everyUnit = require('../everyUnit');

var out = M.clj_to_js;
var p = React.PropTypes;

function range(n, val) {
  var ret = [];
  for (var i = 0; i < n; i++) {
    ret.push(val);
  }
  return ret;
}

function shallowClone(arr) {
  return arr.map((a) => a);
}

// clone the 2d array structure
function shallowCloneMap(map) {
  return shallowClone(map.map((row) => shallowClone(row)));
}

function genConfig() {

}

function surroundWithSea(map) {
  var newMap = shallowCloneMap(map);
  // verticals
  for (var i = 0; i < newMap.length; i++) {
    var row = newMap[i];
    row[0] = {
      Sea: {},
    };
    row[row.length - 1] = {
      Sea: {},
    };
  }
  // horizontals
  for (var i = 0; i < newMap[0].length; i++) {
    newMap[0][i] = {
      Sea: {},
    };
    newMap[newMap.length - 1][i] = {
      Sea: {},
    };
  }

  return newMap;
}

var LandBox = React.createClass({
  propTypes: {
    unit: p.string.isRequired,
    selected: p.bool.isRequired,
  },

  render: function() {
    var props = this.props;
    var unit = props.unit;

    var s = {
      width: 70,
      height: 100,
      display: 'inline-flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    };

    var labelS = {
      textAlign: 'center',
      fontSize: 12,
      color: props.selected ? 'red' : 'gray',
    };

    var imgS = {
      width: assetDims[unit][0],
      height: assetDims[unit][1],
      alignSelf: 'center',
    };

    return (
      <div {...props} style={s}>
        <img src={'./out/' + everyUnit.img[unit]} style={imgS} />
        <div style={labelS}>
          {unit}
        </div>
      </div>
    );
  }
});

var Editor = React.createClass({
  getInitialState: function() {
    var map = range(5, 0).map(() => range(10, {
      Grass: {},
    }));

    return {
      hover: [0, 0],
      selectedUnit: 'Grass',
      tiles: surroundWithSea(map),
      clicking: false,
    };
  },

  handleRangeChange: function(state, e) {
    var val = parseInt(e.target.value);
    if (val < 1 || val > 50) {
      return;
    }
    var tiles = this.state.tiles;
    var w = tiles[0].length;
    var h = tiles.length;

    if (state === 'w') {
      if (val > w) {
        tiles = tiles.map((row) => row.concat(range(val - w, {
          Grass: {},
        })));
      } else {
        tiles = tiles.map((row) => row.slice(0, val));
      }
    } else {
      if (val > h) {
        tiles = tiles.concat(range(val - h, 0).map(() => range(w, {
          Grass: {},
        })));
      } else {
        tiles = tiles.slice(0, val);
      }
    }

    this.setState({
      tiles: surroundWithSea(tiles),
    });
  },

  handleTileOptionClick: function(unit) {
    this.setState({
      selectedUnit: unit,
    });
  },

  handleTileMouseDown: function(i, j) {
    var tiles = this.state.tiles;

    tiles[i][j] = {}
    tiles[i][j][this.state.selectedUnit] = {};
    this.setState({
      tiles: tiles,
    });
  },

  handleTileHover: function(i, j) {
    var tiles = this.state.tiles;
    if (this.state.clicking) {
      tiles[i][j] = {}
      tiles[i][j][this.state.selectedUnit] = {};
    }

    this.setState({
      hover: [i, j],
      tiles: tiles,
    });
  },

  handleMouseDown: function() {
    this.setState({
      clicking: true,
    });
  },

  handleMouseUp: function() {
    this.setState({
      clicking: false,
    });
  },

  render: function() {
    var state = this.state;

    var w = state.tiles[0].length;
    var h = state.tiles.length;

    // var configs = state.tiles.map((row) => {
    //   return row.map((cell) => {
    //     return {
    //       landType: 1,
    //       color: cell,
    //     };
    //   });
    // });

    var configBox = {
      border: '1px solid black',
      width: 1000,
      height: 200,
    };

    var gridWrapper = {
      height: positioner.calcTop(h + 1),
    };

    var tilesBoxS = {
      display: 'flex',
    };

    return (
      <div>
        <div style={configBox}>
          <input
            type="range"
            value={w}
            max={50}
            onChange={this.handleRangeChange.bind(null, 'w')} />
          <span>{w}</span>
          <input
            type="range"
            value={h}
            max={50}
            onChange={this.handleRangeChange.bind(null, 'h')} />
          <span>{h}</span>
          <div>Tile count: {w * h}</div>
          <div>
            {state.hover[0]}, {state.hover[1]}
          </div>

          Lands:
          <div style={tilesBoxS}>
            {everyUnit.name.map(function(unit) {
              return (
                <LandBox
                  unit={unit}
                  onClick={this.handleTileOptionClick.bind(null, unit)}
                  selected={state.selectedUnit === unit} />
              );
            }, this)}
          </div>
        </div>

        <div style={{position: 'relative'}}>
          <div
            className="gridWrapper"
            style={gridWrapper}
            onMouseDown={this.handleMouseDown}
            onMouseUp={this.handleMouseUp} >
            <Grid
              tileConfigs={state.tiles}
              tileMouseDown={this.handleTileMouseDown}
              tileHover={this.handleTileHover} />
          </div>
        </div>

        <textarea
          value={JSON.stringify(state.tiles)}
          readOnly
          cols={60}
          rows={20} />
      </div>
    );
  }
});

React.render(<Editor />, document.querySelector('#container'));
