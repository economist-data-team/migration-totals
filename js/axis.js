import React from 'react';
import d3 from 'd3';

export default class Axis extends React.Component {
  componentDidMount() { this.update(this.props); }
  componentWillReceiveProps(props) { this.update(props); }
  update(props) {
    if(!props.scale) { return; }

    var container = d3.select(React.findDOMNode(this.refs.container));

    var axis = d3.svg.axis()
      .scale(props.scale)
      .orient(props.orient)
      .innerTickSize(6)
      .outerTickSize(0);

    container.call(axis);
  }
  render() {
    var classes = ['axis', this.props.type];

    return(<g className={classes.join(' ')} ref="container"
      transform={this.props.transform}></g>);
  }
}
