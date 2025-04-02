"use strict";

const V = { menu: {} };

whenDOMReady(() => {
  V.menu.dialog = document.getElementById("menu");
  V.menu.open = document.getElementById("menu-open");

  V.menu.open.addEventListener("click", e => {
    if (isOutside(V.menu.dialog, e)) toggleMenu();
  }, { passive: true });
  addEventListener("pointerdown", e => {
    if (isOutside(V.menu.open, e) && isOutside(V.menu.dialog, e)) closeMenu();
  }, { passive: true });
  addEventListener("focusin", () => {
    if (!V.menu.open.contains(document.activeElement)) closeMenu();
  }, { passive: true });
});

function drawMenu() {
  V.menu.dialog.inert = !state.menuOpened;
  V.menu.open.classList.toggle("open", state.menuOpened);
}

function isOutside(el, e) {
  const rect = el.getBoundingClientRect();
  // If the click event was fired with a keyboard press, e.detail will be 0.
  if (e.detail == 0) {
    // In that case, clientX and Y will be 0, so we use the target element's position instead.
    const target = e.target.getBoundingClientRect();
    return target.top < rect.top   || target.bottom > rect.bottom
        || target.left < rect.left || target.right > rect.right;
  }
  return e.clientY < rect.top  || e.clientY > rect.bottom
      || e.clientX < rect.left || e.clientX > rect.right;
}
