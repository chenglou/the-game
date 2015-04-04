'use strict';

var M = require('mori');
var findNeighbors = require('./findNeighbors');
var rankers = require('./rankers');
var getColor = require('./getColor');

function canMoveToAura(map, unitName, enemyColor, [i, j]) {
  // same tile can be protected by many. find 1 hex surrounding (no unit
  // protects more than 1 hex) and get highest ranked unit with aura
  return findNeighbors(map, i, j)
    .filter(([i, j]) => getColor(map, i, j) === enemyColor)
    .map(([i, j]) => M.getIn(map, [i, j, 'units']))
    .every(units => {
      let aurables = M.filter(a => rankers.hasAura[M.first(a)], units);
      return M.every(a => {
        let name = M.first(a);
        let config = M.second(a);

        let rank = M.get(config, 'rank');
        let destUnitName = name === 'Villager'
          ? rankers.villagerByRank[rank]
          : rankers.villageByRank[rank];
        return rankers.canAttack[unitName][destUnitName];
      }, aurables);
    });
}

module.exports = canMoveToAura;
