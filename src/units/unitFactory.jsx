var React = require('react');
var createUnit = require('./createUnit');
var everyUnit = require('../everyUnit');

var unitComponents = {};

Object.keys(everyUnit.nameInDisplayOrder).forEach((unitName) => {
  // if (unitName === 'Village' || unitName === 'Villager') {
  //   return;
  // }
  unitComponents[unitName] = createUnit(unitName);
});

module.exports = unitComponents;
