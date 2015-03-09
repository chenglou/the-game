var React = require('react');
var UnitWrapper = require('./UnitWrapper');

var p = React.PropTypes;

var Fort = React.createClass({
  propTypes: {
    gold: p.number.isRequired,
    wood: p.number.isRequired,
  },

  render: function() {
    return (
      <UnitWrapper unitName="Fort">
      </UnitWrapper>
    );
  }
});

module.exports = Fort;
