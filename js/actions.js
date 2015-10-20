export const UPDATE_DATA = 'UPDATE_DATA';
export const UPDATE_STEPPER_VALUE = 'UPDATE_STEPPER_VALUE';

export function updateData(data) {
  return {
    type : UPDATE_DATA,
    data
  }
}

export function updateStepperValue(value) {
  return {
    type : UPDATE_STEPPER_VALUE,
    value
  };
}
