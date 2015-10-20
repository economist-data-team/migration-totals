'use strict';

import d3 from 'd3';
import React from 'react';
import { Im, parseNumerics, connectMap }
  from './utilities.js';

import colours from './econ_colours.js';

import Header from './header.js';
import StepperRaw from './stepper.js';
import ChartContainer from './chart-container.js';

import chroma from 'chroma-js';

import { createStore } from 'redux';
import { connect, Provider } from 'react-redux';

import {
  updateData, updateStepperValue
} from './actions.js';
import updateState from './reducers.js'

var store = createStore(updateState);

var Stepper = connectMap({
  value : 'stepperValue'
})(StepperRaw);

class Chart extends ChartContainer {
  render() {
    var stepperProps = {
      action : (v) => { store.dispatch(updateStepperValue(v)); }
    };

    return(
      <div className='chart-container'>
        <Header title="To come" subtitle="Also to come"/>
        <Stepper {...stepperProps} />
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
