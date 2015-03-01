var M = require('mori');
var Grid = require('../map/Grid');
var positioner = require('../map/positioner');
var React = require('react');
var colorConfig = require('../../colorConfig');
var url = require('../utils/imgUrl');

var assetDims = require('../assetDims');
var everyUnit = require('../everyUnit');

var Fort = require('../useful/Fort.png');
var Grass = require('../useful/Grass.png');
var Hovel = require('../useful/Hovel.png');
var Infantry = require('../useful/Infantry.png');
var Knight = require('../useful/Knight.png');
var Meadow = require('../useful/Meadow.png');
var Pesant = require('../useful/Pesant.png');
var Road = require('../useful/Road.png');
var Sea = require('../useful/Sea.png');
var Soldier = require('../useful/Soldier.png');
var Tombstone = require('../useful/Tombstone.png');
var Town = require('../useful/Town.png');
var Tree = require('../useful/Tree.png');
var Watchtower = require('../useful/Watchtower.png');

var units = {
  Fort: Fort,
  Grass: Grass,
  Hovel: Hovel,
  Infantry: Infantry,
  Knight: Knight,
  Meadow: Meadow,
  Pesant: Pesant,
  Road: Road,
  Sea: Sea,
  Soldier: Soldier,
  Tombstone: Tombstone,
  Town: Town,
  Tree: Tree,
  Watchtower: Watchtower,
};

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

function surroundWithSea(map) {
  var newMap = shallowCloneMap(map);
  // verticals
  for (var i = 0; i < newMap.length; i++) {
    var row = newMap[i];
    row[0] = 1;
    row[row.length - 1] = 1;
  }
  // horizontals
  for (var i = 0; i < newMap[0].length; i++) {
    newMap[0][i] = 1;
    newMap[newMap.length - 1][i] = 1;
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
        <img src={'./out/' + units[unit]} style={imgS} />
        <div style={labelS}>
          {unit}
        </div>
      </div>
    );
  }
});

var Editor = React.createClass({
  getInitialState: function() {
    var map = range(5, 0).map(() => range(10, 0));
    return {
      hover: [0, 0],
      selectedLand: 'Grass',
      colors: surroundWithSea(map),
      clicking: false,
    };
  },

  handleRangeChange: function(state, e) {
    var val = parseInt(e.target.value);
    if (val < 1 || val > 50) {
      return;
    }
    var colors = this.state.colors;
    var w = colors[0].length;
    var h = colors.length;

    if (state === 'w') {
      if (val > w) {
        colors = colors.map((row) => row.concat(range(val - w, 1)));
      } else {
        colors = colors.map((row) => row.slice(0, val));
      }
    } else {
      if (val > h) {
        colors = colors.concat(range(val - h, 0).map(() => range(w, 1)));
      } else {
        colors = colors.slice(0, val);
      }
    }

    this.setState({
      colors: surroundWithSea(colors),
    });
  },

  handleTileOptionClick: function(unit) {
    this.setState({
      selectedLand: unit,
    });
  },

  handleTileMouseDown: function(i, j) {
    var colors = this.state.colors;

    colors[i][j] = this.state.selectedLand;
    this.setState({
      colors: colors,
    });
  },

  handleTileHover: function(i, j) {
    var colors = this.state.colors;
    if (this.state.clicking) {
      colors[i][j] = this.state.selectedLand;
    }

    this.setState({
      hover: [i, j],
      colors: colors,
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

    var w = state.colors[0].length;
    var h = state.colors.length;

    var configs = state.colors.map((row) => {
      return row.map((cell) => {
        return {
          landType: 1,
          color: cell,
        };
      });
    });

    var configBox = {
      border: '1px solid black',
      width: 1000,
      height: 200,
    };

    var gridWrapper = {
      border: '1px solid black',
      width: 10000,
      height: positioner.calcH(25) * h + 25,
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
            {everyUnit.map(function(unit) {
              return (
                <LandBox
                  unit={unit}
                  onClick={this.handleTileOptionClick.bind(null, unit)}
                  selected={state.selectedLand === unit} />
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
              tileConfigs={configs}
              tileMouseDown={this.handleTileMouseDown}
              tileHover={this.handleTileHover} />
          </div>
        </div>

        <textarea
          value={JSON.stringify(configs)}
          readOnly
          cols={60}
          rows={20} />
      </div>
    );
  }
});

React.render(<Editor />, document.querySelector('#container'));
