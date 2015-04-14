'use strict';

var m = require('mori');

var clj = m.toClj;

function eq(a, b) {
  return m.equals(clj(a), clj(b));
}

function isObj(a) {
  return Object.prototype.toString.call(a) === '[object Object]';
}

function _diff(a, b, acc, path) {
  if (eq(a, b)) {
    return acc;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      acc[path.join('|')] = b;
      return acc;
    }
    for (var i = 0; i < a.length; i++) {
      var x = a[i];
      var y = b[i];
      if (!eq(x, y)) {
        acc = _diff(x, y, acc, path.concat([i]));
      }
    }
    return acc;
  }

  if (isObj(a) && isObj(b)) {
    var acc1 = JSON.parse(JSON.stringify(acc));
    for (var key in a) {
      if (!b.hasOwnProperty(key)) {
        acc1['-' + path.concat([key]).join('|')] = 0;
      } else if (!eq(a[key], b[key])) {
        acc1 = _diff(a[key], b[key], acc1, path.concat([key]));
      }
    }
    for (key in b) {
      if (!a.hasOwnProperty(key)) {
        acc1[path.concat([key]).join('|')] = b[key];
      }
    }

    acc[path.join('|')] = b;
    if (JSON.stringify(acc1).length < JSON.stringify(acc).length) {
      return acc1;
    } else {
      return acc;
    }
  }

  acc[path.join('|')] = b;
  return acc;
}

function diff(a, b) {
  return _diff(a, b, {}, []);
}

function patch(coll, paths) {
  coll = JSON.parse(JSON.stringify(coll));
  for (var key in paths) {
    if (key === '') {
      return paths[key];
    }

    var res = coll;
    var del = key[0] === '-';
    var p = del ? key.slice(1).split('|') : key.split('|');
    var field = p.pop();
    p.forEach(function(pa) {
      res = res[pa];
    });
    if (del) {
      delete res[field];
    } else {
      res[field] = paths[key];
    }
  }

  return coll;
}

module.exports = {diff, patch};

// function t(a, b, expected) {
//   var actual = diff(a, b);
//   if (!m.equals(clj(actual), clj(expected))) {
//     console.log(JSON.stringify(diff(a, b)));
//     console.log(JSON.stringify(expected));
//     throw expected;
//   }

//   var patched = patch(a, actual);
//   if (!m.equals(clj(patched), clj(b))) {
//     console.log(patched);
//     console.log(b);
//     throw patched;
//   }
// }

// t([1, 2], [1], {'': [1]});
// t([1, 2], [], {'': []});
// t([1, 2], [1, 2, 3], {'': [1, 2, 3]});
// t([1, [1, 2]], [1, [2]], {'1': [2]});
// t([2, 1], [1], {'': [1]});
// t([1, [2], [4]], [1, [3], [5]], { '1|0': 3, '2|0': 5 });
// t([], [], {});
// t({a: 1}, {a: 2}, {'a': 2});
// t({a: 1}, {b: 2}, {'': {'b': 2}});
// t({a: 1}, [2], {'': [2]});
// t({a: {b: 1, c: 2}}, {a: {b: 1}}, {'-a|c': 0});
// t([1], {a: 1}, {'': {'a': 1}});
// t({a: [1, 2], b: {c: [1]}}, {a: [1, 2], b: {c: [2]}}, {'b|c|0': 2});
// t({b: {c: [1]}}, {b: {c: {}}}, {'b|c': {}});
// t([{a: 3, b: 4}, 5], [{a: 4, b: 4}, 6], {'1': 6, '0|a': 4});
// t({a: 1, b: 2, c: 3, d: 4}, {a: 1, b: 2, c: 3, d: 4, e: 7}, {'e': 7});
// t({a: 1, b: 2, c: 3, d: 4, e: 7}, {a: 1, b: 2, c: 3, d: 4}, {'-e': 0});
// t({a: {b: {c: [1, 2, 3, 4]}}}, {a: {b: {c: [1, 3, 4, 5]}}}, {'a|b': {'c': [1, 3, 4, 5]}});

