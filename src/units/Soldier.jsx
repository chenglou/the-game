var React = require('react');
var UnitWrapper = require('./UnitWrapper');

var Soldier = React.createClass({
  render: function() {
    return (
      <UnitWrapper unitName="Soldier">
      </UnitWrapper>
    );
  }
});

module.exports = Soldier;
