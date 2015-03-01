var React = require('react');
var url = require('../utils/imgUrl');
var knightImg = require('../useful/Knight.png');
var assign = require('object-assign');

var Knight = React.createClass({
  render: function() {
    var props = this.props;

    var s = {
      backgroundImage: url(knightImg),
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

module.exports = Knight;
