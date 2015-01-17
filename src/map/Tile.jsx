var React = require('react');

var tileImg = require('../../assets/tile.png');
var url = require('../../utils/imgUrl');
var colorConfig = require('../../colorConfig');

function calcW(x) {
  return Math.sqrt(x * x + (x/2) * (x/2)) * 2;
}

function calcH(x) {
  return x * 2;
}

var p = React.PropTypes;

var Tile = React.createClass({
  propTypes: {
    diagLength: p.number.isRequired,
    pos: p.array.isRequired,
    config: p.shape({
      villageType: p.number.isRequired,
      color: p.number.isRequired,
      // hovered: p.bool.isRequired,
    }).isRequired,
  },

  asd: function() {
    console.log('iasdasd');
  },

  render: function() {
    var props = this.props;
    var h = calcH(props.diagLength);
    var w = calcW(props.diagLength);
    var d = (w - props.diagLength) / 2;

    var s = {
      backgroundImage: url(tileImg),
      width: w,
      height: h,
      // TODO:
      display: 'inline-block',
      position: 'relative',
      top: props.pos[1] % 2 === 0 ? 0 : -h / 2,
      left: -d * props.pos[1],
      backgroundColor: colorConfig[props.config.color],
    };
        // {props.config.villageType}

    return (
      <div {...props} style={s}>
        {props.pos[0]}, {props.pos[1]}
        {props.config.color}
      </div>
    );
  }
});

module.exports = Tile;

console.log(calcW(25));
