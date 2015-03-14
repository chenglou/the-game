var M = require('mori');
var everyUnit = require('../everyUnit');
var butLast = require('../utils/butLast');

function surroundWithSea(map) {
  var seaTileConfig = M.toClj({
    units: {
      Sea: everyUnit.defaultConfig.Sea,
    },
    color: 'Gray',
  });
  var rowLength = M.count(M.first(map));

  var row = M.repeat(rowLength, seaTileConfig);

  var newMap = M.concat([row], butLast(M.rest(map)), [row]);

  // columns
  newMap = M.map((row) => {
    return M.concat([seaTileConfig], butLast(M.rest(row)), [seaTileConfig]);
  }, newMap);

  return newMap;
}

module.exports = surroundWithSea;