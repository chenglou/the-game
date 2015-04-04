let arrToSet = require('./utils/arrToSet');

let villageByRank = ['Hovel', 'Town', 'Fort', 'Castle'];
let villagerByRank = ['Peasant', 'Infantry', 'Soldier', 'Knight'];

let upkeep = {
  Peasant: 2,
  Infantry: 6,
  Soldier: 18,
  Knight: 54,
  Watchtower: 0,
  Cannon: 5,
};

let canAttack = {
  Peasant: [],
  Infantry: ['Peasant'],
  Soldier: ['Hovel', 'Town', 'Watchtower', 'Peasant', 'Infantry'],
  Knight: [
    'Hovel', 'Town', 'Fort', 'Watchtower', 'Cannon', 'Peasant', 'Infantry',
    'Soldier',
  ],
  Cannon: ['Hovel', 'Town', 'Watchtower', 'Peasant', 'Infantry'],
  // Watchtower: [],
};

for (let key in canAttack) {
  canAttack[key] = arrToSet(canAttack[key]);
}

let hasAura = {
  Villager: true,
  Village: true,
};

let killable = {
  Villager: true,
  Village: true,
  Cannon: true,
};

let villageCanProduce = {
  Hovel: ['Peasant', 'Infantry'],
  Town: ['Peasant', 'Infantry', 'Soldier'],
  Fort: ['Peasant', 'Infantry', 'Soldier', 'Knight', 'Cannon'],
  Castle: ['Peasant', 'Infantry', 'Soldier', 'Knight', 'Cannon'],
};

for (let key in villageCanProduce) {
  villageCanProduce[key] = arrToSet(villageCanProduce[key]);
}

module.exports = {
  villageByRank, villagerByRank, upkeep, villageCanProduce, hasAura, canAttack, killable
};
