import {SUIFeature} from "./SUIFeature.js";

export class SUIInputStepper extends SUIFeature {

  /**
   * Ensure that the number is a number between the min or max value or the empty string.
   *
   * @param {string|number} value
   * @param {number} min
   * @param {number} max
   * @return {number|string}
   */
  filterNumberInput(value, min, max) {
    let cleanValue = `${value}`.replace(/^[^0-9]*$/, '');

    if (cleanValue === '') {
      return cleanValue;
    }

    cleanValue = parseInt(cleanValue);
    cleanValue = Math.max(cleanValue, min);
    cleanValue = Math.min(cleanValue, max);

    return cleanValue;
  }

  /**
   * Initialize all input steppers on the page.
   */
  init() {
    let inputSteppers = document.querySelectorAll('.sui-input-stepper input[type=number]');

    if (inputSteppers.length === 0) {
      return;
    }

    inputSteppers.forEach(inputStepper => {
      const decreaseBtn = inputStepper.previousElementSibling;
      const increaseBtn = inputStepper.nextElementSibling;

      const enableDisableButtons = () => {
        decreaseBtn.disabled = inputStepper.disabled || (inputStepper.value <= inputStepper.min);
        increaseBtn.disabled = inputStepper.disabled || (inputStepper.value >= inputStepper.max);
      };

      decreaseBtn.addEventListener('click', function(event) {
        event.preventDefault();
        inputStepper.stepDown();
        enableDisableButtons();
      });

      increaseBtn.addEventListener('click', function(event) {
        event.preventDefault();
        inputStepper.stepUp();
        enableDisableButtons();
      });

      inputStepper.addEventListener('input', function() {
        inputStepper.value = this.filterNumberInput(inputStepper.value, inputStepper.min, inputStepper.max);
        enableDisableButtons();
      }.bind(this));

      enableDisableButtons();
    });
  }
}
