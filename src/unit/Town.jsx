var React = require('react');
var url = require('../utils/imgUrl');
var townImg = require('../useful/Town.png');
var assign = require('object-assign');

var Town = React.createClass({
  render: function() {
    var props = this.props;

    var s = {
      backgroundImage: url(townImg),
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

module.exports = Town;