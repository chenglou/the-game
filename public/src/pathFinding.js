'use strict';

var M = require('mori');
var INF = 10000;

function findPath(map, start, end) 
{
  // map is a 2D arrays of 0 and 1. 1 means obstacles. 
  // start is [x, y] coordinates. Same for end
  var H = setupHeuristic(map, start, end);
  var closed = M.set();
  // priority queue
  var open = M.list(M.vector(start[0], start[1]));

  //var parentEdges = M.intoArray(M.map((a) => { return M.map((b) => {return [-1, -1];}, M.range(map[0].length));}, M.range(map.length)));
  var f = (a) => {return M.map(M.constantly(-1), M.range(2));}
  var parentEdges = M.toJs(M.map((a) => {return M.map(f, M.range(map[0].length));}, M.range(map.length)));
  
  // set up cost function
  var C = M.toJs(M.map((a) => { return M.map(M.constantly(INF), M.range(map[0].length));}, M.range(map.length)));
  C[start[0]][start[1]] = 0;

  while (!M.isEmpty(open)) 
  {
    open = M.sortBy((v) => {
      var i = M.nth(v, 0);
      var j = M.nth(v, 1);
      return H[i][j] + C[i][j];
    }, open);

    // remove lowest rank from open
    var cur = M.first(open);
    open = M.rest(open);

    var ci = M.nth(cur, 0);
    var cj = M.nth(cur, 1);

    // check if it's goal
    if (H[ci][cj] === 0)
      break;
    
    closed = M.conj(closed, cur);

    var curNeighbors = findNeighbours(map, ci, cj)
      .filter(([i, j]) => H[i][j] !== -1);

    // set up cost
    curNeighbors.forEach(([i, j]) => {
      var cost = C[ci][cj] + 1; 
      if (M.get(open, M.vector(i, j)) && cost < C[i][j])
        open = M.disj(open, M.vector(i, j));
      if (M.get(closed, M.vector(i, j)) && cost < C[i][j])
        closed = M.disj(closed, M.vector(i, j));
      if (!M.get(open, M.vector(i, j)) && !M.get(closed, M.vector(i, j)))
      {
        C[i][j] = cost;
        open = M.conj(open, M.vector(i, j));
        
        // TODO: set parent edge
        parentEdges[i][j][0] = ci;
        parentEdges[i][j][1] = cj;
      }
    });
  }
  // TODO: traverse parent edges from goal
  if (parentEdges[end[0]][end[1]][0] === -1)
    return [];

  var curNode = end;
  var path = [];
  
  while (!(curNode[0] === start[0] && curNode[1] === start[1]))
  {
    path.unshift([curNode[0], curNode[1]]);
    curNode = parentEdges[curNode[0]][curNode[1]];
  }
  // adding start point to the front of the path
  path.unshift(start);
  return path;
}

function setupHeuristic(map, start, end)
{
  // initialize a 2D array of -1 
  var f = (a) => {return M.map(M.constantly(-1), M.range(map[0].length));}
  var heuristic = M.toJs(M.map(f, M.range(map.length)));
  heuristic[end[0]][end[1]] = 0;
  
  var visited = M.set();
  var toVisit = [[end[0], end[1]]];
  visited = M.conj(visited, M.vector(end[0], end[1]));

  // start with end point, and slowly expand regions
  while(toVisit.length > 0)
  {
    var cur = toVisit.pop();
    var unvisitedNeighbors = findNeighbours(map, cur[0], cur[1])
      .filter(([i, j]) => map[i][j] === 0)
      .filter(([i, j]) => !M.get(visited, M.vector(i, j)));

    unvisitedNeighbors.forEach(([i, j]) => {
      visited = M.conj(visited, M.vector(i, j));
      heuristic[i][j] = heuristic[cur[0]][cur[1]] + 1;
      toVisit.push([i, j]);
    });
  }
  return heuristic;
}

function findNeighbours(map, i, j) 
{
  var oddI = i % 2 === 1;

  var topLeft = [i - 1, oddI ? j : j - 1];
  var topRight = [i - 1, oddI ? j + 1 : j];
  var left = [i, j - 1];
  var right = [i, j + 1];
  var bottomLeft = [i + 1, oddI ? j : j - 1];
  var bottomRight = [i + 1, oddI ? j + 1 : j];

  return [topLeft, topRight, left, right, bottomLeft, bottomRight]
    .filter(([i ,j]) => i >=0 && i < map.length && j >= 0 && j < map[i].length);
}
console.log(findPath([[0, 1, 0, 0],[0, 0, 0, 0],[0, 1, 0, 0]], [0, 0], [2, 3]));
module.exports = findPath;



