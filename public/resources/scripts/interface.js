"use strict";
console.log("★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★\n\nHello. This is a WIP. Do NOT look at my ugly code. I rushed to release this for Wave 6. I'm working on cleaning it up and adding new features.\n\n★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★");

const locl = "en-US";

const mobile = innerWidth <= 1366;

const combos = {
  a: Combo.fromCode("MAAA"),
  b: Combo.fromCode("LMSA")
};
let customFormula = {
  scoreFormula: [...ComboC.OPTISCORE],
  mintbMin: 0, mintbMax: 6, spdMin: 0, spdMax: 6,
  spdGrMin: 0, spdGrMax: 6, spdAgMin: 0, spdAgMax: 6,
  spdWtMin: 0, spdWtMax: 6, spdArMin: 0, spdArMax: 6,
  accelMin: 0, accelMax: 6, weigtMin: 0, weigtMax: 6, hndMin: 0, hndMax: 6,
  hndGrMin: 0, hndGrMax: 6, hndAgMin: 0, hndAgMax: 6,
  hndWtMin: 0, hndWtMax: 6, hndArMin: 0, hndArMax: 6,
  trctnMin: 0, trctnMax: 6, invcbMin: 0, invcbMax: 6, sizeMin: 0, sizeMax: 2,
  excludeKarts: false, excludeATVs: false,
  excludeBikes: false, excludeSportBikes: true,
  ignoreLocks: true
};

let selectedCombo = combos.a;
let otherCombo = combos.b;
let lastStateURL = "";
readURLParams();

let comboSelect;
let comboTier, comboDetails;
let compareSwitch, randomButton;
let driverButton, bodyButton, tireButton, gliderButton,
    driverImg,    bodyImg,    tireImg,    gliderImg,
    driverLock,   bodyLock,   tireLock,   gliderLock,
    driverLabel,  bodyLabel,  tireLabel,  gliderLabel; // Current combo display
let comboStats;
let mintbMeter, accelMeter, weigtMeter, // Stat bars
    spdGrMeter, spdAgMeter, spdWtMeter, spdArMeter,
    hndGrMeter, hndAgMeter, hndWtMeter, hndArMeter,
    trctnMeter, invcbMeter;
let partsGrid;
let driverName, bodyName, tireName, gliderName;
let driverSelect, bodySelect, tireSelect, gliderSelect; // Part grids
let dominantCombosRows, similarCombosRows, customCombosRows; // Table bodies
let dominantCombosCount, similarCombosCount, customCombosCount;
let customComboFormula, customizeFormulaButton;
let customFormulaDialog;
let mintbWeight, spdWeight, accelWeight,
    weigtWeight, hndWeight, trctnWeight,
    invcbWeight, sizeWeight;
let mintbMin, spdMin, accelMin,
    weigtMin, hndMin, trctnMin,
    invcbMin, sizeMin;
let mintbMax, spdMax, accelMax,
    weigtMax, hndMax, trctnMax,
    invcbMax, sizeMax;
let mintbMode, spdMode, accelMode,
    weigtMode, hndMode, trctnMode,
    invcbMode, sizeMode;
let includeKarts, includeATVs, includeBikes, includeSportBikes;
let ignoreLocksFormula;
let resetFormulaButton, cancelFormulaButton, saveFormulaButton;

