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
  propTypes: {
    diagLength: React.PropTypes.number.isRequired,
    pos: React.PropTypes.array.isRequired,
    config: React.PropTypes.object.isRequired,
  },

  render: function() {
    var props = this.props;
    var h = calcH(props.diagLength);
    var w = calcW(props.diagLength);
    var d = (w - props.diagLength) / 2;

    var s = {
      backgroundImage: url(asd),
      width: w,
      height: h,
      // TODO:
      display: 'inline-block',
      position: 'relative',
      top: props.pos[1] % 2 === 0 ? 0 : -h / 2,
      left: -d * props.pos[1],
    };

    return (
      <div style={s}>
        {this.props.pos.toString()}
      </div>
    );
  }
});

module.exports = Tile;

console.log(calcW(25));
