var React = require('react');
var url = require('../utils/imgUrl');
var positioner = require('../map/positioner');
var assetDims = require('../assetDims');
var assetUrls = require('../assetUrls');

var p = React.PropTypes;

var UnitWrapper = React.createClass({
  propTypes: {
    unitName: p.string.isRequired,
  },

  render: function() {
    var props = this.props;

    var [imgW, imgH] = assetDims[props.unitName];

    var s = {
      width: '100%',
      height: '100%',
    };

    var innerS = {
      backgroundImage: url(assetUrls[props.unitName]),
      backgroundRepeat: 'no-repeat',
      width: imgW,
      height: imgH,
      marginLeft: (positioner.calcW() - imgW) / 2,
      // marginTop: (positioner.calcH() - imgH) / 2,
    };

    return (
      <div style={s}>
        <div style={innerS}></div>
      </div>
    );
  }
});

module.exports = UnitWrapper;
