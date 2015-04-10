'use strict';

var React = require('react');
var Login = require('./Login');
var Game = require('./Game');
var Rooms = require('./Rooms');
var Room = require('./Room');
var request = require('superagent');
var M = require('mori');

let clj = M.toClj;
let js = M.toJs;

let maps = [
  M.toClj(require('./src/map/data/map1')),
  M.toClj(require('./src/map/data/map2')),
];

function sameRoom(a, b) {
  var {map, ...r} = a;
  let map1 = map;
  var {map, ...r2} = b;
  return M.equals(clj(r), clj(r2)) && M.equals(map1, map);
}

function isGameTime({users, currMapIndex}) {
  let names = Object.keys(users);
  let allReady = names.every(name => users[name].ready);
  let colors = M.reduce((colors, row) => {
    return M.reduce((colors, cell) => {
      colors[M.get(cell, 'color')] = true;
      return colors;
    }, colors, row);
  }, {}, maps[currMapIndex]);
  delete colors.Gray;
  console.log(allReady, colors, names);

  return allReady && Object.keys(colors).length === names.length;
}

var App = React.createClass({
  getInitialState: function() {
    return {
      screen: 'login',
      user: null,
      room: null,
    };
  },

  componentDidMount: function() {
    window.onbeforeunload = () => {
      let user = this.state.user;
      let {users, ...rest} = this.state.room;
      let newUsers = js(clj(users));
      delete newUsers[user.name];
      this.setState({
        room: {
          ...{users: newUsers},
          ...rest,
        },
      });
      return 'Are you sure?';
    };
  },

  startSync: function() {
    let f = () => {
      let {room} = this.state;
      request
        .post('/listenRoomP')
        .send({roomName: room.name})
        .set('Accept', 'application/json')
        .end((err, res) => {
          let {map, ...rest} = JSON.parse(res.text);
          let newRoom = {
            map: clj(map),
            ...rest,
          };
          if (sameRoom(this.state.room, newRoom)) {
            setTimeout(f, 100);
            return;
          }

          this.setState({
            room: newRoom,
          });
          setTimeout(f, 100);
        });
    };
    f();
  },

  componentDidUpdate: function(prevProps, ps) {
    let room = this.state.room;
    if (!room) {
      return;
    }
    if (ps.room && sameRoom(ps.room, room)) {
      return;
    }
    let {map, ...rest} = room;
    let sendRoom = {
      map: js(map),
      ...rest,
    };
    request
      .post('/syncRoom')
      .send({roomName: room.name, room: sendRoom})
      .set('Accept', 'application/json')
      .end((err, res) => {});
  },

  handleSuccess: function(user) {
    this.setState({
      screen: 'rooms',
      user: user,
    });
  },

  handleRoomPicked: function(room) {
    // got it from server, map is js
    let {map, users, ...rest} = room;
    let {...newUsers} = users;
    newUsers[this.state.user.name] = this.state.user;
    this.setState({
      screen: 'room',
      room: {
        map: clj(map),
        ...{users: newUsers},
        ...rest,
      },
    }, () => {
      this.startSync();
    });
  },

  handleDecideMap: function() {
    let {room, user, screen} = this.state;
    let {map, ...rest} = room;
    // fuck mutations
    let newRest = js(clj(rest));
    newRest.users[user.name].ready = true;

    this.setState({
      room: {map: map, ...newRest},
    });
  },

  handleChooseMap: function(step) {
    let {room} = this.state;
    let {currMapIndex, users, ...rest} = room;

    let next = currMapIndex + step;
    if (next < 0) {
      next = maps.length - 1;
    }
    if (next >= maps.length) {
      next = 0;
    }
    let newUsers = js(clj(users));
    Object.keys(newUsers).forEach(name => {
      newUsers[name].ready = false;
    });
    this.setState({
      room: {currMapIndex: next, users: newUsers, ...rest},
    });
  },

  render: function() {
    let {screen, room, user} = this.state;

    let thing;
    if (room && isGameTime(room)) {
      thing =
        <Game />;
    } else if (screen === 'login') {
      thing =
        <Login onSuccess={this.handleSuccess} />;
    } else if (screen === 'rooms') {
      thing =
        <Rooms
          onRoomPicked={this.handleRoomPicked}
          user={user} />;
    } else if (screen === 'room') {
      thing =
        <Room
          onChooseMap={this.handleChooseMap}
          onDecideMap={this.handleDecideMap}
          room={room}
          user={user} />;
    }

    return (
      <div>
        {thing}
      </div>
    );
  }
});

React.render(<App />, document.querySelector('#container'));
