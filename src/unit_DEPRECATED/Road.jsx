var React = require('react');
var url = require('../utils/imgUrl');
var roadImg = require('../useful/Road.png');
var assign = require('object-assign');

var Road = React.createClass({
  render: function() {
    var props = this.props;

    var s = {
      backgroundImage: url(roadImg),
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

module.exports = Road;
