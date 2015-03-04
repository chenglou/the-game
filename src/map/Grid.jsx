var React = require('react');
var Land = require('./Land');
var positioner = require('./positioner');
var Tile = require('../Tile');
var M = require('mori');
var assign = require('object-assign');
var everyUnit = require('../everyUnit');

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

    var lands = M.map((i, row) => {
      var cells = M.map((j, cell) => {
        var orderedCells = orderUnitsForDisplay(M.keys(cell));

        var units = M.map((unitName) => {
           var Unit = everyUnit.comp[unitName];
           return (
             <Unit
               onMouseDown={props.tileMouseDown.bind(null, i, j)}
               onMouseEnter={props.tileHover.bind(null, i, j)}>
             </Unit>
           );
        }, orderedCells);

        return (
          <Tile key={j} diagLength={25} pos={[i, j]}>
            {M.toJs(units)}
            {i + ',' + j}
          </Tile>
        );
      }, M.range(), row);

      return <div key={i} style={rowS}>{M.toJs(cells)}</div>;
    }, M.range(), tileConfigs);

    var maybeUnits = null;
    if (props.unitConfigs) {
      maybeUnits = props.unitConfigs.map((row, i) => {
        var cells = row.map((cell, j) => {
          if (!cell) {
            return null;
          }
          var Unit = cell.component;
          return (
            <Tile
              key={j}
              diagLength={25}
              pos={[i, j]}
              config={props.unitConfigs[i][j]}>
              <Unit
                onMouseDown={props.tileMouseDown.bind(null, i, j)}
                onMouseEnter={props.tileHover.bind(null, i, j)}/>
            </Tile>
          );
        });

        return <div key={i} style={rowS}>{cells}</div>;
      });
    }

    var s = {
      WebkitUserSelect: 'none',
      height: positioner.calcH(25) * M.count(tileConfigs),
    };
    var tilesS = {
      position: 'absolute',
    };
    var unitsS = {
      position: 'absolute',
    };
    return (
      <div style={s}>
        <div style={tilesS}>
          {M.toJs(lands)}
        </div>
        <div style={unitsS}>
          {maybeUnits}
        </div>
      </div>
    );
  }
});

module.exports = Grid;
