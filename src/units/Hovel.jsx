var React = require('react');
var UnitWrapper = require('./UnitWrapper');

var p = React.PropTypes;

var Hovel = React.createClass({
  propTypes: {
    gold: p.number,
    wood: p.number,
  },

  render: function() {
    var {gold, wood} = this.props;

    var s = {
      margin: 'auto',
      zIndex: 100,
    };

    return (
      <UnitWrapper unitName="Hovel">
        <div style={s}>
          {gold + ', ' + wood}
        </div>
      </UnitWrapper>
    );
  }
});

module.exports = Hovel;
