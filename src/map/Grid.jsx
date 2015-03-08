var React = require('react');
var positioner = require('./positioner');
var Tile = require('../Tile');
var M = require('mori');
var assign = require('object-assign');
var everyUnit = require('../everyUnit');
var unitFactory = require('../units/unitFactory');
var overlayBlue = require('../overlayBlue.png');
var overlayRed = require('../overlayRed.png');
var assetDims = require('../assetDims');
var url = require('../utils/imgUrl');

var p = React.PropTypes;

function orderUnitsForDisplay(unitNames) {
  var nameInDisplayOrder = everyUnit.nameInDisplayOrder;
  return M.sort((a, b) => nameInDisplayOrder[a] - nameInDisplayOrder[b], unitNames);
}

var Grid = React.createClass({
  propTypes: {
    // tileConfigs: p.arrayOf(p.array.isRequired).isRequired,
    unitConfigs: p.arrayOf(p.array.isRequired),
    tileMouseDown: p.func.isRequired,
    tileHover: p.func.isRequired,
  },

  render: function() {
    var props = this.props;
    var tileConfigs = props.tileConfigs;

    var h = M.count(tileConfigs);
    var w = M.count(M.first(tileConfigs));

    var rowS = {
      width: 9999,
    };

    var overlayW = assetDims.misc.overlay[0];
    var overlayH = assetDims.misc.overlay[1];

    var tiles = M.map((row, i) => {
      var cells = M.map((cell, j) => {
        var units = M.get(cell, 'units');
        var orderedUnits = orderUnitsForDisplay(M.keys(units));

        var unitComponents = M.map((unitName) => {
          var Unit = unitFactory[unitName];
          var config = M.get(units, unitName);

          return (
            <Unit key={unitName} config={M.toJs(config)}></Unit>
          );
        }, orderedUnits);

        var color = M.get(cell, 'color');
        var overlay = color === 'Blue' ? url(overlayBlue)
          : color === 'Red' ? url(overlayRed)
          : 'none';

        var overlayS = {
          backgroundImage: overlay,
          backgroundRepeat: 'no-repeat',
          opacity: 0.5,
          top: -4,
          zIndex: 99,
          width: overlayW,
          height: overlayH,
          marginLeft: (positioner.calcW() - overlayW) / 2,
        };

        return (
          <Tile
            key={j}
            diagLength={25}
            pos={[i, j]}
            onMouseDown={props.tileMouseDown.bind(null, i, j)}
            onMouseEnter={props.tileHover.bind(null, i, j)}>
              {M.toJs(unitComponents)}
              <div style={overlayS}></div>
          </Tile>
        );
      }, row, M.range());

      return <div key={i} style={rowS}>{M.toJs(cells)}</div>;
    }, tileConfigs, M.range());

    var s = {
      height: positioner.calcH(25) * M.count(tileConfigs),
    };
    var tilesS = {
      position: 'absolute',
    };
    return (
      <div style={s}>
        <div style={tilesS}>
          {M.toJs(tiles)}
        </div>
      </div>
    );
  }
});

module.exports = Grid;
