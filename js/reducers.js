import {
  UPDATE_DATA, UPDATE_STEPPER_VALUE
} from './actions.js';

var initialState = {
  data : [],
  stepperValue : 'apps'
};

function dataReducer(state = [], action) {
  if(action.type !== UPDATE_DATA) { return state; }
  return action.data;
}
function stepperReducer(state = '', action) {
  if(action.type !== UPDATE_STEPPER_VALUE) { return state; }
  return action.value;
}

export default function updateState(state = initialState, action) {
  return {
    data : dataReducer(state.data, action),
    stepperValue : stepperReducer(state.stepperValue, action)
  };
}
