'use strict';

var coexistances = {
  'Hovel': ['Grass', 'Watchtower'],
  'Town': ['Grass', 'Watchtower'],
  'Fort': ['Grass', 'Watchtower'],
  'Castle': ['Grass', 'Watchtower'],

  'Peasant': ['Grass', 'Meadow', 'Road'],
  'Infantry': ['Grass', 'Meadow', 'Road'],
  'Soldier': ['Grass', 'Meadow', 'Road'],
  'Knight': ['Grass', 'Meadow', 'Road'],

  'Grass': [
    'Hovel', 'Town', 'Fort', 'Castle', 'Peasant', 'Infantry', 'Soldier', 'Knight', 'Tree',
    'Meadow', 'Watchtower', 'Road', 'Tombstone'
  ],
  'Meadow': [
    'Peasant', 'Infantry', 'Soldier', 'Knight', 'Grass', 'Watchtower',
    'Tombstone', 'Road'
  ],
  'Road': [
    'Peasant', 'Infantry', 'Soldier', 'Knight', 'Grass', 'Watchtower',
    'Tombstone', 'Meadow'
  ],
  'Sea': [],
  'Tombstone': ['Grass', 'Meadow', 'Road'],
  'Tree': ['Grass'],
  'Watchtower': ['Hovel', 'Town', 'Fort', 'Castle', 'Grass', 'Meadow', 'Road'],
};

for (var key in coexistances) {
  coexistances[key] = coexistances[key].reduce((acc, unit) => {
    acc[unit] = true;
    return acc;
  }, {});
}

module.exports = coexistances;