whenDOMReady(() => {
  comboSelect = document.getElementById("combo-tabs");

  comboTier = document.getElementById("combo-tier");
  comboDetails = document.getElementById("combo-details");

  compareSwitch = document.getElementById("compare");
  randomButton = document.getElementById("random-button");

  driverButton = document.getElementById("combo-driver");
  driverImg = document.getElementById("current-driver-img");
  driverLock = document.getElementById("driver-lock");
  driverLabel = document.getElementById("current-driver-label");
  bodyButton = document.getElementById("combo-body");
  bodyImg = document.getElementById("current-body-img");
  bodyLock = document.getElementById("body-lock");
  bodyLabel = document.getElementById("current-body-label");
  tireButton = document.getElementById("combo-tire");
  tireImg = document.getElementById("current-tire-img");
  tireLock = document.getElementById("tire-lock");
  tireLabel = document.getElementById("current-tire-label");
  gliderButton = document.getElementById("combo-glider");
  gliderImg = document.getElementById("current-glider-img");
  gliderLock = document.getElementById("glider-lock");
  gliderLabel = document.getElementById("current-glider-label");

  comboStats = document.getElementById("combo-stats");

  mintbMeter = document.getElementById("mintb-meter");
  accelMeter = document.getElementById("accel-meter");
  weigtMeter = document.getElementById("weigt-meter");
  spdGrMeter = document.getElementById("spdGr-meter");
  spdAgMeter = document.getElementById("spdAg-meter");
  spdWtMeter = document.getElementById("spdWt-meter");
  spdArMeter = document.getElementById("spdAr-meter");
  hndGrMeter = document.getElementById("hndGr-meter");
  hndAgMeter = document.getElementById("hndAg-meter");
  hndWtMeter = document.getElementById("hndWt-meter");
  hndArMeter = document.getElementById("hndAr-meter");
  trctnMeter = document.getElementById("trctn-meter");
  invcbMeter = document.getElementById("invcb-meter");

  partsGrid    = document.getElementById("combo-parts");
  driverSelect = document.getElementById("drivers");
  bodySelect   = document.getElementById("bodies");
  tireSelect   = document.getElementById("tires");
  gliderSelect = document.getElementById("gliders");

  dominantCombosCount = document.getElementById("dominant-combos-count");
  similarCombosCount  = document.getElementById("similar-combos-count");
  customCombosCount   = document.getElementById("custom-combos-count");

  dominantCombosRows = document.getElementById("dominant-combos-rows");
  similarCombosRows  = document.getElementById("similar-combos-rows");
  customCombosRows   = document.getElementById("custom-combos-rows");

  customComboFormula = document.getElementById("custom-combo-formula");
  customizeFormulaButton = document.getElementById("customize-formula-button");

  customFormulaDialog = document.getElementById("custom-formula-dialog");

  mintbWeight = document.getElementById("formula-mintb-weight");
  mintbMin = document.getElementById("formula-mintb-min");
  mintbMax = document.getElementById("formula-mintb-max");
  spdWeight = document.getElementById("formula-spd-weight");
  spdMin = document.getElementById("formula-spd-min");
  spdMax = document.getElementById("formula-spd-max");
  accelWeight = document.getElementById("formula-accel-weight");
  accelMin = document.getElementById("formula-accel-min");
  accelMax = document.getElementById("formula-accel-max");
  weigtWeight = document.getElementById("formula-weigt-weight");
  weigtMin = document.getElementById("formula-weigt-min");
  weigtMax = document.getElementById("formula-weigt-max");
  hndWeight = document.getElementById("formula-hnd-weight");
  hndMin = document.getElementById("formula-hnd-min");
  hndMax = document.getElementById("formula-hnd-max");
  trctnWeight = document.getElementById("formula-trctn-weight");
  trctnMin = document.getElementById("formula-trctn-min");
  trctnMax = document.getElementById("formula-trctn-max");
  invcbWeight = document.getElementById("formula-invcb-weight");
  invcbMin = document.getElementById("formula-invcb-min");
  invcbMax = document.getElementById("formula-invcb-max");
  sizeWeight = document.getElementById("formula-size-weight");
  sizeMin = document.getElementById("formula-size-min");
  sizeMax = document.getElementById("formula-size-max");

  mintbMode = document.getElementById("formula-mintb-mode");
  spdMode = document.getElementById("formula-spd-mode");
  accelMode = document.getElementById("formula-accel-mode");
  weigtMode = document.getElementById("formula-weigt-mode");
  hndMode = document.getElementById("formula-hnd-mode");
  trctnMode = document.getElementById("formula-trctn-mode");
  invcbMode = document.getElementById("formula-invcb-mode");
  sizeMode = document.getElementById("formula-size-mode");

  includeKarts = document.getElementById("formula-include-karts");
  includeATVs = document.getElementById("formula-include-atvs");
  includeBikes = document.getElementById("formula-include-bikes");
  includeSportBikes = document.getElementById("formula-include-sportbikes");

  ignoreLocksFormula = document.getElementById("formula-ignore-locks");

  resetFormulaButton = document.getElementById("formula-reset");
  cancelFormulaButton = document.getElementById("formula-cancel");
  saveFormulaButton = document.getElementById("formula-save");

  initRadioGroup(comboSelect).addEventListener("change", e => {
    const comboID = e.target.dataset.value;
    selectedCombo = combos[comboID];
    switch (comboID) {
      case "a":
        otherCombo = combos.b;
        break;
      case "b":
        otherCombo = combos.a;
    }
    selectCombo(selectedCombo);
    drawCurrentCombo();
  });

  addEventListener("keydown", e => {
    if (event.shiftKey || event.ctrlKey || event.altKey || event.metaKey) return;
    if (e.key == "a") {
      selectedCombo = combos.a;
      otherCombo = combos.b;
      selectCombo(selectedCombo);
      drawCurrentCombo();
      comboSelect.children[0].classList.add("selected");
      comboSelect.children[1].classList.remove("selected");
    } else if (e.key == "b") {
      selectedCombo = combos.b;
      otherCombo = combos.a;
      selectCombo(selectedCombo);
      drawCurrentCombo();
      comboSelect.children[0].classList.remove("selected");
      comboSelect.children[1].classList.add("selected");
    }
  });

  randomButton.addEventListener("click", () => {
    randomCombo();
  });

  compareSwitch.addEventListener("change", e => {
    comboStats.classList.toggle("compare", e.target.state);
  });


  const closePartsPopup = () => {
    partsGrid.classList.remove("open");
    for (const grid of partsGrid.children) {
      grid.classList.remove("open");
    }
  };

  partsGrid.addEventListener("click", () => {
    closePartsPopup();
  });

  driverButton.addEventListener("click", () => {
    if (!mobile) return;
    partsGrid.classList.add("open");
    partsGrid.children[0].classList.add("open");
  });

  bodyButton.addEventListener("click", () => {
    if (!mobile) return;
    partsGrid.classList.add("open");
    partsGrid.children[1].classList.add("open");
  });

  tireButton.addEventListener("click", () => {
    if (!mobile) return;
    partsGrid.classList.add("open");
    partsGrid.children[2].classList.add("open");
  });

  gliderButton.addEventListener("click", () => {
    if (!mobile) return;
    partsGrid.classList.add("open");
    partsGrid.children[3].classList.add("open");
  });


  driverLock.addEventListener("change", drawRelatedTables);
  bodyLock.addEventListener("change", drawRelatedTables);
  tireLock.addEventListener("change", drawRelatedTables);
  gliderLock.addEventListener("change", drawRelatedTables);

  addEventListener("popstate", () => {
    readURLParams();
    selectedCombo = combos.a;
    otherCombo = combos.b;
    selectCombo();
    drawCurrentCombo(false);
  });

  drawPartsGrids();

  const driverFolders = driverSelect.querySelectorAll(".folder");
  const closeAllDriverFolders = () => {
    for (const folder of driverFolders) {
      folder.classList.remove("open");
    }
  };
  for (const folder of driverFolders) {
    for (const button of folder.children[1].children) {
      button.addEventListener("click", e => {
        closeAllDriverFolders();
        e.stopPropagation();
      });
    }
    folder.addEventListener("click", e => {
      if (e.target == folder) {
        folder.classList.add("open");
        e.stopPropagation();
      }
    });
  }
  document.addEventListener("click", closeAllDriverFolders);

  initRadioGroup(driverSelect).addEventListener("change", e => {
    const value = e.target.dataset.value;
    selectedCombo.driver = value;
    selectDriver(value);
    drawCurrentCombo();
    closeAllDriverFolders();
    closePartsPopup();
  });
  initRadioGroup(bodySelect).addEventListener("change", e => {
    const value = e.target.dataset.value;
    selectedCombo.body = value;
    selectBody(value);
    drawCurrentCombo();
    closePartsPopup();
  });
  initRadioGroup(tireSelect).addEventListener("change", e => {
    const value = e.target.dataset.value;
    selectedCombo.tire = value;
    selectTire(value);
    drawCurrentCombo();
  });
  initRadioGroup(gliderSelect).addEventListener("change", e => {
    const value = e.target.dataset.value;
    selectedCombo.glider = value;
    selectGlider(value);
    drawCurrentCombo();
    closePartsPopup();
  });

  selectCombo();
  drawCurrentCombo();


  customizeFormulaButton.addEventListener("click", () => {
    drawCustomFormulaInterface();
    customFormulaDialog.showModal();
    customFormulaDialog.addEventListener("keydown", e => {
      if (e.key == "Escape") {
        e.preventDefault();
        customFormulaDialog.close();
      }
    }, { once: true });
  });
  resetFormulaButton.addEventListener("click", () => {
    resetCustomFormula();
    drawCustomFormulaInterface();
  });
  cancelFormulaButton.addEventListener("click", () => {
    customFormulaDialog.close();
  });
  saveFormulaButton.addEventListener("click", () => {
    commitFormula();
    customFormulaDialog.close();
    drawCustomCombos();
  });
  customFormulaDialog.addEventListener("click", e => {
    const rect = customFormulaDialog.getBoundingClientRect();
    const isInDialog = rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
                       rect.left <= e.clientX && e.clientX <= rect.left + rect.width;
    if (!isInDialog) customFormulaDialog.close();
  });

  mintbMode.addEventListener("click", e => toggleMode(mintbWeight, e.target));
  spdMode.addEventListener("click", e => toggleMode(spdWeight, e.target));
  accelMode.addEventListener("click", e => toggleMode(accelWeight, e.target));
  weigtMode.addEventListener("click", e => toggleMode(weigtWeight, e.target));
  hndMode.addEventListener("click", e => toggleMode(hndWeight, e.target));
  trctnMode.addEventListener("click", e => toggleMode(trctnWeight, e.target));
  invcbMode.addEventListener("click", e => toggleMode(invcbWeight, e.target));
  sizeMode.addEventListener("click", e => toggleMode(sizeWeight, e.target));

  mintbWeight.addEventListener("input", e => updateFormulaMode(e.target, mintbMode));
  spdWeight.addEventListener("input", e => updateFormulaMode(e.target, spdMode));
  accelWeight.addEventListener("input", e => updateFormulaMode(e.target, accelMode));
  weigtWeight.addEventListener("input", e => updateFormulaMode(e.target, weigtMode));
  hndWeight.addEventListener("input", e => updateFormulaMode(e.target, hndMode));
  trctnWeight.addEventListener("input", e => updateFormulaMode(e.target, trctnMode));
  invcbWeight.addEventListener("input", e => updateFormulaMode(e.target, invcbMode));
  sizeWeight.addEventListener("input", e => updateFormulaMode(e.target, sizeMode));
});

