'use strict';

var React = require('react');
var UnitWrapper = require('./UnitWrapper');
var rankers = require('../rankers');
var Badge = require('../map/Badge');

var p = React.PropTypes;

var Village = React.createClass({
  propTypes: {
    gold: p.number.isRequired,
    wood: p.number.isRequired,
    rank: p.number.isRequired,
  },

  render: function() {
    var {gold, wood, rank} = this.props;

    return (
      <UnitWrapper unitName={rankers.villageByRank[rank]}>
        <Badge notice={true}>
          {gold + ' / ' + wood}
        </Badge>
      </UnitWrapper>
    );
  }
});

module.exports = Village;
