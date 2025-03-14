"use strict";
// Controller

const statIndex = {
  mtb: 0, spdGr: 1, spdAg: 2, spdWt: 3, spdAr: 4,  acc: 5,
  wgt: 6, hndGr: 7, hndAg: 8, hndWt: 9, hndAr: 10, trn: 11,
  size: 12, spd: 13, hnd: 14
};
const stats = [ "mtb", "spdGr", "spdAg", "spdWt", "spdAr", "acc",
                "wgt", "hndGr", "hndAg", "hndWt", "hndAr", "trn",
                "size", "spd", "hnd" ];
const blankFormula = {
  factors: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  min:     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  max:     [20,20,20,20,20,20,20,20,20,20,20,20,2,20,20],
  unified: { spd: true, hnd: true },
  excludeKarts: false, excludeATVs: false,
  excludeBikes: false, excludeSportBikes: false
};
const defaultFormula = {
  factors: [8, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0,16, 0],
  min:     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  max:     [20,20,20,20,20,20,20,20,20,20,20,20,2,20,20],
  unified: { spd: true, hnd: true },
  excludeKarts: false, excludeATVs: false,
  excludeBikes: false, excludeSportBikes: true
};
const state = {
  settings: {
    allowCookies: false,
    locale: "en-US",
    statScale: "display",
    showMeterValues: false },
  selectedSlotID: "A",
  slot: {
    A: {
      combo: {},
      isFavorite: false,
      dominant: [],
      similar: [],
      custom: [] },
    B: {
      combo: {},
      isFavorite: false,
      dominant: [],
      similar: [],
      custom: [] }
  },
  get selectedSlot() {
    switch (state.selectedSlotID) {
      case "A": return state.slot.A;
      case "B": return state.slot.B;
      default: throw "Error: Selected slot is “" + state.selectedSlotID + "”";
  } },
  get offSlot() {
    switch (state.selectedSlotID) {
      case "A": return state.slot.B;
      case "B": return state.slot.A;
      default: throw "Error: Selected slot is “" + state.selectedSlotID + "”";
  } },
  get driver() { return state.selectedSlot.combo.driverID; },
  get body() { return state.selectedSlot.combo.bodyID; },
  get tire() { return state.selectedSlot.combo.tireID; },
  get glider() { return state.selectedSlot.combo.gliderID; },
  locks: {
    driver: false,
    body: false,
    tire: false,
    glider: false },
  parts: {
    drivers: {},
    bodies: {},
    tires: {},
    gliders: {} },
  driverPrefs: {
    yoshi: "yoshi",
    shyguy: "shyguy",
    villager: "villagerM",
    mii: "miiM" },
  favorites: [],
  formula: structuredClone(defaultFormula),
  workingFormula: structuredClone(defaultFormula),
  formulaDialogScrollTop: 0,
  openedDialog: "",
  inspectorTimeout: 0,
  lastState: {
    aCode: "",
    bCode: ""
  }
};

const Stats = new Worker("/resources/scripts/mk8/stats-worker.js");
Stats.exchanges = 0;
Stats.post = (...args) => {
  return new Promise((resolve, reject) => {
    const exchangeID = Stats.exchanges++;
    Stats.addEventListener("message", e => {
      if (e.data[0] == exchangeID) {
        const data = e.data[1];
        if (typeof data == "string" && data.startsWith("Error: ")) {
          console.error(data);
          reject(data);
        } else {
          resolve(data);
      } }
    }, { passive: true });
    Stats.postMessage([exchangeID, args]);
  }).catch(console.error);
};

initController();

function setDriver(driver) {
  Stats.post("getCombo", driver, state.body, state.tire, state.glider)
  .then(setCombo);
  closeDriverDialog();
}
function setBody(body) {
  Stats.post("getCombo", state.driver, body, state.tire, state.glider)
  .then(setCombo);
  closeBodyDialog();
}
function setTire(tire) {
  Stats.post("getCombo", state.driver, state.body, tire, state.glider)
  .then(setCombo);
  closeTireDialog();
}
function setGlider(glider) {
  Stats.post("getCombo", state.driver, state.body, state.tire, glider)
  .then(setCombo);
  closeGliderDialog();
}

function setCombo(combo, slot, replaceURL = false) {
  if (slot == "A" && state.selectedSlotID == "B"
   || slot == "B" && state.selectedSlotID == "A") {
    state.offSlot.combo = combo;
    state.offSlot.isFavorite = isFavorite(combo);
    state.offSlot.dominant = getDominantCombos(combo);
    state.offSlot.similar = getSimilarCombos(combo);
    state.offSlot.custom = getCustomCombos(combo);
  } else {
    state.selectedSlot.combo = combo;
    state.selectedSlot.isFavorite = isFavorite(combo);
    for (const driverGroup of Object.keys(state.driverPrefs)) {
      if (state.driver.startsWith(driverGroup)) {
        state.driverPrefs[driverGroup] = state.driver;
    } }
    drawCurrentCombo();
    updateRelatedCombos(slot);
    drawDominantCombos();
    drawSimilarCombos();
    drawCustomCombos();
  }
  updateURLParams(replaceURL);
  commitState();
}

