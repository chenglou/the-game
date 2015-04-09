'use strict';

var React = require('react');
var M = require('mori');
var everyUnit = require('../everyUnit');
var units = require('../units');
var everyUnitDefaultConfigDebug = require('./everyUnitDefaultConfigDebug');
var colorStyle = require('../colorStyle');
var {overlay} = require('../assetUrls');
var assetDims = require('../assetDims');
var url = require('../utils/imgUrl');

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

    let Unit = units[unitName];

    return (
      <div {...props} style={s}>
        <Unit {...M.toJs(M.get(everyUnitDefaultConfigDebug, unitName))} />
        <div style={labelS}>
          {unitName}
        </div>
      </div>
    );
  }
});

function colorS(currColor, color) {
  let [w, h] = assetDims.overlay;
  return {
    background: url(overlay),
    width: w,
    height: h,
    color: 'white',
    WebkitFilter: colorStyle[color],
    outline: currColor === color ? '2px solid white' : 'none',
    display: 'inline-block',
    margin: 1,
  };
}

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
          <div style={colorS(color, 'Red')} onClick={onColorClick.bind(null, 'Red')} />
          <div style={colorS(color, 'Blue')} onClick={onColorClick.bind(null, 'Blue')} />
          <div style={colorS(color, 'Orange')} onClick={onColorClick.bind(null, 'Orange')} />
          <div style={colorS(color, 'Gray')} onClick={onColorClick.bind(null, 'Gray')} />
        </div>
      </div>
    );
  }
});

module.exports = UnitSelector;