// Updates view output to the currently selected combo (a/b).
async function drawCurrentCombo(updateURL = true) {
  getTier().then(tier => { comboTier.className = tier});
  comboDetails.innerHTML = strings[locl].size[selectedCombo.size];
  if (gameStats.parts.bodies[selectedCombo.body].type == "sport") {
    comboDetails.innerHTML += ", " + strings[locl].driftStyle.in;
  }

  driverImg.src = "/resources/graphics/drivers/" + selectedCombo.driver + ".webp";
  driverName = strings[locl].drivers[selectedCombo.driver];
  driverImg.alt = driverName;
  driverLabel.innerText = driverName;
  bodyImg.src = "/resources/graphics/bodies/" + selectedCombo.body + ".webp";
  bodyName = strings[locl].bodies[selectedCombo.body];
  bodyImg.alt = bodyName;
  bodyLabel.innerText = bodyName;
  tireImg.src = "/resources/graphics/tires/" + selectedCombo.tire + ".webp";
  tireName = strings[locl].tires[selectedCombo.tire];
  tireImg.alt = tireName;
  tireLabel.innerText = tireName;
  gliderImg.src = "/resources/graphics/gliders/" + selectedCombo.glider + ".webp";
  gliderName = strings[locl].gliders[selectedCombo.glider];
  gliderImg.alt = gliderName;
  gliderLabel.innerText = gliderName;

  // Stats
  const mintbA = selectedCombo.lvl.mintb;
  const mintbB = otherCombo.lvl.mintb;
  mintbMeter.classList.toggle("dominant", mintbA > mintbB);
  mintbMeter.style.setProperty("--value", mintbA);
  mintbMeter.style.setProperty("--secondary-value", mintbB);
  mintbMeter.setAttribute("tooltip", strings[locl].stats["mintb"] + ": " + mintbA);

  const accelA = selectedCombo.lvl.accel;
  const accelB = otherCombo.lvl.accel;
  accelMeter.classList.toggle("dominant", accelA > accelB);
  accelMeter.style.setProperty("--value", accelA);
  accelMeter.style.setProperty("--secondary-value", accelB);
  accelMeter.setAttribute("tooltip", strings[locl].stats["accel"] + ": " + accelA);

  const weigtA = selectedCombo.lvl.weigt;
  const weigtB = otherCombo.lvl.weigt;
  weigtMeter.classList.toggle("dominant", weigtA > weigtB);
  weigtMeter.style.setProperty("--value", weigtA);
  weigtMeter.style.setProperty("--secondary-value", weigtB);
  weigtMeter.setAttribute("tooltip", strings[locl].stats["weigt"] + ": " + weigtA);

  const spdGrA = selectedCombo.lvl.spdGr;
  const spdGrB = otherCombo.lvl.spdGr;
  spdGrMeter.classList.toggle("dominant", spdGrA > spdGrB);
  spdGrMeter.style.setProperty("--value", spdGrA);
  spdGrMeter.style.setProperty("--secondary-value", spdGrB);
  spdGrMeter.setAttribute("tooltip", strings[locl].stats["spdGr"] + ": " + spdGrA);

  const spdAgA = selectedCombo.lvl.spdAg;
  const spdAgB = otherCombo.lvl.spdAg;
  spdAgMeter.classList.toggle("dominant", spdAgA > spdAgB);
  spdAgMeter.style.setProperty("--value", spdAgA);
  spdAgMeter.style.setProperty("--secondary-value", spdAgB);
  spdAgMeter.setAttribute("tooltip", strings[locl].stats["spdAg"] + ": " + spdAgA);

  const spdWtA = selectedCombo.lvl.spdWt;
  const spdWtB = otherCombo.lvl.spdWt;
  spdWtMeter.classList.toggle("dominant", spdWtA > spdWtB);
  spdWtMeter.style.setProperty("--value", spdWtA);
  spdWtMeter.style.setProperty("--secondary-value", spdWtB);
  spdWtMeter.setAttribute("tooltip", strings[locl].stats["spdWt"] + ": " + spdWtA);

  const spdArA = selectedCombo.lvl.spdAr;
  const spdArB = otherCombo.lvl.spdAr;
  spdArMeter.classList.toggle("dominant", spdArA > spdArB);
  spdArMeter.style.setProperty("--value", spdArA);
  spdArMeter.style.setProperty("--secondary-value", spdArB);
  spdArMeter.setAttribute("tooltip", strings[locl].stats["spdAr"] + ": " + spdArA);

  const hndGrA = selectedCombo.lvl.hndGr;
  const hndGrB = otherCombo.lvl.hndGr;
  hndGrMeter.classList.toggle("dominant", hndGrA > hndGrB);
  hndGrMeter.style.setProperty("--value", hndGrA);
  hndGrMeter.style.setProperty("--secondary-value", hndGrB);
  hndGrMeter.setAttribute("tooltip", strings[locl].stats["hndGr"] + ": " + hndGrA);

  const hndAgA = selectedCombo.lvl.hndAg;
  const hndAgB = otherCombo.lvl.hndAg;
  hndAgMeter.classList.toggle("dominant", hndAgA > hndAgB);
  hndAgMeter.style.setProperty("--value", hndAgA);
  hndAgMeter.style.setProperty("--secondary-value", hndAgB);
  hndAgMeter.setAttribute("tooltip", strings[locl].stats["hndAg"] + ": " + hndAgA);

  const hndWtA = selectedCombo.lvl.hndWt;
  const hndWtB = otherCombo.lvl.hndWt;
  hndWtMeter.classList.toggle("dominant", hndWtA > hndWtB);
  hndWtMeter.style.setProperty("--value", hndWtA);
  hndWtMeter.style.setProperty("--secondary-value", hndWtB);
  hndWtMeter.setAttribute("tooltip", strings[locl].stats["hndWt"] + ": " + hndWtA);

  const hndArA = selectedCombo.lvl.hndAr;
  const hndArB = otherCombo.lvl.hndAr;
  hndArMeter.classList.toggle("dominant", hndArA > hndArB);
  hndArMeter.style.setProperty("--value", hndArA);
  hndArMeter.style.setProperty("--secondary-value", hndArB);
  hndArMeter.setAttribute("tooltip", strings[locl].stats["hndAr"] + ": " + hndArA);

  const trctnA = selectedCombo.lvl.trctn;
  const trctnB = otherCombo.lvl.trctn;
  trctnMeter.classList.toggle("dominant", trctnA > trctnB);
  trctnMeter.style.setProperty("--value", trctnA);
  trctnMeter.style.setProperty("--secondary-value", trctnB);
  trctnMeter.setAttribute("tooltip", strings[locl].stats["trctn"] + ": " + trctnA);

  const invcbA = selectedCombo.lvl.invcb;
  const invcbB = otherCombo.lvl.invcb;
  invcbMeter.classList.toggle("dominant", invcbA > invcbB);
  invcbMeter.style.setProperty("--value", invcbA);
  invcbMeter.style.setProperty("--secondary-value", invcbB);
  invcbMeter.setAttribute("tooltip", strings[locl].stats["invcb"] + ": " + invcbA);

  if (updateURL) updateURLParams();

  return drawRelatedTables();
}

