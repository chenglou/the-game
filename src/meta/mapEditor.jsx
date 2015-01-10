var M = require('mori');
var Grid = require('../map/Grid');
var React = require('react');

var out = M.clj_to_js;

var Editor = React.createClass({
  getInitialState: function() {
    return {
      w: 10,
      h: 5,
    };
  },

  handleChange: function(state, e) {
    var obj = {};
    obj[state] = e.target.value;
    this.setState(obj);
  },

  render: function() {
    var state = this.state;

    var configs = M.map((i) => {
      return M.map((j) => {
        return {
          villageType: Math.random() > 0.5 ? 1 : 0,
        };
      }, M.range(state.w));
    }, M.range(state.h));
    configs = out(configs);

    return (
      <div>
        <input value={state.w} onChange={this.handleChange.bind(null, 'w')} />
        x
        <input value={state.h} onChange={this.handleChange.bind(null, 'h')} />
        <Grid configs={configs}/>

        <textarea
          value={JSON.stringify(configs)}
          readOnly
          cols={60}
          rows={20} />
      </div>
    );
  }
});

React.render(<Editor />, document.querySelector('#container'));
