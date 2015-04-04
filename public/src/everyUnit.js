var comp = {
  Village: require('./units/Village'),
  Villager: require('./units/Villager'),
  Grass: require('./units/Grass'),
  Meadow: require('./units/Meadow'),
  Road: require('./units/Road'),
  Sea: require('./units/Sea'),
  Tombstone: require('./units/Tombstone'),
  Tree: require('./units/Tree'),
  Watchtower: require('./units/Watchtower'),
};

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
};

var defaultConfig = {
  Grass: {},
  Sea: {},
  Village: {gold: 7, wood: 0, rank: 0},
  Villager: {hasMoved: false, cooldown: 0, rank: 0},
  Road: {cooldown: 1},
  Meadow: {cooldown: 2},
  Tree: {},
  Tombstone: {},
  Watchtower: {},
};

module.exports = {nameInDisplayOrder, comp, defaultConfig};
