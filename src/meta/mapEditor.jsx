var M = require('mori');
var Grid = require('../map/Grid');
var React = require('react');
var colorConfig = require('../../colorConfig');

var out = M.clj_to_js;
var p = React.PropTypes;

function range(n, val) {
  var ret = [];
  for (var i = 0; i < n; i++) {
    ret.push(val);
  }
  return ret;
}

var LandBox = React.createClass({
  propTypes: {
    color: p.number.isRequired,
    selected: p.bool.isRequired,
  },

  render: function() {
    var props = this.props;
    var s = {
      width: 50,
      height: 50,
      backgroundColor: colorConfig[props.color],
      outline: props.selected ? '2px solid black' : 'none',
      display: 'inline-block',
    };

    return (
      <div {...props} style={s}>
      </div>
    );
  }
});

var Editor = React.createClass({
  getInitialState: function() {
    return {
      hover: [0, 0],
      selectedLand: 0,
      colors: range(5, 0).map(() => range(10, 0)),
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
        colors = colors.map((row) => row.concat(range(val - w, 0)));
      } else {
        colors = colors.map((row) => row.slice(0, val));
      }
    } else {
      if (val > h) {
        colors = colors.concat(range(val - h, 0).map(() => range(w, 0)));
      } else {
        colors = colors.slice(0, val);
      }
    }

    this.setState({
      colors: colors,
    });
  },

  handleTileOptionClick: function(selectedNum) {
    this.setState({
      selectedLand: selectedNum,
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

    var configs = state.colors.map((row) => {
      return row.map((cell) => {
        return {
          villageType: 1,
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
      paddingBottom: 25,
    };

    var w = state.colors[0].length;
    var h = state.colors.length;

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
          <div>
            <LandBox
              color={0}
              onClick={this.handleTileOptionClick.bind(null, 0)}
              selected={state.selectedLand === 0}>
            </LandBox>
            <LandBox
              color={1}
              onClick={this.handleTileOptionClick.bind(null, 1)}
              selected={state.selectedLand === 1}>
            </LandBox>
            <LandBox
              color={2}
              onClick={this.handleTileOptionClick.bind(null, 2)}
              selected={state.selectedLand === 2}>
            </LandBox>
          </div>
        </div>

        <div
          style={gridWrapper}
          onMouseDown={this.handleMouseDown}
          onMouseUp={this.handleMouseUp} >
          <Grid
            configs={configs}
            tileMouseDown={this.handleTileMouseDown}
            tileHover={this.handleTileHover} />
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
