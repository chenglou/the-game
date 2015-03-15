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
      ['Move', 'move', 0, 0],
      ['Cultivate Meadow', 'cultivateMeadow', 0, 0],
      ['Build Road', 'buildRoad', 0, 0],
      ['Upgrade to Infantry', 'upgradeVillager', 10, 0],
    ],
    Infantry: [
      ['Move', 'move', 0, 0],
      ['Upgrade to Soldier', 'upgradeVillager', 10, 0],
      // ['Kill', 'kill'],
    ],
    Soldier: [
      // tramples meadow unless there's a road
      ['Move', 'move', 0, 0],
      ['Upgrade to Knight', 'upgradeVillager', 10, 0],
      // ['Kill', 'kill'],
    ],
    Knight: [
      // can't move into tree, etc. tramples meadow unless road
      ['Move', 'move', 0, 0],
      // ['Kill', 'kill'],
    ],
  }
};

var immediateActions = {
  cultivateMeadow: true,
  buildRoad: true,
  upgradeVillage: true,
  upgradeVillager: true,
};

module.exports = {pendingActions, immediateActions};
