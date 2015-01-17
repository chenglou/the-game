var M = require('mori');
var React = require('react');
var Tile = require('./src/map/Tile');
var Grid = require('./src/map/Grid');

var out = M.clj_to_js;

var map = [
  [0, 1, 1, 0, 1],
  [0, 1, 0, 0, 0],
  [0, 1, 0, 0, 0],
  [0, 1, 0, 0, 0],
  [0, 1, 1, 0, 1],
];

function calcW(x) {
  return x * 2;
}

function calcH(x) {
  return Math.sqrt(x * x + (x / 2) * (x / 2)) * 2;
}

var App = React.createClass({
  render: function() {
    var configs = M.map((i) => {
      return M.map((j) => {
        return {
          villageType: map[i][j],
          color: map[i][j],
        };
      }, M.range(map[0].length));
    }, M.range(map.length));

    configs = out(configs);

    return (
      <div>
        <Grid configs={configs} />
      </div>
    );
  }
});

React.render(<App />, document.querySelector('#container'));
