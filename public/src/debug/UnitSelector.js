'use strict';

var everyUnit = require('../everyUnit');
var everyUnitDefaultConfigDebug = require('./everyUnitDefaultConfigDebug');
var React = require('react');

var p = React.PropTypes;

var LandBox = React.createClass({
  propTypes: {
    unitName: p.string.isRequired,
    selected: p.bool.isRequired,
  },

  render: function() {
    let {unitName, selected, ...props} = this.props;

    let s = {
      width: 70,
      height: 100,
      display: 'flex',
      flexShrink: 0,
      flexDirection: 'column',
      justifyContent: 'space-between',
    };

    let labelS = {
      textAlign: 'center',
      fontSize: 12,
      color: selected ? 'red' : 'gray',
    };

    let Unit = everyUnit.comp[unitName];

    return (
      <div {...props} style={s}>
        <Unit {...everyUnitDefaultConfigDebug[unitName]}></Unit>
        <div style={labelS}>
          {unitName}
        </div>
      </div>
    );
  }
});

var UnitSelector = React.createClass({
  propTypes: {
    unitName: p.string.isRequired,
    color: p.string.isRequired,
    onUnitClick: p.func.isRequired,
    onColorClick: p.func.isRequired,
  },

  render: function() {
    var {color, onUnitClick, onColorClick, unitName, ...props} = this.props;

    var s = {
      display: 'flex',
      flexWrap: 'wrap',
    };

    let colorS = (color2) => {
      return {
        backgroundColor: color2,
        // display: 'flex',
        width: 50,
        height: 50,
        color: 'white',
        outline: color === color2 ? '2px solid white' : 'none',
        display: 'inline-block',
        margin: 1,
      };
    };

    return (
      <div {...props} style={s}>
        {Object.keys(everyUnit.nameInDisplayOrder).map(unitName2 => {
          return (
            <LandBox
              key={unitName2}
              unitName={unitName2}
              onClick={onUnitClick.bind(null, unitName2)}
              selected={unitName2 === unitName} / >
          );
        })}

        <div>
          <div
            onClick={onColorClick.bind(null, 'Red')}
            style={colorS('Red')}>
              Red
          </div>
          <div
            onClick={onColorClick.bind(null, 'Blue')}
            style={colorS('Blue')}>
              Blue
          </div>
          <div
            onClick={onColorClick.bind(null, 'Gray')}
            style={colorS('Gray')}>
              Gray
          </div>
        </div>
      </div>
    );
  }
});

module.exports = UnitSelector;
