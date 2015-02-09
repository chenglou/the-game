var React = require('react');
var colorConfig = require('../colorConfig');
var positioner = require('./map/positioner');

var p = React.PropTypes;

var Tile = React.createClass({
  propTypes: {
    diagLength: p.number.isRequired,
    pos: p.array.isRequired,
    config: p.shape({
      villageType: p.number,
      color: p.number,
    }).isRequired,
  },

  render: function() {
    var props = this.props;
    var pos = props.pos;
    var h = positioner.calcH(props.diagLength);
    var w = positioner.calcW(props.diagLength);
    var d = (w - props.diagLength) / 2;

    var s = {
      height: h,
      width: w,
      // TODO:
      display: 'inline-block',
      left: -d * pos[1] + pos[1] * w,
      top: (pos[1] % 2 === 0 ? 0 : -h / 2) + pos[0] * h,
    };

    if (props.config.color != null) {
      s.backgroundColor = colorConfig[props.config.color];
    }

    return (
      <div {...props} style={s}>
        {props.children}
      </div>
    );
  }
});

module.exports = Tile;
