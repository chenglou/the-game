'use strict';

var M = require('mori');

var nameInDisplayOrder = {
  Grass: 1,
  Sea: 1,

  Village: 2,
  Road: 3,

  Meadow: 4,
  Tree: 4,

  Tombstone: 5,
  Watchtower: 6,
  Villager: 7,
  Cannon: 7,
};

var defaultConfig = M.toClj({
  Grass: {},
  Sea: {},
  Village: {gold: 7, wood: 0, rank: 0, hp: 1},
  Villager: {hasMoved: false, cooldown: 0, rank: 0},
  Road: {cooldown: 1},
  Meadow: {cooldown: 2},
  Tree: {},
  Tombstone: {},
  Watchtower: {},
  Cannon: {hasMoved: false},
});

module.exports = {nameInDisplayOrder, defaultConfig};
