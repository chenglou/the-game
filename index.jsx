var React = require('react');
var Grid = require('./src/map/Grid');
var M = require('mori');

var map1 = require('./src/map/data/map1');

function mapSeqToVec(map) {
  return M.into(M.vector(), M.map((row) => M.into(M.vector(), row), map));
}

var App = React.createClass({
  getInitialState: function() {
    return {
      hover: [0, 0],
      map: M.toClj(map1),
    };
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
