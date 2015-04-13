'use strict';

var React = require('react');
var UnitWrapper = require('./UnitWrapper');
var Badge = require('../map/Badge');

var Road = React.createClass({
  render: function() {
    var {cooldown} = this.props;

    var maybeBadge;
    if (cooldown > 0) {
      maybeBadge = <Badge>{cooldown}</Badge>;
    }

    return (
      <UnitWrapper unitName="Road">
        {maybeBadge}
      </UnitWrapper>
    );
  }
});

module.exports = Road;
