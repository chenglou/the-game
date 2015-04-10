'use strict';

let React = require('react');
let request = require('superagent');
let {MenuItem} = require('./src/Menu');
let Grid = require('./src/map/Grid');
let allMaps = require('./src/allMaps');
var M = require('mori');

let p = React.PropTypes;

var Room = React.createClass({
  propTypes: {
    onChooseMap: p.func.isRequired,
    onDecideMap: p.func.isRequired,
    userName: p.string.isRequired,
    users: p.object.isRequired,

    room: p.shape({
      name: p.string.isRequired,
      users: p.object.isRequired,
      currMapIndex: p.number.isRequired,
    }).isRequired,
  },

  render: function() {
    let {onChooseMap, onDecideMap, room, userName, users} = this.props;

    let s = {
      color: 'white',
    };

    return (
      <div>
        <div style={s}>{room.name}</div>
        {Object.keys(room.users).map(name => {
          let u = users[name];
          return (
            <div style={s} key={name}>
              {name} ({u.ready ? 'decided' : 'deciding'})
              : {u.totalWon} won / {u.totalPlayed} played
            </div>
          );
        })}
        <button onClick={onChooseMap.bind(null, -1)}>Prev</button>
        <button onClick={onChooseMap.bind(null, 1)}>Next</button>
        <MenuItem
          disabled={room.users[userName] && users[userName].ready}
          onClick={onDecideMap}>
          Choose
        </MenuItem>

        <Grid
          hover={[-1, -1]}
          moveTrail={[]}
          tileConfigs={allMaps[room.currMapIndex]}
          onTileMouseDown={function() {}}
          onTileHover={function() {}}>
        </Grid>
      </div>
    );
  }
});

module.exports = Room;
