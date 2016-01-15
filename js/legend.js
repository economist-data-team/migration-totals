import React from 'react';
import BoundedSVG from './bounded-svg.js';
import { Im, generateTranslateString } from './utilities.js';
import colours from './econ_colours.js';

export default class ChartLegend extends BoundedSVG {
	static get defaultProps() {
	   	return Im.extend(super.defaultProps, {
		   		rectWidth : 15,
		   		_width: 110,
		   		rectHeight : 15,
		   		colors: ["#E30010", "#00857C", "#004C64", "#1A1719"],
		   		_x: 20,
		   		_y: 290,
		   		_yHeader: 285,
		   		gap: 20,
		   		fontSize : 14,
		   		index: [1, 2, 3, 4],
		   		textLabel: [">75%", "50-75%", "10-50%", "<10%"],
		   		legendLabel: "Acceptance Rate",
		   		source: "to come"
	   	      }
	   	   );
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

   return texts.map((line, idx) => {
    return (<text className="label-group" x={this.props._x} y={(idx + 1) * (this.props.fontSize * 1.2) + this.props._yHeader} fontSize={this.props.fontSize}>{line.join(' ')}</text>);
       });
  }


	 get legend() {
	  	var labels = this.props.textLabel;

	  	return labels.map((label, idx) => {
	  		return (<text fontSize={this.props.fontSize} className="label-group-legend" 
	  			x={this.props._x + this.props.rectWidth + 10} 
	  			y={this.props._y + this.props.index[idx] * this.props.gap + 12}>{labels[idx]}</text>);  
	  	});
	  }
   

	render() {
	    return(<g>
	    	{this.legend}
	    	{this.legendheader}
	    	   <rect x={this.props._x} y={this.props._y + this.props.index[0] * this.props.gap} width={this.props.rectWidth} height={this.props.rectHeight} fill={colours.red[1]} ></rect>
			   <rect x={this.props._x} y={this.props._y + this.props.index[1] * this.props.gap} width={this.props.rectWidth} height={this.props.rectHeight} fill={colours.yellow[0]} ></rect>
			   <rect x={this.props._x} y={this.props._y + this.props.index[2] * this.props.gap} width={this.props.rectWidth} height={this.props.rectHeight} fill={colours.blue[3]}></rect>
			   <rect x={this.props._x} y={this.props._y + this.props.index[3] * this.props.gap} width={this.props.rectWidth} height={this.props.rectHeight} fill={colours.blue[4]} ></rect>
		   </g>
	    )
	  }
}

