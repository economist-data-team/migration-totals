import React from 'react';

/**
 * A tooltip
 *
 * @prop {boolean} show - whether the tooltip should be shown
 * @prop {function} template - how to format the data point given to
 *       the tooltip into a display. Takes `this.props` as an argument
 */
export default class Tooltip extends React.Component {
  static get defaultProps() {
    return {
      template : () => {
        return (<span>Hark! a tooltip.</span>);
      },
      show : false,
      mouseX : 10,
      mouseY : 10,
      fullWidth : 595
    }
  }
  render() {
    var x = this.props.mouseX;
    var rightAlign = x > this.props.fullWidth / 2;

    var tooltipProps = {
      style : {
        left : rightAlign ? '' : x,
        right : rightAlign ? this.props.fullWidth - x : '',
        top : this.props.mouseY
      },
      className : ['tooltip', this.props.show ? null : 'tooltip-hidden']
        .filter((n => n != null)).join(' ')
    };

    return(<div {...tooltipProps}>{this.props.template(this.props)}</div>);
  }
}