function drawPartsGrids() {
  const folders = {};
  for (const driver of Object.keys(gameStats.parts.drivers)) {
    const driverName = strings[locl].drivers[driver];

    const button = document.createElement("button");
    button.value = driver;
    button.title = driverName;

    const icon = document.createElement("img");
    icon.loading = "lazy";
    icon.src = "/resources/graphics/drivers/" + driver + ".webp";
    icon.alt = driverName;
    icon.width = 40;
    icon.height = 40;
    button.append(icon);

    const folder = gameStats.parts.drivers[driver].folder;
    if (folder !== undefined) {
      if (folders[folder] == undefined) {
        // Create folder
        const folderButton = button.cloneNode(true);
        folderButton.removeAttribute("value");
        folderButton.title = strings[locl].driverFolders[folder];
        folderButton.dataset.folder = folder;
        folderButton.classList.add("folder");
        const folderContent = document.createElement("div");
        folderButton.append(folderContent);
        driverSelect.append(folderButton);
        folders[folder] = folderContent;
      }
      folders[folder].append(button);

    } else {
      driverSelect.append(button);
    }
  }

  const karts = document.createElement("div");
  karts.classList.add("parts-grid");
  const atvs = document.createElement("div");
  atvs.classList.add("parts-grid");
  const bikes = document.createElement("div");
  bikes.classList.add("parts-grid");
  const sportBikes = document.createElement("div");
  sportBikes.classList.add("parts-grid");
  for (const body of Object.keys(gameStats.parts.bodies)) {
    const bodyName = strings[locl].bodies[body];

    const button = document.createElement("button");
    button.value = body;
    button.title = bodyName;

    const icon = document.createElement("img");
    icon.loading = "lazy";
    icon.src = "/resources/graphics/bodies/" + body + ".webp";
    icon.alt = bodyName;
    icon.width = 200;
    icon.height = 128;
    button.append(icon);

    switch (gameStats.parts.bodies[body].type) {
      case "kart":
        karts.append(button);
        break;
      case "bike":
        bikes.append(button);
        break;
      case "sport":
        sportBikes.append(button);
        break;
      case "atv":
        atvs.append(button);
        break;
    }
  }
  bodySelect.append(karts);
  bodySelect.append(atvs);
  bodySelect.append(bikes);
  bodySelect.append(sportBikes);

  for (const tire of Object.keys(gameStats.parts.tires)) {
    const tireName = strings[locl].tires[tire];

    const button = document.createElement("button");
    button.value = tire;
    button.title = tireName;

    const icon = document.createElement("img");
    icon.loading = "lazy";
    icon.src = "/resources/graphics/tires/" + tire + ".webp";
    icon.alt = tireName;
    icon.width = 200;
    icon.height = 128;
    button.append(icon);

    tireSelect.append(button);
  }

  for (const glider of Object.keys(gameStats.parts.gliders)) {
    const gliderName = strings[locl].gliders[glider];

    const button = document.createElement("button");
    button.value = glider;
    button.title = gliderName;

    const icon = document.createElement("img");
    icon.loading = "lazy";
    icon.src = "/resources/graphics/gliders/" + glider + ".webp";
    icon.alt = gliderName;
    icon.width = 200;
    icon.height = 128;
    button.append(icon);

    gliderSelect.append(button);
  }
}

// Update the parts grid to match combo.
function selectCombo(combo) {
  combo ??= selectedCombo;
  selectDriver(combo.driver);
  selectBody(combo.body);
  selectTire(combo.tire);
  selectGlider(combo.glider);
}

function selectDriver(driver) {
  for (const button of driverSelect.querySelectorAll("button")) {
    let selected = false;
    let highlight = false;

    if (button.value != "") { // Driver button
      selected = button.value == driver;
      highlight = gameStats.parts.drivers[button.value].group == gameStats.parts.drivers[driver].group;

    } else { // Folder button
      selected = button.dataset.folder == gameStats.parts.drivers[driver].folder;
      if (button.dataset.folder == gameStats.parts.drivers[driver].folder) {
        button.children[0].src = "/resources/graphics/drivers/" + driver + ".webp";
      }
      for (const button2 of button.children[1].children) {
        if (gameStats.parts.drivers[button2.value].group == gameStats.parts.drivers[driver].group) {
          highlight = true;
        }
      }
    }

    button.classList.toggle("selected", selected);
    button.classList.toggle("highlight", highlight);
  }
}

function selectBody(body) {
  for (const button of bodySelect.querySelectorAll("button")) {
    button.classList.toggle("selected", button.value == body);
    button.classList.toggle("highlight", gameStats.parts.bodies[button.value].group == gameStats.parts.bodies[body].group);
  }
}

function selectTire(tire) {
  for (const button of tireSelect.querySelectorAll("button")) {
    button.classList.toggle("selected", button.value == tire);
    button.classList.toggle("highlight", gameStats.parts.tires[button.value].group == gameStats.parts.tires[tire].group);
  }
}

