var React = require('react');
var UnitWrapper = require('./UnitWrapper');
var Badge = require('../map/Badge');

var Meadow = React.createClass({
  render: function() {
    var {cooldown} = this.props;

    var maybeBadge;
    if (cooldown > 0) {
      maybeBadge = <Badge>{cooldown}</Badge>;
    }

    return (
      <UnitWrapper unitName="Meadow">
        {maybeBadge}
      </UnitWrapper>
    );
  }
});

module.exports = Meadow;
