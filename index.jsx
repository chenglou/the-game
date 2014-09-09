/** @jsx React.DOM */

var React = require('react');

var App = React.createClass({
  render: function() {
    return (
      <div>
        as
      </div>
    );
  }
});

React.renderComponent(<App />, document.querySelector('#container'));

class Person {
  constructor(firstName, lastName) {
    this.firstName = firstName;
    this.lastName = lastName;
  }

  name() {
    return this.firstName + ' ' + this.lastName;
  }

  toString() {
    return this.name;
  }
}


var p = new Person('c', 'l');

console.log(p.name());
