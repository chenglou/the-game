'use strict';

var {defaultConfig} = require('../everyUnit');

var everyUnitDefaultConfigDebug = {
  ...defaultConfig,
  Road: {
    ...defaultConfig.Road,
    cooldown: 0,
  },
  Meadow: {
    ...defaultConfig.Meadow,
    cooldown: 0,
  },
};

module.exports = everyUnitDefaultConfigDebug;
