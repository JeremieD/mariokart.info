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

function delay(fn) { state.inspectorTimeout = setTimeout(fn, 500); }

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


/*---------------------------------------*/
/*              SHARED VIEW              */
/*---------------------------------------*/

function drawMenu() {
  V.menu.dialog.inert = !state.menuOpened;
  V.menu.open.classList.toggle("open", state.menuOpened);
}

function drawFormulaHelpDialog() {
  if (state.openedDialog !== "formula-help") {
    V.formula.helpDialog.inert = true;
    V.formula.helpDialog.close();
    return;
  }
  V.formula.helpDialog.inert = false;
  if (V.formula.helpDialog.open) return;
  V.formula.helpDialog.showModal();
}

function drawHelpDialog() {
  if (state.openedDialog !== "help") {
    V.help.dialog.inert = true;
    V.help.dialog.close();
    return;
  }
  V.help.dialog.inert = false;
  if (V.help.dialog.open) return;
  V.help.dialog.showModal();
}

function drawCreditsDialog() {
  if (state.openedDialog !== "credits") {
    V.credits.dialog.inert = true;
    V.credits.dialog.close();
    return;
  }
  V.credits.dialog.inert = false;
  if (V.credits.dialog.open) return;
  V.credits.dialog.showModal();
}

function drawChangelogDialog() {
  if (state.openedDialog !== "changelog") {
    V.changelog.dialog.inert = true;
    V.changelog.dialog.close();
    return;
  }
  V.changelog.dialog.inert = false;
  if (V.changelog.dialog.open) return;
  V.changelog.dialog.showModal();
}

function drawShareNotice() {
  Tooltip.draw("Link copied to clipboard.", { el: V.combo.share, pos: "bottom" });
}

function drawMeterValues(t) {
  // Anim duration is 150ms, slightly shorter than meter animation
  V.combo.meterValuesAnim.start ??= t;
  const completion = Math.max(Math.min((t - V.combo.meterValuesAnim.start) / 150, 1), 0);
  const numberFormatter = new Intl.NumberFormat("en", getStatLocaleOptions());

  for (const stat of realStats) {
    if (state.settings.showMeterValues) {
      const delta = V.combo[stat].value - V.combo[stat].prevValue;
      const interpolatedValue = Math.round(V.combo[stat].prevValue + delta * completion);
      if (V.combo[stat].animValue === interpolatedValue) continue; // Skip if identical
      const displayValue = numberFormatter.format(scaleStat(interpolatedValue));
      V.combo[stat].output.innerText = displayValue;
      V.combo[stat].animValue = interpolatedValue;
    } else {
      V.combo[stat].output.innerText = "";
    }
  }

  if (completion < 1 && state.settings.showMeterValues) V.combo.meterValuesAnim.frameRequestID = requestAnimationFrame(drawMeterValues);
}

function drawDominantCombos() {
  state.selectedSlot.dominant.then(data => {
    V.dominant.count.innerText = data.length;
    if (state.selectedTab !== "dominant") return;
    V.similar.rows.innerHTML = "";
    V.custom.rows.innerHTML  = "";
    drawComboTable(V.dominant.rows, data.combos);
  });
}

function drawSimilarCombos() {
  state.selectedSlot.similar.then(data => {
    V.similar.count.innerText = data.length;
    if (state.selectedTab !== "similar") return;
    V.dominant.rows.innerHTML = "";
    V.custom.rows.innerHTML   = "";
    drawComboTable(V.similar.rows, data.combos);
  });
}

function drawCustomCombos() {
  state.selectedSlot.custom.then(data => {
    V.custom.count.innerText = data.length;
    if (state.selectedTab !== "search") return;
    V.dominant.rows.innerHTML = "";
    V.similar.rows.innerHTML  = "";
    V.custom.formula.innerHTML = formatFormula(state.formula);
    drawComboTable(V.custom.rows, data.combos);
  });
}

