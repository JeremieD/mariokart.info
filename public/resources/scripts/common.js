var isMobile = matchMedia("(hover: none)").matches;

// Calls a function once the DOM has loaded.
// Also calls the function if the DOM has *already* loaded.
function whenDOMReady(callback, options = { once: true, passive: true }) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback, options);
  } else {
    callback();
  }
}

var viewLoaded = false;
function whenViewReady(callback, options = { once: true, passive: true }) {
  if (!viewLoaded) {
    addEventListener("viewLoaded", callback, options);
  } else {
    callback();
  }
}

/**
 * Async wrapper for XMLHttpRequest.
 * @param {string} url - The requested URL.
 * @returns {Promise<string>} The promised response body.
 */
async function httpGet(url) {
  return new Promise(function(resolve, reject) {
    const cacheHit = httpGetCache[url];
    if (cacheHit && Date.now() - cacheHit.time < 86400000) { // 1 day
      return resolve(httpGetCache[url].data);
    }
    const httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = () => {
      if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
          try {
            httpGetCache[url] = {
              time: Date.now(),
              data: httpRequest.responseText
            };
            resolve(httpRequest.responseText);
          } catch (e) {
            console.error(e);
            reject(e);
          }
        } else {
          reject(httpRequest.status);
      } }
    };
    httpRequest.open("GET", url);
    httpRequest.send();
  });
}
// { url: { time, data }, ... }
const httpGetCache = {};

window.structuredClone ??= obj => {
  return JSON.parse(JSON.stringify(obj));
};

// Returns whether the click event *e* is inside element *el*.
function isOutside(el, e) {
  const rect = el.getBoundingClientRect();
  // If the click event was fired with a keyboard press, e.detail will be 0.
  if (e.detail === 0) {
    // In that case, clientX and Y will be 0, so we use the target element's position instead.
    const target = e.target.getBoundingClientRect();
    return target.top < rect.top   || target.bottom > rect.bottom
        || target.left < rect.left || target.right > rect.right;
  }
  return e.clientY < rect.top  || e.clientY > rect.bottom
      || e.clientX < rect.left || e.clientX > rect.right;
}

function disableScroll(el) { el.classList.add("no-scroll"); }
function enableScroll(el)  { el.classList.remove("no-scroll"); }

function blockAnimation(el) {
  el.classList.add("no-animation");
  setTimeout(() => { el.classList.remove("no-animation"); }, 500);
}

function parseValue(v, defaultV = 0) {
  v = parseFloat(v);
  if (isNaN(v)) return parseFloat(defaultV);
  return v;
}

// Hack to force layout recalculation for an element.
const forceLayoutCalculation = el => el.getClientRects();


/*---------------------------------------*/
/*           SHARED CONTROLLER           */
/*---------------------------------------*/

// Service Worker Wrapper with async .post();
class StatsWorker extends Worker {
  constructor(src) {
    super(src);
    this.exchanges = 0;
    this.post = (...args) => {
      return new Promise((resolve, reject) => {
        const exchangeID = this.exchanges++;
        this.addEventListener("message", e => {
          if (e.data[0] === exchangeID) {
            const data = e.data[1];
            if (typeof data === "string" && data.startsWith("Error: ")) {
              console.error(data);
              reject(data);
            } else {
              resolve(data);
          } }
        }, { passive: true });
        this.postMessage([exchangeID, args]);
      }).catch(console.error);
    };
  }
}

function initController() {
  readState();
  getAvailableParts();
}

function getAvailableParts() {
  state.parts = Stats.post("getAvailableParts", state.settings.availableParts);
}

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

function openHelpDialog() {
  state.openedDialog = "help";
  drawHelpDialog();
}
function closeHelpDialog() {
  state.openedDialog = "";
  drawHelpDialog();
}

function openSettingsDialog() {
  state.openedDialog = "settings";
  drawSettingsDialog();
}
function closeSettingsDialog() {
  state.openedDialog = "";
  drawSettingsDialog();
}

function openChangelogDialog() {
  state.openedDialog = "changelog";
  drawChangelogDialog();
}
function closeChangelogDialog() {
  state.openedDialog = "";
  drawChangelogDialog();
}

