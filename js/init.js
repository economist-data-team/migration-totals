'use strict';

import d3 from 'd3';
import React from 'react';
import { Im, parseNumerics, connectMap }
  from './utilities.js';

import colours from './econ_colours.js';

import Header from './header.js';
import StepperRaw, { Step } from './stepper.js';
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
var steps = [
  new Step('apps', (<span>
    Applications to the EU are at their highest level since records began.
    Nearing 100,000 per month. Almost 20% are headed to Germany.</span>)
  ),
  new Step('recog', (<span>
    But not all of these asylum seekers will make it in. Recognition rates vary from country
    to country.</span>)
  ),
  new Step('reloc', (<span>
    Another way in is through relocation. [Explanation of relocation agreement.]</span>)
  ),
  new Step('resettle', (<span>
    Another way in is through resettlement. [Explanation of resettlement agreement.]</span>)
  )
];

class Chart extends ChartContainer {
  render() {
    var stepperProps = {
      items : steps,
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
