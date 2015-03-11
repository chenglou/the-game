var coexistances = {
  'Hovel': ['Grass', 'Watchtower'],
  'Town': ['Grass', 'Watchtower'],
  'Fort': ['Grass', 'Watchtower'],

  'Peasant': ['Grass', 'Meadow', 'Road'],
  'Infantry': ['Grass', 'Meadow', 'Road'],
  'Soldier': ['Grass', 'Meadow', 'Road'],
  'Knight': ['Grass', 'Meadow', 'Road'],

  'Grass': [
    'Hovel', 'Town', 'Fort', 'Peasant', 'Infantry', 'Soldier', 'Knight', 'Tree',
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
  'Watchtower': ['Hovel', 'Town', 'Fort', 'Grass', 'Meadow', 'Road'],
};

for (var key in coexistances) {
  coexistances[key] = coexistances[key].reduce(function(acc, unit) {
    acc[unit] = true;
    return acc;
  }, {});
}

module.exports = coexistances;
