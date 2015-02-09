var M = require('mori');
var React = require('react');
var Land = require('./src/map/Land');
var Grid = require('./src/map/Grid');
var Hovel = require('./src/unit/Hovel');
var unitConfig = require('./src/unit/unitConfig');

var map1 = require('./src/map/data/map1');

var out = M.clj_to_js;

function range(n, val) {
  var ret = [];
  for (var i = 0; i < n; i++) {
    ret.push(val);
  }
  return ret;
}

var unitConfigs = range(map1.length, 0).map(() => {
  return range(map1[0].length, {
    unit: unitConfig[0],
    component: Hovel,
  });
});

var App = React.createClass({
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
            tileMouseDown={function() {}}
            tileHover={function() {}} />
        </div>
      </div>
    );
  }
});

React.render(<App />, document.querySelector('#container'));
