var React = require('react');
var UnitWrapper = require('./UnitWrapper');

var p = React.PropTypes;

var Peasant = React.createClass({
  propTypes: {
    hasMoved: p.bool.isRequired,
    cooldown: p.number.isRequired,
  },

  render: function() {
    return (
      <UnitWrapper unitName="Peasant">
      </UnitWrapper>
    );
  }
});

module.exports = Peasant;
