var React = require('react');
var UnitWrapper = require('./UnitWrapper');
var Badge = require('../map/Badge');

var p = React.PropTypes;

var Hovel = React.createClass({
  propTypes: {
    gold: p.number.isRequired,
    wood: p.number.isRequired,
  },

  render: function() {
    var {gold, wood} = this.props;

    return (
      <UnitWrapper unitName="Hovel">
        <Badge notice={true}>
          {gold + ' / ' + wood}
        </Badge>
      </UnitWrapper>
    );
  }
});

module.exports = Hovel;
