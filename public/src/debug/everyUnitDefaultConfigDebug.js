'use strict';

let {defaultConfig} = require('../everyUnit');
let M = require('mori');

let config = defaultConfig;
config = M.assocIn(config, ['Road', 'cooldown'], 0);
config = M.assocIn(config, ['Meadow', 'cooldown'], 0);

module.exports = config;
