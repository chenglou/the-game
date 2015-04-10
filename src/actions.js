'use strict';

let newPeasant = ['New Peasant', 'newVillager', {gold: 10, wood: 0, name: 'Peasant'}];
let newInfantry = ['New Infantry', 'newVillager', {gold: 20, wood: 0, name: 'Infantry'}];
let newSoldier = ['New Soldier', 'newVillager', {gold: 30, wood: 0, name: 'Soldier'}];
let newKnight = ['New Knight', 'newVillager', {gold: 40, wood: 0, name: 'Knight'}];
let newWatchtower = ['New Watchtower', 'newWatchtower', {gold: 0, wood: 5}];
let newCannon = ['New Cannon', 'newCannon', {gold: 35, wood: 12}];
let combine = ['Combine', 'combineVillagers', {}];

let pendingActions = {
  Village: {
    Hovel: [
      newPeasant,
      newInfantry,
      ['Upgrade to Town', 'upgradeVillage', {gold: 0, wood: 8, nextName: 'Town'}],
    ],
    Town: [
      newPeasant,
      newInfantry,
      newSoldier,
      newWatchtower,
      ['Upgrade to Fort', 'upgradeVillage', {gold: 0, wood: 8, nextName: 'Fort'}],
    ],
    Fort: [
      newPeasant,
      newInfantry,
      newSoldier,
      newKnight,
      newWatchtower,
      newCannon,
      ['Upgrade to Castle', 'upgradeVillage', {gold: 0, wood: 12, nextName: 'Castle'}],
    ],
    Castle: [newPeasant, newInfantry, newSoldier, newKnight, newWatchtower, newCannon],
  },

  Villager: {
    Peasant: [
      ['Move', 'move', {name: 'Peasant', typeName: 'Villager', move: true}],
      ['Cultivate Meadow', 'build', {name: 'Meadow', cooldown: 2}],
      ['Build Road', 'build', {name: 'Road', cooldown: 1}],
      ['Upgrade to Infantry', 'upgradeVillager', {gold: 10, wood: 0, nextName: 'Infantry'}],
      combine,
    ],
    Infantry: [
      ['Move', 'move', {name: 'Infantry', typeName: 'Villager', move: true}],
      ['Upgrade to Soldier', 'upgradeVillager', {gold: 10, wood: 0, nextName: 'Soldier'}],
      combine,
    ],
    Soldier: [
      ['Move', 'move', {name: 'Soldier', typeName: 'Villager', move: true}],
      ['Upgrade to Knight', 'upgradeVillager', {gold: 10, wood: 0, nextName: 'Knight'}],
      combine,
    ],
    Knight: [
      ['Move', 'move', {name: 'Knight', typeName: 'Villager', move: true}],
    ],
  },

  Cannon: [
    ['Move', 'move', {name: 'Cannon'}],
    ['Shoot', 'shootCannon', {gold: 0, wood: 1}],
  ],
};

var immediateActions = {
  build: true,
  upgradeVillage: true,
  upgradeVillager: true,
};

module.exports = {pendingActions, immediateActions};
