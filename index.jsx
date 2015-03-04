var React = require('react');
var Land = require('./src/map/Land');
var Grid = require('./src/map/Grid');
var Hovel = require('./src/unit/Hovel');
var unitConfig = require('./src/unit/unitConfig');

var map1 = require('./src/map/data/map1');

function range(n, val) {
  var ret = [];
  for (var i = 0; i < n; i++) {
    ret.push(val);
  }
  return ret;
}

var unitConfigs = range(map1.length, 0).map(() => {
  return range(map1[0].length, 1).map(function() {
    if (Math.random() < 0.9) {
      return null;
    }
    return {
      unit: unitConfig[0],
      component: Hovel,
    };
  });
});

var App = React.createClass({
  handleTileMouseDown: function(i, j) {
    if (unitConfigs[i][j]) {
      console.log('has unit here');
    }
  },

  render: function() {
    var gridWrapper = {
      border: '1px solid black',
      width: 10000,
    };
    return (
      <div>
        <div style={gridWrapper}>
          <Grid
            tileConfigs={map1}
            unitConfigs={unitConfigs}
            tileMouseDown={this.handleTileMouseDown}
            tileHover={function() {}} />
        </div>
      </div>
    );
  }
});

React.render(<App />, document.querySelector('#container'));
