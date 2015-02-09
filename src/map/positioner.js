function calcH(diag) {
  return diag * 2;
}

function calcW(diag) {
  return Math.sqrt(diag * diag + (diag/2) * (diag/2)) * 2;
}

function calcLeft(diag, x, y) {

}

function calcTop(diag, x, y) {

}

module.exports = {
  calcH: calcH,
  calcW: calcW,
  calcLeft: calcLeft,
  calcTop: calcTop,
};
