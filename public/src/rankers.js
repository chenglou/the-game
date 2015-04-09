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
  Castle: 80,
};

// next level's hp boost
let villageUpgradeHp = {
  Town: 1,
  Fort: 3,
  Castle: 5,
};

let canAttack = {
  Peasant: [],
  Infantry: ['Peasant'],
  Soldier: ['Hovel', 'Town', 'Watchtower', 'Peasant', 'Infantry'],
  Knight: [
    'Hovel', 'Town', 'Fort', 'Watchtower', 'Cannon', 'Peasant', 'Infantry',
    'Soldier',
  ],
  Cannon: ['Hovel', 'Town', 'Watchtower', 'Peasant', 'Infantry', 'Castle'],
  // Watchtower: [],
};

for (let key in canAttack) {
  canAttack[key] = arrToSet(canAttack[key]);
}

let canInvade = {
  Infantry: true,
  Soldier: true,
  Knight: true,
};

let hasAura = {
  Villager: true,
  Village: true,
};

let killable = {
  Villager: true,
  Village: true,
  Cannon: true,
};

let producibleVillagers = {
  Hovel: ['Peasant', 'Infantry'],
  Town: ['Peasant', 'Infantry', 'Soldier'],
  Fort: ['Peasant', 'Infantry', 'Soldier', 'Knight'],
  Castle: ['Peasant', 'Infantry', 'Soldier', 'Knight'],
};

for (let key in producibleVillagers) {
  producibleVillagers[key] = arrToSet(producibleVillagers[key]);
}

module.exports = {
  villageByRank,
  villagerByRank,
  upkeep,
  producibleVillagers,
  hasAura,
  canAttack,
  killable,
  villageUpgradeHp,
  canInvade,
};