function openCreditsDialog() {
  state.openedDialog = "credits";
  drawCreditsDialog();
}
function closeCreditsDialog() {
  state.openedDialog = "";
  drawCreditsDialog();
}

function openFavoritesDialog() {
  state.openedDialog = "favorites";
  drawFavoritesDialog();
}
function closeFavoritesDialog() {
  state.openedDialog = "";
  drawFavoritesDialog();
}

function openFormulaDialog() {
  state.openedDialog = "formula";
  drawFormulaDialog();
}
function openFormulaHelpDialog() {
  state.openedDialog = "formula-help";
  drawFormulaHelpDialog();
}
function closeFormulaHelpDialog() {
  state.openedDialog = "formula";
  drawFormulaHelpDialog();
}

function openDriverDialog() {
  state.openedDialog = "driver";
  drawDriverDialog();
}
function closeDriverDialog() {
  state.openedDialog = "";
  drawDriverDialog();
  drawCurrentCombo();
  drawDominantCombos();
  drawSimilarCombos();
  drawCustomCombos();
}

function openBodyDialog() {
  state.openedDialog = "body";
  drawBodyDialog();
}
function closeBodyDialog() {
  state.openedDialog = "";
  drawBodyDialog();
  drawCurrentCombo();
  drawDominantCombos();
  drawSimilarCombos();
  drawCustomCombos();
}

function openTireDialog() {
  state.openedDialog = "tire";
  drawTireDialog();
}
function closeTireDialog() {
  state.openedDialog = "";
  drawTireDialog();
  drawCurrentCombo();
  drawDominantCombos();
  drawSimilarCombos();
  drawCustomCombos();
}

function openGliderDialog() {
  state.openedDialog = "glider";
  drawGliderDialog();
}
function closeGliderDialog() {
  state.openedDialog = "";
  drawGliderDialog();
  drawCurrentCombo();
  drawDominantCombos();
  drawSimilarCombos();
  drawCustomCombos();
}

function share() {
  const link = location.origin + location.pathname + "?A=" + state.selectedSlot.combo.code;
  navigator.clipboard.writeText(link).then(drawShareNotice);
}

function selectSlot(slot) {
  if (state.openedDialog !== "") return;
  state.selectedSlotID = slot;
  updateURLParams();
  commitState();
  drawCurrentCombo();
  drawDominantCombos();
  drawSimilarCombos();
  drawCustomCombos();
}
function toggleSelectedCombo() {
  if (state.selectedSlotID === "A") {
    selectSlot("A");
  } else {
    selectSlot("B");
  }
}

function toggleDriverLock(draw = false) {
  state.locks.driver = !state.locks.driver;
  updateRelatedCombos("A");
  updateRelatedCombos("B");
  drawDriverLock();
  if (draw === true) {
    drawCurrentCombo();
    drawDominantCombos();
    drawSimilarCombos();
    drawCustomCombos();
  }
  commitState();
}
function toggleBodyLock(draw = false) {
  state.locks.body = !state.locks.body;
  updateRelatedCombos("A");
  updateRelatedCombos("B");
  drawBodyLock();
  if (draw === true) {
    drawCurrentCombo();
    drawDominantCombos();
    drawSimilarCombos();
    drawCustomCombos();
  }
  commitState();
}
function toggleTireLock(draw = false) {
  state.locks.tire = !state.locks.tire;
  updateRelatedCombos("A");
  updateRelatedCombos("B");
  drawTireLock();
  if (draw === true) {
    drawCurrentCombo();
    drawDominantCombos();
    drawSimilarCombos();
    drawCustomCombos();
  }
  commitState();
}
function toggleGliderLock(draw = false) {
  state.locks.glider = !state.locks.glider;
  updateRelatedCombos("A");
  updateRelatedCombos("B");
  drawGliderLock();
  if (draw === true) {
    drawCurrentCombo();
    drawDominantCombos();
    drawSimilarCombos();
    drawCustomCombos();
  }
  commitState();
}

