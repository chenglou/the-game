'use strict';

var M = require('mori');

let allMaps = [
  M.toClj(require('./map/data/map1')),
  M.toClj(require('./map/data/map2')),
  M.toClj(require('./map/data/map3')),
  M.toClj(require('./map/data/map4')),
  M.toClj(require('./map/data/map5')),
  M.toClj(require('./map/data/map6')),
];

module.exports = allMaps;
