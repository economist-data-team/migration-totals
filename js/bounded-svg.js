import React from 'react';
import SVGComponent from './svg-component.js';
import { parseMarginArray } from './utilities.js';

/**
 * a base component class that provides a bunch of utilities for
 * working with margins in an SVG
 */
export default class BoundedSVG extends SVGComponent {
  static get defaultProps() {
    return {
      margin : 10,
      height: 300,
      width: 595
    };
  }

  get margins() { return parseMarginArray(this.props.margin); }
  get leftBound() { return this.margin.left; }
  get rightBound() { return this.props.width - this.margin.right; }
  get topBound() { return this.margin.top; }
  get bottomBound() { return this.props.height - this.margin.bottom; }
  get widthSpan() { return this.props.width - this.margin.left - this.margin.right; }
  get heightSpan() { return this.props.height - this.margin.top - this.margin.bottom; }
}
