var React = require('react');
var Tile = require('./Tile');
var M = require('mori');

var out = M.clj_to_js;
var p = React.PropTypes;

var Grid = React.createClass({
  propTypes: {
    configs: p.arrayOf(p.array.isRequired).isRequired,
    tileMouseDown: p.func.isRequired,
  },

  render: function() {
    var props = this.props;

    var h = props.configs.length;
    var w = props.configs[0].length;

    var tiles = M.map((i) => {
      var cells = M.map((j) => {
        return (
          <Tile
            key={i + '|' + j}
            diagLength={25}
            pos={[i, j]}
            config={props.configs[i][j]}
            onMouseDown={props.tileMouseDown.bind(null, i, j)}
            onMouseEnter={props.tileHover.bind(null, i, j)} />
        );
      }, M.range(w));

      return <div key={i}>{out(cells)}</div>;
    }, M.range(h));

    var s = {
      top: 25,
      position: 'relative',
      WebkitUserSelect: 'none',
    };
    return (
      <div style={s}>
        {out(tiles)}
      </div>
    );
  }
});

module.exports = Grid;
