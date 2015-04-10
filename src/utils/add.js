'use strict';

// hand-rolled currying
function add(x) {
  return function(y) {
    return x + y;
  };
}

module.exports = add;
