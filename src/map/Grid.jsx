var React = require('react');
var Tile = require('./Tile');
var M = require('mori');

var out = M.clj_to_js;

var Grid = React.createClass({
  propTypes: {
    configs: React.PropTypes.arrayOf(React.PropTypes.array.isRequired).isRequired,
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
            config={props.configs[i][j]} />
        );
      }, M.range(w));

      return <div key={i}>{out(cells)}</div>;
    }, M.range(h));

    return (
      <div>
        {out(tiles)}
      </div>
    );
  }
});

module.exports = Grid;
