var M = require('mori');
var Grid = require('../map/Grid');
var positioner = require('../map/positioner');
var React = require('react');
var colorConfig = require('../../colorConfig');
var url = require('../utils/imgUrl');
var coexistances = require('../coexistances');

var assetDims = require('../assetDims');
var everyUnit = require('../everyUnit');

var p = React.PropTypes;

// function range(n, val) {
//   var ret = [];
//   for (var i = 0; i < n; i++) {
//     ret.push(val);
//   }
//   return ret;
// }

// function shallowCloneObj(obj) {
//   var ret = {};
//   for (var key in obj) {
//     if (!obj.hasOwnProperty(key)) {
//       continue;
//     }
//     ret[key] = obj[key];
//   }

//   return ret;
// }

// function shallowClone(arr) {
//   return arr.map((a) => a);
// }

// clone the 2d array structure
// function shallowCloneMap(map) {
//   return shallowClone(map.map((row) => shallowClone(row)));
// }

function butLast(coll) {
  return M.map(M.identity, coll, M.rest(coll));
}

function surroundWithSea(map) {
  var seaConfig = M.toClj({
    Sea: {}
  });
  var rowLength = M.count(M.first(map));

  var row = M.repeat(rowLength, seaConfig);

  var newMap = M.concat([row], butLast(M.rest(map)), [row]);

  // columns
  newMap = M.map((row) => {
    return M.concat([seaConfig], butLast(M.rest(row)), [seaConfig]);
  }, newMap);

  return newMap;
}

// function surroundWithSea(map) {
//   var newMap = shallowCloneMap(map);
//   // verticals
//   for (var i = 0; i < newMap.length; i++) {
//     var row = newMap[i];
//     row[0] = {
//       Sea: {},
//     };
//     row[row.length - 1] = {
//       Sea: {},
//     };
//   }
//   // horizontals
//   for (var i = 0; i < newMap[0].length; i++) {
//     newMap[0][i] = {
//       Sea: {},
//     };
//     newMap[newMap.length - 1][i] = {
//       Sea: {},
//     };
//   }

//   return newMap;
// }

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

function mapSeqToVec(map) {
  return M.into(M.vector(), M.map((row) => M.into(M.vector(), row), map));
}

var Editor = React.createClass({
  getInitialState: function() {
    var row = M.repeat(10, M.toClj({
      Grass: {}
    }));

    var map = M.repeat(5, row);

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
    var grassConfig = M.toClj({
      Grass: {}
    });
    var w = M.count(M.first(tiles));
    var h = M.count(tiles);

    if (state === 'w') {
      tiles = M.map((row) => {
        return M.take(val, M.concat(row, M.repeat(grassConfig)));
      }, tiles);
    } else {
      var row = M.repeat(val, grassConfig);
      tiles = M.take(val, M.concat(tiles, M.repeat(row)));
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

  getNewTiles: function(i, j) {
    var tiles = mapSeqToVec(this.state.tiles);
    var selectedUnit = this.state.selectedUnit;
    var tile = M.toJs(M.getIn(tiles, [i, j]));

    for (var key in tile) {
      if (!coexistances[selectedUnit][key]) {
        delete tile[key];
      }
    }

    tile[selectedUnit] = {};
    // debugger;
    return M.updateIn(tiles, [i, j], () => M.toClj(tile));
  },

  handleTileMouseDown: function(i, j) {
    this.setState({
      tiles: this.getNewTiles(i, j),
    });
  },

  handleTileHover: function(i, j) {
    var tiles = this.state.clicking ? this.getNewTiles(i, j) : this.state.tiles;
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
    var tiles = state.tiles;

    var w = M.count(M.first(tiles));
    var h = M.count(tiles);

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
            {Object.keys(everyUnit.nameInDisplayOrder).map(function(unit) {
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
            onMouseUp={this.handleMouseUp}>
            <Grid
              tileConfigs={state.tiles}
              tileMouseDown={this.handleTileMouseDown}
              tileHover={this.handleTileHover} />
          </div>
        </div>

        <textarea
          value={JSON.stringify(M.toJs(state.tiles))}
          readOnly
          cols={60}
          rows={20} />
      </div>
    );
  }
});

React.render(<Editor />, document.querySelector('#container'));
