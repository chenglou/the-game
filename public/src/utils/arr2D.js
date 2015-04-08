'use strict';

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

module.exports = arr2D;
