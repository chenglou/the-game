'use strict';

var React = require('react');
var request = require('superagent');

var reactFire = require('reactfire');
var Firebase = require('firebase');
let p = React.PropTypes;

var Login = React.createClass({
  mixins: [reactFire],

  propTypes: {
    onLogin: p.func.isRequired,
    onRegister: p.func.isRequired,
    loginError: p.string,
  },

  getInitialState: function() {
    return {
      name: 'a',
      pass: '1',
      error: null,
      register: false,
    };
  },

  handleChange: function(state, e) {
    this.setState({
      [state]: e.target.value,
    });
  },

  handleSubmit: function(e) {
    let {name, pass, register} = this.state;
    e.preventDefault();

    if (!register) {
      this.props.onLogin(name, pass);
    } else {
      this.props.onRegister(name, pass);
    }
  },

  handleRegister: function() {
    this.setState({
      register: true,
    });
  },

  render: function() {
    let {name, pass, register} = this.state;
    let {loginError} = this.props;

    let maybeError;
    if (loginError) {
      let errorS = {
        color: 'white',
      };
      maybeError =
        <div style={errorS}>
          {loginError}
          <input type="button" onClick={this.handleRegister} value="Register instead" />
        </div>;
    }
    let loginStyle = {
      color: 'white',
    };

    return (
      <div>
        <div style={loginStyle}>{register ? 'Register:' : 'Login:'}</div>
        <form onSubmit={this.handleSubmit}>
          <input
            type="text"
            placeholder="User name"
            value={name}
            onChange={this.handleChange.bind(null, 'name')} />
          <input
            type="password"
            placeholder="Password"
            value={pass}
            onChange={this.handleChange.bind(null, 'pass')} />
          <input type="submit" />
        </form>
        {maybeError}
      </div>
    );
  }
});

module.exports = Login;
