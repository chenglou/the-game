'use strict';

var React = require('react');
var Login = require('./Login');
var Game = require('./Game');
var Rooms = require('./Rooms');
var Room = require('./Room');
var request = require('superagent');
var M = require('mori');
var {getMapPlayerColors, getMapPlayerColorsM} = require('./src/getMapPlayerColors');

let clj = M.toClj;
let js = M.toJs;

let maps = [
  clj(require('./src/map/data/map1')),
  clj(require('./src/map/data/map2')),
  clj(require('./src/map/data/map3')),
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
  let colors = getMapPlayerColors(maps[currMapIndex]);

  return allReady && colors.length === names.length;
}

var Wrapper = React.createClass({
  getInitialState: function() {
    return {
      screen: 'login',
      userName: null,
      room: null,
    };
  },

  componentDidMount: function() {
    window.onbeforeunload = () => {
      let {users, ...rest} = this.state.room;
      let newUsers = js(clj(users));
      delete newUsers[this.state.userName];
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
            setTimeout(f, 300);
            return;
          }

          this.setState({
            room: newRoom,
          });
          setTimeout(f, 300);
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
      .end();
  },

  handleLoginSuccess: function(name) {
    this.setState({
      screen: 'rooms',
      userName: name,
    });
  },

  handleRoomPicked: function(room) {
    // got it from server, map is js
    let {map, ...rest} = room;
    this.setState({
      screen: 'room',
      room: {
        map: clj(map),
        ...rest,
      },
    }, () => {
      this.startSync();
    });
  },

  handleDecideMap: function() {
    let {room: {map, ...rest}, userName} = this.state;
    // fuck mutations
    let newRest = js(clj(rest));
    newRest.users[userName].ready = true;

    this.setState({
      room: {
        map: maps[newRest.currMapIndex],
        ...newRest,
      },
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

  handleSyncProps: function(stuff) {
    let {room} = this.state;
    let {map, phase, currTurn, over, users, ...rest} = room;

    let newUsers = users;
    let isOver = over;
    if (!over && stuff.map) {
      let origMap = maps[room.currMapIndex];
      let colors = getMapPlayerColorsM(stuff.map);
      let origColors = getMapPlayerColorsM(origMap);

      if (M.count(colors) !== M.count(origColors)) {
        isOver = true;

        let colorsToUsers = M.zipmap(
          getMapPlayerColors(maps[room.currMapIndex]),
          Object.keys(room.users).sort()
        );
        let winners = M.map(
          color => M.get(colorsToUsers, color),
          M.intersection(colors, origColors)
        );
        let losers = M.map(
          color => M.get(colorsToUsers, color),
          M.difference(origColors, colors)
        );
        newUsers = js(clj(users));
        M.each(winners, w => {
          newUsers[w].totalPlayed++;
          newUsers[w].totalWon++;
        });
        M.each(losers, w => {
          newUsers[w].totalPlayed++;
        });
      }

    }
    this.setState({
      room: {
        map: stuff.map || map,
        phase: stuff.phase || phase,
        currTurn: stuff.currTurn == null ? currTurn : stuff.currTurn,
        over: isOver,
        users: newUsers,
        ...rest,
      },
    });
  },

  // handleCrownWinners: function() {
  //   let {room, user} = this.state;
  //   let {map, currMapIndex} = room;
  //   let origMap = maps[currMapIndex];
  //   let colors = getMapPlayerColorsM(map);
  //   let origColors = getMapPlayerColorsM(origMap);

  //   let colorsToUsers = M.zipmap(
  //     getMapPlayerColors(maps[room.currMapIndex]),
  //     Object.keys(room.users).sort()
  //   );
  //   let winners = M.map(
  //     color => M.get(colorsToUsers, color),
  //     M.intersection(colors, origColors)
  //   );
  //   let losers = M.map(
  //     color => M.get(colorsToUsers, color),
  //     M.difference(colors, origColors)
  //   );
  //   request
  //     .post('/updateScores')
  //     .send({
  //       roomName: room.name,
  //       userName: user.name,
  //       winners: js(winners),
  //       losers: js(losers),
  //     })
  //     .set('Accept', 'application/json')
  //     .end((err, res) => {
  //       this.setState({
  //         user: JSON.parse(res.text),
  //       });
  //     });
  // },

  render: function() {
    let {screen, room, userName} = this.state;

    let thing;
    if (room && isGameTime(room)) {
      // turn (who gets what color) is deterministic
      let selfTurn = Object.keys(room.users).sort().indexOf(userName);
      thing =
        <Game
          map={room.map}
          phase={room.phase}
          currTurn={room.currTurn}
          selfTurn={selfTurn}
          syncProps={this.handleSyncProps}
          originalMapIndex={room.currMapIndex}
          crownWinners={this.handleCrownWinners}
          />;
    } else if (screen === 'login') {
      thing =
        <Login onSuccess={this.handleLoginSuccess} />;
    } else if (screen === 'rooms') {
      thing =
        <Rooms
          onRoomPicked={this.handleRoomPicked}
          userName={userName} />;
    } else if (screen === 'room') {
      thing =
        <Room
          onChooseMap={this.handleChooseMap}
          onDecideMap={this.handleDecideMap}
          room={room}
          userName={userName} />;
    }

    return (
      <div>
        {thing}
      </div>
    );
  }
});

React.render(<Wrapper />, document.querySelector('#container'));
