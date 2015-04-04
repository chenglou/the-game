'use strict';

var M = require('mori');
var getColor = require('./getColor');
var findNeighbors = require('./findNeighbors');

function findRegion(map, i, j) {
  var color = getColor(map, i, j);

  var visited = M.set();
  var toVisit = [[i, j]];

  while (toVisit.length > 0) {
    let [i, j] = toVisit.pop();
    var unVisitedSameColorNeighbors = findNeighbors(map, i, j)
      .filter(([i, j]) => getColor(map, i, j) === color)
      .filter(([i, j]) => !M.get(visited, M.vector(i, j)));

    unVisitedSameColorNeighbors.forEach(([i, j]) => {
      visited = M.conj(visited, M.vector(i, j));
      toVisit.push([i, j]);
    });
  }

  return M.toJs(visited);
}

module.exports = findRegion;