function selectGlider(glider) {
  for (const button of gliderSelect.querySelectorAll("button")) {
    button.classList.toggle("selected", button.value == glider);
    button.classList.toggle("highlight", gameStats.parts.gliders[button.value].group == gameStats.parts.gliders[glider].group);
  }
}

function randomCombo() {
  if (!driverLock.state) selectedCombo.driver = Combo.randomDriver();
  if (!bodyLock.state) selectedCombo.body = Combo.randomBody();
  if (!tireLock.state) selectedCombo.tire = Combo.randomTire();
  if (!gliderLock.state) selectedCombo.glider = Combo.randomGlider();
  drawCurrentCombo();
  selectCombo();
}

async function getDominantCombos(ignoreLocks = false) {
  let opts = {
    mustDiffer: true,
    mintbMin: selectedCombo.lvl.mintb,
    spdGrMin: selectedCombo.lvl.spdGr, spdWtMin: selectedCombo.lvl.spdWt,
    spdAgMin: selectedCombo.lvl.spdAg, spdArMin: selectedCombo.lvl.spdAr,
    accelMin: selectedCombo.lvl.accel, weigtMin: selectedCombo.lvl.weigt,
    hndGrMin: selectedCombo.lvl.hndGr, hndWtMin: selectedCombo.lvl.hndWt,
    hndAgMin: selectedCombo.lvl.hndAg, hndArMin: selectedCombo.lvl.hndAr,
    trctnMin: selectedCombo.lvl.trctn, invcbMin: selectedCombo.lvl.invcb
  };
  if (!ignoreLocks) {
    if (driverLock.state) opts.driverLock = selectedCombo.driver;
    if (bodyLock.state) opts.bodyLock = selectedCombo.body;
    if (tireLock.state) opts.tireLock = selectedCombo.tire;
    if (gliderLock.state) opts.gliderLock = selectedCombo.glider;
  }
  return listCombos(opts);
}

async function getSimilarCombos(ignoreLocks = false) {
  let opts = {
    mustDiffer: true, maxAbsDiff: 2.5, minDiff: -.75,
    mintb: selectedCombo.lvl.mintb,
    spdGr: selectedCombo.lvl.spdGr, spdWt: selectedCombo.lvl.spdWt,
    spdAg: selectedCombo.lvl.spdAg, spdAr: selectedCombo.lvl.spdAr,
    accel: selectedCombo.lvl.accel, weigt: selectedCombo.lvl.weigt,
    hndGr: selectedCombo.lvl.hndGr, hndWt: selectedCombo.lvl.hndWt,
    hndAg: selectedCombo.lvl.hndAg, hndAr: selectedCombo.lvl.hndAr,
    trctn: selectedCombo.lvl.trctn, invcb: selectedCombo.lvl.invcb
  };
  if (!ignoreLocks) {
    if (driverLock.state) opts.driverLock = selectedCombo.driver;
    if (bodyLock.state) opts.bodyLock = selectedCombo.body;
    if (tireLock.state) opts.tireLock = selectedCombo.tire;
    if (gliderLock.state) opts.gliderLock = selectedCombo.glider;
  }
  return listCombos(opts);
}

async function getCustomCombos() {
  const opts = structuredClone(customFormula);
  opts.sortBy = "score";

  if (!customFormula.ignoreLocks) {
    if (driverLock.state) opts.driverLock = selectedCombo.driver;
    if (bodyLock.state) opts.bodyLock = selectedCombo.body;
    if (tireLock.state) opts.tireLock = selectedCombo.tire;
    if (gliderLock.state) opts.gliderLock = selectedCombo.glider;
  }

  return listCombos(opts);
}

// TODO: Abstract this and avoid repeated calls to listCombos.
async function getTier() {
  return getDominantCombos(true).then(dominantCombos => {
    const nbCombos = 28224; // Nb of different *class* combinations
    const nbDominantCombos = dominantCombos.length;

    if (nbDominantCombos == 0) return "S";
    if (nbDominantCombos / nbCombos < .0003) return "A";
    if (nbDominantCombos / nbCombos < .002) return "B";
    if (nbDominantCombos / nbCombos < .0035) return "C";
    return "D";
  })
}

async function drawRelatedTables() {
  return Promise.all([drawDominantCombos(), drawSimilarCombos(),
                      drawCustomCombos()]);
}

async function drawDominantCombos() {
  return getDominantCombos().then(dominantCombos => {
    dominantCombosRows.innerHTML = "";
    dominantCombosCount.innerText = dominantCombos.length;
    fillTable(dominantCombosRows, dominantCombos);
  });
}

async function drawSimilarCombos() {
  return getSimilarCombos().then(similarCombos => {
    similarCombosRows.innerHTML = "";
    similarCombosCount.innerText = similarCombos.length;
    fillTable(similarCombosRows, similarCombos);
  });
}

async function drawCustomCombos() {
  return getCustomCombos().then(customCombos => {
    customCombosRows.innerHTML = "";
    customCombosCount.innerText = customCombos.length;
    customComboFormula.innerHTML = formatFormula(customFormula);
    fillTable(customCombosRows, customCombos.slice(0, 100));
    // Truncation info
    if (customCombos.length > 100) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 14;
      cell.classList.add("empty");
      const para = document.createElement("p");
      para.innerHTML = "Showing top 100 matches.<br>Try refining the formula to see more.";
      row.append(cell);
      cell.append(para);
      customCombosRows.append(row);
    }
  });
}

