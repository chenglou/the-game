var React = require('react');
var url = require('../utils/imgUrl');
var knightImg = require('../useful/Knight.png');
var assign = require('object-assign');
var assetDims = require('../assetDims');
var positioner = require('../map/positioner');

var Knight = React.createClass({
  render: function() {
    var props = this.props;

    var s = {
      width: '100%',
      height: '100%',
    };

    var imgW = assetDims.Knight[0];
    var imgH = assetDims.Knight[1];

    var innerS = {
      backgroundImage: url(knightImg),
      backgroundRepeat: 'no-repeat',
      width: imgW,
      height: imgH,
      marginLeft: (positioner.calcW() - imgW) / 2,
    };

    return (
      <div {...props} style={assign({}, props.style, s)}>
        <div style={innerS}></div>
      </div>
    );
  }
});

module.exports = Knight;
