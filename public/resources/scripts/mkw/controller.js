"use strict";
// Controller

const statCount = 12;
const realStatCount = 9;
const stats = [ "mtb", "spdSr", "spdRr", "spdWt", "acc",
                "wgt", "hndSr", "hndRr", "hndWt", "size", "spd", "hnd" ];
const realStats = stats.slice(0, realStatCount);
const statIndex = { mtb: 0, spdSr: 1, spdRr: 2, spdWt: 3, acc: 4,
                    wgt: 5, hndSr: 6, hndRr: 7, hndWt: 8, size: 9,
                    spd: 10, hnd: 11 };

const blankFormula = {
  factors: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  min:     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  max:     [20,20,20,20,20,20,20,20,20,2,20,20],
  unified: { spd: true, hnd: true },
  excludeKarts: false, excludeATVs: false, excludeBikes: false
};
const defaultFormula = {
  factors: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1],
  min:     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  max:     [20,20,20,20,20,20,20,20,20,2,20,20],
  unified: { spd: true, hnd: true },
  excludeKarts: false, excludeATVs: false, excludeBikes: false
};
const state = {
  settings: {
    allowCookies: false,
    gameVersion: "latest",
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
  locks: {
    driver: false,
    body: false },
  parts: {
    drivers: {},
    bodies: {} },
  driverPrefs: {
    mario: "mario",
    luigi: "luigi",
    peach: "peach",
    daisy: "daisy",
    yoshi: "yoshi",
    dk: "dk",
    bowser: "bowser",
    bowserJr: "bowserJr",
    koopa: "koopa",
    toad: "toad",
    toadette: "toadette",
    lakitu: "lakitu",
    kingboo: "kingboo",
    shyguy: "shyguy",
    wario: "wario",
    waluigi: "waluigi",
    birdo: "birdo",
    pauline: "pauline",
    rosalina: "rosalina",
    marioBb: "marioBb",
    luigiBb: "luigiBb",
    peachBb: "peachBb",
    daisyBb: "daisyBb",
    rosalinaBb: "rosalinaBb" },
  favorites: [],
  formula: structuredClone(defaultFormula),
  workingFormula: structuredClone(defaultFormula),
  formulaDialogScrollTop: 0,
  openedDialog: "",
  selectedTab: "",
  inspectorTimeout: 0,
  menuOpened: false,
  update: {
    version: "0.8",
    message: "",
    open: false,
    dismissed: false
  },
  lastState: {
    aCode: "",
    bCode: ""
  }
};

const Stats = new StatsWorker("/resources/scripts/mkw/stats-worker.js");

initController();

function setDriver(driver) {
  Stats.post("getCombo", driver, state.body).then(setCombo);
  closeDriverDialog();
}
function setBody(body) {
  Stats.post("getCombo", state.driver, body).then(setCombo);
  closeBodyDialog();
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
    driverLock: state.locks.driver, bodyLock: state.locks.body
  };
  return Stats.post("listCombos", opts);
}

function getSimilarCombos(combo) {
  const opts = {
    mustDiffer: true, maxAbsDiff: 12, minDiff: -4,
    refCombo: combo, sortBy: "similar",
    driverLock: state.locks.driver, bodyLock: state.locks.body
  };
  return Stats.post("listCombos", opts);
}

function getCustomCombos(combo) {
  const opts = structuredClone(state.formula);
  opts.refCombo = combo;
  opts.sortBy = "score";
  opts.driverLock = state.locks.driver;
  opts.bodyLock = state.locks.body;

  if (state.formula.unified.spd) {
    opts.factors[statIndex.spdSr] = 0; opts.max[statIndex.spdSr] = 20; opts.min[statIndex.spdSr] = 0;
    opts.factors[statIndex.spdRr] = 0; opts.max[statIndex.spdRr] = 20; opts.min[statIndex.spdRr] = 0;
    opts.factors[statIndex.spdWt] = 0; opts.max[statIndex.spdWt] = 20; opts.min[statIndex.spdWt] = 0;
  } else {
    opts.factors[statIndex.spd] = 0; opts.max[statIndex.spd] = 20; opts.min[statIndex.spd] = 0;
  }
  if (state.formula.unified.hnd) {
    opts.factors[statIndex.hndSr] = 0; opts.max[statIndex.hndSr] = 20; opts.min[statIndex.hndSr] = 0;
    opts.factors[statIndex.hndRr] = 0; opts.max[statIndex.hndRr] = 20; opts.min[statIndex.hndRr] = 0;
    opts.factors[statIndex.hndWt] = 0; opts.max[statIndex.hndWt] = 20; opts.min[statIndex.hndWt] = 0;
  } else {
    opts.factors[statIndex.hnd] = 0; opts.max[statIndex.hnd] = 20; opts.min[statIndex.hnd] = 0;
  }

  return Stats.post("listCombos", opts);
}

