'use strict';

var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var faker = require('faker');

var map1 = require('./public/src/map/data/map1');

var app = express();
app.use(express.static('public/'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(function(err, req, res, next) {
  res.status(500).send('Something broke!');
});

var users = {
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
};

var rooms = {};

app.post('/login', function(req, res, next) {
  var b = req.body;
  var user = users[b.name];
  if (!user) {
    res.status(500).send('Invalid name');
    return next();
  }
  if (user.pass === b.pass) {
    res.send(JSON.stringify(users[b.name]));
    return next();
  }

  res.status(500).send('Invalid pass');
  next();
});

app.post('/register', function(req, res, next) {
  var b = req.body;
  var user = users[b.name];
  if (user) {
    res.status(500).send('Name already exists!');
    return next();
  }
  users[b.name] = {
    name: b.name,
    pass: b.pass,
    ready: false,
    totalPlayed: 0,
    totalWon: 0,
  };
  res.end();
  next();
});

app.post('/rooms', function(req, res, next) {
  res.send(rooms);
  next();
});

app.post('/roomCreate', function(req, res, next) {
  var userName = req.body.userName;
  var roomName = faker.company.bsAdjective() + ' ' + Math.floor(Math.random() * 99);
  var newRoom = {
    name: roomName,
    map: map1,
    currMapIndex: 0,
    users: {},
    currTurn: 0,
    phase: 'Player',
    over: false,
  };
  newRoom.users[userName] = users[userName];
  rooms[roomName] = newRoom;
  res.send(newRoom);
  next();
});

app.post('/roomJoin', function(req, res, next) {
  var roomName = req.body.roomName;
  var userName = req.body.userName;
  rooms[roomName].users[userName] = users[userName];
  res.send(rooms[roomName]);
  next();
});

app.post('/syncRoom', function(req, res, next) {
  var roomName = req.body.roomName;
  var room = req.body.room;
  rooms[roomName] = room;
  var over = room.over;
  Object.keys(room.users).forEach(function(name) {
    users[name] = room.users[name];
  });
  console.log(users);
  res.send({over: over});
  next();
});

app.post('/listenRoomP', function(req, res, next) {
  var roomName = req.body.roomName;
  res.send(rooms[roomName]);
  next();
});

app.listen(4000, function () {console.log('App listening');});