function updateRelatedCombos(slot) {
  if (slot == "A" && state.selectedSlotID == "B"
   || slot == "B" && state.selectedSlotID == "A") {
    state.offSlot.dominant = getDominantCombos(state.offSlot.combo);
    state.offSlot.similar = getSimilarCombos(state.offSlot.combo);
    state.offSlot.custom = getCustomCombos(state.offSlot.combo);
  } else {
    state.selectedSlot.dominant = getDominantCombos(state.selectedSlot.combo);
    state.selectedSlot.similar = getSimilarCombos(state.selectedSlot.combo);
    state.selectedSlot.custom = getCustomCombos(state.selectedSlot.combo);
  }
}

function getDominantCombos(combo) {
  const opts = {
    mustDiffer: true, sortBy: "diff",
    min: [
      combo.lvl[0],
      combo.lvl[1],
      combo.lvl[2],
      combo.lvl[3],
      combo.lvl[4],
      combo.lvl[5],
      combo.lvl[6],
      combo.lvl[7],
      combo.lvl[8],
      combo.lvl[9],
      combo.lvl[10],
      combo.lvl[11],
      combo.lvl[12]
    ],
    refCombo: combo,
    driverLock: state.locks.driver, bodyLock: state.locks.body,
    tireLock: state.locks.tire, gliderLock: state.locks.glider
  };
  return Stats.post("listCombos", opts);
}

function getSimilarCombos(combo) {
  const opts = {
    mustDiffer: true, maxAbsDiff: 12, minDiff: -4,
    refCombo: combo, sortBy: "similar",
    driverLock: state.locks.driver, bodyLock: state.locks.body,
    tireLock: state.locks.tire, gliderLock: state.locks.glider
  };
  return Stats.post("listCombos", opts);
}

function getCustomCombos(combo) {
  const opts = structuredClone(state.formula);
  opts.refCombo = combo;
  opts.sortBy = "score";
  opts.driverLock = state.locks.driver;
  opts.bodyLock = state.locks.body;
  opts.tireLock = state.locks.tire;
  opts.gliderLock = state.locks.glider;

  if (state.formula.unified.spd) {
    opts.factors[1] = 0; opts.max[1] = 20; opts.min[1] = 0;
    opts.factors[2] = 0; opts.max[2] = 20; opts.min[2] = 0;
    opts.factors[3] = 0; opts.max[3] = 20; opts.min[3] = 0;
    opts.factors[4] = 0; opts.max[4] = 20; opts.min[4] = 0;
  } else {
    opts.factors[14] = 0; opts.max[14] = 20; opts.min[14] = 0;
  }
  if (state.formula.unified.hnd) {
    opts.factors[7]  = 0; opts.max[7]  = 20; opts.min[7]  = 0;
    opts.factors[8]  = 0; opts.max[8]  = 20; opts.min[8]  = 0;
    opts.factors[9]  = 0; opts.max[9]  = 20; opts.min[9]  = 0;
    opts.factors[10] = 0; opts.max[10] = 20; opts.min[10] = 0;
  } else {
    opts.factors[15] = 0; opts.max[15] = 20; opts.min[15] = 0;
  }

  return Stats.post("listCombos", opts);
}

function randomCombo() {
  const locks = [
    state.locks.driver ? state.driver : undefined,
    state.locks.body   ? state.body : undefined,
    state.locks.tire   ? state.tire : undefined,
    state.locks.glider ? state.glider : undefined
  ];
  Stats.post("getRandomCombo", ...locks).then(setCombo);
}

function share() {
  const link = location.origin + location.pathname + "?A=" + state.selectedSlot.combo.code;
  navigator.clipboard.writeText(link).then(drawShareNotice);
}