function randomCombo() {
  const locks = [
    state.locks.driver ? state.driver : undefined,
    state.locks.body   ? state.body : undefined
  ];
  Stats.post("getRandomCombo", ...locks).then(setCombo);
}

function deserializeFormula(serial) {
  const obj = structuredClone(blankFormula);
  if (serial.factors.length === 11) { // Upgrading from v0.7
    for (let i = 1; i < obj.factors.length; i++) {
      const j = i-1;
      if (serial.factors?.[j] !== undefined) obj.factors[i] = serial.factors[j];
      if (serial.min?.[j]     !== undefined) obj.min[i]     = serial.min[j];
      if (serial.max?.[j]     !== undefined) obj.max[i]     = serial.max[j];
    }
  } else {
    for (let i = 0; i < obj.factors.length; i++) {
      if (serial.factors?.[i] !== undefined) obj.factors[i] = serial.factors[i];
      if (serial.min?.[i]     !== undefined) obj.min[i]     = serial.min[i];
      if (serial.max?.[i]     !== undefined) obj.max[i]     = serial.max[i];
    }
  }
  if (serial.unified?.spd !== undefined) obj.unified.spd  = serial.unified.spd;
  if (serial.unified?.hnd !== undefined) obj.unified.hnd  = serial.unified.hnd;
  if (serial.excludeKarts !== undefined) obj.excludeKarts = serial.excludeKarts;
  if (serial.excludeATVs  !== undefined) obj.excludeATVs  = serial.excludeATVs;
  if (serial.excludeBikes !== undefined) obj.excludeBikes = serial.excludeBikes;
  return obj;
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
function invertIncludes() {
  state.workingFormula.excludeKarts = !state.workingFormula.excludeKarts;
  state.workingFormula.excludeATVs = !state.workingFormula.excludeATVs;
  state.workingFormula.excludeBikes = !state.workingFormula.excludeBikes;
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

function changeGameVersion(version) {
  return Stats.post("setVersion", version).then(() => {
    Stats.post("getCombo", state.slot.A.combo.code).then(combo => {
      whenViewReady(() => { setCombo(combo, "A", true); });
    });
    Stats.post("getCombo", state.slot.B.combo.code).then(combo => {
      whenViewReady(() => { setCombo(combo, "B", true); });
    });
    state.settings.gameVersion = version;
    commitState();
  });
}

function toggleCookies() {
  state.settings.allowCookies = !state.settings.allowCookies;

  if (state.settings.allowCookies) { // Store Cookies
    commitState();

  } else { // Delete cookies
    localStorage.removeItem("mkw");
  }

  drawSettingsDialog();
}

function dismissNotification() {
  state.update.dismissed = true;
  state.update.open = false;
  drawNotification();
}

function checkForUpdate() {
  // httpGet caches result for 1 day.
  httpGet("/api/version/mkw.json").then(JSON.parse).then(data => {
    if (data.v === state.update.version) return;
    state.update.message = data.m;
    if (!state.update.dismissed) state.update.open = true;
    drawNotification();
  });
}

function readState() {
  // Read from URL
  const url = new URL(location.href);
  const ACode = url.searchParams.get("A");
  let   aCode = url.searchParams.get("a") ?? ACode;
  const BCode = url.searchParams.get("B");
  let   bCode = url.searchParams.get("b") ?? BCode;

  let slot, tab, dialog;
  if (ACode !== null) slot = "A";
  if (BCode !== null) slot ??= "B";

  if (aCode === "") aCode = undefined;
  if (bCode === "") bCode = undefined;

  let fragment = url.hash.slice(1);
  if (fragment === "dominant" || fragment === "similar" || fragment === "search") {
    tab = fragment;
    url.hash = "";
    history.replaceState({}, "", url.toString());

  } else if (fragment === "help" || fragment === "settings" ||
             fragment === "credits" || fragment === "changelog") {
    dialog = fragment;
  }

  // Read from storage
  const data = JSON.parse(localStorage.getItem("mkw"));
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
      state.formula = deserializeFormula(data.formula);
      state.workingFormula = structuredClone(state.formula);
    }
  }

  // Fallback
  slot   ??= "A";
  aCode  ??= "MA";
  bCode  ??= "LR";
  tab    ??= "dominant";
  dialog ??= "";

  state.selectedSlotID = slot;
  state.slot.A.combo.code = aCode;
  state.slot.B.combo.code = bCode;
  changeGameVersion(state.settings.gameVersion);
  state.selectedTab = tab;
  state.openedDialog = dialog;
  whenViewReady(() => {
    drawTabs();
    drawHelpDialog();
    drawSettingsDialog();
    drawCreditsDialog();
    drawChangelogDialog();
  });
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
    },
    version: state.update.version
  };
  localStorage.setItem("mkw", JSON.stringify(data));
}
