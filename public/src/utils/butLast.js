var M = require('mori');

function butLast(coll) {
  return M.map(M.identity, coll, M.rest(coll));
}

module.exports = butLast;
