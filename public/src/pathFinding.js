'use strict';

var M = require('mori');
var findNeighbors = require('./findNeighbors');

function arr2D(f, width, height) {
  let res = [];
  for (let i = 0; i < height; i++) {
    res.push([]);
    for (let j = 0; j < width; j++) {
      res[i][j] = f();
    }
  }
  return res;
}

function findPath(map, [si, sj], [ei, ej]) {
  // map is a 2D arrays of 0 and 1. 1 means obstacles.
  // start is [x, y] coordinates. Same for end
  var H = setupHeuristic(map, [si, sj], [ei, ej]);
  var closed = M.set();
  // priority queue
  var open = M.sortedSetBy((a, b) => {
    let [ai, aj] = M.toJs(a);
    let [bi, bj] = M.toJs(b);
    return (H[ai][aj] + C[ai][aj]) - (H[bi][bj] + C[bi][bj]);
  }, M.vector(si, sj));

  let height = M.count(map);
  let width = M.count(M.first(map));
  var parentEdges = arr2D(() => [-1, -1], width, height);

  // set up cost function
  var C = arr2D(() => 9999, width, height);

  C[si][sj] = 0;

  while (!M.isEmpty(open)) {
    // remove lowest rank from open
    var cur = M.first(open);
    open = M.rest(open);

    var ci = M.nth(cur, 0);
    var cj = M.nth(cur, 1);

    closed = M.conj(closed, cur);

    var curNeighbors =
      findNeighbors(map, ci, cj).filter(([i, j]) => H[i][j] !== -1);

    // set up cost
    curNeighbors.forEach(([i, j]) => {
      let v = M.vector(i, j);
      var cost = C[ci][cj] + 1;

      if (M.get(open, v) && cost < C[i][j]) {
        // should never happen
        open = M.disj(open, v);
      }
      if (M.get(closed, v)) {
        if (cost < C[i][j]) {
          closed = M.disj(closed, v);
        }
      }
      if (!M.get(open, v) && !M.get(closed, v)) {
        if (cost < C[i][j]) {
          C[i][j] = cost;
          // TODO: set parent edge
          parentEdges[i][j][0] = ci;
          parentEdges[i][j][1] = cj;

          open = M.conj(open, v);
        }
      }
    });
  }
  // TODO: traverse parent edges from goal
  if (parentEdges[ei][ej][0] === -1) {
    return [];
  }

  var currNode = [ei, ej];
  var path = [];

  while (!(currNode[0] === si && currNode[1] === sj)) {
    path.unshift([currNode[0], currNode[1]]);
    currNode = parentEdges[currNode[0]][currNode[1]];
  }
  // adding start point to the front of the path
  path.unshift([si, sj]);
  return path;
}

function setupHeuristic(map, start, [ei, ej]) {
  // initialize a 2D array of -1
  let height = M.count(map);
  let width = M.count(M.first(map));
  let heuristic = arr2D(() => -1, width, height);
  heuristic[ei][ej] = 0;

  let visited = M.set();
  let toVisit = [[ei, ej]];
  visited = M.conj(visited, M.vector(ei, ej));

  // start with end point, and slowly expand regions
  while(toVisit.length > 0) {
    let [ci, cj] = toVisit.pop();
    let unvisitedNeighbors = findNeighbors(map, ci, cj)
      .filter(([i, j]) => M.getIn(map, [i, j]) === 0)
      .filter(([i, j]) => !M.get(visited, M.vector(i, j)));

    unvisitedNeighbors.forEach(([i, j]) => {
      visited = M.conj(visited, M.vector(i, j));
      heuristic[i][j] = heuristic[ci][cj] + 1;
      toVisit.push([i, j]);
    });
  }
  return heuristic;
}

function rand() {
  let res = [];
  for (let i = 0; i < 20; i++) {
    res.push([]);
    for (let j = 0; j < 30; j++) {
      res[i][j] = Math.random() > .5 ? 1 : 0;
    }
  }
  return res;
}

console.log(JSON.stringify(
  findPath(
    M.toClj(
      [[0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 1, 1, 0, 1, 1, 0, 0], [0, 0, 1, 1, 1, 1, 1, 1, 0], [0, 0, 1, 1, 1, 1, 1, 0, 0], [0, 0, 0, 1, 1, 1, 1, 0, 0], [0, 0, 0, 1, 1, 1, 0, 0, 0], [0, 0, 0, 0, 1, 1, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0]]
    ), [0, 4], [9, 4]
  )
));


module.exports = findPath;



