import d3 from 'd3';
import React from 'react';
import BoundedSVG from './bounded-svg.js';
import { Im, generateTranslateString, generateRectPolygonString } from './utilities.js';

import colours from './econ_colours.js';

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
class Bar extends React.Component {
  static get defaultProps() {
    return {
      x : 0, y: 0,
      width : 10, height : 10
    };
  }
  render() {
    var polygonProps = {
      points : generateRectPolygonString(this.props.x, this.props.y, this.props.width, this.props.height),
      fill : this.props.barColour,
      key : this.props.barKey
    };

    return(<polygon {...polygonProps}></polygon>);
  }
}
class BarGroup extends BoundedSVG {
  static get defaultProps() {
    return {
      data : [],
      lineHeight : 15,
      backgroundColour: colours.grey[10]
    };
  }
  render() {
    var range = this.props.scale.range();
    var rangeSpan = range[1] - range[0];
    var lineSpacing = this.props.lineHeight + this.props.linePadding;

    var backgrounds = this.props.hideBackground ? [] : this.props.data.map((d, idx) => {
      var rectProps = {
        width : rangeSpan,
        fill : this.props.backgroundColour,
        height: this.props.lineHeight,
        x : range[0],
        y : idx * lineSpacing,
        key : `background-${d.key}`
      };
      return (<rect {...rectProps}></rect>);
    });

    var bars = this.props.data.map((d, idx) => {
      var rectProps = {
        barColour : this.props.barColour,
        width : this.props.scale(d[this.props.dataKey]) - this.props.scale(0),
        height : this.props.lineHeight,
        x : range[0],
        y : idx * lineSpacing,
        barKey : `bar-${d.key}`
      };
      return (<Bar {...rectProps}></Bar>);
    });

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
        key : g.dataKey
      };
      return (<BarGroup {...barGroupProps} />);
    });

    return (<svg width="595" height="700">
      <BarLabels {...labelsProps}/>
      {barGroups}
    </svg>);
  }
}
