import {
  UPDATE_SOURCE_DATA, UPDATE_COUNTRY_DATA, UPDATE_APPS_DATA,
  UPDATE_STEPPER_VALUE
} from './actions.js';

var initialState = {
  data : [],
  stepperValue : 'apps'
};

function sourceDataReducer(state = [], action) {
  if(action.type !== UPDATE_SOURCE_DATA) { return state; }
  return action.data;
}
function countryDataReducer(state = [], action) {
  if(action.type !== UPDATE_COUNTRY_DATA) { return state; }
  return action.data;
}
function appsDataReducer(state = [], action) {
  if(action.type !== UPDATE_APPS_DATA) { return state; }
  return action.data;
}
function stepperReducer(state = '', action) {
  if(action.type !== UPDATE_STEPPER_VALUE) { return state; }
  return action.value;
}

export default function updateState(state = initialState, action) {
  return {
    sourceData : sourceDataReducer(state.sourceData, action),
    countryData : countryDataReducer(state.countryData, action),
    appsData : appsDataReducer(state.appsData, action),
    stepperValue : stepperReducer(state.stepperValue, action)
  };
}
