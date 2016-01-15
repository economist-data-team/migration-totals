import React from 'react';
import BoundedSVG from './bounded-svg.js';
import { Im, generateTranslateString } from './utilities.js';

export default class SourceLabel extends BoundedSVG {
  static get defaultProps() {
    return Im.extend(super.defaultProps, {
      fontSize : 10,
      text : '',
      x : 10,
      y : 1
    });
  }

  render() {
    var texts = this.props.text.split(' ');
    var textTransform = generateTranslateString(this.leftBound, this.topBound);

    return(<g transform={textTransform} className="label-group-source">
      <text x={this.props.x} y={this.props.y} fontSize={this.props.fontSize}>{this.props.text}</text>
    </g>)
  }
}