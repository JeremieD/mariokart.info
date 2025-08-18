"use strict";
// Controller

const statIndex = { spdSr: 0, spdRr: 1, spdWt: 2, acc: 3, wgt: 4,
                    hndSr: 5, hndRr: 6, hndWt: 7, size: 8, spd: 9, hnd: 10 };
const stats = [ "spdSr", "spdRr", "spdWt", "acc", "wgt",
                "hndSr", "hndRr", "hndWt", "size", "spd", "hnd" ];
const blankFormula = {
  factors: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  min:     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  max:     [20,20,20,20,20,20,20,20,2,20,20],
  unified: { spd: true, hnd: true },
  excludeKarts: false, excludeATVs: false, excludeBikes: false
};
const defaultFormula = {
  factors: [0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1],
  min:     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  max:     [20,20,20,20,20,20,20,20,2,20,20],
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
  inspectorTimeout: 0,
  menuOpened: false,
  update: {
    version: "0.6.2",
    message: "",
    open: false,
    dismissed: false
  },
  lastState: {
    aCode: "",
    bCode: ""
  }
};

const Stats = new Worker("/resources/scripts/mkw/stats-worker.js");
Stats.exchanges = 0;
Stats.post = (...args) => {
  return new Promise((resolve, reject) => {
    const exchangeID = Stats.exchanges++;
    Stats.addEventListener("message", e => {
      if (e.data[0] === exchangeID) {
        const data = e.data[1];
        if (typeof data === "string" && data.startsWith("Error: ")) {
          reject(data);
        } else {
          resolve(data);
      } }
    }, { passive: true });
    Stats.postMessage([exchangeID, args]);
  });
};

initController();

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
    min: [
      combo.lvl[0],
      combo.lvl[1],
      combo.lvl[2],
      combo.lvl[3],
      combo.lvl[4],
      combo.lvl[5],
      combo.lvl[6],
      combo.lvl[7]
    ],
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

function share() {
  const link = location.origin + location.pathname + "?A=" + state.selectedSlot.combo.code;
  navigator.clipboard.writeText(link).then(drawShareNotice);
}

function selectA() {
  if (state.openedDialog !== "") return;
  state.selectedSlotID = "A";
  updateURLParams();
  commitState();
  drawCurrentCombo();
  drawDominantCombos();
  drawSimilarCombos();
  drawCustomCombos();
}
function selectB() {
  if (state.openedDialog !== "") return;
  state.selectedSlotID = "B";
  updateURLParams();
  commitState();
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
function deserializeFormula(serial) {
  const obj = structuredClone(blankFormula);
  for (let i = 0; i < obj.factors.length; i++) {
    if (serial.factors?.[i] !== undefined) obj.factors[i] = serial.factors[i];
    if (serial.min?.[i]     !== undefined) obj.min[i]     = serial.min[i];
    if (serial.max?.[i]     !== undefined) obj.max[i]     = serial.max[i];
  }
  if (serial.unified?.spd !== undefined) obj.unified.spd  = serial.unified.spd;
  if (serial.unified?.hnd !== undefined) obj.unified.hnd  = serial.unified.hnd;
  if (serial.excludeKarts !== undefined) obj.excludeKarts = serial.excludeKarts;
  if (serial.excludeATVs  !== undefined) obj.excludeATVs  = serial.excludeATVs;
  if (serial.excludeBikes !== undefined) obj.excludeBikes = serial.excludeBikes;
  return obj;
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
  getAvailableParts();
}

function getAvailableParts() {
  state.parts = Stats.post("getAvailableParts", state.settings.availableParts);
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
      whenViewReady(() => { setCombo(combo, "A"); });
    });
    Stats.post("getCombo", state.slot.B.combo.code).then(combo => {
      whenViewReady(() => { setCombo(combo, "B"); });
    });
    state.settings.gameVersion = version;
    commitState();
  });
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

function toggleCookies() {
  state.settings.allowCookies = !state.settings.allowCookies;

  if (state.settings.allowCookies) { // Store Cookies
    commitState();

  } else { // Delete cookies
    localStorage.removeItem("mkw");
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

  if (aCode === "") aCode = undefined;
  if (bCode === "") bCode = undefined;

  // Read from storage
  const data = JSON.parse(localStorage.getItem("mkw"));
  if (data?.settings?.allowCookies) {
    for (const prop of Object.keys(data.settings)) {
      if (data.settings[prop] === undefined) continue;
      state.settings[prop] = data.settings[prop];
    }

    slot ??= data.lastState?.selectedSlot;
    aCode ??= data.lastState?.A;
    bCode ??= data.lastState?.B;

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
  slot  ??= "A";
  aCode ??= "MA";
  bCode ??= "LR";

  state.selectedSlotID = slot;
  state.slot.A.combo.code = aCode;
  state.slot.B.combo.code = bCode;
  changeGameVersion(state.settings.gameVersion);
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
      selectedSlot: state.selectedSlotID
    }
  };
  localStorage.setItem("mkw", JSON.stringify(data));
}
