"use strict";
// Controller

const defaultFormula = {
  mintb: {
    factor: 16,
    min: 0,
    max: 6 },
  spd: {
    use: true,
    factor: 15,
    min: 0,
    max: 6 },
  spdGr: {
    factor: 0,
    min: 0,
    max: 6 },
  spdAg: {
    factor: 0,
    min: 0,
    max: 6 },
  spdWt: {
    factor: 0,
    min: 0,
    max: 6 },
  spdAr: {
    factor: 0,
    min: 0,
    max: 6 },
  accel: {
    factor: 1,
    min: 0,
    max: 6 },
  weigt: {
    factor: 1,
    min: 0,
    max: 6 },
  hnd: {
    use: true,
    factor: .5,
    min: 0,
    max: 6 },
  hndGr: {
    factor: 0,
    min: 0,
    max: 6 },
  hndAg: {
    factor: 0,
    min: 0,
    max: 6 },
  hndWt: {
    factor: 0,
    min: 0,
    max: 6 },
  hndAr: {
    factor: 0,
    min: 0,
    max: 6 },
  trctn: {
    factor: .5,
    min: 0,
    max: 6
  },
  invcb: {
    factor: 0,
    min: 0,
    max: 6 },
  size: {
    factor: 0,
    min: 0,
    max: 2 },
  excludeKarts: false, excludeATVs: false,
  excludeBikes: false, excludeSportBikes: true,
};
const state = {
  settings: {
    gameVersion: "v3.0.1",
    locale: "",
    availableParts: "all" },
  selectedSlotID: "A",
  slot: {
    A: {
      combo: {},
      dominant: [],
      similar: [],
      custom: [] },
    B: {
      combo: {},
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
    birdo: "birdo",
    yoshi: "yoshi",
    shyguy: "shyguy",
    marioGold: "marioGold",
    inkling: "inklingF",
    villager: "villagerM",
    link: "link1",
    mii: "miiM" },
  formula: structuredClone(defaultFormula),
  workingFormula: structuredClone(defaultFormula),
  formulaDialogScrollTop: 0,
  openedDialog: "",
  inspectorTimeout: 0,
  lastState: {
    aCode: "",
    bCode: "", }
};

const Stats = new Worker("/resources/scripts/stats-worker.js");
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
  });
};

init();

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
    state.offSlot.dominant = getDominantCombos(combo);
    state.offSlot.similar = getSimilarCombos(combo);
    state.offSlot.custom = getCustomCombos(combo);
  } else {
    state.selectedSlot.combo = combo;
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
    mintb: { min: combo.lvl.mintb },
    spdGr: { min: combo.lvl.spdGr }, spdWt: { min: combo.lvl.spdWt },
    spdAg: { min: combo.lvl.spdAg }, spdAr: { min: combo.lvl.spdAr },
    accel: { min: combo.lvl.accel }, weigt: { min: combo.lvl.weigt },
    hndGr: { min: combo.lvl.hndGr }, hndWt: { min: combo.lvl.hndWt },
    hndAg: { min: combo.lvl.hndAg }, hndAr: { min: combo.lvl.hndAr },
    trctn: { min: combo.lvl.trctn }, invcb: { min: combo.lvl.invcb },
    refCombo: combo,
    driverLock: state.locks.driver, bodyLock: state.locks.body,
    tireLock: state.locks.tire, gliderLock: state.locks.glider
  };
  return Stats.post("listCombos", opts);
}

function getSimilarCombos(combo) {
  const opts = {
    mustDiffer: true, maxAbsDiff: 2.5, minDiff: -.75,
    refCombo: combo, sortBy: "diff",
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

  if (state.formula.spd.use) {
    opts.spdGr.factor = 0; opts.spdAg.factor = 0;
    opts.spdWt.factor = 0; opts.spdAr.factor = 0;
    opts.spdGr.min = 0; opts.spdAg.min = 0;
    opts.spdWt.min = 0; opts.spdAr.min = 0;
    opts.spdGr.max = 6; opts.spdAg.max = 6;
    opts.spdWt.max = 6; opts.spdAr.max = 6;
  } else {
    opts.spd.factor = 0;
    opts.spd.min = 0; opts.spd.max = 6;
  }
  if (state.formula.hnd.use) {
    opts.hndGr.factor= 0; opts.hndAg.factor = 0;
    opts.hndWt.factor = 0; opts.hndAr.factor = 0;
    opts.hndGr.min = 0; opts.hndAg.min = 0;
    opts.hndWt.min = 0; opts.hndAr.min = 0;
    opts.hndGr.max = 6; opts.hndAg.max = 6;
    opts.hndWt.max = 6; opts.hndAr.max = 6;
  } else {
    opts.hnd.factor = 0;
    opts.hnd.min = 0; opts.hnd.max = 6;
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

function toggleDriverLock() {
  state.locks.driver = !state.locks.driver;
  drawDriverLock();
  updateRelatedCombos("A");
  updateRelatedCombos("B");
}
function toggleBodyLock() {
  state.locks.body = !state.locks.body;
  drawBodyLock();
  updateRelatedCombos("A");
  updateRelatedCombos("B");
}
function toggleTireLock() {
  state.locks.tire = !state.locks.tire;
  drawTireLock();
  updateRelatedCombos("A");
  updateRelatedCombos("B");
}
function toggleGliderLock() {
  state.locks.glider = !state.locks.glider;
  drawGliderLock();
  updateRelatedCombos("A");
  updateRelatedCombos("B");
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

function toggleSpdMode() {
  state.workingFormula.spd.use = !state.workingFormula.spd.use;
  drawCollapses();
}
function toggleHndMode() {
  state.workingFormula.hnd.use = !state.workingFormula.hnd.use;
  drawCollapses();
}

function toggleFactorSign(stat) {
  const statState = state.workingFormula[stat];
  if (statState.factor == 0) {
    statState.factor = 1;
  } else {
    statState.factor *= -1;
  }
  drawFormulaDialog();
}
function resetFactor(stat) {
  state.workingFormula[stat].factor = 0;
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

function openFormulaHelpDialog() {
  state.openedDialog = "formula-help";
  drawFormulaHelpDialog();
}
function closeFormulaHelpDialog() {
  state.openedDialog = "formula";
  drawFormulaHelpDialog();
}

function openCreditsDialog() {
  state.openedDialog = "credits";
  drawCreditsDialog();
}
function closeCreditsDialog() {
  state.openedDialog = "";
  drawCreditsDialog();
}

function init() {
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
  .then(combo => { setCombo(combo, "A", true) });

  const bCombo = Stats.post("getCombo", bCode ?? BCode ?? "LMSA")
  .then(combo => { setCombo(combo, "B", true) });
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
  locale = locl;
  drawCurrentCombo();
  drawDominantCombos();
  drawSimilarCombos();
  drawCustomCombos();
}
