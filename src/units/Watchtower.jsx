var React = require('react');
var url = require('../utils/imgUrl');
var watchtowerImg = require('../useful/Watchtower.png');
var assign = require('object-assign');

var Watchtower = React.createClass({
  render: function() {
    var props = this.props;

    var s = {
      backgroundImage: url(watchtowerImg),
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

module.exports = Watchtower;
