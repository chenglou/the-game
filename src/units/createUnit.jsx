var React = require('react');
var url = require('../utils/imgUrl');
var assign = require('object-assign');
var assetDims = require('../assetDims');
var positioner = require('../map/positioner');
var everyUnit = require('../everyUnit');

function createUnit(unitName) {
  return React.createClass({
    displayName: unitName,

    render: function() {
      var props = this.props;

      var s = {
        width: '100%',
        height: '100%',
      };

      var imgW = assetDims[unitName][0];
      var imgH = assetDims[unitName][1];

      var innerS = {
        backgroundImage: url(everyUnit.img[unitName]),
        backgroundRepeat: 'no-repeat',
        width: imgW,
        height: imgH,
        marginLeft: (positioner.calcW() - imgW) / 2,
        // marginTop: (positioner.calcH() - imgH) / 2,
      };

      return (
        <div {...props} style={assign({}, props.style, s)}>
          <div style={innerS}></div>
        </div>
      );
    }
  });
}

module.exports = createUnit;
