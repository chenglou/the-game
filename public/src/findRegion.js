'use strict';

var M = require('mori');
var findNeighbors = require('./findNeighbors');

function findRegionSet(map, i, j) {
  var color = M.getIn(map, [i, j, 'color']);

  var visited = M.set();
  var toVisit = [[i, j]];

  while (toVisit.length > 0) {
    let [i, j] = toVisit.pop();
    visited = M.conj(visited, M.vector(i, j));
    var unVisitedSameColorNeighbors = findNeighbors(map, i, j)
      .filter(([i, j]) => M.getIn(map, [i, j, 'color']) === color)
      .filter(([i, j]) => !M.get(visited, M.vector(i, j)));

    unVisitedSameColorNeighbors.forEach(([i, j]) => {
      visited = M.conj(visited, M.vector(i, j));
      toVisit.push([i, j]);
    });
  }

  return visited;
}

function findRegion(map, i, j) {
  return M.toJs(findRegionSet(map, i, j));
}

function findRegionM(map, i, j) {
  return M.into(M.vector(), findRegionSet(map, i, j));
}

module.exports = {findRegion, findRegionM};