function commitFormula() {
  state.formula = structuredClone(state.workingFormula);
  state.selectedSlot.custom = getCustomCombos(state.selectedSlot.combo);
  drawCustomCombos();
  state.offSlot.custom = getCustomCombos(state.offSlot.combo);
  state.openedDialog = "";
  drawFormulaDialog();
  commitState();
}
function revertFormula() {
  state.workingFormula = structuredClone(state.formula);
  state.openedDialog = "";
  drawFormulaDialog();
}
function setDefaultFormula() {
  state.workingFormula = structuredClone(defaultFormula);
  drawFormulaDialog();
}
function setBlankFormula() {
  state.workingFormula = structuredClone(blankFormula);
  drawFormulaDialog();
}

function toggleSpdMode() {
  state.workingFormula.unified.spd = !state.workingFormula.unified.spd;
  drawCollapses();
}
function toggleHndMode() {
  state.workingFormula.unified.hnd = !state.workingFormula.unified.hnd;
  drawCollapses();
}

function toggleFactorSign(statIndex, strict = false) {
  if (state.workingFormula.factors[statIndex] === 0 && !strict) {
    state.workingFormula.factors[statIndex] = 1;
  } else {
    state.workingFormula.factors[statIndex] *= -1;
  }
  drawFormulaDialog();
}
function resetFactor(statIndex) {
  state.workingFormula.factors[statIndex] = 0;
  drawFormulaDialog();
}

function isFavorite(combo) {
  for (const fav of state.favorites) {
    if (combo.code === fav.combo.code) return true;
  }
  return false;
}
function favoriteCombo() {
  if (state.selectedSlot.isFavorite) return;
  state.selectedSlot.isFavorite = true;
  if (state.offSlot.combo.code === state.selectedSlot.combo.code) {
    state.offSlot.isFavorite = true;
  }
  const newFav = {
    name: state.selectedSlot.combo.name,
    combo: state.selectedSlot.combo
  };
  state.favorites.push(newFav);
  drawCurrentCombo();
  commitState();
}
function unfavorite(combo, bypass = false) {
  if (!isFavorite(combo)) throw combo.name + " is not in favorites";
  if (!bypass && getCustomName(combo) !== combo.name) {
    drawUnfavoriteConfirmDialog(combo);
    return;
  }
  state.favorites = state.favorites.filter(c => c.combo.code !== combo.code);
  if (combo.code === state.selectedSlot.combo.code) state.selectedSlot.isFavorite = false;
  if (combo.code === state.offSlot.combo.code) state.offSlot.isFavorite = false;
  removeFavorite(combo);
  drawCurrentCombo();
  commitState();
}
function getCustomName(combo) {
  for (const fav of state.favorites) {
    if (fav.combo.code === combo.code) return fav.name;
  }
  return undefined;
}
function nameFavorite(combo, newName) {
  for (const fav of state.favorites) {
    if (fav.combo.code === combo.code) {
      fav.name = newName;
      if (state.selectedSlot.combo.code === combo.code) {
        drawPageTitle();
      }
      commitState();
      break;
    }
  }
}
function serializeFavorites(obj) {
  const serial = [];
  for (const fav of obj) {
    serial.push({
      name: fav.name,
      combo: fav.combo.code
    });
  }
  return serial;
}
function deserializeFavorites(serial) {
  if (serial === undefined) { return []; }
  const obj = [];
  for (const fav of serial) {
    Stats.post("getCombo", fav.combo).then(combo => {
      obj.push({
        name: fav.name,
        combo: combo
      });
    });
  }
  return obj;
}

function changeLocale(locl) {
  state.settings.locale = locl;
  drawCurrentCombo();
  drawDominantCombos();
  drawSimilarCombos();
  drawCustomCombos();
  commitState();
}

function changeStatScale(mode) {
  state.settings.statScale = mode;
  drawCurrentCombo();
  drawDominantCombos();
  drawSimilarCombos();
  drawCustomCombos();
  commitState();
}

function toggleMeterValues() {
  state.settings.showMeterValues = !state.settings.showMeterValues;
  drawSettingsDialog();
  drawCurrentCombo();
  commitState();
}
