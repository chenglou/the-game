var everyUnitComp = {
  Hovel: require('./units/Hovel'),
  Town: require('./units/Town'),
  Fort: require('./units/Fort'),

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

var everyUnitNameInDisplayOrder = {
  'Grass': 1,
  'Sea': 1,

  'Hovel': 2,
  'Town': 2,
  'Fort': 2,

  'Road': 3,

  'Meadow': 4,
  'Tree': 4,

  'Tombstone': 5,

  'Watchtower': 6,

  'Peasant': 7,
  'Infantry': 7,
  'Soldier': 7,
  'Knight': 7,
};

var everyUnitRank = {
  // shouldnt be needing these
  'Grass': 0,
  'Sea': 0,
  'Road': 0,
  'Meadow': 0,
  'Tree': 0,
  'Tombstone': 0,

  // hovel: overtaken by enemy soldier
  // town: overtaken by enemy soldier
  // fort: overtaken by knight
  'Hovel': 2,
  'Town': 3,
  'Fort': 4,

  'Peasant': 1,
  'Infantry': 2,
  'Soldier': 4, // not a typo
  'Knight': 5,

  'Watchtower': 2,
};

var everyUnit = {
  nameInDisplayOrder: everyUnitNameInDisplayOrder,
  comp: everyUnitComp,
  rank: everyUnitRank,
};

module.exports = everyUnit;
