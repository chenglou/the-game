var React = require('react');
var Land = require('./Land');
var positioner = require('./positioner');
var Tile = require('../Tile');
var M = require('mori');
var assign = require('object-assign');

var out = M.clj_to_js;
var p = React.PropTypes;

var Grid = React.createClass({
  propTypes: {
    tileConfigs: p.arrayOf(p.array.isRequired).isRequired,
    unitConfigs: p.arrayOf(p.array.isRequired),
    tileMouseDown: p.func.isRequired,
    tileHover: p.func.isRequired,
  },

  render: function() {
    var props = this.props;

    var h = props.tileConfigs.length;
    var w = props.tileConfigs[0].length;

    var rowS = {
      width: 9999,
    };

    var lands = M.map((i) => {
      var cells = M.map((j) => {
        return (
          <Tile
            key={j}
            diagLength={25}
            pos={[i, j]}
            config={props.tileConfigs[i][j]}
            >
            <Land
              pos={[i, j]}
              config={props.tileConfigs[i][j]}
              onMouseDown={props.tileMouseDown.bind(null, i, j)}
              onMouseEnter={props.tileHover.bind(null, i, j)} />
          </Tile>
        );
      }, M.range(w));

      return <div key={i} style={rowS}>{out(cells)}</div>;
    }, M.range(h));

    var maybeUnits = null;
    if (props.unitConfigs) {
      maybeUnits = props.unitConfigs.map((row, i) => {
        var cells = row.map((cell, j) => {
          var Unit = cell.component;
          return (
            <Tile
              key={j}
              diagLength={25}
              pos={[i, j]}
              config={props.unitConfigs[i][j]}
              >
              <Unit />
            </Tile>
          );
        });

        return <div key={i} style={rowS}>{cells}</div>;
      });
    }

    var s = {
      WebkitUserSelect: 'none',
      height: positioner.calcH(25) * props.tileConfigs.length,
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
          {out(lands)}
        </div>
        <div style={unitsS}>
          {maybeUnits}
        </div>
      </div>
    );
  }
});

module.exports = Grid;