function formatFormula(formula) {
  const stats = [];
  for (let i = 0; i < ComboC.SCORE_STATS.length; i++) {
    const statCode = ComboC.SCORE_STATS[i].toUpperCase();
    let weight = formula.scoreFormula[i];
    if (weight == 0) continue;
    const sign = weight < 0 ? "-" : "";
    const className = weight < 0 ? "negative" : "positive";
    weight = Math.abs(weight).toString();
    if (weight[0] == "0") weight = weight.substr(1);
    const term = '<span class="' + className + '">' + sign + weight + '<span class="coefficient-separator">×</span>' + statCode + "</span>";
    stats.push(term);
  }
  let s = '<span class="formula">' + stats.join(" + ") + "</span>";

  const locks = [];
  if (!formula.ignoreLocks) {
    if (driverLock.state) locks.push(strings[locl].drivers[selectedCombo.driver]);
    if (bodyLock.state) locks.push(strings[locl].bodies[selectedCombo.body]);
    if (tireLock.state) locks.push(strings[locl].tires[selectedCombo.tire]);
    if (gliderLock.state) locks.push(strings[locl].gliders[selectedCombo.glider]);
  }

  let exclusionsString = "";
  if (formula.ignoreLocks || !bodyLock.state) {
    const exclusions = [];
    if (formula.excludeKarts) exclusions.push("karts");
    if (formula.excludeATVs) exclusions.push("ATVs");
    if (formula.excludeBikes) exclusions.push("outside drifting bikes");
    if (formula.excludeSportBikes) exclusions.push("inside drifting bikes");

    if (exclusions.length == 3) {
      if (!formula.excludeKarts) exclusionsString = "Karts only";
      else if (!formula.excludeATVs) exclusionsString = "ATVs only";
      else if (!formula.excludeBikes) exclusionsString = "Outside drifting bikes only";
      else if (!formula.excludeSportBikes) exclusionsString = "Inside drifting bikes only";
      } else if (!formula.excludeKarts && !formula.excludeATVs &&
                  formula.excludeBikes && formula.excludeSportBikes) {
        exclusionsString = "No bikes";
      } else if (formula.excludeKarts && formula.excludeATVs &&
                !formula.excludeBikes && !formula.excludeSportBikes) {
        exclusionsString = "Bikes only";
      } else if (exclusions.length > 0) {
        exclusionsString = "No ";
        exclusionsString += exclusions.slice(0, -1).join(", ");
        if (exclusions.length > 1) exclusionsString += " or ";
        exclusionsString += exclusions.at(-1);
    }
  }

  if (locks.length > 0 || exclusionsString.length > 0) s += "<br>";
  s += locks.join(", ");
  if (locks.length > 0 && exclusionsString.length > 0) s += " — ";
  s += exclusionsString;

  return s;
}

function fillTable(tableEl, data) {
  // No results.
  if (data.length == 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 14;
    cell.classList.add("empty");
    const para = document.createElement("p");
    para.innerText = "No combos found.";
    row.append(cell);
    cell.append(para);
    tableEl.append(row);
    return;
  }

  const rows = [];

  let sortIndex = 0;
  for (const combo of data) {
    const row = document.createElement("tr");

    // Use current combo's parts if same stats.
    let driver = combo.driver;
    if (gameStats.parts.drivers[selectedCombo.driver].stats == gameStats.parts.drivers[driver].stats) {
      driver = selectedCombo.driver;
    }
    let body = combo.body;
    if (gameStats.parts.bodies[selectedCombo.body].stats == gameStats.parts.bodies[body].stats) {
      body = selectedCombo.body;
    }
    let tire = combo.tire;
    if (gameStats.parts.tires[selectedCombo.tire].stats == gameStats.parts.tires[tire].stats) {
      tire = selectedCombo.tire;
    }
    let glider = combo.glider;
    if (gameStats.parts.gliders[selectedCombo.glider].stats == gameStats.parts.gliders[glider].stats) {
      glider = selectedCombo.glider;
    }

    const comboDisplay = document.createElement("td");
    comboDisplay.dataset.value = sortIndex--;
    const driverDisplay = document.createElement("img");
    driverDisplay.loading = "lazy";
    driverDisplay.width = 128;
    driverDisplay.height = 128;
    driverDisplay.src = "/resources/graphics/drivers/" + driver + ".webp";
    driverDisplay.title = strings[locl].drivers[driver];
    const bodyDisplay = document.createElement("img");
    bodyDisplay.loading = "lazy";
    bodyDisplay.width = 200;
    bodyDisplay.height = 128;
    bodyDisplay.src = "/resources/graphics/bodies/" + body + ".webp";
    bodyDisplay.title = strings[locl].bodies[body];
    const tireDisplay = document.createElement("img");
    tireDisplay.loading = "lazy";
    tireDisplay.width = 200;
    tireDisplay.height = 128;
    tireDisplay.src = "/resources/graphics/tires/" + tire + ".webp";
    tireDisplay.title = strings[locl].tires[tire];
    const gliderDisplay = document.createElement("img");
    gliderDisplay.loading = "lazy";
    gliderDisplay.width = 200;
    gliderDisplay.height = 128;
    gliderDisplay.src = "/resources/graphics/gliders/" + glider + ".webp";
    gliderDisplay.title = strings[locl].gliders[glider];

    // Slot Buttons
    const pickSlot = document.createElement("div");
    pickSlot.classList.add("pick-slot");
    const toSlotA = document.createElement("button");
    if (selectedCombo == combos.a) toSlotA.classList.add("primary");
    toSlotA.innerText = "→A";
    toSlotA.addEventListener("click", () => {
      combos.a.driver = driver;
      combos.a.body = body;
      combos.a.tire = tire;
      combos.a.glider = glider;
      selectCombo();
      drawCurrentCombo();
    });
    const toSlotB = document.createElement("button");
    if (selectedCombo == combos.b) toSlotB.classList.add("primary");
    toSlotB.innerText = "→B";
    toSlotB.addEventListener("click", () => {
      combos.b.driver = driver;
      combos.b.body = body;
      combos.b.tire = tire;
      combos.b.glider = glider;
      selectCombo();
      drawCurrentCombo();
    });
    pickSlot.append(toSlotA, toSlotB);

    comboDisplay.append(driverDisplay, bodyDisplay, tireDisplay, gliderDisplay, pickSlot);
    row.append(comboDisplay);

    const mobileStats = document.createElement("div");
    mobileStats.classList.add("only-mobile", "mobile-stats");
    for (const stat of ["mintb", "spdGr", "spdAg", "spdWt", "spdAr",
    "accel", "weigt", "hndGr", "hndAg", "hndWt", "hndAr", "trctn", "invcb"]) {
      const cell = document.createElement("td");
      const diff = combo.lvl[stat] - selectedCombo.lvl[stat];
      const formattedDiff = formatStatDiff(diff);
      cell.dataset.value = diff;
      cell.classList.toggle("positive", diff > 0);
      cell.classList.toggle("negative", diff < 0);
      cell.innerText = formattedDiff;
      row.append(cell);
      if (diff !== 0) {
        const label = document.createElement("label");
        label.innerText = strings[locl].statsCode[stat];
        const value = document.createElement("span");
        value.innerText = formattedDiff;
        value.classList.toggle("positive", diff > 0);
        value.classList.toggle("negative", diff < 0);
        const statOutput = document.createElement("div");
        statOutput.append(label, value);
        mobileStats.append(statOutput);
      }
    }
    comboDisplay.append(mobileStats);

    rows.push(row);
  }
  tableEl.append(...rows);
}

function formatStatDiff(diff) {
  let text = Math.abs(diff).toString();
  if (diff != 0 && text[0] == "0") text = text.substr(1);
  if (diff >= 0) { text = "+" + text; }
  else { text = "-" + text; }
  return text;
}

