var React = require('react');
var UnitWrapper = require('./UnitWrapper');

var p = React.PropTypes;

var Infantry = React.createClass({
  propTypes: {
    hasMoved: p.bool.isRequired,
  },

  render: function() {
    return (
      <UnitWrapper unitName="Infantry">
      </UnitWrapper>
    );
  }
});

module.exports = Infantry;
