/**
 * Enables a submit button whenever its text field has text. Listens to
 * `input`, which fires for typing, pasting with the mouse, autofill, cut and
 * drag-and-drop, and keeps `keyup` for browsers that skip `input` on autofill.
 * Also enables it at bind time if a value was filled in before the page wired up.
 *
 * @param {HTMLInputElement} input
 * @param {function(): HTMLButtonElement|null} getButton
 */
export function bindSubmitButtonToInput(input, getButton) {
  const sync = () => {
    const submitBtn = getButton();
    if (!submitBtn) return;

    if (input.value.length > 0 && submitBtn.classList.contains('sui-mod-disabled')) {
      submitBtn.disabled = false;
      submitBtn.classList.remove('sui-mod-disabled');
      submitBtn.classList.add('sui-mod-primary');
    } else if (input.value.length === 0 && submitBtn.classList.contains('sui-mod-primary')) {
      submitBtn.disabled = true;
      submitBtn.classList.remove('sui-mod-primary');
      submitBtn.classList.add('sui-mod-disabled');
    }
  };

  input.addEventListener('input', sync);
  input.addEventListener('keyup', sync);
  // Only to enable: an empty field leaves the button as the page drew it.
  if (input.value.length > 0) sync();
}