function drawCustomFormulaInterface() {
  mintbWeight.value = customFormula.scoreFormula[0] ?? "";
  spdWeight.value = customFormula.scoreFormula[1] ?? "";
  // spdGrWeight.value = customFormula.scoreFormula[2] ?? "";
  // spdAgWeight.value = customFormula.scoreFormula[3] ?? "";
  // spdWtWeight.value = customFormula.scoreFormula[4] ?? "";
  // spdArWeight.value = customFormula.scoreFormula[5] ?? "";
  accelWeight.value = customFormula.scoreFormula[6] ?? "";
  weigtWeight.value = customFormula.scoreFormula[7] ?? "";
  hndWeight.value = customFormula.scoreFormula[8] ?? "";
  // hndGrWeight.value = customFormula.scoreFormula[9] ?? "";
  // hndAgWeight.value = customFormula.scoreFormula[10] ?? "";
  // hndWtWeight.value = customFormula.scoreFormula[11] ?? "";
  // hndArWeight.value = customFormula.scoreFormula[12] ?? "";
  trctnWeight.value = customFormula.scoreFormula[13] ?? "";
  invcbWeight.value = customFormula.scoreFormula[14] ?? "";
  sizeWeight.value = customFormula.scoreFormula[15] ?? "";

  mintbMin.value = customFormula.mintbMin != 0 ? customFormula.mintbMin : "";
  mintbMax.value = customFormula.mintbMax != 6 ? customFormula.mintbMax : "";
  spdMin.value = customFormula.spdMin != 0 ? customFormula.spdMin : "";
  spdMax.value = customFormula.spdMax != 6 ? customFormula.spdMax : "";
  // spdGrMin.value = customFormula.spdGrMin != 0 ? customFormula.spdGrMin : "";
  // spdGrMax.value = customFormula.spdGrMax != 6 ? customFormula.spdGrMax : "";
  // spdAgMin.value = customFormula.spdAgMin != 0 ? customFormula.spdAgMin : "";
  // spdAgMax.value = customFormula.spdAgMax != 6 ? customFormula.spdAgMax : "";
  // spdWtMin.value = customFormula.spdWtMin != 0 ? customFormula.spdWtMin : "";
  // spdWtMax.value = customFormula.spdWtMax != 6 ? customFormula.spdWtMax : "";
  // spdArMin.value = customFormula.spdArMin != 0 ? customFormula.spdArMin : "";
  // spdArMax.value = customFormula.spdArMax != 6 ? customFormula.spdArMax : "";
  accelMin.value = customFormula.accelMin != 0 ? customFormula.accelMin : "";
  accelMax.value = customFormula.accelMax != 6 ? customFormula.accelMax : "";
  weigtMin.value = customFormula.weigtMin != 0 ? customFormula.weigtMin : "";
  weigtMax.value = customFormula.weigtMax != 6 ? customFormula.weigtMax : "";
  hndMin.value = customFormula.hndMin != 0 ? customFormula.hndMin : "";
  hndMax.value = customFormula.hndMax != 6 ? customFormula.hndMax : "";
  // hndGrMin.value = customFormula.hndGrMin != 0 ? customFormula.hndGrMin : "";
  // hndGrMax.value = customFormula.hndGrMax != 6 ? customFormula.hndGrMax : "";
  // hndAgMin.value = customFormula.hndAgMin != 0 ? customFormula.hndAgMin : "";
  // hndAgMax.value = customFormula.hndAgMax != 6 ? customFormula.hndAgMax : "";
  // hndWtMin.value = customFormula.hndWtMin != 0 ? customFormula.hndWtMin : "";
  // hndWtMax.value = customFormula.hndWtMax != 6 ? customFormula.hndWtMax : "";
  // hndArMin.value = customFormula.hndArMin != 0 ? customFormula.hndArMin : "";
  // hndArMax.value = customFormula.hndArMax != 6 ? customFormula.hndArMax : "";
  trctnMin.value = customFormula.trctnMin != 0 ? customFormula.trctnMin : "";
  trctnMax.value = customFormula.trctnMax != 6 ? customFormula.trctnMax : "";
  invcbMin.value = customFormula.invcbMin != 0 ? customFormula.invcbMin : "";
  invcbMax.value = customFormula.invcbMax != 6 ? customFormula.invcbMax : "";
  sizeMin.value = customFormula.sizeMin != 0 ? customFormula.sizeMin : "";
  sizeMax.value = customFormula.sizeMax != 2 ? customFormula.sizeMax : "";

  updateFormulaMode(mintbWeight, mintbMode)
  updateFormulaMode(spdWeight, spdMode)
  // updateFormulaMode(spdGrWeight, spdGrMode)
  // updateFormulaMode(spdAgWeight, spdAgMode)
  // updateFormulaMode(spdWtWeight, spdWtMode)
  // updateFormulaMode(spdArWeight, spdArMode)
  updateFormulaMode(accelWeight, accelMode)
  updateFormulaMode(weigtWeight, weigtMode)
  updateFormulaMode(hndWeight, hndMode)
  // updateFormulaMode(hndGrWeight, hndGrMode)
  // updateFormulaMode(hndAgWeight, hndAgMode)
  // updateFormulaMode(hndWtWeight, hndWtMode)
  // updateFormulaMode(hndArWeight, hndArMode)
  updateFormulaMode(trctnWeight, trctnMode)
  updateFormulaMode(invcbWeight, invcbMode)
  updateFormulaMode(sizeWeight, sizeMode)

  includeKarts.set(!customFormula.excludeKarts);
  includeATVs.set(!customFormula.excludeATVs);
  includeBikes.set(!customFormula.excludeBikes);
  includeSportBikes.set(!customFormula.excludeSportBikes);

  ignoreLocksFormula.set(customFormula.ignoreLocks);
}

function resetCustomFormula() {
  customFormula = {
    scoreFormula: [...ComboC.OPTISCORE],
    mintbMin: 0, mintbMax: 6, spdMin: 0, spdMax: 6,
    spdGrMin: 0, spdGrMax: 6, spdAgMin: 0, spdAgMax: 6,
    spdWtMin: 0, spdWtMax: 6, spdArMin: 0, spdArMax: 6,
    accelMin: 0, accelMax: 6, weigtMin: 0, weigtMax: 6, hndMin: 0, hndMax: 6,
    hndGrMin: 0, hndGrMax: 6, hndAgMin: 0, hndAgMax: 6,
    hndWtMin: 0, hndWtMax: 6, hndArMin: 0, hndArMax: 6,
    trctnMin: 0, trctnMax: 6, invcbMin: 0, invcbMax: 6, sizeMin: 0, sizeMax: 2,
    excludeKarts: false, excludeATVs: false,
    excludeBikes: false, excludeSportBikes: true,
    ignoreLocks: true
  };
  drawCustomFormulaInterface();
}

