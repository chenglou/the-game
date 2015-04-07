'use strict';

var React = require('react');
var UnitWrapper = require('./UnitWrapper');

var p = React.PropTypes;

var Cannon = React.createClass({
  propTypes: {
    hasMoved: p.bool.isRequired,
  },

  render: function() {
    return (
      <UnitWrapper unitName="Cannon">
      </UnitWrapper>
    );
  }
});

module.exports = Cannon;
