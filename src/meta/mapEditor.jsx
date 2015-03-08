var M = require('mori');
var Grid = require('../map/Grid');
var positioner = require('../map/positioner');
var React = require('react');
var url = require('../utils/imgUrl');
var butLast = require('../utils/butLast');
var coexistances = require('../coexistances');
var mapSeqToVec = require('../mapSeqToVec');

var assetDims = require('../assetDims');
var everyUnit = require('../everyUnit');
var assetUrls = require('../assetUrls');

var p = React.PropTypes;

function surroundWithSea(map) {
  var seaTileConfig = M.toClj({
    units: {
      Sea: {}
    },
    color: 'Gray',
  });
  var rowLength = M.count(M.first(map));

  var row = M.repeat(rowLength, seaTileConfig);

  var newMap = M.concat([row], butLast(M.rest(map)), [row]);

  // columns
  newMap = M.map((row) => {
    return M.concat([seaTileConfig], butLast(M.rest(row)), [seaTileConfig]);
  }, newMap);

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
        <img src={'./out/' + assetUrls[unit]} style={imgS} />
        <div style={labelS}>
          {unit}
        </div>
      </div>
    );
  }
});

var Editor = React.createClass({
  getInitialState: function() {
    var row = M.repeat(10, M.toClj({
      units: {
        Grass: {},
      },
      color: 'Gray',
    }));

    var map = M.repeat(5, row);

    return {
      hover: [0, 0],
      selectedUnit: 'Grass',
      selectedColor: 'Red',
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
    var grassTileConfig = M.toClj({
      units: {
        Grass: {}
      },
      color: 'Gray',
    });
    var w = M.count(M.first(tiles));
    var h = M.count(tiles);

    if (state === 'w') {
      tiles = M.map((row) => {
        return M.take(val, M.concat(row, M.repeat(grassTileConfig)));
      }, tiles);
    } else {
      var row = M.repeat(val, grassTileConfig);
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

    for (var key in tile.units) {
      if (!coexistances[selectedUnit][key]) {
        delete tile.units[key];
      }
    }

    tile.units[selectedUnit] = {};
    tile.color = this.state.selectedColor;

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

  handleTextAreaChange: function(e) {
    var value = e.target.value;
    this.setState({
      tiles: M.toClj(JSON.parse(value))
    });
  },

  handleColorClick: function(color) {
    this.setState({selectedColor: color});
  },

  render: function() {
    var state = this.state;
    var tiles = state.tiles;
    var hover = state.hover;

    var w = M.count(M.first(tiles));
    var h = M.count(tiles);

    var configBox = {
      border: '1px solid black',
      width: 1000,
      height: 250,
    };

    var gridWrapper = {
      height: positioner.calcTop(h + 1),
    };

    var tilesBoxS = {
      display: 'flex',
    };

    function colorS(color) {
      return {
        backgroundColor: color,
        // display: 'flex',
        width: 50,
        height: 50,
        color: 'white',
        outline: state.selectedColor === color ? '2px solid black' : 'none',
        margin: 1,
      };
    }

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
            {hover[0]}, {hover[1]}
          </div>

          Units:
          <div style={tilesBoxS}>
            {Object.keys(everyUnit.nameInDisplayOrder).map(function(unit) {
              return (
                <LandBox
                  key={unit}
                  unit={unit}
                  onClick={this.handleTileOptionClick.bind(null, unit)}
                  selected={state.selectedUnit === unit} />
              );
            }, this)}
          </div>

          Colors:
          <div style={tilesBoxS}>
            <div
              onClick={this.handleColorClick.bind(null, 'Red')}
              style={colorS('Red')}>
                Red
            </div>
            <div
              onClick={this.handleColorClick.bind(null, 'Blue')}
              style={colorS('Blue')}>
                Blue
            </div>
            <div
              onClick={this.handleColorClick.bind(null, 'Gray')}
              style={colorS('Gray')}>
                Gray
            </div>
          </div>
        </div>

        <div style={{position: 'relative'}}>
          <div
            className="gridWrapper"
            style={gridWrapper}
            onMouseDown={this.handleMouseDown}
            onMouseUp={this.handleMouseUp}>
            <Grid
              active={hover}
              tileConfigs={state.tiles}
              tileMouseDown={this.handleTileMouseDown}
              tileHover={this.handleTileHover} />
          </div>
        </div>

        <textarea
          style={{WebkitUserSelect: 'inherit'}}
          value={JSON.stringify(M.toJs(state.tiles))}
          onChange={this.handleTextAreaChange}
          cols={60}
          rows={20} />
      </div>
    );
  }
});

React.render(<Editor />, document.querySelector('#container'));
