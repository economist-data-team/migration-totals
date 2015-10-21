import d3 from 'd3';
import React from 'react';
import RFD from 'react-faux-dom';
import BoundedSVG from './bounded-svg.js';
import { Im } from './utilities.js';

class ColumnSeries extends BoundedSVG {
  static get defaultProps() {
    return Im.extend(super.defaultProps, {});
  }
  render() {
    var el = RFD.createElement('g');
    var sel = d3.select(el);

    var xScale = this.props.xScale, yScale = this.props.yScale;

    // spacing dropped here for the last column, which should flush to
    // the end
    var colWidth = xScale(1) - xScale(0) - this.props.spacing - this.props.offset;

    var columnJoin = sel.selectAll('.chart-column')
      .data(this.props.data);
    columnJoin.enter()
      .append('svg:rect')
      .classed('chart-column', true);
    columnJoin.exit().remove();
    columnJoin
      .classed(`column-${this.props.index}`, true)
      .attr({
        height : d => yScale(this.props.yAccessor(d)) - yScale(0),
        y : d => {
          console.log(this.props.index, this.props.yAccessor(d), this.props.priorAccessor(d),
            yScale(this.props.yAccessor(d) + this.props.priorAccessor(d)));
          return this.heightSpan - yScale(this.props.yAccessor(d) + this.props.priorAccessor(d));
        },
        width: colWidth,
        x : d => xScale(this.props.xAccessor(d)) + this.props.offset
      });

    return el.toReact();
  }
}

export default class ColumnChart extends BoundedSVG {
  static get defaultProps() {
    return {
      height: 300,
      width: 595,
      xAccessor : d => d.x,
      yAccessor : [d => d.y, d => d.y2, d => d.y3],
      data : [
        {x:0, y:10, y2:80, y3:50},
        {x:1, y:30, y2:50, y3:50},
        {x:2, y:90, y2:30, y3:50},
        {x:3, y:40, y2:60, y3:50}
      ],
      margin : 10,
      spacing : 10,
      xScale : d3.scale.linear().domain([0,4]),
      yScale : d3.scale.linear().domain([0,300])
    };
  }
  render() {
    var el = RFD.createElement('g');
    var sel = d3.select(el);

    var yAccessor = this.props.yAccessor instanceof Array ? this.props.yAccessor : [this.props.yAccessor];

    var xScale = this.props.xScale.copy().range([this.leftBound, this.rightBound + this.props.spacing]);
    var yScale = this.props.yScale.copy().range([this.topBound, this.bottomBound]);

    var columns = yAccessor.map((accessor, idx) => {
      var props = {
        key : accessor,
        xScale : xScale, yScale : yScale,
        data : this.props.data,
        xAccessor : this.props.xAccessor,
        yAccessor : accessor,
        priorAccessor : d => yAccessor.slice(0,idx).reduce((memo, fn) => { return memo + fn(d); }, 0),
        spacing : this.props.spacing,
        margin : this.props.margin,
        index : idx,
        offset : 0 // placeholder: to handle adjacent series
      };
      return (<ColumnSeries {...props} />);
    });

    return(
      <svg height={this.props.height} width={this.props.width}>
        {columns}
      </svg>
    );
  }
}
