var React = require('react');
var positioner = require('./map/positioner');

var p = React.PropTypes;

var Tile = React.createClass({
  propTypes: {
    pos: p.array.isRequired,
  },

  render: function() {
    var props = this.props;
    var [y, x] = props.pos;

    var s = {
      height: positioner.calcH(),
      width: positioner.calcW(),
      left: positioner.calcLeft(x, y),
      top: positioner.calcTop(y),
    };

    return (
      <div {...props} style={s}>
        {props.children}
      </div>
    );
  }
});

module.exports = Tile;
