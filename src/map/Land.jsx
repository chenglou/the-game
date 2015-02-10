var React = require('react');
var landImg = require('./tileGrass.png');
var lavaImg = require('./tileLava.png');
var waterImg = require('./tileWater_full.png');
var url = require('../utils/imgUrl');
var colorConfig = require('../../colorConfig');
var assign = require('object-assign');

var p = React.PropTypes;

var Land = React.createClass({
  propTypes: {
    pos: p.array.isRequired,
    config: p.shape({
      landType: p.number,
      color: p.number,
    }).isRequired,
  },

  render: function() {
    var props = this.props;
    var color = props.config.color;

    var img;
    if (color === 0) {
      img = lavaImg;
    } else if (color === 1) {
      img = waterImg;
    } else {
      img = landImg;
    }

    var s = {
      backgroundImage: url(img),
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
