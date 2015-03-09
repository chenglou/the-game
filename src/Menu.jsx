var React = require('react');
var assetUrls = require('./assetUrls');
var assetDims = require('./assetDims');
var url = require('./utils/imgUrl');

var p = React.PropTypes;

var MenuItem = React.createClass({
  propTypes: {
    children: p.string.isRequired,
    disabled: p.bool.isRequired,
  },

  render: function() {
    var {children, disabled, ...props} = this.props;

    var [w, h] = assetDims.menuItem;

    var itemS = {
      height: h,
      width: w,
      backgroundRepeat: 'no-repeat',
      backgroundImage: disabled ? url(assetUrls.MenuItemDisabled) : url(assetUrls.MenuItem),
      color: disabled ? 'gray' : 'black',
    };

    var innerS = {
      padding: '13px 0px 0px 10px',
    }

    return (
      <div style={itemS} {...props}>
        <div style={innerS}>
          {children}
        </div>
      </div>
    );
  }
});

var Menu = React.createClass({
  propTypes: {
    pos: p.array.isRequired,
  },

  render: function() {
    var {children, pos: [x, y]} = this.props;

    var s = {
      position: 'absolute',
      top: y + 50,
      left: x + 50,
      zIndex: 101,
    };

    return (
      <div style={s}>
        {children}
      </div>
    );
  }
});

module.exports = {MenuItem, Menu};
