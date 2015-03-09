var _ = require('lodash');

function filterObj(o, cb) {
  var ret = {};
  _.forEach(o, function(val, key) {
    if (cb(val, key)) {
      ret[key] = val;
    }
  });

  return ret;
}

function mapToObj(m) {
  var ret = {};
  m.forEach(function(tiles, i) {
    tiles.forEach(function(t, j) {
      var key = i + '|' + j;
      ret[key] = t;
    });
  });

  return ret;
}

function mapObjToMap(o) {
  var ret = [];
  _.each(o, function(val, key) {
    var asd = key.split('|');
    var i = asd[0];
    var j = asd[1];
    if (!ret[i]) {
      ret[i] = [];
    }
    ret[i][j] = val;
  });

  return ret;
}

function randomlyFillEmptyTiles(m, n) {
  var mObj = mapToObj(m);

  var asd = filterObj(mObj, function(val, key) {
    return val === 0;
  });

  var o = _.clone(mObj);
  _(asd).keys().shuffle().take(n).value().forEach(function(key) {
    o[key] = 8;
  });

  return mapObjToMap(o);
}

module.exports = randomlyFillEmptyTiles;


var map = [
  [0, 1, 1, 0, 1],
  [0, 1, 0, 0, 0],
  [0, 1, 0, 0, 0],
  [0, 1, 0, 0, 0],
  [0, 1, 1, 0, 1],
];

console.log(randomlyFillEmptyTiles(map, 10))
