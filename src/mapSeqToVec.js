var M = require('mori');

function mapSeqToVec(map) {
  return M.into(M.vector(), M.map((row) => M.into(M.vector(), row), map));
}

module.exports = mapSeqToVec;
