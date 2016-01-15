import d3 from 'd3';
import React from 'react';
import BoundedSVG from './bounded-svg.js';
import { Im, mapToObject, generateTranslateString, generateRectPolygonString } from './utilities.js';

import colours from './econ_colours.js';

class MigrationColumnLabels extends BoundedSVG {
  static get defaultProps() {
    return Im.extend(super.defaultProps, {

    });
  }
}

class BarLabels extends BoundedSVG {
  static get defaultProps() {
    return Im.extend(super.defaultProps, {
      data : [],
      lineHeight : 15,
      linePadding: 5,
      fillColour : colours.blue[6]
    });
  }
  render() {
    var fontSize = 14;

    var labels = this.props.data.map((d, idx) => {
      var transform = generateTranslateString(this.leftBound,
        idx * (this.props.lineHeight + this.props.linePadding));

      var rectProps = {
        width : this.rightBound - this.leftBound,
        height : this.props.lineHeight,
        fill : this.props.fillColour
      }

      return (<g transform={transform} key={d.key}>
        <rect {...rectProps}></rect>
        <text x="5" y="12" fontSize={fontSize}>{d[this.props.labelColumn]}</text>
      </g>);
    });

    return (<g>
      {labels}
    </g>);
  }
}

var barTransitionableProps = ['x', 'y', 'width', 'height', 'barColour'];
class Bar extends React.Component {
  constructor(props, ...args) {
    super(props, ...args);
    this.state = mapToObject(barTransitionableProps, props);
    this.animationStep = this.animationStep.bind(this);
  }
  static get defaultProps() {
    return {
      x : 0, y: 0,
      width : 10, height : 10,
      barColour : '#c00',
      duration : 250,
      alt : null
    };
  }
  componentWillReceiveProps(newProps) {
    // console.log('new props get!', newProps);
    d3.timer(this.animationStep);
    this.interpolators = mapToObject(barTransitionableProps, k => d3.interpolate(this.props[k], newProps[k]));
    // console.log('interps', this.interpolators);
  }
  animationStep(ms) {
    var progress = Math.min(1, ms / this.props.duration);
    // this.setState(barTransitionableProps.map(k => ({ key : k, value : props[k]})));
    this.setState(mapToObject(barTransitionableProps, k => this.interpolators[k](progress)));
    // end the animation
    if(progress === 1) { return true; }
    return false;
  }
  render() {
    var polygonProps = {
      points : generateRectPolygonString(this.state.x, this.state.y, this.state.width, this.state.height),
      fill : this.state.barColour
    };

    return(<polygon {...polygonProps}></polygon>);
  }
}
class BarGroup extends BoundedSVG {
  static get defaultProps() {
    return {
      data : [],
      lineHeight : 15,
      backgroundColour: colours.grey[10],
      alts : {}
    };
  }
  render() {
    var range = this.props.scale.range();
    var rangeSpan = range[1] - range[0];
    var lineSpacing = this.props.lineHeight + this.props.linePadding;

    var backgrounds = this.props.hideBackground ? [] : this.props.data.map((d, idx) => {
      var key = `background-${d.key}`;
      var rectProps = {
        width : rangeSpan,
        barColour : this.props.backgroundColour,
        height: this.props.lineHeight,
        x : range[0],
        y : idx * lineSpacing,
        barKey : key,
        key : key
      };
      return (<Bar {...rectProps}></Bar>);
    });

    var dataKey = this.props.dataKey;
    var barColour = this.props.barColour;
    // if it's not an array...
    if(!dataKey.push) { dataKey = [dataKey]; }
    if(!barColour.push) { barColour = [barColour]; }

    var alts = this.props.alts;
    var altKeys = Object.keys(alts);

    var bars = dataKey.map((dKey, dIdx) => {
      return this.props.data.map((d, idx) => {
        var value = d[dKey];
        var key = `bar-${dKey}-${d.key}`;
        if(altKeys.indexOf(value) > -1 ) {
          let transform = generateTranslateString(range[0], idx * lineSpacing);
          return (<g transform={transform}>
            {alts[value]}
          </g>);
        }
        var barProps = {
          barColour : barColour[dIdx],
          width : this.props.scale(d[dKey]) - this.props.scale(0),
          height : this.props.lineHeight,
          x : range[0],
          y : idx * lineSpacing,
          barKey : key,
          key : key
        };
        return (<Bar {...barProps}></Bar>);
      });
    // we have to flatten the array here so the keys work properly
    }).reduce((memo, v) => memo.concat(v),[]);

    return (<g>
      {backgrounds}
      {bars}
    </g>);
  }
}

export default class MigrationBars extends BoundedSVG {
  static get defaultProps() {
    return Im.extend(super.defaultProps, {
      data : [],
      lineHeight : 15,
      linePadding : 5,
      fillColour : colours.blue[6],
      groups : [
        {
          dataKey : 'positive',
          scale : d3.scale.linear().range([120, 250]),
          barColour : 'red'
        }
      ]
    });
  }
  render() {
    var labelsProps = {
      data : this.props.data,
      labelColumn : 'countryName',
      lineHeight : this.props.lineHeight,
      linePadding : this.props.linePadding,
      fillColour : this.props.fillColour,
      margin : [10, 480, 10, 10]
    };

    var barGroups = this.props.groups.map(g => {
      var barGroupProps = {
        scale : g.scale,
        dataKey : g.dataKey,
        lineHeight : this.props.lineHeight,
        linePadding : this.props.linePadding,
        backgroundColour : this.props.fillColour,
        barColour : g.colour,
        data : this.props.data,
        hideBackground : g.hideBackground,
        key : g.groupKey || g.dataKey,
        alts: g.alts
      };
      return (<BarGroup {...barGroupProps} />);
    });

    return (<svg width="595" height="700">
      <BarLabels {...labelsProps}/>
      {barGroups}
    </svg>);
  }
}
