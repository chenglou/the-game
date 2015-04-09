'use strict';

var React = require('react');
var Login = require('./Login');
var Game = require('./Game');

var App = React.createClass({
  getInitialState: function() {
    return {
      screen: 'login',
      user: null,
    };
  },

  handleSuccess: function(user) {
    this.setState({
      screen: 'roomlist',
      user: user,
    });
  },

  render: function() {
    let {screen} = this.state;
    let thing;
    if (screen === 'login') {
      thing =
        <Login onSuccess={this.handleSuccess} />;
    } else if (screen === 'roomlist') {
      thing =
        <Game></Game>;
    }

    return (
      <div>
        {thing}
      </div>
    );
  }
});

React.render(<App />, document.querySelector('#container'));