function commitFormula() {
  customFormula.scoreFormula[0] = parseFactor(mintbWeight.value) ?? 0;
  customFormula.scoreFormula[1] = parseFactor(spdWeight.value) ?? 0;
  // customFormula.scoreFormula[2] = parseFactor(spdGrWeight.value) ?? 0;
  // customFormula.scoreFormula[3] = parseFactor(spdAgWeight.value) ?? 0;
  // customFormula.scoreFormula[4] = parseFactor(spdWtWeight.value) ?? 0;
  // customFormula.scoreFormula[5] = parseFactor(spdArWeight.value) ?? 0;
  customFormula.scoreFormula[6] = parseFactor(accelWeight.value) ?? 0;
  customFormula.scoreFormula[7] = parseFactor(weigtWeight.value) ?? 0;
  customFormula.scoreFormula[8] = parseFactor(hndWeight.value) ?? 0;
  // customFormula.scoreFormula[9] = parseFactor(hndGrWeight.value) ?? 0;
  // customFormula.scoreFormula[10] = parseFactor(hndAgWeight.value) ?? 0;
  // customFormula.scoreFormula[11] = parseFactor(hndWtWeight.value) ?? 0;
  // customFormula.scoreFormula[12] = parseFactor(hndArWeight.value) ?? 0;
  customFormula.scoreFormula[13] = parseFactor(trctnWeight.value) ?? 0;
  customFormula.scoreFormula[14] = parseFactor(invcbWeight.value) ?? 0;
  customFormula.scoreFormula[15] = parseFactor(sizeWeight.value) ?? 0;

  customFormula.mintbMin = mintbMin.value != "" ? mintbMin.value : mintbMin.placeholder;
  customFormula.mintbMax = mintbMax.value != "" ? mintbMax.value : mintbMax.placeholder;
  customFormula.spdMin = spdMin.value != "" ? spdMin.value : spdMin.placeholder;
  customFormula.spdMax = spdMax.value != "" ? spdMax.value : spdMax.placeholder;
  // customFormula.spdGrMin = spdGrMin.value != "" ? spdGrMin.value : spdGrMin.placeholder;
  // customFormula.spdGrMax = spdGrMax.value != "" ? spdGrMax.value : spdGrMax.placeholder;
  // customFormula.spdAgMin = spdAgMin.value != "" ? spdAgMin.value : spdAgMin.placeholder;
  // customFormula.spdAgMax = spdAgMax.value != "" ? spdAgMax.value : spdAgMax.placeholder;
  // customFormula.spdWtMin = spdWtMin.value != "" ? spdWtMin.value : spdWtMin.placeholder;
  // customFormula.spdWtMax = spdWtMax.value != "" ? spdWtMax.value : spdWtMax.placeholder;
  // customFormula.spdArMin = spdArMin.value != "" ? spdArMin.value : spdArMin.placeholder;
  // customFormula.spdArMax = spdArMax.value != "" ? spdArMax.value : spdArMax.placeholder;
  customFormula.accelMin = accelMin.value != "" ? accelMin.value : accelMin.placeholder;
  customFormula.accelMax = accelMax.value != "" ? accelMax.value : accelMax.placeholder;
  customFormula.weigtMin = weigtMin.value != "" ? weigtMin.value : weigtMin.placeholder;
  customFormula.weigtMax = weigtMax.value != "" ? weigtMax.value : weigtMax.placeholder;
  customFormula.hndMin = hndMin.value != "" ? hndMin.value : hndMin.placeholder;
  customFormula.hndMax = hndMax.value != "" ? hndMax.value : hndMax.placeholder;
  // customFormula.hndGrMin = hndGrMin.value != "" ? hndGrMin.value : hndGrMin.placeholder;
  // customFormula.hndGrMax = hndGrMax.value != "" ? hndGrMax.value : hndGrMax.placeholder;
  // customFormula.hndAgMin = hndAgMin.value != "" ? hndAgMin.value : hndAgMin.placeholder;
  // customFormula.hndAgMax = hndAgMax.value != "" ? hndAgMax.value : hndAgMax.placeholder;
  // customFormula.hndWtMin = hndWtMin.value != "" ? hndWtMin.value : hndWtMin.placeholder;
  // customFormula.hndWtMax = hndWtMax.value != "" ? hndWtMax.value : hndWtMax.placeholder;
  // customFormula.hndArMin = hndArMin.value != "" ? hndArMin.value : hndArMin.placeholder;
  // customFormula.hndArMax = hndArMax.value != "" ? hndArMax.value : hndArMax.placeholder;
  customFormula.trctnMin = trctnMin.value != "" ? trctnMin.value : trctnMin.placeholder;
  customFormula.trctnMax = trctnMax.value != "" ? trctnMax.value : trctnMax.placeholder;
  customFormula.invcbMin = invcbMin.value != "" ? invcbMin.value : invcbMin.placeholder;
  customFormula.invcbMax = invcbMax.value != "" ? invcbMax.value : invcbMax.placeholder;
  customFormula.sizeMin = sizeMin.value != "" ? sizeMin.value : sizeMin.placeholder;
  customFormula.sizeMax = sizeMax.value != "" ? sizeMax.value : sizeMax.placeholder;

  customFormula.excludeKarts = !includeKarts.state;
  customFormula.excludeATVs = !includeATVs.state;
  customFormula.excludeBikes = !includeBikes.state;
  customFormula.excludeSportBikes = !includeSportBikes.state;

  customFormula.ignoreLocks = ignoreLocksFormula.state;
}

function parseFactor(n) {
  const parsedN = parseFloat(n);
  if (isNaN(parsedN)) return undefined;
  return parsedN;
}

function updateFormulaMode(weightInput, modeOutput) {
  if (weightInput.value > 0) {
    weightInput.className = "positive";
    modeOutput.innerHTML = "Maximize";
    modeOutput.className = "";
  } else if (weightInput.value < 0) {
    weightInput.className = "negative";
    modeOutput.innerHTML = "Minimize";
    modeOutput.className = "";
  } else {
    weightInput.className = "";
    modeOutput.innerHTML = "Ignore";
    modeOutput.className = "subdued";
  }
}

function toggleMode(weightInput, modeOutput) {
  if (weightInput.value != "0" && weightInput.value != "") {
    weightInput.value *= -1;
  } else {
    weightInput.value = 1;
  }
  updateFormulaMode(weightInput, modeOutput);
}

function readURLParams() {
  const url = new URL(window.location.href);
  const aCode = url.searchParams.get("a");
  if (aCode != undefined) combos.a = Combo.fromCode(aCode);
  const bCode = url.searchParams.get("b");
  if (bCode != undefined) combos.b = Combo.fromCode(bCode);
  lastStateURL = location.href;
}

function updateURLParams() {
  const aCode = combos.a.code;
  const bCode = combos.b.code;

  const url = new URL(location.href);
  url.searchParams.set("a", aCode);
  url.searchParams.set("b", bCode);
  const urlStr = url.toString();
  if (urlStr != lastStateURL) {
    history.pushState({}, "", urlStr);
  }
}
