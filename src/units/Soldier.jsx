var React = require('react');
var UnitWrapper = require('./UnitWrapper');

var p = React.PropTypes;

var Soldier = React.createClass({
  propTypes: {
    hasMoved: p.bool.isRequired,
  },

  render: function() {
    return (
      <UnitWrapper unitName="Soldier">
      </UnitWrapper>
    );
  }
});

module.exports = Soldier;
