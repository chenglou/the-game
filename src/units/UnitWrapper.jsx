'use strict';

var React = require('react');
var url = require('../utils/imgUrl');
var assetDims = require('../assetDims');
var assetUrls = require('../assetUrls');

var p = React.PropTypes;

var UnitWrapper = React.createClass({
  propTypes: {
    unitName: p.string.isRequired,
  },

  render: function() {
    var {unitName, children} = this.props;

    var [imgW, imgH] = assetDims[unitName];

    var s = {
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
    };

    var innerS = {
      backgroundImage: url(assetUrls[unitName]),
      backgroundRepeat: 'no-repeat',
      width: imgW,
      height: imgH,
      position: 'relative',
    };
    return (
      <div style={s}>
        <div style={innerS}>
          {children}
        </div>
      </div>
    );
  }
});

module.exports = UnitWrapper;
