'use strict';

function inCoordsList(arr, [i, j]) {
  return arr.some(([i2, j2]) => i === i2 && j === j2);
}

module.exports = inCoordsList;
