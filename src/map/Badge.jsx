var React = require('react');

var p = React.PropTypes;

var Badge = React.createClass({
  propTypes: {
    children: p.oneOfType([p.string, p.number]).isRequired,
    notice: p.bool,
  },

  render: function() {
    var {notice, children} = this.props;

    var blue = 'linear-gradient(rgb(114, 185, 244), rgb(38, 152, 249))';
    var red = 'linear-gradient(rgb(244, 114, 114), rgb(253, 66, 66))';

    var s = {
      zIndex: 100,
      background: notice ? blue : red,
      padding: 4,
      color: 'white',
      borderRadius: 99,
      fontSize: 11,
      border: '2px solid rgb(234, 234, 234)',
      minWidth: 12,
      textAlign: 'center',
      top: 8,
    };

    return (
      <div style={s}>
        {children}
      </div>
    );
  }
});

module.exports = Badge;