// TODO: Find a way to pass the limit from listCombos.
function drawComboTable(container, combos, limit = 50) {
  container.innerHTML = "";

  if (combos.length === 0) {
    container.classList.add("empty");
    const para = document.createElement("p");
    para.innerText = "No combos found.";
    container.append(para);
    return;
  }
  container.classList.remove("empty");

  for (const combo of combos.slice(0, limit)) {
    const li = document.createElement("li");
    const top = document.createElement("div");

    const comboDisplay = newComboDisplay(combo, false);

    const buttonsDisplay = document.createElement("div");
    buttonsDisplay.classList.add("button-group", "radio");
    const loadInA = document.createElement("button");
    const loadInB = document.createElement("button");
    loadInA.innerText = "→A";
    loadInB.innerText = "→B";
    loadInA.title = "Load this combo into slot A.";
    loadInB.title = "Load this combo into slot B.";
    loadInA.classList.toggle("primary", state.selectedSlotID === "A");
    loadInB.classList.toggle("primary", state.selectedSlotID === "B");
    loadInA.addEventListener("click", () => { setCombo(combo, "A"); }, { passive: true });
    loadInB.addEventListener("click", () => { setCombo(combo, "B"); }, { passive: true });
    buttonsDisplay.append(loadInA, loadInB);

    top.append(comboDisplay, buttonsDisplay);

    const statsDisplay = document.createElement("div");
    statsDisplay.classList.add("stat-diffs");
    for (let i = 0; i < realStatCount; i++) {
      const stat = stats[i];
      const diff = combo.diffs[i];
      if (diff === 0) continue;
      const statDiff = document.createElement("div");
      const label = document.createElement("label");
      label.innerText = S("statsAbbr", stat);
      label.title = S("stats", stat);
      const value = document.createElement("output");
      if (diff > 0) value.classList.add("positive");
      if (diff < 0) value.classList.add("negative");
      value.innerText = formatStatDiff(scaleStatAbs(diff));
      statDiff.append(label, value);
      statsDisplay.append(statDiff);
    }
    if (statsDisplay.children.length === 0) {
      const statDiff = document.createElement("div");
      const label = document.createElement("label");
      label.innerText = "No change";
      statDiff.append(label);
      statsDisplay.append(statDiff);
    }

    li.append(top, statsDisplay);
    container.append(li);
  }

  if (combos.length > limit) {
    const para = document.createElement("p");
    para.innerHTML = "Showing top " + limit + " matches.<br>Try another formula to see more.";
    container.append(para);
  }
}

function formatStatDiff(x) {
  let s = Math.abs(x).toString();
  if (x !== 0 && s[0] === "0") s = s.substring(1);
  if (x >= 0) { s = "+" + s; }
  else { s = "−" + s; }
  return s;
}

// Update rest of the widget according to the numeric input.
function drawFactorWidget(stat) {
  const input = V.formula[stat].factor;
  const slider = V.formula[stat].slider;
  const mode = V.formula[stat].mode;
  const value = input.value;
  slider.classList.remove("positive", "negative");
  mode.classList.remove("positive", "negative");
  if (value > 0) {
    slider.classList.add("positive");
    mode.classList.add("positive");
    mode.innerText = "Maximize";
  } else if (value < 0) {
    slider.classList.add("negative");
    mode.classList.add("negative");
    mode.innerText = "Minimize";
  } else {
    mode.innerText = "Ignore";
  }
}

function validateBounds(stat) {
  const i = statIndex[stat];
  const min = state.workingFormula.min[i];
  const max = state.workingFormula.max[i];
  const invalidBounds = max < min;
  V.formula[stat].min.classList.toggle("invalid", invalidBounds);
  V.formula[stat].max.classList.toggle("invalid", invalidBounds);
}

function drawCollapses() {
  const formula = state.workingFormula;
  for (const stat of [ "spd", "hnd" ]) {
    const container = V.formula[stat].collapse;
    const chevron = container.children[0];
    const tabOn = container.children[1];
    const tabOff = container.children[2];
    const isOn = formula.unified[stat];
    chevron.classList.toggle("rotated", !isOn);
    tabOn.classList.toggle("selected", isOn);
    tabOn.toggleAttribute("inert", !isOn);
    tabOff.toggleAttribute("inert", isOn);
    tabOff.classList.toggle("selected", !isOn);
    const height = (isOn ? tabOn : tabOff).getBoundingClientRect().height;
    container.style.height = height + "px";
  }
}

function drawPopover(el) {
  // TODO: Make this popover system not jank.
  //       State variables feel overkill but would be cleaner.
  el.setAttribute("open", "");
  el.removeAttribute("inert");
  el.classList.remove("left", "right");
  const rect = el.getBoundingClientRect();
  el.classList.toggle("left", rect.left - 12 < 0);
  el.classList.toggle("right", rect.right + 12 > innerWidth);
}
function closePopover(el) {
  el.removeAttribute("open");
  el.setAttribute("inert", "");
}

