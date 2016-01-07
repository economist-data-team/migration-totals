import React from 'react';
import BoundedSVG from './bounded-svg.js';
import d3 from 'd3';

export default class Treemap extends BoundedSVG {
  static get defaultProps() {
    return {
      data : []
    };
  }
  render() {
    var tree = d3.layout.treemap()
      .value(d => d.applicants)
      .size([300, 300]);

    var data = this.props.data;
    console.log(data);

    return (<g>
      <text>Oh hi.</text>
    </g>);
  }
}
