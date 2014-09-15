/** @jsx React.DOM */

var React = require('react');
var Tile = require('./src/map/Tile');

var map = [
  [0, 1, 1, 0, 1],
  [0, 1, 0, 0, 0],
  [0, 1, 0, 0, 0],
  [0, 1, 0, 0, 0],
  [0, 1, 1, 0, 1],
];

function calcW(x) {
  return x * 2;
}

function calcH(x) {
  return Math.sqrt(x * x + (x/2) * (x/2)) * 2;
}

var App = React.createClass({
  render: function() {
    return (
      <div>
        <Tile diagLength={25} />asd
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
