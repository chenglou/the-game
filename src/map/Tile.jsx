/** @jsx React.DOM */

var React = require('react');

var asd = require('../../assets/tile.png');
var url = require('../../utils/imgUrl');

function calcW(x) {
  return Math.sqrt(x * x + (x/2) * (x/2)) * 2;
}

function calcH(x) {
  return x * 2;
}

var Tile = React.createClass({
  render: function() {
    var props = this.props;

    var s = {
      backgroundImage: url(asd),
      width: calcW(props.diagLength),
      height: calcH(props.diagLength),
    };

    return (
      <div style={s}>
        asd
      </div>
    );
  }
});

module.exports = Tile;

console.log(calcW(25));
