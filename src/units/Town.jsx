var React = require('react');
var UnitWrapper = require('./UnitWrapper');

var p = React.PropTypes;

var Town = React.createClass({
  propTypes: {
    gold: p.number.isRequired,
    wood: p.number.isRequired,
  },

  render: function() {
    var {gold, wood} = this.props;

    var s = {
      margin: 'auto',
      zIndex: 100,
    };

    return (
      <UnitWrapper unitName="Town">
        <div style={s}>
          {gold + ', ' + wood}
        </div>
      </UnitWrapper>
    );
  }
});

module.exports = Town;
