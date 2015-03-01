var React = require('react');
var Grass = require('../useful/Grass.png');
var Road = require('../useful/Road.png');
var Sea = require('../useful/Sea.png');
var url = require('../utils/imgUrl');
var assign = require('object-assign');

var units = {
  Grass: Grass,
  Road: Road,
  Sea: Sea,
};

var p = React.PropTypes;

var Land = React.createClass({
  propTypes: {
    pos: p.array.isRequired,
    config: p.shape({
      Sea: p.object,
      Grass: p.object,
      Road: p.object,
    }).isRequired,
  },

  render: function() {
    var props = this.props;
    var unit = props.config.Sea ? 'Sea'
      : props.config.Road ? 'Road'
      : props.config.Grass ? 'Grass' : 'no unit';

    var s = {
      backgroundImage: url(units[unit]),
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
