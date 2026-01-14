"use strict";
// Controller

const statCount = 15;
const realStatCount = 12;
const stats = [ "mtb", "spdGr", "spdAg", "spdWt", "spdAr", "acc",
                "wgt", "hndGr", "hndAg", "hndWt", "hndAr", "trn",
                "size", "spd", "hnd" ];
const realStats = stats.slice(0, realStatCount);
const statIndex = {  mtb: 0, spdGr: 1, spdAg: 2, spdWt: 3, spdAr: 4,  acc: 5,
                     wgt: 6, hndGr: 7, hndAg: 8, hndWt: 9, hndAr: 10, trn: 11,
                     size: 12, spd: 13, hnd: 14 };

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
  selectedTab: "",
  inspectorTimeout: 0,
  menuOpened: false,
  lastState: {
    aCode: "",
    bCode: ""
  }
};

const Stats = new StatsWorker("/resources/scripts/mk8/stats-worker.js");

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
  if (slot === "A" && state.selectedSlotID === "B"
   || slot === "B" && state.selectedSlotID === "A") {
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
  if (slot === "A" && state.selectedSlotID === "B"
   || slot === "B" && state.selectedSlotID === "A") {
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
    min: combo.lvl.slice(0, realStatCount),
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
    opts.factors[statIndex.spdGr] = 0; opts.max[statIndex.spdGr] = 20; opts.min[statIndex.spdGr] = 0;
    opts.factors[statIndex.spdAg] = 0; opts.max[statIndex.spdAg] = 20; opts.min[statIndex.spdAg] = 0;
    opts.factors[statIndex.spdWt] = 0; opts.max[statIndex.spdWt] = 20; opts.min[statIndex.spdWt] = 0;
    opts.factors[statIndex.spdAr] = 0; opts.max[statIndex.spdAr] = 20; opts.min[statIndex.spdAr] = 0;
  } else {
    opts.factors[statIndex.spd] = 0; opts.max[statIndex.spd] = 20; opts.min[statIndex.spd] = 0;
  }
  if (state.formula.unified.hnd) {
    opts.factors[statIndex.hndGr] = 0; opts.max[statIndex.hndGr] = 20; opts.min[statIndex.hndGr] = 0;
    opts.factors[statIndex.hndAg] = 0; opts.max[statIndex.hndAg] = 20; opts.min[statIndex.hndAg] = 0;
    opts.factors[statIndex.hndWt] = 0; opts.max[statIndex.hndWt] = 20; opts.min[statIndex.hndWt] = 0;
    opts.factors[statIndex.hndAr] = 0; opts.max[statIndex.hndAr] = 20; opts.min[statIndex.hndAr] = 0;
  } else {
    opts.factors[statIndex.hnd] = 0; opts.max[statIndex.hnd] = 20; opts.min[statIndex.hnd] = 0;
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

function updateURLParams(forceReplace = false) {
  if (state.slot.A.combo.code === undefined || state.slot.B.combo.code === undefined) return;
  const aCode = state.slot.A.combo.code;
  const bCode = state.slot.B.combo.code;
  const url = new URL(location.href);
  url.searchParams.delete("A");
  url.searchParams.delete("a");
  url.searchParams.delete("B");
  url.searchParams.delete("b");

  if (state.selectedSlotID === "B") {
    url.searchParams.set("a", aCode);
    url.searchParams.set("B", bCode);
  } else {
    url.searchParams.set("A", aCode);
    url.searchParams.set("b", bCode);
  }
  if (!forceReplace && (aCode !== state.lastState.aCode
                     || bCode !== state.lastState.bCode)) {
    history.pushState({}, "", url.toString());
  } else {
    history.replaceState({}, "", url.toString());
  }

  state.lastState.aCode = state.slot.A.combo.code;
  state.lastState.bCode = state.slot.B.combo.code;
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
  // Read from URL
  const url = new URL(location.href);
  const ACode = url.searchParams.get("A");
  let   aCode = url.searchParams.get("a") ?? ACode;
  const BCode = url.searchParams.get("B");
  let   bCode = url.searchParams.get("b") ?? BCode;

  let slot;
  if (ACode !== null) slot = "A";
  if (BCode !== null) slot ??= "B";
  let tab = url.hash.slice(1);

  url.hash = "";
  history.replaceState({}, "", url.toString());

  if (aCode === "") aCode = undefined;
  if (bCode === "") bCode = undefined;
  if (tab   === "") tab   = undefined;

  // Read from storage
  const data = JSON.parse(localStorage.getItem("mk8"));
  if (data?.settings?.allowCookies) {
    for (const prop of Object.keys(data.settings)) {
      if (data.settings[prop] === undefined) continue;
      state.settings[prop] = data.settings[prop];
    }

    slot  ??= data.lastState?.selectedSlot;
    aCode ??= data.lastState?.A;
    bCode ??= data.lastState?.B;
    tab   ??= data.lastState?.selectedTab;

    if (data.locks !== undefined) {
      state.locks = structuredClone(data.locks);
    }

    for (const prop of Object.keys(data.driverPrefs)) {
      state.driverPrefs[prop] = data.driverPrefs[prop];
    }

    if (data.favorites !== undefined) {
      state.favorites = deserializeFavorites(data.favorites);
    }

    if (data.formula !== undefined) {
      state.formula = structuredClone(data.formula);
      state.workingFormula = structuredClone(state.formula);
    }
  }

  // Fallback
  slot  ??= "A";
  aCode ??= "MAAA";
  bCode ??= "LMSA";
  tab   ??= "dominant";

  // Set combos
  state.selectedSlotID = slot;
  Stats.post("getCombo", aCode).then(combo => {
    whenViewReady(() => { setCombo(combo, "A", true); });
  });
  Stats.post("getCombo", bCode).then(combo => {
    whenViewReady(() => { setCombo(combo, "B", true); });
  });
  state.selectedTab = tab;
  whenViewReady(drawTabs);
}
function commitState() {
  if (!state.settings.allowCookies) return;
  const data = {
    settings: structuredClone(state.settings),
    locks: structuredClone(state.locks),
    driverPrefs: structuredClone(state.driverPrefs),
    favorites: serializeFavorites(state.favorites),
    formula: structuredClone(state.formula),
    lastState: {
      A: state.slot.A.combo.code,
      B: state.slot.B.combo.code,
      selectedSlot: state.selectedSlotID,
      selectedTab: state.selectedTab
    }
  };
  localStorage.setItem("mk8", JSON.stringify(data));
}
