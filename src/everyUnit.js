var everyUnitImg = {
  Fort: require('./useful/Fort.png'),
  Grass: require('./useful/Grass.png'),
  Hovel: require('./useful/Hovel.png'),
  Infantry: require('./useful/Infantry.png'),
  Knight: require('./useful/Knight.png'),
  Meadow: require('./useful/Meadow.png'),
  Pesant: require('./useful/Pesant.png'),
  Road: require('./useful/Road.png'),
  Sea: require('./useful/Sea.png'),
  Soldier: require('./useful/Soldier.png'),
  Tombstone: require('./useful/Tombstone.png'),
  Town: require('./useful/Town.png'),
  Tree: require('./useful/Tree.png'),
  Watchtower: require('./useful/Watchtower.png'),
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

// var everyUnitComp = {
//   Fort: require('./unit/Fort'),
//   Grass: require('./unit/Grass'),
//   Hovel: require('./unit/Hovel'),
//   Infantry: require('./unit/Infantry'),
//   Knight: require('./unit/Knight'),
//   Meadow: require('./unit/Meadow'),
//   Pesant: require('./unit/Pesant'),
//   Road: require('./unit/Road'),
//   Sea: require('./unit/Sea'),
//   Soldier: require('./unit/Soldier'),
//   Tombstone: require('./unit/Tombstone'),
//   Town: require('./unit/Town'),
//   Tree: require('./unit/Tree'),
//   Watchtower: require('./unit/Watchtower'),
// };

var everyUnit = {
  nameInDisplayOrder: everyUnitNameInDisplayOrder,
  img: everyUnitImg,
  // comp: everyUnitComp,
};

module.exports = everyUnit;
