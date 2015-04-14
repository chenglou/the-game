'use strict';

var M = require('mori');
var findNeighbors = require('./findNeighbors');
var arr2D = require('./utils/arr2D');

var prevRun = {
  s: [],
  e: [],
  path: [],
};

function aStar(map, [si, sj], [ei, ej]) {
  if (M.getIn(map, [ei, ej]) === 100) {
    return [];
  }
  // map is a 2D arrays of 0 to 100. 100 means obstacles.
  // start is [x, y] coordinates. Same for end
  // set up cost function
  let height = M.count(map);
  let width = M.count(M.first(map));
  var cost = arr2D(() => 1, width, height);
  var H = setupHeuristic(map, cost, [si, sj], [ei, ej]);
  
  if (prevRun)
  {
    if (prevRun.s.length!==0 && prevRun.e.length!==0 && prevRun.path.length!==0)
    {
      if (prevRun.s[0] === si && prevRun.s[1] === sj && prevRun.e[0] === ei && prevRun.e[1] === ej )
      {
        prevRun.path = aStarWithNewObstacle(map, cost, H);
        return prevRun.path;
      }
    }
  }
  
  debugger;
  prevRun.s = [si, sj];
  prevRun.e = [ei, ej];
  prevRun.path = aStarDiffPath(map, cost, H, [si, sj], [ei, ej]);
  return prevRun.path;
}

function setupHeuristic(map, cost, start, [ei, ej]) 
{
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

function aStarDiffPath(map, cost, H, [si, sj], [ei, ej])
{
  let height = M.count(map);
  let width = M.count(M.first(map));

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

function aStarWithNewObstacle(map, cost, H) 
{
  var obstacleIndexes = [];
  for (var i = 1; i<prevRun.path.length; i++)
  {
    let [pi, pj] = prevRun.path[i];
    if (M.getIn(map, [pi, pj]) === 100)
    {
      obstacleIndexes.push({
        index: i,
        coord: [pi, pj] 
      });
    }
  }

  if (obstacleIndexes.length === 0) {
    return path;
  }

  var path = prevRun.path;
  for (var i = 0; i<obstacleIndexes.length; i++)
  {
    var newPath = [];
    let [oi, oj] = obstacleIndexes[i].coord;
    var index = path.indexOf([oi, oj]);
    if (index < 1 || index >= path.length - 1)
    {
      prevRun.path = [];
      return prevRun.path;
    }

    var prev = index - 1;
    var post = index + 1;

    while (prev > 0 && post < path.length - 1) 
    {
      newPath = aStarDiffPath(cost, H);

      if (newPath.length > 0) {
        break;
      }

      prev--;
      post++;
    }

    if (newPath.length === 0) {
      return [];
    }

    path.splice(prev, post - prev + 1, newPath);
  }
}

module.exports = aStar;
