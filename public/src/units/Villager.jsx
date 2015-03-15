'use strict';

var React = require('react');
var UnitWrapper = require('./UnitWrapper');
var rankers = require('../rankers');

var p = React.PropTypes;

var Villager = React.createClass({
  propTypes: {
    hasMoved: p.bool.isRequired,
    cooldown: p.number.isRequired,
    rank: p.number.isRequired,
  },

  render: function() {
    return (
      <UnitWrapper unitName={rankers.villagerByRank[this.props.rank]}>
      </UnitWrapper>
    );
  }
});

module.exports = Villager;
