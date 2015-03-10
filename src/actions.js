// desc, unique action name, gold, wood
var pendingActions = {
  Village: {
    Hovel: [
      ['New Peasant', 'newPeasant', 10, 0],
      ['New Infantry', 'newInfantry', 20, 0],
      ['Upgrade to Town', 'upgradeVillage', 0, 8],
    ],
    Town: [
      ['New Peasant', 'newPeasant', 10, 0],
      ['New Infantry', 'newInfantry', 20, 0],
      ['New Soldier', 'newSoldier', 30, 0],
      ['New Watchtower', 'newWatchtower', 0, 5],
      ['Upgrade to Fort', 'upgradeVillage', 0, 8],
    ],
    Fort: [
      ['New Peasant', 'newPeasant', 10, 0],
      ['New Infantry', 'newInfantry', 20, 0],
      ['New Soldier', 'newSoldier', 30, 0],
      ['New Knight', 'newKnight', 40, 0],
      ['New Watchtower', 'newWatchtower', 0, 5],
    ],
  },

  Villager: {
    Peasant: [
      // can't invade
      ['Move', 'move'],
      ['Cultivate Meadow', 'cultivateMeadow'],
      ['Build Road', 'buildRoad'],
    ],
    Infantry: [
      ['Move', 'move'],
      // ['Kill', 'kill'],
    ],
    Soldier: [
      // tramples meadow unless there's a road
      ['Move', 'move'],
      // ['Kill', 'kill'],
    ],
    Knight: [
      // can't move into tree, etc. tramples meadow unless road
      ['Move', 'move'],
      // ['Kill', 'kill'],
    ],
  }
};

var immediateActions = {
  cultivateMeadow: true,
  buildRoad: true,
  upgradeVillage: true,
};

module.exports = {pendingActions, immediateActions};
