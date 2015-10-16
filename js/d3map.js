import d3 from 'd3';
import React from 'react';
import SVGComponent from './svg-component.js';
import topojson from 'topojson';

class MapLayer extends SVGComponent {
  static get defaultProps() {
    return {
      elementClass : 'item'
    };
  }
  render() {
    return(<g ref='layergroup'></g>);
  }
  d3render() {
    var el = this.selectRef('layergroup');

    var pathFn = d3.geo.path()
      .projection(this.props.projection);

    var join = el.selectAll(`.${this.props.elementClass}`)
      .data(this.props.data);
    join.enter().append('svg:path')
      .classed(this.props.elementClass, true);
    join.exit().remove();

    join.attr(this.props.attrs);
    join.on(this.props.handlers);

    var alter = this.props.duration ? join.transition().duration(this.props.duration) : join;
    alter.attr('d', pathFn);
  }
}

export default class D3Map extends SVGComponent {
  constructor(props) {
    super(...arguments);
    this.state = {
      layers : [],
      layerOrder : null,
      projection : props.projection,
      layerAttrs : {},
      layerHandlers : {}
    }
  }
  static get defaultProps() {
    return {
      duration : 500,
      projection : d3.geo.mercator()
    };
  }
  render() {
    var layers = this.state.layers;
    if(this.state.layerOrder) {
      layers = this.state.layerOrder.toOrderedMap().map(function(k) {
        return layers.has(k) ? layers.get(k) : null;
      });
    }

    var projection = this.state.projection.translate([595/2,this.props.height/2]);

    var layerElements = layers.filter(v => v).map((layer, name) => {
      var props = {
        elementClass : name,
        duration : this.props.duration,
        projection : projection,
        data : layer,
        attrs : this.state.layerAttrs[name] || {},
        handlers : this.state.layerHandlers[name] || {}
      };

      return (<MapLayer {...props} />);
    });

    return(<svg height={this.props.height} width="595" data-status={this.state.status}>
      {layerElements}
    </svg>)
  }
}
