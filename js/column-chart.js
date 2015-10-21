import d3 from 'd3';
import React from 'react';
import RFD from 'react-faux-dom';
import SVGComponent from './svg-component.js';
import { parseMarginArray } from './utilities.js';

export default class ColumnChart extends SVGComponent {
  static get defaultProps() {
    return {
      height: 300,
      width: 595,
      data : [
        {x:0.1,y:0},
        {x:0.3,y:1},
        {x:0.9,y:2},
        {x:0.4,y:3}
      ],
      margin : 10,
      xScale : d3.scale.linear().domain([0,1]),
      yScale : d3.scale.linear().domain([0,3])
    };
  }
  get margins() { return parseMarginArray(this.props.margin); }
  get leftBound() { return this.margin.left; }
  get rightBound() { return this.props.width - this.margin.right; }
  get topBound() { return this.margin.top; }
  get bottomBound() { return this.props.height - this.margin.bottom; }
  get widthSpan() { return this.props.width - this.margin.left - this.margin.right; }
  get heightSpan() { return this.props.height - this.margin.top - this.margin.bottom; }

  render() {
    var el = RFD.createElement('g');
    var sel = d3.select(el);

    var xScale = this.props.xScale.copy().range([this.bottomBound, this.topBound]);
    var yScale = this.props.yScale.copy().range([this.leftBound, this.rightBound]);

    sel.append('svg:rect')
      .attr('width', 100)
      .attr('height', 100);

    return(
      <svg height={this.props.height} width={this.props.width}>
        {el.toReact()}
      </svg>
    );
  }
}
