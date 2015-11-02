import d3 from 'd3';
import React from 'react';
import RFD from 'react-faux-dom';
import SVGComponent from './svg-component.js';
import BoundedSVG from './bounded-svg.js';
import { Im, generateTranslateString } from './utilities.js';

class Tick extends React.Component {
  static get defaultProps() {
    return {
      tickLength : 5,
      position : 0,
      label : 'none',
      textOffset : 0
    }
  }
  render() {
    var transform = generateTranslateString(this.props.position, 0);

    var line = this.props.hideTick ? null : (<line x1="0" y1="0" x2="0" y2={this.props.tickLength}></line>);

    return (<g className='tick' transform={transform}>
      {line}
      <text x={this.props.textOffset} y={this.props.tickLength + 18} textAnchor="middle">{this.props.label}</text>
    </g>);
  }
}

export default class Axis extends BoundedSVG {
  static get defaultProps() {
    return Im.extend(super.defaultProps, {
      scale : d3.scale.linear().domain([0,100]),
      type : 'year',
      orient : 'bottom',
      tickValues : d3.range(0,100,10),
      tickPosition : 'interval', // or tick
      tickFormat : v => v,
      offset : [0, 0]
    });
  }
  render() {
    var el = RFD.createElement('g');
    var sel = d3.select(el);

    var classes = ['axis', this.props.type];
    var transform = generateTranslateString(0, this.topBound);

    var scale = this.props.scale.copy().range([this.leftBound, this.rightBound]);

    var interval = this.props.tickPosition === 'interval'

    var ticks = this.props.tickValues.map((t,i) => {
      var nextValue = this.props.tickValues[i + 1] || scale.domain()[1];
      var props = {
        value : t,
        label : this.props.tickFormat(t),
        position : scale(t),
        hideTick : interval && i === 0,
        textOffset : interval ? (scale(nextValue) - scale(t)) / 2 : 0
      };

      return (<Tick {...props} />);
    });

    return (<g className={classes.join(' ')} transform={transform}>
      {ticks}
    </g>);
  }
}
