'use strict';

var M = require('mori');

function dissocIn(coll, path) {
  var p1 = path.slice(0, -1);
  var p2 = path[path.length - 1];
  return M.updateIn(coll, p1, (o) => M.dissoc(o, p2));
}

module.exports = dissocIn;
