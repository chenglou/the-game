'use strict';

var React = require('react');
var request = require('superagent');
var {MenuItem} = require('./src/Menu');

let p = React.PropTypes;

var Rooms = React.createClass({
  propTypes: {
    onRoomPicked: p.func.isRequired,
    userName: p.string.isRequired,
  },

  getInitialState: function() {
    return {
      rooms: {},
    };
  },

  componentDidMount: function() {
    let f = () => {
      request
        .post('/rooms')
        // .send({a: 1})
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) {
            throw new Error(err);
          }
          if (this.isMounted()) {
            this.setState({
              rooms: JSON.parse(res.text)
            });
            setTimeout(f, 500);
          }
        });
    };
    f();
  },

  handleCreateClick: function() {
    let {userName, onRoomPicked} = this.props;

    request
      .post('/roomCreate')
      .send({userName})
      .set('Accept', 'application/json')
      .end((err, res) => {
        let obj = JSON.parse(res.text);
        onRoomPicked(obj);
      });
  },

  handleJoinClick: function(roomName) {
    let {userName, onRoomPicked} = this.props;

    request
      .post('/roomJoin')
      .send({userName, roomName})
      .set('Accept', 'application/json')
      .end((err, res) => {
        let obj = JSON.parse(res.text);
        onRoomPicked(obj);
      });
  },

  render: function() {
    let {rooms} = this.state;

    return (
      <div>
        <MenuItem onClick={this.handleCreateClick}>
          Create Room
        </MenuItem>
        {Object.keys(rooms).map(name => {
          return (
            <MenuItem
              key={name}
              onClick={this.handleJoinClick.bind(null, name)}>
              {name}
            </MenuItem>
          );
        })}
      </div>
    );
  }
});

module.exports = Rooms;
