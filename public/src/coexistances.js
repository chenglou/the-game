'use strict';

var arrToSet = require('./utils/arrToSet');

var coexistances = {
  Village: ['Grass', 'Watchtower'],
  Villager: ['Grass', 'Meadow', 'Road'],
  Grass: ['Village', 'Tree', 'Meadow', 'Watchtower', 'Road', 'Tombstone', 'Villager'],
  Meadow: ['Grass', 'Watchtower', 'Tombstone', 'Road', 'Villager'],
  Road: ['Grass', 'Watchtower', 'Tombstone', 'Meadow', 'Villager'],
  Sea: [],
  Tombstone: ['Grass', 'Meadow', 'Road'],
  Tree: ['Grass'],
  Watchtower: ['Village', 'Grass', 'Meadow', 'Road'],
};

for (var key in coexistances) {
  coexistances[key] = arrToSet(coexistances[key]);
}

module.exports = coexistances;
