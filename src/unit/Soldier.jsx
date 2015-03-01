var React = require('react');
var url = require('../utils/imgUrl');
var soldierImg = require('../useful/Soldier.png');
var assign = require('object-assign');

var Soldier = React.createClass({
  render: function() {
    var props = this.props;

    var s = {
      backgroundImage: url(soldierImg),
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

module.exports = Soldier;
