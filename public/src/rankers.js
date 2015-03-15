var arrToSet = require('./utils/arrToSet');

var villageByRank = ['Hovel', 'Town', 'Fort', 'Castle'];
var villagerByRank = ['Peasant', 'Infantry', 'Soldier', 'Knight'];

var upkeep = {
  Peasant: 2,
  Infantry: 6,
  Soldier: 18,
  Knight: 54,
  Watchtower: 0,
  Cannon: 5,
};

var villageCanProduce = {
  Hovel: ['Peasant', 'Infantry'],
  Town: ['Peasant', 'Infantry', 'Soldier'],
  Fort: ['Peasant', 'Infantry', 'Soldier', 'Knight', 'Cannon'],
  Castle: ['Peasant', 'Infantry', 'Soldier', 'Knight', 'Cannon'],
};

for (var key in villageCanProduce) {
  villageCanProduce[key] = arrToSet(villageCanProduce[key]);
}

module.exports = {villageByRank, villagerByRank, upkeep, villageCanProduce};
