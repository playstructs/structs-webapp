import {SUIFeature} from "./SUIFeature.js";

export class SUIInputStepper extends SUIFeature {

  /**
   * Ensure that the number is a number between the min or max value or the empty string.
   * Honors data-decimals attribute for fractional input.
   *
   * @param {string|number} value
   * @param {number} min
   * @param {number} max
   * @param {number} decimals
   * @return {number|string}
   */
  filterNumberInput(value, min, max, decimals = 0) {
    const str = String(value).trim();
    
    if (str === '' || str === '-') {
      return str;
    }

    if (decimals > 0) {
      // Allow decimal point and up to N decimal places
      const regex = new RegExp(`^-?\\d*(\\.\\d{0,${decimals}})?$`);
      if (!regex.test(str)) {
        // Strip invalid characters
        const match = str.match(new RegExp(`^(-?\\d*(?:\\.\\d{0,${decimals}})?)`));
        return match ? match[1] : '';
      }
      const num = parseFloat(str);
      if (isNaN(num)) {
        return '';
      }
      if (num < min) return String(min);
      if (num > max) return String(max);
      return str;
    } else {
      // Integer only
      let cleanValue = str.replace(/[^0-9-]/g, '');
      if (cleanValue === '' || cleanValue === '-') {
        return '';
      }
      let num = parseInt(cleanValue, 10);
      if (isNaN(num)) {
        return '';
      }
      num = Math.max(num, min);
      num = Math.min(num, max);
      return String(num);
    }
  }

  /**
   * Initialize all input steppers on the page.
   */
  autoInitAll() {
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
        const decimals = parseInt(inputStepper.dataset.decimals || '0', 10);
        inputStepper.value = this.filterNumberInput(inputStepper.value, inputStepper.min, inputStepper.max, decimals);
        enableDisableButtons();
      }.bind(this));

      enableDisableButtons();
    });
  }
}
