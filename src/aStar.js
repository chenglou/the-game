'use strict';

var M = require('mori');
var findNeighbors = require('./findNeighbors');
var arr2D = require('./utils/arr2D');

function aStar(map, [si, sj], [ei, ej]) {
  if (M.getIn(map, [ei, ej]) === 1) {
    return [];
  }
  // map is a 2D arrays of 0 to 100. 100 means obstacles.
  // start is [x, y] coordinates. Same for end
  // set up cost function
  let height = M.count(map);
  let width = M.count(M.first(map));
  var cost = arr2D(() => 1, width, height);
  var H = setupHeuristic(map, cost, [si, sj], [ei, ej]);
  var closed = M.set();
  // priority queue
  var open = M.sortedSetBy((a, b) => {
    let [ai, aj] = M.toJs(a);
    let [bi, bj] = M.toJs(b);
    return (H[ai][aj] + C[ai][aj]) - (H[bi][bj] + C[bi][bj]);
  }, M.vector(si, sj));

  var parentEdges = arr2D(() => [-1, -1], width, height);
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

    if (H[ci][cj] == 0)
    {
      break;
    }

    // set up cost
    curNeighbors.forEach(([i, j]) => {
      let v = M.vector(i, j);
      var tmpCost = C[ci][cj] + cost[ci][cj];

      if (M.get(open, v) && tmpCost < C[i][j]) {
        // should never happen
        open = M.disj(open, v);
      }
      if (M.get(closed, v)) {
        if (tmpCost < C[i][j]) {
          closed = M.disj(closed, v);
        }
      }
      if (!M.get(open, v) && !M.get(closed, v)) {
        if (tmpCost < C[i][j]) {
          C[i][j] = tmpCost;
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

function setupHeuristic(map, cost, start, [ei, ej]) {
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
      .filter(([i, j]) => M.getIn(map, [i, j]) !== 100)
      .filter(([i, j]) => !M.get(visited, M.vector(i, j)));

    unvisitedNeighbors.forEach(([i, j]) => {
      visited = M.conj(visited, M.vector(i, j));
      heuristic[i][j] = heuristic[ci][cj] + 1;
      cost[i][j] += M.getIn(map, [i, j])
      toVisit.push([i, j]);
    });
  }
  return heuristic;
}

function aStarWithNewObstacle(map, path, [oi, oj]) {
  // obstacleIndex = -1;
  // for (int i = 0; i<path.length; i++)
  // {
  //   if (path[i][0] == oi && path[i][1] == oj)
  //   {
  //     obstacleIndex = i;
  //     break;
  //   }
  // }

  var obstacleIndex = path.indexOf([oi, oj]);

  if (obstacleIndex === -1 ||
    obstacleIndex === path.length - 1 ||
    obstacleIndex === 0) {
    return path;
  }

  var newPath = [];
  var prev = obstacleIndex - 1;
  var post = obstacleIndex + 1;

  while (prev > 0 && post < path.length - 1) {
    newPath = aStar(map, path[prev], path[post]);

    if (newPath.length > 0) {
      break;
    }

    prev--;
    post++;
  }

  if (newPath.length === 0) {
    return [];
  }

  var p = path;
  return p.splice(prev, post - prev + 1, newPath);
}

module.exports = {aStar, aStarWithNewObstacle};
