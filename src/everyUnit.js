var everyUnitComp = {
  Hovel: require('./units/Hovel'),
  Town: require('./units/Town'),
  Fort: require('./units/Fort'),

  Pesant: require('./units/Pesant'),
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

  'Pesant': 7,
  'Infantry': 7,
  'Soldier': 7,
  'Knight': 7,
};

var everyUnit = {
  nameInDisplayOrder: everyUnitNameInDisplayOrder,
  comp: everyUnitComp,
};

module.exports = everyUnit;
