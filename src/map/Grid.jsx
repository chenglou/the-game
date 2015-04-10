'use strict';

var React = require('react');
var positioner = require('./positioner');
var Tile = require('../Tile');
var M = require('mori');
var everyUnit = require('../everyUnit');
var units = require('../units');
var assetDims = require('../assetDims');
var colorStyle = require('../colorStyle');
var inCoordsList = require('../inCoordsList');
var {overlay} = require('../assetUrls');
var url = require('../utils/imgUrl');

var p = React.PropTypes;
var js = M.toJs;

function orderUnitsForDisplay(unitNames) {
  var nameInDisplayOrder = everyUnit.nameInDisplayOrder;
  return M.sort((a, b) => nameInDisplayOrder[a] - nameInDisplayOrder[b], unitNames);
}

function getOverlayStyle(color, isFocus, isActiveTurn) {
  var [w, h] = assetDims.overlay;

  return {
    backgroundImage: url(overlay),
    backgroundRepeat: 'no-repeat',
    opacity: isFocus || isActiveTurn ? 1 : 0.5,
    WebkitFilter: colorStyle[color],
    top: -4,
    zIndex: isFocus ? 100 : 99,
    width: w,
    height: h,
    marginLeft: (positioner.calcW() - w) / 2,
  };
}

var Grid = React.createClass({
  propTypes: {
    tileConfigs: p.any.isRequired,
    hover: p.array.isRequired,
    onTileMouseDown: p.func.isRequired,
    onTileHover: p.func.isRequired,
    turn: p.string,
    moveTrail: p.arrayOf(p.arrayOf(p.number)).isRequired,
  },

  render: function() {
    var {
      tileConfigs,
      hover,
      onTileMouseDown,
      onTileHover,
      children,
      turn,
      moveTrail,
    } = this.props;

    var h = M.count(tileConfigs);
    var w = M.count(M.first(tileConfigs));

    var tiles = M.map((row, i) => {
      var cells = M.map((cell, j) => {
        var orderedUnits = orderUnitsForDisplay(
          M.keys(M.get(cell, 'units'))
        );

        var unitComponents = M.map((unitName) => {
          var Unit = units[unitName];
          var config = M.getIn(cell, ['units', unitName]);

          return (
            <Unit key={unitName} {...js(config)}></Unit>
          );
        }, orderedUnits);

        let color = M.get(cell, 'color');

        let maybeActiveOverlay;
        if (i === hover[0] && j === hover[1]) {
          maybeActiveOverlay =
            <div
              style={getOverlayStyle('Yellow', true, false)}>
            </div>;
        }

        let maybeTrailOverlay;
        if (inCoordsList(moveTrail, [i, j])) {
          maybeTrailOverlay =
            <div
              style={getOverlayStyle('BrightYellow', true, false)}>
            </div>;
        }

        let maybeHighlightOverlay;
        if (color !== 'Gray') {
          maybeHighlightOverlay =
            <div style={getOverlayStyle(color, false, turn === color)}></div>;
        }

        return (
          <Tile
            key={j}
            pos={[i, j]}
            onMouseDown={onTileMouseDown.bind(null, i, j)}
            onMouseEnter={onTileHover.bind(null, i, j)}>
              {js(unitComponents)}
              {maybeHighlightOverlay}
              {maybeActiveOverlay}
              {maybeTrailOverlay}
              {false && i + ',' + j}
          </Tile>
        );
      }, row, M.range());

      return <div key={i}>{js(cells)}</div>;
    }, tileConfigs, M.range());

    var s = {
      width: positioner.calcLeft(w, 1),
      height: positioner.calcTop(h + 1),
      // needed for abs positioned things inside, e.g. menu
      position: 'relative',
    };
    var tilesS = {
      position: 'absolute',
    };
    return (
      <div style={s}>
        <div className="gridWrapper" style={tilesS}>
          {js(tiles)}
        </div>
        {children}
      </div>
    );
  }
});

module.exports = Grid;