function selectA() {
  if (state.openedDialog !== "") return;
  state.selectedSlotID = "A";
  updateURLParams();
  drawCurrentCombo();
  drawDominantCombos();
  drawSimilarCombos();
  drawCustomCombos();
}
function selectB() {
  if (state.openedDialog !== "") return;
  state.selectedSlotID = "B";
  updateURLParams();
  drawCurrentCombo();
  drawDominantCombos();
  drawSimilarCombos();
  drawCustomCombos();
}
function toggleSelectedCombo() {
  if (state.selectedSlotID === "A") {
    selectB();
  } else {
    selectA();
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

function isFavorite(combo) {
  for (const fav of state.favorites) {
    if (combo.code === fav.combo.code) return true;
  }
  return false;
}
function favoriteCombo() {
  if (state.selectedSlot.isFavorite) return;
  state.selectedSlot.isFavorite = true;
  if (state.offSlot.combo.code == state.selectedSlot.combo.code) {
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
function openFavoritesDialog() {
  state.openedDialog = "favorites";
  drawFavoritesDialog();
}
function closeFavoritesDialog() {
  state.openedDialog = "";
  drawFavoritesDialog();
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
  if (serial == undefined) { return []; }
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

function openFormulaDialog() {
  state.openedDialog = "formula";
  drawFormulaDialog();
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
  if (state.workingFormula.factors[statIndex] == 0 && !strict) {
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

function toggleIncludeKarts() {
  state.workingFormula.excludeKarts = !state.workingFormula.excludeKarts;
  drawFormulaDialog();
}
function toggleIncludeATVs() {
  state.workingFormula.excludeATVs = !state.workingFormula.excludeATVs;
  drawFormulaDialog();
}
function toggleIncludeBikes() {
  state.workingFormula.excludeBikes = !state.workingFormula.excludeBikes;
  drawFormulaDialog();
}
function toggleIncludeSportBikes() {
  state.workingFormula.excludeSportBikes = !state.workingFormula.excludeSportBikes;
  drawFormulaDialog();
}
function invertIncludes() {
  state.workingFormula.excludeKarts = !state.workingFormula.excludeKarts;
  state.workingFormula.excludeATVs = !state.workingFormula.excludeATVs;
  state.workingFormula.excludeBikes = !state.workingFormula.excludeBikes;
  state.workingFormula.excludeSportBikes = !state.workingFormula.excludeSportBikes;
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

function initController() {
  readState();
  readURLParams();
  getAvailableParts();
}

function getAvailableParts() {
  state.parts = Stats.post("getAvailableParts", state.settings.availableParts);
}

function readURLParams() {
  // TODO: More robust code correction. (like it was before)
  const url = new URL(window.location.href);
  const aCode = url.searchParams.get("A") ?? url.searchParams.get("a");
  const bCode = url.searchParams.get("b");
  const BCode = url.searchParams.get("B");

  state.selectedSlotID = BCode == undefined ? "A" : "B";

  const aCombo = Stats.post("getCombo", aCode ?? "MAAA")
  .then(combo => {
    whenViewReady(() => { setCombo(combo, "A", true); });
  });

  const bCombo = Stats.post("getCombo", bCode ?? BCode ?? "LMSA")
  .then(combo => {
    whenViewReady(() => { setCombo(combo, "B", true); });
  });
}

function updateURLParams(forceReplace = false) {
  const aCode = state.slot.A.combo.code;
  const bCode = state.slot.B.combo.code;
  const url = new URL(location.href);
  url.searchParams.delete("A");
  url.searchParams.delete("a");
  url.searchParams.delete("B");
  url.searchParams.delete("b");

  if (state.selectedSlotID == "B") {
    url.searchParams.set("a", aCode);
    url.searchParams.set("B", bCode);
  } else {
    url.searchParams.set("A", aCode);
    url.searchParams.set("b", bCode);
  }
  if (!forceReplace && (aCode != state.lastState.aCode
                     || bCode != state.lastState.bCode)) {
    history.pushState({}, "", url.toString());
  } else {
    history.replaceState({}, "", url.toString());
  }

  state.lastState.aCode = state.slot.A.combo.code;
  state.lastState.bCode = state.slot.B.combo.code;
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

function toggleCookies() {
  state.settings.allowCookies = !state.settings.allowCookies;

  if (state.settings.allowCookies) { // Store Cookies
    commitState();

  } else { // Delete cookies
    localStorage.removeItem("mk8");
  }

  drawSettingsDialog();
}

function readState() {
  const data = JSON.parse(localStorage.getItem("mk8"));
  if (!data?.settings?.allowCookies) return;

  for (const prop of Object.keys(data.settings)) {
    if (data.settings[prop] == undefined) continue;
    state.settings[prop] = data.settings[prop];
  }

  if (data.locks != undefined) {
    state.locks = structuredClone(data.locks);
  }

  for (const prop of Object.keys(data.driverPrefs)) {
    state.driverPrefs[prop] = data.driverPrefs[prop];
  }

  if (data.favorites != undefined) {
    state.favorites = deserializeFavorites(data.favorites);
  }

  if (data.formula != undefined) {
    state.formula = structuredClone(data.formula);
    state.workingFormula = structuredClone(state.formula);
  }
}
function commitState() {
  if (!state.settings.allowCookies) return;
  const data = {
    settings: structuredClone(state.settings),
    locks: structuredClone(state.locks),
    driverPrefs: structuredClone(state.driverPrefs),
    favorites: serializeFavorites(state.favorites),
    formula: structuredClone(state.formula)
  };
  localStorage.setItem("mk8", JSON.stringify(data));
}
