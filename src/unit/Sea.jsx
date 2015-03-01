var React = require('react');
var url = require('../utils/imgUrl');
var seaImg = require('../useful/Sea.png');
var assign = require('object-assign');

var Sea = React.createClass({
  render: function() {
    var props = this.props;

    var s = {
      backgroundImage: url(seaImg),
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

module.exports = Sea;
