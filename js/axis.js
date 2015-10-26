import d3 from 'd3';
import React from 'react';
import RFD from 'react-faux-dom';
import SVGComponent from './svg-component.js';
import BoundedSVG from './bounded-svg.js';
import { Im, generateTranslateString } from './utilities.js';

class Tick extends React.Component {
  static get defaultProps() {
    return {
      tickLength : 5
    }
  }
  render() {
    return (<g className='tick'>
      <line x1="0" y1="0" x2="0" y2={this.props.tickLength}></line>
    </g>);
  }
}

export default class Axis extends BoundedSVG {
  static get defaultProps() {
    return Im.extend(super.defaultProps, {
      scale : d3.scale.linear().domain([0,100]),
      type : 'year',
      orient : 'bottom',
      ticks : 10,
      tickPosition : 'interval', // or tick
      tickFormat : v => v,
      offset : [0, 0]
    });
  }
  get ticks() {
    if(this.props.ticks instanceof Number) {

    }
  }
  render() {
    var el = RFD.createElement('g');
    var sel = d3.select(el);

    var classes = ['axis', this.props.type];
    var transform = generateTranslateString(0, this.topBound);

    var scale = this.props.scale.copy().range([this.leftBound, this.rightBound]);

    // var axis = d3.svg.axis()
    //   .scale(scale)
    //   .orient(this.props.orient)
    //   .innerTickSize(6)
    //   .outerTickSize(1);
    //
    // sel
    //   .classed(classes, true)
    //   .attr('transform', transform)
    //   .call(axis);

    // return el.toReact();


    return (<g className={classes.join(' ')} transform={transform}>

    </g>)
  }
}
