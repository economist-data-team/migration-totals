'use strict';

import d3 from 'd3';
import React from 'react';
import { Im, parseNumerics, connectMap }
  from './utilities.js';

import colours from './econ_colours.js';

import Header from './header.js';
import StepperRaw, { Step } from './stepper.js';
import ChartContainer from './chart-container.js';
import ColumnChartRaw from './column-chart.js';
import BoundedSVG from './bounded-svg.js';

import chroma from 'chroma-js';

import { createStore } from 'redux';
import { connect, Provider } from 'react-redux';

import {
  updateSourceData, updateCountryData,
  updateAppsData, updateStepperValue
} from './actions.js';
import updateState from './reducers.js'

var store = createStore(updateState);
window.store = store;

var Stepper = connectMap({
  value : 'stepperValue'
})(StepperRaw);
var ColumnChart = connect((state) => {
  var data = state.appsData;
  var months = data.map(d => d.month);
  // need new Date to avoid modifying the actual data point
  var end = new Date(d3.max(months));
  if(end) { end.setMonth(end.getMonth() + 1); }
  return {
    data,
    xScale : d3.scale.linear().domain([0, data.length])
  };
})(ColumnChartRaw);

var steps = [
  new Step('apps', (<span>
    Applications to the EU are at their highest level since records began.
    Nearing 100,000 per month. Almost 20% are headed to Germany.</span>), '1'
  ),
  new Step('recog', (<span>
    But not all of these asylum seekers will make it in. Recognition rates vary from country
    to country.</span>), '2'
  ),
  new Step('reloc', (<span>
    Another way in is through relocation. [Explanation of relocation agreement.]</span>), '3'
  ),
  new Step('resettle', (<span>
    Another way in is through resettlement. [Explanation of resettlement agreement.]</span>), '4'
  )
];

var dateFormatter = d3.time.format('%d/%m/%y');

class ChartLabel extends BoundedSVG {
  render() {
    return(<g><text>Hi</text></g>)
  }
}

class Chart extends ChartContainer {
  render() {
    var stepperProps = {
      items : steps,
      action : (v) => { store.dispatch(updateStepperValue(v)); }
    };

    var columnChartProps = {
      margin : [10, 10, 40],
      series : [
        { name : 'germany', accessor : d => d.Germany },
        { name : 'europe', accessor : d => d.otherEurope }
      ],
      yScale : d3.scale.linear().domain([0, 130000]),
      spacing : 1
    };

    return(
      <div className='chart-container'>
        <Header title="To come" subtitle="Also to come"/>
        <Stepper {...stepperProps} />
        <svg width="595" height="300">
          <ChartLabel />
          <ColumnChart {...columnChartProps} />
        </svg>
      </div>
    );
  }
}
var props = {
  height : 320
};

var chart = React.render(
  <Provider store={store}>
    {() => <Chart {...props} />}
  </Provider>, document.getElementById('interactive'));

d3.csv('../data/applications.csv', function(error, data) {
  data = data.map(parseNumerics).map((d) => {
    d.month = dateFormatter.parse(d.month);
    return d;
  });

  store.dispatch(updateAppsData(data));
});
