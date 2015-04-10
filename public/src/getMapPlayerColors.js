'use strict';

var M = require('mori');

// discards neutral gray
function getMapPlayerColorsM(map) {
  let colors = M.reduce((colors, row) => {
    return M.reduce(
      (colors, cell) => M.conj(colors, M.get(cell, 'color')),
      colors,
      row
    );
  }, M.set(), map);

  return M.disj(colors, 'Gray');
}

function getMapPlayerColors(map) {
  return M.toJs(getMapPlayerColorsM(map));
}

module.exports = {getMapPlayerColors, getMapPlayerColorsM};
