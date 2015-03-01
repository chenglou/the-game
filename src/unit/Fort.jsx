var React = require('react');
var url = require('../utils/imgUrl');
var fortImg = require('../useful/Fort.png');
var assign = require('object-assign');

var Fort = React.createClass({
  render: function() {
    var props = this.props;

    var s = {
      backgroundImage: url(fortImg),
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

module.exports = Fort;
