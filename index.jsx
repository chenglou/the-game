'use strict';

var React = require('react');
var Game = require('./Game');
var allMaps = require('./src/allMaps');

var Wrapper = React.createClass({
  getInitialState: function() {
    return {
      map: allMaps[0],
      phase: 'Player',
      currTurn: 0,
      currMapIndex: 0,
    };
  },

  handleSyncProps: function(stuff) {
    this.setState(stuff);
  },

  render: function() {
    let {map, phase, currTurn, selfTurn, currMapIndex} = this.state;

    return (
      <div>
        <Game
          map={map}
          phase={phase}
          currTurn={currTurn}
          selfTurn={0}
          syncProps={this.handleSyncProps}
          originalMapIndex={currMapIndex}
          onWin={function() {}}
          />
      </div>
    );
  }
});

React.render(<Wrapper />, document.querySelector('#container'));
