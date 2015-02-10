var React = require('react');
var colorConfig = require('../colorConfig');
var positioner = require('./map/positioner');

var p = React.PropTypes;

var Tile = React.createClass({
  propTypes: {
    diagLength: p.number.isRequired,
    pos: p.array.isRequired,
    config: p.shape({
      landType: p.number,
      color: p.number,
    }).isRequired,
  },

  render: function() {
    var props = this.props;
    var pos = props.pos;

    var s = {
      height: positioner.calcH(),
      width: positioner.calcW(),
      left: positioner.calcLeft(pos[1], pos[0]),
      top: positioner.calcTop(pos[0]),
    };
    // if (props.config.color != null) {
    //   s.backgroundColor = colorConfig[props.config.color];
    // }

    return (
      <div {...props} style={s}>
        {props.children}
      </div>
    );
  }
});

module.exports = Tile;
