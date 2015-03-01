var React = require('react');
var url = require('../utils/imgUrl');
var grassImg = require('../useful/Grass.png');
var assign = require('object-assign');

var Grass = React.createClass({
  render: function() {
    var props = this.props;

    var s = {
      backgroundImage: url(grassImg),
      backgroundRepeat: 'no-repeat',
      display: 'inline-block',
      width: '100%',
      height: '100%',
    };

    return (
      <div {...props} style={assign({}, props.style, s)}>
      </div>
    );
  }
});

module.exports = Grass;
