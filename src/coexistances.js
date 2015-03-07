var coexistances = {
  'Hovel': ['Grass', 'Watchtower'],
  'Town': ['Grass', 'Watchtower'],
  'Fort': ['Grass', 'Watchtower'],

  'Pesant': ['Grass', 'Meadow', 'Road'],
  'Infantry': ['Grass', 'Meadow', 'Road'],
  'Soldier': ['Grass', 'Meadow', 'Road'],
  'Knight': ['Grass', 'Meadow', 'Road'],

  'Grass': [
    'Hovel', 'Town', 'Fort', 'Pesant', 'Infantry', 'Soldier', 'Knight', 'Tree',
    'Meadow', 'Watchtower', 'Road', 'Tombstone'
  ],
  'Meadow': [
    'Pesant', 'Infantry', 'Soldier', 'Knight', 'Grass', 'Watchtower',
    'Tombstone', 'Road'
  ],
  'Road': [
    'Pesant', 'Infantry', 'Soldier', 'Knight', 'Grass', 'Watchtower',
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
