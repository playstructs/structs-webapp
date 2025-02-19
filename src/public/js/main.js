/* Fixes anchor behaviour with overflow scroll */
if(window.location.hash) {
  const anchor = document.getElementById(window.location.hash.substring(1));
  if (anchor) {
    anchor.scrollIntoView();
  }
}
