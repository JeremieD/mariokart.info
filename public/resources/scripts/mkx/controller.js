"use strict";

const state = { menuOpened: false };

function openMenu() {
  state.menuOpened = true;
  drawMenu();
}
function closeMenu() {
  state.menuOpened = false;
  drawMenu();
}
function toggleMenu() {
  state.menuOpened = !state.menuOpened;
  drawMenu();
}
