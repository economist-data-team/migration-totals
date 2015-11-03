import React from 'react';
import SVGComponent from './svg-component.js';
import { generateTranslateString } from './utilities.js';

export default class ColumnChartLabel extends SVGComponent {
  static get defaultProps() {
    return {
      text : 'Hello',
      position : [300, 50],
      lineLength : -50
    };
  }
  render() {
    var transform = generateTranslateString(...this.props.position);

    var textRight = this.props.lineLength > 0;
    var textOffset = this.props.lineLength + (textRight ? 5 : -5);
    var textAnchor = textRight ? 'start' : 'end';

    return (<g transform={transform}>
      <line x1="0" x2={this.props.lineLength} y1="0" y2="0" stroke="black"></line>
      <text x={textOffset} y="5" textAnchor={textAnchor}>{this.props.text}</text>
    </g>);
  }
}
