var React = require('react');
var UnitWrapper = require('./UnitWrapper');

var p = React.PropTypes;

var Knight = React.createClass({
  propTypes: {
    hasMoved: p.bool.isRequired,
  },

  render: function() {
    return (
      <UnitWrapper unitName="Knight">
      </UnitWrapper>
    );
  }
});

module.exports = Knight;
