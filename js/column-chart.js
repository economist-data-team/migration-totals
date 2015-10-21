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
      xAccessor : d => d.x,
      yAccessor : d => d.y,
      data : [
        {y:0.1,x:0},
        {y:0.3,x:1},
        {y:0.9,x:2},
        {y:0.4,x:3}
      ],
      margin : 10,
      spacing : 10,
      xScale : d3.scale.linear().domain([0,4]),
      yScale : d3.scale.linear().domain([0,1])
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

    var xScale = this.props.xScale.copy().range([this.leftBound, this.rightBound + this.props.spacing]);
    var yScale = this.props.yScale.copy().range([this.topBound, this.bottomBound]);

    // spacing dropped here for the last column, which should flush to
    // the end
    var colWidth = xScale(1) - xScale(0) - this.props.spacing;

    var columnJoin = sel.selectAll('.chart-column')
      .data(this.props.data);
    columnJoin.enter()
      .append('svg:rect')
      .classed('chart-column', true);
    columnJoin.exit().remove();
    columnJoin.attr({
      height : d => yScale(this.props.yAccessor(d)),
      y : d => this.heightSpan - yScale(this.props.yAccessor(d)),
      width: colWidth,
      x : d => xScale(this.props.xAccessor(d))
    });

    return(
      <svg height={this.props.height} width={this.props.width}>
        {el.toReact()}
      </svg>
    );
  }
}
