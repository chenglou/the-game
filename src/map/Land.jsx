var React = require('react');
var landImg = require('./land.png');
var url = require('../utils/imgUrl');
var assign = require('object-assign');

var p = React.PropTypes;

var Land = React.createClass({
  propTypes: {
    pos: p.array.isRequired,
  },

  render: function() {
    var props = this.props;

    var s = {
      backgroundImage: url(landImg),
      backgroundRepeat: 'no-repeat',
      display: 'inline-block',
      width: '100%',
      height: '100%',
    };

    return (
      <div {...props} style={assign({}, props.style, s)}>
        {props.pos[0]}, {props.pos[1]}
      </div>
    );
  }
});

module.exports = Land;
