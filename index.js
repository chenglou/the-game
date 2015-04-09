'use strict';

var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');

var app = express();
app.use(express.static('public/'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(function(err, req, res, next) {
  res.status(500).send('Something broke!');
});

var users = {
  a: {
    pass: '1',
  },
  b: {
    pass: '2',
  },
};

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
  return next();
});

app.post('/register', function(req, res, next) {
  var b = req.body;
  var user = users[b.name];
  if (user) {
    res.status(500).send('Name already exists!');
    return next();
  }
  users[b.name] = {
    pass: b.pass,
  };
  res.send(JSON.stringify(users[b.name]));
  return next();
});

app.listen(4000, function () {console.log('App listening');});
