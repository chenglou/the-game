'use strict';

var React = require('react');
var request = require('superagent');
var {MenuItem} = require('./src/Menu');

let p = React.PropTypes;

var Rooms = React.createClass({
  propTypes: {
    onRoomPicked: p.func.isRequired,
    user: p.object.isRequired,
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

  handleClick: function() {
    request
      .post('/roomCreate')
      .send(this.props.user)
      .set('Accept', 'application/json')
      .end((err, res) => {
        if (err) {
          throw new Error(err);
        }
        let obj = JSON.parse(res.text);
        this.props.onRoomPicked(obj);
      });
  },

  render: function() {
    let {rooms} = this.state;

    return (
      <div>
        <MenuItem onClick={this.handleClick}>
          Create Room
        </MenuItem>
        {Object.keys(rooms).map(name => {
          return (
            <MenuItem
              key={name}
              onClick={this.props.onRoomPicked.bind(null, rooms[name])}>
              {name}
            </MenuItem>
          );
        })}
      </div>
    );
  }
});

module.exports = Rooms;
