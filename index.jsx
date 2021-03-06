'use strict';

var React = require('react');
var Login = require('./Login');
var Game = require('./Game');
var Rooms = require('./Rooms');
var Room = require('./Room');
var M = require('mori');
var {getMapPlayerColors, getMapPlayerColorsM} = require('./src/getMapPlayerColors');
var allMaps = require('./src/allMaps');
var faker = require('faker');
var {diff, patch} = require('./src/diff');

var reactFire = require('reactfire');
var Firebase = require('firebase');

let clj = M.toClj;
let js = M.toJs;

let prevMap = [[]];

function isGameTime(users, currMapIndex) {
  let names = Object.keys(users);
  let allReady = names.every(name => users[name].ready);
  let colors = getMapPlayerColors(allMaps[currMapIndex]);

  return allReady && colors.length === names.length;
}

var Wrapper = React.createClass({
  mixins: [reactFire],

  getInitialState: function() {
    return {
      screen: 'login',
      userName: null,
      roomName: null,
      chatLine: '',

      loginError: null,

      db: {},

      fb: new Firebase('https://361.firebaseio.com/db/'),
    };
  },

  componentWillMount: function() {
    this.bindAsObject(this.state.fb, 'db');
  },

  componentDidMount: function() {
    window.onbeforeunload = () => {
      let {db, roomName, userName} = this.state;
      db.users[userName].ready = false;
      delete db.rooms[roomName].users[userName];
      this.firebaseRefs.db.set(db);
      return 'Are you sure?';
    };
  },

  componentDidUpdate: function(prevProps, ps) {
    let {roomName, screen, db} = this.state;

    if (screen !== 'game' && roomName) {
      if (isGameTime(db.users, db.rooms[roomName].currMapIndex)) {
        this.setState({
          screen: 'game',
        });
      }
    }
  },

  handleLogin: function(name, pass) {
    let {users} = this.state.db;
    if (!users[name]) {
      this.setState({
        loginError: 'Invalid name',
      });
      return;
    }
    if (users[name].pass !== pass) {
      this.setState({
        loginError: 'Invalid password',
      });
      return;
    }
    this.setState({
      screen: 'rooms',
      userName: name,
    });
  },

  handleRegister: function(name, pass) {
    let {users} = this.state.db;
    if (users[name]) {
      this.setState({
        loginError: 'Name already taken',
      });
      return;
    }
    this.state.db.users[name] = {
      name: name,
      pass: pass,
      ready: false,
      totalPlayed: 0,
      totalWon: 0,
    };
    this.firebaseRefs.db.set(this.state.db, () => {
      this.setState({
        screen: 'rooms',
        userName: name,
      });
    });
  },

  handleRoomPicked: function(name) {
    if (!this.state.db.rooms[name].users) {
      this.state.db.rooms[name].users = {};
    }
    this.state.db.rooms[name].users[this.state.userName] = true;
    this.firebaseRefs.db.set(this.state.db, () => {
      this.setState({
        screen: 'room',
        roomName: name,
      });
    });
  },

  handleRoomCreate: function() {
    var roomName = faker.company.bsAdjective() + ' ' + Math.floor(Math.random() * 99);

    if (!this.state.db.rooms) {
      this.state.db.rooms = {};
    }

    let nextMap = js(allMaps[0]);
    let mapDiff = diff(prevMap, nextMap);
    prevMap = nextMap;

    this.state.db.rooms[roomName] = {
      name: roomName,
      map: JSON.stringify(mapDiff),
      currMapIndex: 0,
      users: {},
      currTurn: 0,
      phase: 'Player',
    };
    this.firebaseRefs.db.set(this.state.db, () => {
      this.setState({roomName});
    });
  },

  handleDecideMap: function() {
    let {userName, roomName} = this.state;
    this.state.db.users[userName].ready = true;
    this.firebaseRefs.db.set(this.state.db, () => {
      if (isGameTime(this.state.db.users, this.state.db.rooms[roomName].currMapIndex)) {
        this.setState({
          screen: 'game',
        });
      }
    });
  },

  handleChooseMap: function(step) {
    let {roomName} = this.state;

    let next = this.state.db.rooms[roomName].currMapIndex + step;
    if (next < 0) {
      next = allMaps.length - 1;
    }
    if (next >= allMaps.length) {
      next = 0;
    }

    this.state.db.rooms[roomName].currMapIndex = next;

    let nextMap = js(allMaps[next]);
    let mapDiff = diff(prevMap, nextMap);
    prevMap = nextMap;
    this.state.db.rooms[roomName].map = JSON.stringify(mapDiff);

    Object.keys(this.state.db.rooms[roomName].users).forEach(name => {
      this.state.db.users[name].ready = false;
    }, this);
    this.firebaseRefs.db.set(this.state.db);
  },

  handleSyncProps: function(stuff) {
    let s = this.state;
    let {roomName, db} = s;

    // let newMap = stuff.map ? JSON.stringify(js(stuff.map)) : db.rooms[roomName].map;
    let newMap = stuff.map ? js(stuff.map) : prevMap;
    let newCurrTurn = stuff.currTurn;
    let newPhase = stuff.phase;

    let mapDiff = diff(prevMap, newMap);
    prevMap = newMap;
    db.rooms[roomName].map = JSON.stringify(mapDiff);
    db.rooms[roomName].phase = newPhase || db.rooms[roomName].phase;
    db.rooms[roomName].currTurn = newCurrTurn == null ? db.rooms[roomName].currTurn : newCurrTurn;
    this.firebaseRefs.db.set(db);
  },

  handleWin: function() {
    let {roomName} = this.state;
    let db = this.state.db;
    let room = db.rooms[roomName];

    Object.keys(db.rooms[roomName].users).forEach(name => {
      db.users[name].ready = false;
    }, this);

    let origMap = allMaps[room.currMapIndex];
    let colors = getMapPlayerColorsM(clj(JSON.parse(prevMap)));
    let origColors = getMapPlayerColorsM(origMap);

    let colorsToUsers = M.zipmap(
      getMapPlayerColors(allMaps[room.currMapIndex]),
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

    M.each(winners, name => {
      db.users[name].totalPlayed++;
      db.users[name].totalWon++;
    });
    M.each(losers, name => {
      db.users[name].totalPlayed++;
    });

    this.firebaseRefs.db.set(db, () => {
      this.setState({
        screen: 'rooms',
        roomName: null
      });
    });
  },

  resetFb: function() {
    this.firebaseRefs.db.set({
      users: {
        a: {
          name: 'a',
          pass: '1',
          ready: false,
          totalPlayed: 0,
          totalWon: 0,
        },
        b: {
          name: 'b',
          pass: '2',
          ready: false,
          totalPlayed: 0,
          totalWon: 0,
        },
      },
      rooms: {},
    });
  },

  handleChatSubmit: function(e) {
    e.preventDefault();

    let db = this.state.db;
    if (!db.chat) {
      db.chat = '';
    }
    db.chat += (this.state.userName || 'anon') + ': ' + this.state.chatLine + '\n';
    console.log(this.state.chatLine);
    this.firebaseRefs.db.set(db, () => {
      this.setState({
        chatLine: '',
      });
    });
  },

  handleChat: function(e) {
    this.setState({
      chatLine: e.target.value,
    });
  },

  render: function() {
    let {screen, roomName, userName, loginError} = this.state;

    let thing;
    if (screen === 'game') {
      let room = this.state.db.rooms[roomName];
      // turn (who gets what color) is deterministic
      let selfTurn = Object.keys(room.users).sort().indexOf(userName);
      let newMap = patch(prevMap, JSON.parse(room.map));
      prevMap = newMap;
      thing =
        <Game
          map={clj(newMap)}
          phase={room.phase}
          currTurn={room.currTurn}
          selfTurn={selfTurn}
          syncProps={this.handleSyncProps}
          originalMapIndex={room.currMapIndex}
          onWin={this.handleWin}
          />;
    } else if (screen === 'login') {
      thing =
        <Login
          loginError={loginError}
          onLogin={this.handleLogin}
          onRegister={this.handleRegister}
          />;
    } else if (screen === 'rooms') {
      thing =
        <Rooms
          onRoomPicked={this.handleRoomPicked}
          onRoomCreate={this.handleRoomCreate}
          rooms={this.state.db.rooms}
          />;
    } else if (screen === 'room') {
      thing =
        <Room
          onChooseMap={this.handleChooseMap}
          onDecideMap={this.handleDecideMap}
          room={this.state.db.rooms[roomName]}
          userName={userName}
          users={this.state.db.users}
          />;
    }

    let chat = this.state.db.chat;
    let msgs = chat && chat.split('\n');
    if (msgs) {
      msgs = msgs.filter(msg => {
        if (/\s*: \\/.test(msg)) {
          if (msg.indexOf('\\' + this.state.userName) >= 0) {
            return true;
          }
          return false;
        }
        return true;
      });
      msgs = msgs.slice(-5).join('\n');
    }
    return (
      <div>
        <textarea
          style={{WebkitUserSelect: 'inherit', width: 350, height: 60}}
          value={msgs}>
        </textarea>
        <form onSubmit={this.handleChatSubmit}>
          <input type="text" value={this.state.chatLine} onChange={this.handleChat} style={{width: 350}} />
        </form>
        <button onClick={this.resetFb}>RESET</button>

        {thing}
      </div>
    );
  }
});

React.render(<Wrapper />, document.querySelector('#container'));
