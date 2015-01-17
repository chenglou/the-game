var M = require('mori');
var React = require('react');
var Tile = require('./src/map/Tile');
var Grid = require('./src/map/Grid');

var map1 = require('./src/map/data/map1');

var out = M.clj_to_js;

function calcW(x) {
  return x * 2;
}

function calcH(x) {
  return Math.sqrt(x * x + (x / 2) * (x / 2)) * 2;
}

var App = React.createClass({
  render: function() {
    var gridWrapper = {
      border: '1px solid black',
      width: 10000,
      paddingBottom: 25,
    };

    return (
      <div>
        <div style={gridWrapper}>
          <Grid
            configs={map1}
            tileMouseDown={function() {}}
            tileHover={function() {}} />
        </div>
      </div>
    );
  }
});

React.render(<App />, document.querySelector('#container'));
