import d3 from 'd3';
import React from 'react';
import BoundedSVG from './bounded-svg.js';
import { Im, generateTranslateString } from './utilities.js';

import colours from './econ_colours.js';

class BarLabels extends BoundedSVG {
  static get defaultProps() {
    return Im.extend(super.defaultProps, {
      data : []
    });
  }
  render() {
    var fontSize = 14;

    var labels = this.props.data.map((d, idx) => {
      var transform = generateTranslateString(this.leftBound, idx * 20);

      return (<g transform={transform}>
        <rect width={this.rightBound - this.leftBound} height="15" fill={colours.blue[6]}></rect>
        <text x="5" y="12" fontSize={fontSize}>{d[this.props.labelColumn]}</text>
      </g>);
    });

    return (<g>
      {labels}
    </g>);
  }
}
class BarGroup extends BoundedSVG {

}

export default class MigrationBars extends BoundedSVG {
  static get defaultProps() {
    return Im.extend(super.defaultProps, {
      data : []
    });
  }
  render() {
    var labelsProps = {
      data : this.props.data,
      labelColumn : 'countryName'
    };

    return (<svg width="595" height="700">
      <BarLabels {...labelsProps}/>
    </svg>);
  }
}
