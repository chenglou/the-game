var React = require('react');

var p = React.PropTypes;

var Menu = React.createClass({
  propTypes: {
    pos: p.array.isRequired,
  },

  render: function() {
    var {children, pos: [x, y]} = this.props;

    var s = {
      width: 200,
      height: 200,
      outline: '1px solid black',
      position: 'absolute',
      top: y + 50,
      left: x + 50,
      backgroundColor: 'white',
      zIndex: 101,
    };

    var innerS = {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
    };

    var itemS = {
      position: 'relative',
      top: 'initial',
      left: 'initial',
      flexGrow: 1,
      flexBasis: 'auto',
      // height: 50,
    };

    return (
      <div style={s}>
        <div style={innerS}>
          {React.Children.map(children, (child, i) => {
            return (
              <div key={i} style={itemS}>
                {child}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
});

module.exports = Menu;
