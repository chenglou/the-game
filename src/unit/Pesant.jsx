var React = require('react');
var url = require('../utils/imgUrl');
var pesantImg = require('../useful/Pesant.png');
var assign = require('object-assign');

var Pesant = React.createClass({
  render: function() {
    var props = this.props;

    var s = {
      backgroundImage: url(pesantImg),
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

module.exports = Pesant;
