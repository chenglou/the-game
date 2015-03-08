var React = require('react');
var positioner = require('./positioner');
var Tile = require('../Tile');
var M = require('mori');
var everyUnit = require('../everyUnit');
var overlayBlue = require('../overlayBlue.png');
var overlayRed = require('../overlayRed.png');
var overlayActive = require('../overlayActive.png');
var assetDims = require('../assetDims');
var url = require('../utils/imgUrl');

var p = React.PropTypes;
var js = M.toJs;

function orderUnitsForDisplay(unitNames) {
  var nameInDisplayOrder = everyUnit.nameInDisplayOrder;
  return M.sort((a, b) => nameInDisplayOrder[a] - nameInDisplayOrder[b], unitNames);
}

function getOverlayStyle(bg, active) {
  var [w, h] = assetDims.misc.overlay;

  return {
    backgroundImage: bg,
    backgroundRepeat: 'no-repeat',
    opacity: active ? 1 : 0.5,
    top: -4,
    zIndex: active ? 100 : 99,
    width: w,
    height: h,
    marginLeft: (positioner.calcW() - w) / 2,
  };
}

var Grid = React.createClass({
  propTypes: {
    // tileConfigs: p.arrayOf(p.array.isRequired).isRequired,
    active: p.array.isRequired,
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

    var tiles = M.map((row, i) => {
      var cells = M.map((cell, j) => {
        var units = M.get(cell, 'units');
        var orderedUnits = orderUnitsForDisplay(M.keys(units));

        var unitComponents = M.map((unitName) => {
          var Unit = everyUnit.comp[unitName];
          var config = M.get(units, unitName);

          return (
            <Unit key={unitName} {...js(config)}></Unit>
          );
        }, orderedUnits);

        var color = M.get(cell, 'color');
        var overlay = color === 'Blue' ? url(overlayBlue)
          : color === 'Red' ? url(overlayRed)
          : 'none';

        var maybeActiveOverlay;
        if (props && i === props.active[0] && j === props.active[1]) {
          maybeActiveOverlay =
            <div style={getOverlayStyle(url(overlayActive), true)}></div>;
        }

        return (
          <Tile
            key={j}
            pos={[i, j]}
            onMouseDown={props.tileMouseDown.bind(null, i, j)}
            onMouseEnter={props.tileHover.bind(null, i, j)}>
              {js(unitComponents)}
              <div style={getOverlayStyle(overlay, false)}></div>
              {maybeActiveOverlay}
          </Tile>
        );
      }, row, M.range());

      return <div key={i} style={rowS}>{js(cells)}</div>;
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
          {js(tiles)}
        </div>
      </div>
    );
  }
});

module.exports = Grid;
