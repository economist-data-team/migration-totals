import d3 from 'd3';
import {
  UPDATE_SOURCE_DATA, UPDATE_COUNTRY_DATA, UPDATE_APPS_DATA,
  UPDATE_SANKEY_DATA,
  UPDATE_STEPPER_VALUE, UPDATE_COLUMN_CHART_HIGHLIGHT,
  CHANGE_TOOLTIP
} from './actions.js';

var initialState = {
  data : [],
  sankeyData : { links : [], nodes : [] },
  stepperValue : 'sankey',
  tooltipShow : false,
  tooltipContents : null
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
function sankeyDataReducer(state = initialState.sankeyData, action) {
  if(action.type !== UPDATE_SANKEY_DATA) { return state; }
  return action.data;
}
function stepperReducer(state = '', action) {
  if(action.type !== UPDATE_STEPPER_VALUE) { return state; }
  return action.value;
}
function appsScaleReducer(state = d3.scale.linear(), action) {
  if(action.type !== UPDATE_APPS_DATA) { return state; }
  return d3.scale.linear().domain([0, action.data.length]);
};
function columnChartHighlightReducer(state = '', action) {
  if(action.type !== UPDATE_COLUMN_CHART_HIGHLIGHT) { return state; }
  return action.data;
};


function tooltipShowReducer(state = initialState.tooltipShow, action) {
  if(action.type !== CHANGE_TOOLTIP) { return state; }
  return action.show;
}
function tooltipContentsReducer(state = initialState.tooltipContents, action) {
  if(action.type !== CHANGE_TOOLTIP) { return state; }
  if(action.contents) { return action.contents; }
  return null;
}

export default function updateState(state = initialState, action) {
  return {
    sourceData : sourceDataReducer(state.sourceData, action),
    countryData : countryDataReducer(state.countryData, action),
    appsData : appsDataReducer(state.appsData, action),
    sankeyData : sankeyDataReducer(state.sankeyData, action),
    stepperValue : stepperReducer(state.stepperValue, action),
    appsScale : appsScaleReducer(state.appsScale, action),
    columnChartHighlight : columnChartHighlightReducer(
      state.columnChartHighlight, action),
    tooltipShow : tooltipShowReducer(state.tooltipShow, action),
    tooltipContents : tooltipContentsReducer(state.tooltipContents, action)
  };
}
