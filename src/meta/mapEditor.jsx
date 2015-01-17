var M = require('mori');
var Grid = require('../map/Grid');
var React = require('react');
var colorConfig = require('../../colorConfig');

var out = M.clj_to_js;
var p = React.PropTypes;

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
      w: 10,
      h: 5,
      selectedLand: 0,
      colors: out(M.map(() => M.repeat(10, 0), M.range(5))),
      clicking: false,
    };
  },

  handleChange: function(state, e) {
    var obj = {};
    obj[state] = e.target.value;
    this.setState(obj);
  },

  handleLandClick: function(selectedNum) {
    this.setState({
      selectedLand: selectedNum,
    });
  },

  handleTileClick: function(i, j) {
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

    // var configs = M.map((colorRow) => {
    //   return M.map((colorCell) => {
    //     return {
    //       villageType: 1,
    //       color: colorCell,
    //     };
    //   }, colorRow);
    // }, state.colors);
    // configs = out(configs);

    var configBox = {
      border: '1px solid black',
      width: 1000,
      height: 200,
    };

    var gridWrapper = {
      border: '1px solid black',
      width: 10000,
    };

    return (
      <div>
        <div style={configBox}>
          <input
            type="range"
            value={state.w}
            onChange={this.handleChange.bind(null, 'w')} />
          <span>{state.w}</span>
          <input
            type="range"
            value={state.h}
            onChange={this.handleChange.bind(null, 'h')} />
          <span>{state.h}</span>
          <div>Tile count: {state.w * state.h}</div>
          <div>
            {state.hover[0]}, {state.hover[1]}
          </div>

          Lands:
          <div>
            <LandBox
              color={0}
              onClick={this.handleLandClick.bind(null, 0)}
              selected={state.selectedLand === 0}>
            </LandBox>
            <LandBox
              color={1}
              onClick={this.handleLandClick.bind(null, 1)}
              selected={state.selectedLand === 1}>
            </LandBox>
            <LandBox
              color={2}
              onClick={this.handleLandClick.bind(null, 2)}
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
            tileClick={this.handleTileClick}
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
