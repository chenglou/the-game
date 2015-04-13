'use strict';

// assume base color is blue (check overlay.png color)
// to be incorporated into a style filter attribute
let colorStyle = {
  Blue: 'hue-rotate(0deg)',
  Red: 'hue-rotate(90deg)',
  Orange: 'hue-rotate(190deg)',
  Purple: 'hue-rotate(50deg)',
  Yellow: 'hue-rotate(190deg) brightness(1.7)',
  Gray: 'brightness(2) grayscale(1)',
  BrightYellow: 'hue-rotate(190deg) brightness(2)',
};

module.exports = colorStyle;
