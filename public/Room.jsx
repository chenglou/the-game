'use strict';

let React = require('react');
let request = require('superagent');
let {MenuItem} = require('./src/Menu');
let Grid = require('./src/map/Grid');
var M = require('mori');

let maps = [
  M.toClj(require('./src/map/data/map1')),
  M.toClj(require('./src/map/data/map2')),
];

let p = React.PropTypes;

var Room = React.createClass({
  propTypes: {
    onChooseMap: p.func.isRequired,
    onDecideMap: p.func.isRequired,
    room: p.shape({
      name: p.string.isRequired,
      users: p.object.isRequired,
      currMapIndex: p.number.isRequired,
      map: p.object.isRequired,
    }).isRequired,
    user: p.object.isRequired,
  },

  render: function() {
    let {onChooseMap, onDecideMap, room, user} = this.props;

    let s = {
      color: 'white',
    };

    return (
      <div>
        <div style={s}>{room.name}</div>
        {Object.keys(room.users).map(name => {
          let u = room.users[name];
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
          disabled={room.users[user.name] && room.users[user.name].ready}
          onClick={onDecideMap}>
          Choose
        </MenuItem>

        <Grid
          hover={[-1, -1]}
          moveTrail={[]}
          tileConfigs={maps[room.currMapIndex]}
          onTileMouseDown={function() {}}
          onTileHover={function() {}}>
        </Grid>
      </div>
    );
  }
});

module.exports = Room;
