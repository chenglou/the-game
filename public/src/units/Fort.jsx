var React = require('react');
var UnitWrapper = require('./UnitWrapper');
var Badge = require('../map/Badge');

var p = React.PropTypes;

var Fort = React.createClass({
  propTypes: {
    gold: p.number.isRequired,
    wood: p.number.isRequired,
  },

  render: function() {
    var {gold, wood} = this.props;

    return (
      <UnitWrapper unitName="Fort">
        <Badge notice={true}>
          {gold + ' / ' + wood}
        </Badge>
      </UnitWrapper>
    );
  }
});

module.exports = Fort;
