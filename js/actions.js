export const UPDATE_SOURCE_DATA = 'UPDATE_SOURCE_DATA';
export const UPDATE_COUNTRY_DATA = 'UPDATE_COUNTRY_DATA';
export const UPDATE_APPS_DATA = 'UPDATE_APPS_DATA';
export const UPDATE_SANKEY_DATA = 'UPDATE_SANKEY_DATA';
export const UPDATE_STEPPER_VALUE = 'UPDATE_STEPPER_VALUE';
export const CHANGE_TOOLTIP = 'CHANGE_TOOLTIP';
export const UPDATE_COLUMN_CHART_HIGHLIGHT = 'UPDATE_COLUMN_CHART_HIGHLIGHT';

export function updateSourceData(data) {
  return {
    type : UPDATE_SOURCE_DATA,
    data
  };
}
export function updateCountryData(data) {
  return {
    type : UPDATE_COUNTRY_DATA,
    data
  };
}
export function updateAppsData(data) {
  return {
    type : UPDATE_APPS_DATA,
    data
  };
}
export function updateSankeyData(data) {
  return {
    type : UPDATE_SANKEY_DATA,
    data
  };
}
export function updateColumnChartHighlight(data) {
  return {
    type : UPDATE_COLUMN_CHART_HIGHLIGHT,
    data
  };
}
export function clearColumnChartHighlight() {
  return {
    type : UPDATE_COLUMN_CHART_HIGHLIGHT
  }
}


export function updateStepperValue(value) {
  return {
    type : UPDATE_STEPPER_VALUE,
    value
  };
}


export function showTooltip(contents) {
  return {
    type : CHANGE_TOOLTIP,
    show : true,
    contents
  };
}
export function hideTooltip() {
  return {
    type : CHANGE_TOOLTIP,
    show : false
  };
}