function drawFavoritesDialog() {
  if (state.openedDialog !== "favorites") {
    V.favorites.dialog.inert = true;
    V.favorites.dialog.close();
    return;
  }

  V.favorites.list.innerHTML = "";

  if (state.settings.allowCookies) {
    if (state.favorites.length === 0) {
      V.favorites.list.classList.add("empty");
      const para = document.createElement("p");
      para.innerText = "No favourite combos.";
      V.favorites.list.append(para);
    } else {
      V.favorites.list.classList.remove("empty");
    }

    for (const fav of state.favorites) {
      const combo = fav.combo;

      const li = document.createElement("li");
      li.id = combo.code;
      const header = document.createElement("div");
      const comboDisplay = newComboDisplay(combo);

      const name = document.createElement("input");
      name.classList.add("inline");
      name.type = "text";
      name.value = fav.name;
      name.placeholder = combo.name;
      name.autocapitalize = true;
      name.autocomplete = false;
      name.spellcheck = false;
      name.addEventListener("change", e => {
        e.target.value = e.target.value.trim();
        if (e.target.value === "") e.target.value = combo.name;
        nameFavorite(combo, e.target.value);
      }, { passive: true });

      const buttonsDisplay = document.createElement("div");
      buttonsDisplay.classList.add("button-group");

      const remove = document.createElement("button");
      remove.title = "Remove this combo from your favourites.";
      remove.append(new JDIcon("heart-slash"));
      remove.classList.add("square", "danger", "selected");
      remove.addEventListener("click", () => { unfavorite(combo); }, { passive: true });

      const loadButtons = document.createElement("div");
      loadButtons.classList.add("button-group", "radio");
      const loadInA = document.createElement("button");
      const loadInB = document.createElement("button");
      loadInA.innerText = "→A";
      loadInB.innerText = "→B";
      loadInA.title = "Load this combo into slot A.";
      loadInB.title = "Load this combo into slot B.";
      loadInA.classList.toggle("primary", state.selectedSlotID === "A");
      loadInB.classList.toggle("primary", state.selectedSlotID === "B");
      loadInA.addEventListener("click", () => {
        setCombo(combo, "A");
        Tooltip.draw("Loaded into slot A.", { el: loadInA, pos: "bottom", align: "right", dialog: V.favorites.dialog });
      }, { passive: true });
      loadInB.addEventListener("click", () => {
        setCombo(combo, "B");
        Tooltip.draw("Loaded into slot B.", { el: loadInB, pos: "bottom", align: "right", dialog: V.favorites.dialog });
      }, { passive: true });
      loadButtons.append(loadInA, loadInB);

      buttonsDisplay.append(remove, loadButtons);

      header.append(name, buttonsDisplay);

      li.append(header, comboDisplay);
      V.favorites.list.append(li);
    }
  } else {
    const para = document.createElement("p");
    para.innerHTML = "Enable <em>cookies</em> in settings to use the favourites feature.<br>";
    const link = document.createElement("a");
    link.innerText = "Take me there!";
    link.tabIndex = "0";
    para.append(link);
    link.addEventListener("click", () => {
      closeFavoritesDialog();
      openSettingsDialog();
    }, { passive: true });
    V.favorites.list.append(para);
  }

  V.favorites.dialog.inert = false;
  if (V.favorites.dialog.open) return;
  V.favorites.dialog.showModal();
}
function removeFavorite(combo) {
  const li = document.getElementById(combo.code);
  if (li === null) return;
  li.style.height = li.offsetHeight + "px";
  forceLayoutCalculation(li);
  li.classList.add("remove");
  li.addEventListener("transitionend", () => {
    li.remove();
    if (V.favorites.list.children.length === 0) {
      drawFavoritesDialog();
    }
  }, { passive: true });
}
function drawUnfavoriteConfirmDialog(combo) {
  V.favorites.unfavoriteDialog.inert = false;
  V.favorites.unfavoriteMessage.innerHTML = "Are you sure you want to remove <em>"
                                          + getCustomName(combo)
                                          + "</em> from your favourites?";

  const previousDialog = state.openedDialog;
  state.openedDialog = "unfavorite-confirm";
  V.favorites.unfavoriteDialog.showModal();

  const abort = new AbortController();

  function confirm() {
    abort.abort();
    V.favorites.unfavoriteDialog.close();
    state.openedDialog = previousDialog;
    unfavorite(combo, true);
  }
  function cancel() {
    abort.abort();
    V.favorites.unfavoriteDialog.close();
    state.openedDialog = previousDialog;
  }

  V.favorites.unfavoriteConfirmButton.addEventListener("click", confirm, { signal: abort.signal, passive: true });
  V.favorites.unfavoriteCancelButton.addEventListener("click", cancel, { signal: abort.signal, passive: true });
  addEventListener("keydown", e => {
    if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) return;
    if (e.key === "Escape") cancel();
  }, { signal: abort.signal, passive: true });
}

