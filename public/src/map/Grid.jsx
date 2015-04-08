'use strict';

var React = require('react');
var positioner = require('./positioner');
var Tile = require('../Tile');
var M = require('mori');
var everyUnit = require('../everyUnit');
var units = require('../units');
var assetDims = require('../assetDims');
var {overlay} = require('../assetUrls');
var url = require('../utils/imgUrl');

var p = React.PropTypes;
var js = M.toJs;

function orderUnitsForDisplay(unitNames) {
  var nameInDisplayOrder = everyUnit.nameInDisplayOrder;
  return M.sort((a, b) => nameInDisplayOrder[a] - nameInDisplayOrder[b], unitNames);
}

function getOverlayStyle(bg, color, isFocus, isActiveTurn) {
  var [w, h] = assetDims.overlay;

  let hue = {
    // original overlay is blue
    Blue: 0,
    Red: 90,
    Orange: 190,
    Purple: 50,
  };

  let filter = `hue-rotate(${hue[color]}deg)` + (isFocus ? ' brightness(1.7) ' : '');

  return {
    backgroundImage: bg,
    backgroundRepeat: 'no-repeat',
    opacity: isFocus || isActiveTurn ? 1 : 0.5,
    WebkitFilter: filter,
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
  },

  render: function() {
    var {
      tileConfigs,
      hover,
      onTileMouseDown,
      onTileHover,
      children,
      turn,
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

        var color = M.get(cell, 'color');
        let overlayUrl = color === 'Gray' ? null : url(overlay);

        var maybeActiveOverlay;
        if (i === hover[0] && j === hover[1]) {
          maybeActiveOverlay =
            <div
              style={getOverlayStyle(url(overlay), 'Orange', true, false)}>
            </div>;
        }

        return (
          <Tile
            key={j}
            pos={[i, j]}
            onMouseDown={onTileMouseDown.bind(null, i, j)}
            onMouseEnter={onTileHover.bind(null, i, j)}>
              {js(unitComponents)}
              <div style={getOverlayStyle(overlayUrl, color, false, turn === color)}></div>
              {maybeActiveOverlay}
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
