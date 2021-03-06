import React from 'react';
import BoundedSVG from './bounded-svg.js';
import { Im, generateTranslateString } from './utilities.js';
import colours from './econ_colours.js';

export function textFunc(text, characters) {
  var _texts = [];

  var _words = text.split(' ');

  while(_words.join(' ').length > characters) {
    let nextLine = [];
    while(nextLine.join(' ').length < characters) {
      nextLine.push(_words.shift());
    }
    if(nextLine.join(' ').length > characters) {
      _words.unshift(nextLine.pop());
    }
    _texts.push(nextLine);
  }

  _texts.push(_words);
  return _texts;
}

export default class ChartLegend extends BoundedSVG {
  static get defaultProps() {
    return Im.extend(super.defaultProps, {
      rectWidth : 15,
      rectHeight : 15,
      gap: 20,
      fontSize : 14,
      legendLabel : "The label",
      legendSublabel : null,
      legendItems : [
        { colour : 'red', label : 'One' },
        { colour : 'blue', label : 'Two' }
      ]
    });
  }

  get legendheader() {
    var characters = this.props.width * 2 / this.props.fontSize;
    var words = this.props.legendLabel.split(' ');
    var texts = [];

    while(words.join(' ').length > characters) {
      let nextLine = [];
      while(nextLine.join(' ').length < characters) {
        nextLine.push(words.shift());
      }
      if(nextLine.join(' ').length > characters) {
        words.unshift(nextLine.pop());
      }
      texts.push(nextLine);
    }

    texts.push(words);

    var textElements = texts.map((line, idx) => {
      return (<text className="label-group" x={this.leftBound} y={(idx + 1) * (this.props.fontSize * 1.2) + this.topBound} fontSize={this.props.fontSize}>{line.join(' ')}</text>);
    });

    var subtextElements = this.props.legendSublabel ?
      textFunc(this.props.legendSublabel, characters).map((line, idx) => {
        return (<text className="label-group-subtitle" x={this.leftBound} y={(idx + textElements.length + 1) * (this.props.fontSize * 1.2) + this.topBound} fontSize={this.props.fontSize}>{line.join(' ')}</text>);
      }) :
      [];

    return(<g transform={generateTranslateString(0, -1 * this.props.fontSize * ((textElements.length + subtextElements.length) - 1) - 5)}>
      {textElements}
      {subtextElements}
    </g>);
  }

  render() {
    var items = this.props.legendItems.map((d, idx) => {
      var transform = generateTranslateString(0, this.topBound + (idx + 1) * this.props.gap + 5);

      var rectProps = {
        x : this.leftBound,
        // y : this.topBound + (idx + 1) * this.props.gap,
        width : this.props.rectWidth,
        height : this.props.rectHeight,
        fill : d.colour
      };
      var textProps = {
        x : this.leftBound + this.props.rectWidth + 5,
        y : this.props.fontSize * 0.85,
        fontSize : this.props.fontSize
      };

      return (<g transform={transform}>
        <rect {...rectProps}></rect>
        <text {...textProps}>{d.label}</text>
      </g>);
    });

    return(<g>
      {this.legendheader}
      {items}
     </g>
    )
  }
}