function initTireDialog() {
  state.parts.then(({tires}) => {
    for (const tire of tires) {
      const id = tire.id;
      const button = newPartButton("tires", id, "tire-" + id);
      button.addEventListener("click", () => { setTire(id); }, { passive: true });
      button.addEventListener("mouseenter", () => { drawTireTitle(id); }, { passive: true });
      button.addEventListener("mouseleave", () => { delay(() => drawTireTitle(state.tire)) }, { passive: true });
      button.addEventListener("focus", () => { drawTireTitle(id); }, { passive: true });
      button.addEventListener("blur", () => { drawTireTitle(state.tire); }, { passive: true });
      V.tires.grid.append(button);
    }
  });
}
function drawTireDialog() {
  if (state.openedDialog !== "tire") {
    V.tires.dialog.inert = true;
    V.tires.dialog.close();
    enableScroll(document.documentElement);
    return;
  }
  state.parts.then(({tires}) => {
    for (const tire of tires) {
      const id = tire.id;
      const button = document.getElementById("tire-" + id);
      const name = S("tires", id);
      button.querySelector("img").alt = name;
      button.title = name;
      button.classList.toggle("selected", id === state.tire);
      button.classList.toggle("highlight", tire.group === state.selectedSlot.combo.parts.tire.group);
    }
  });
  V.tires.title.innerText = S("tires", state.tire);
  drawTireLock();
  disableScroll(document.documentElement);
  V.tires.dialog.inert = false;
  if (!V.tires.dialog.open) V.tires.dialog.showModal();
}

function initGliderDialog() {
  state.parts.then(({gliders}) => {
    for (const glider of gliders) {
      const id = glider.id;
      const button = newPartButton("gliders", id, "glider-" + id);
      button.addEventListener("click", () => { setGlider(id); }, { passive: true });
      button.addEventListener("mouseenter", () => { drawGliderTitle(id); }, { passive: true });
      button.addEventListener("mouseleave", () => { delay(() => drawGliderTitle(state.glider)) }, { passive: true });
      button.addEventListener("focus", () => { drawGliderTitle(id); }, { passive: true });
      button.addEventListener("blur", () => { drawGliderTitle(state.glider); }, { passive: true });
      V.gliders.grid.append(button);
    }
  });
}
function drawGliderDialog() {
  if (state.openedDialog !== "glider") {
    V.gliders.dialog.inert = true;
    V.gliders.dialog.close();
    enableScroll(document.documentElement);
    return;
  }
  state.parts.then(data => {
    const gliders = data.gliders;
    for (const glider of gliders) {
      const id = glider.id;
      const button = document.getElementById("glider-" + id);
      const name = S("gliders", id);
      button.querySelector("img").alt = name;
      button.title = name;
      button.classList.toggle("selected", id === state.glider);
      button.classList.toggle("highlight", glider.group === state.selectedSlot.combo.parts.glider.group);
    }
  });
  V.gliders.title.innerText = S("gliders", state.glider);
  drawGliderLock();
  disableScroll(document.documentElement);
  V.gliders.dialog.inert = false;
  if (!V.gliders.dialog.open) V.gliders.dialog.showModal();
}

function drawDriverLock() {
  V.drivers.lock.classList.toggle("selected", state.locks.driver);
  V.drivers.lockLabel.innerText = state.locks.driver ? "Unlock Driver" : "Lock Driver";
}
function drawBodyLock() {
  V.bodies.lock.classList.toggle("selected", state.locks.body);
  V.bodies.lockLabel.innerText = state.locks.body ? "Unlock Body" : "Lock Body";
}
function drawTireLock() {
  V.tires.lock.classList.toggle("selected", state.locks.tire);
  V.tires.lockLabel.innerText = state.locks.tire ? "Unlock Tire" : "Lock Tire";
}
function drawGliderLock() {
  V.gliders.lock.classList.toggle("selected", state.locks.glider);
  V.gliders.lockLabel.innerText = state.locks.glider ? "Unlock Glider" : "Lock Glider";
}
