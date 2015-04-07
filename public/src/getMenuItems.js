'use strict';

var React = require('react');
var {MenuItem} = require('./Menu');
var {pendingActions} = require('./actions');

function getItems(currGold, currWood, cb) {
  return function ([desc, action, {gold, wood, ...rest}]) {
    if ((gold == null && wood == null) || currGold >= gold && currWood >= wood) {
      return (
        <MenuItem key={desc} onClick={cb.bind(null, [action, {gold, wood, ...rest}])}>
          {desc}
        </MenuItem>
      );
    }

    return (
      <MenuItem key={desc} disabled={true}>
        {desc}
      </MenuItem>
    );
  };
}

function village(typeName, gold, wood, cb) {
  return pendingActions.Village[typeName].map(getItems(gold, wood, cb));
}

function villager(unitName, {hasMoved, cooldown}, gold, wood, cb) {
  if (hasMoved) {
    return [
      <MenuItem key="hasMoved" disabled={true}>
        Already Moved
      </MenuItem>
    ];
  }
  if (cooldown > 0) {
    return [
      <MenuItem key="cooldown" disabled={true}>
        {`Cooldown (${cooldown})`}
      </MenuItem>
    ];
  }
  return pendingActions.Villager[unitName].map(getItems(gold, wood, cb));
}

function cannon({hasMoved}, gold, wood, cb) {
  if (hasMoved) {
    return [
      <MenuItem key="hasMoved" disabled={true}>
        Already Moved
      </MenuItem>
    ];
  }
  return pendingActions.Cannon.map(getItems(gold, wood, cb));
}

module.exports = {village, villager, cannon};
