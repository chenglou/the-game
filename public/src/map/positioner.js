'use strict';

var tileH = 89;
var tileW = 65;

// magic number
var tileHOffSet = 50;

function calcH() {
  return tileH;
}

function calcW() {
  return tileW;
}

// relative to 0, 0
function calcLeft(x, y) {
  return (y % 2 === 0 ? 0 : tileW / 2) + x * tileW;
}

// relative to 0, 0
function calcTop(y) {
  return y * tileHOffSet;
}

module.exports = {
  calcH: calcH,
  calcW: calcW,
  calcLeft: calcLeft,
  calcTop: calcTop,
};
