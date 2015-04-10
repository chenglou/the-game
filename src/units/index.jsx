'use strict';

var React = require('react');
var UnitWrapper = require('./UnitWrapper');

function makeGenericComp(name) {
  return React.createClass({
    shouldComponentUpdate: function() {
      return false;
    },
    render: function() {
      return (
        <UnitWrapper unitName={name}>
        </UnitWrapper>
      );
    }
  });
}

var comps = {
  Grass: makeGenericComp('Grass'),
  Sea: makeGenericComp('Sea'),
  Tombstone: makeGenericComp('Tombstone'),
  Tree: makeGenericComp('Tree'),
  Watchtower: makeGenericComp('Watchtower'),

  Village: require('./Village'),
  Villager: require('./Villager'),
  Meadow: require('./Meadow'),
  Road: require('./Road'),
  Cannon: require('./Cannon'),
};

module.exports = comps;
