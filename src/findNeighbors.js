var M = require('mori');
var mapSeqToVec = require('./mapSeqToVec');

function findNeighbors(map, i, j) {
  var map = mapSeqToVec(map);

  var oddJ = j % 2 === 1;
  var oddI = i % 2 === 1;

  var topLeft = [i - 1, oddI ? j : j - 1];
  var topRight = [i - 1, oddI ? j + 1 : j];
  var left = [i, j - 1];
  var right = [i, j + 1];
  var bottomLeft = [i + 1, oddI ? j : j - 1];
  var bottomRight = [i + 1, oddI ? j + 1 : j];

  return [topLeft, topRight, left, right, bottomLeft, bottomRight].filter((coords) => {
    return M.getIn(map, coords);
  });
}

module.exports = findNeighbors;
