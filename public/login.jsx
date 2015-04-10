'use strict';

var React = require('react');
var request = require('superagent');

let p = React.PropTypes;

var Login = React.createClass({
  propTypes: {
    onSuccess: p.func.isRequired,
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

    request
      .post(register ? '/register' : '/login')
      .send({name, pass})
      .set('Accept', 'application/json')
      .end((err, res) => {
        if (err) {
          this.setState({
            error: err.response.text,
            pass: '',
          });
          return;
        }
        this.props.onSuccess(JSON.parse(res.text));
      });
  },

  handleRegister: function() {
    this.setState({
      register: true,
    });
  },

  render: function() {
    let {name, pass, error, register} = this.state;
    let maybeError;
    if (error) {
      let errorS = {
        color: 'white',
      };
      maybeError =
        <div style={errorS}>
          {error}
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
          <input type="submit" />Go!
        </form>
        {maybeError}
      </div>
    );
  }
});

module.exports = Login;
