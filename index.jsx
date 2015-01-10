var React = require('react');
var Tile = require('./src/map/Tile');

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
  return Math.sqrt(x * x + (x/2) * (x/2)) * 2;
}

var App = React.createClass({
  render: function() {
    return (
      <div>
        <Tile diagLength={25} pos={[0, 0]} />
        <Tile diagLength={25} pos={[0, 1]} />
        <Tile diagLength={25} pos={[0, 2]} />
      </div>
    );
  }
});

React.render(<App />, document.querySelector('#container'));
