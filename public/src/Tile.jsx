'use strict';

var React = require('react');
var positioner = require('./map/positioner');

var p = React.PropTypes;

var Tile = React.createClass({
  propTypes: {
    pos: p.array.isRequired,
  },

  render: function() {
    let {pos: [y, x], children, ...props} = this.props;

    let s = {
      height: positioner.calcH(),
      width: positioner.calcW(),
      left: positioner.calcLeft(x, y),
      top: positioner.calcTop(y),
    };

    return (
      <div {...props} style={s}>
        {children}
      </div>
    );
  }
});

module.exports = Tile;
