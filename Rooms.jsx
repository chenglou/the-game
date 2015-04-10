'use strict';

var React = require('react');
var {MenuItem} = require('./src/Menu');

let p = React.PropTypes;

var Rooms = React.createClass({
  propTypes: {
    onRoomPicked: p.func.isRequired,
    onRoomCreate: p.func.isRequired,
    rooms: p.object,
  },

  render: function() {
    let {rooms, onRoomCreate, onRoomPicked} = this.props;

    return (
      <div>
        <MenuItem onClick={onRoomCreate}>
          Create Room
        </MenuItem>
        {rooms && Object.keys(rooms).map(name => {
          return (
            <MenuItem
              key={name}
              onClick={onRoomPicked.bind(null, name)}>
              {name}
            </MenuItem>
          );
        })}
      </div>
    );
  }
});

module.exports = Rooms;
