var comp = {
  Hovel: require('./units/Hovel'),
  Town: require('./units/Town'),
  Fort: require('./units/Fort'),
  Castle: require('./units/Castle'),

  Peasant: require('./units/Peasant'),
  Infantry: require('./units/Infantry'),
  Soldier: require('./units/Soldier'),
  Knight: require('./units/Knight'),

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

  Hovel: 2,
  Town: 2,
  Fort: 2,
  Castle: 2,

  Road: 3,

  Meadow: 4,
  Tree: 4,

  Tombstone: 5,

  Watchtower: 6,

  Peasant: 7,
  Infantry: 7,
  Soldier: 7,
  Knight: 7,
};

var rank = {
  // hovel: overtaken by enemy soldier
  // town: overtaken by enemy soldier
  // fort: overtaken by knight
  Hovel: 2,
  Town: 3,
  Fort: 4,
  Castle: 99,

  Peasant: 1,
  Infantry: 2,
  Soldier: 4, // not a typo
  Knight: 5,

  Watchtower: 2,
};

var defaultConfig = {
  Grass: {},
  Sea: {},

  Hovel: {gold: 7, wood: 0},
  Town: {gold: 7, wood: 0},
  Fort: {gold: 7, wood: 0},
  Castle: {gold: 7, wood: 0},

  Road: {cooldown: 1},
  Meadow: {cooldown: 2},

  Tree: {},
  Tombstone: {},
  Watchtower: {},

  Peasant: {hasMoved: false, cooldown: 0},
  Infantry: {hasMoved: false},
  Soldier: {hasMoved: false},
  Knight: {hasMoved: false},
};

module.exports = {nameInDisplayOrder, comp, rank, defaultConfig};
