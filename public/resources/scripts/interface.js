console.log("★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★\n\nHello. This is a WIP. Do NOT look at my ugly code. I rushed to release this for Wave 6. I'm working on cleaning it up and adding new features.\n\n★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★");

const locl = "en-US";

const combos = {
  a: new Combo(),
  b: new Combo()
};
readURLParams();
let selectedCombo = combos.a;
let otherCombo = combos.b;

let comboSelect;
let comboTier, comboDetails;
let randomButton, optimizeButton;
let driverImg,   bodyImg,   tireImg,   gliderImg,
    driverLock,  bodyLock,  tireLock,  gliderLock,
    driverLabel, bodyLabel, tireLabel, gliderLabel; // Current combo display
let mintbMeter, accelMeter, weigtMeter, // Stat bars
    spdGrMeter, spdAgMeter, spdWtMeter, spdArMeter,
    hndGrMeter, hndAgMeter, hndWtMeter, hndArMeter,
    trctnMeter, invulMeter;
let driverSelect, bodySelect, tireSelect, gliderSelect; // Part grids
let betterCombosRows, similarCombosRows; // Table bodies

whenDOMReady(() => {
  comboSelect = document.getElementById("combo-tabs");

  comboTier = document.getElementById("combo-tier");
  comboDetails = document.getElementById("combo-details");

  randomButton = document.getElementById("random-button");
  optimizeButton = document.getElementById("optimize-button");

  driverImg = document.getElementById("current-driver-img");
  driverLock = document.getElementById("driver-lock");
  driverLabel = document.getElementById("current-driver-label");
  bodyImg = document.getElementById("current-body-img");
  bodyLock = document.getElementById("body-lock");
  bodyLabel = document.getElementById("current-body-label");
  tireImg = document.getElementById("current-tire-img");
  tireLock = document.getElementById("tire-lock");
  tireLabel = document.getElementById("current-tire-label");
  gliderImg = document.getElementById("current-glider-img");
  gliderLock = document.getElementById("glider-lock");
  gliderLabel = document.getElementById("current-glider-label");

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
  invulMeter = document.getElementById("invul-meter");

  driverSelect = document.getElementById("drivers");
  bodySelect   = document.getElementById("bodies");
  tireSelect   = document.getElementById("tires");
  gliderSelect = document.getElementById("gliders");

  betterCombosRows = document.getElementById("better-combos-rows");
  similarCombosRows = document.getElementById("similar-combos-rows");

  initRadioGroup(comboSelect).addEventListener("change", e => {
    comboID = e.target.dataset.value;
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

  addEventListener("popstate", () => {
    readURLParams();
    selectedCombo = combos.a;
    otherCombo = combos.b;
    selectCombo();
    drawCurrentCombo(false);
  });

  drawPartsGrids();

  const driverFolders = driverSelect.querySelectorAll(".folder");
  closeAllDriverFolders = () => {
    for (const folder of driverFolders) {
      folder.classList.remove("open");
    }
  }
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
  });
  initRadioGroup(bodySelect).addEventListener("change", e => {
    const value = e.target.dataset.value;
    selectedCombo.body = value;
    selectBody(value);
    drawCurrentCombo();
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
  });

  selectCombo();
  drawCurrentCombo();
});

// Updates view output to the currently selected combo (a/b).
function drawCurrentCombo(updateURL = true) {
  comboTier.className = getTier();
  comboDetails.innerText = strings[locl].size[selectedCombo.getLevel("size")];
  if (gameStats.parts.bodies[selectedCombo.body].type == "sport") {
    comboDetails.innerText += ", " + strings[locl].driftStyle.in;
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
  const mintbA = selectedCombo.getLevel("mintb");
  const mintbB = otherCombo.getLevel("mintb");
  mintbMeter.classList.toggle("dominant", mintbA > mintbB);
  mintbMeter.style.setProperty("--value", mintbA);
  mintbMeter.style.setProperty("--secondary-value", mintbB);
  mintbMeter.title = strings[locl].stats["mintb"] + ": " + mintbA;

  const accelA = selectedCombo.getLevel("accel");
  const accelB = otherCombo.getLevel("accel");
  accelMeter.classList.toggle("dominant", accelA > accelB);
  accelMeter.style.setProperty("--value", accelA);
  accelMeter.style.setProperty("--secondary-value", accelB);
  accelMeter.title = strings[locl].stats["accel"] + ": " + accelA;

  const weigtA = selectedCombo.getLevel("weigt");
  const weigtB = otherCombo.getLevel("weigt");
  weigtMeter.classList.toggle("dominant", weigtA > weigtB);
  weigtMeter.style.setProperty("--value", weigtA);
  weigtMeter.style.setProperty("--secondary-value", weigtB);
  weigtMeter.title = strings[locl].stats["weigt"] + ": " + weigtA;

  const spdGrA = selectedCombo.getLevel("spdGr");
  const spdGrB = otherCombo.getLevel("spdGr");
  spdGrMeter.classList.toggle("dominant", spdGrA > spdGrB);
  spdGrMeter.style.setProperty("--value", spdGrA);
  spdGrMeter.style.setProperty("--secondary-value", spdGrB);
  spdGrMeter.title = strings[locl].stats["spdGr"] + ": " + spdGrA;

  const spdAgA = selectedCombo.getLevel("spdAg");
  const spdAgB = otherCombo.getLevel("spdAg");
  spdAgMeter.classList.toggle("dominant", spdAgA > spdAgB);
  spdAgMeter.style.setProperty("--value", spdAgA);
  spdAgMeter.style.setProperty("--secondary-value", spdAgB);
  spdAgMeter.title = strings[locl].stats["spdAg"] + ": " + spdAgA;

  const spdWtA = selectedCombo.getLevel("spdWt");
  const spdWtB = otherCombo.getLevel("spdWt");
  spdWtMeter.classList.toggle("dominant", spdWtA > spdWtB);
  spdWtMeter.style.setProperty("--value", spdWtA);
  spdWtMeter.style.setProperty("--secondary-value", spdWtB);
  spdWtMeter.title = strings[locl].stats["spdWt"] + ": " + spdWtA;

  const spdArA = selectedCombo.getLevel("spdAr");
  const spdArB = otherCombo.getLevel("spdAr");
  spdArMeter.classList.toggle("dominant", spdArA > spdArB);
  spdArMeter.style.setProperty("--value", spdArA);
  spdArMeter.style.setProperty("--secondary-value", spdArB);
  spdArMeter.title = strings[locl].stats["spdAr"] + ": " + spdArA;

  const hndGrA = selectedCombo.getLevel("hndGr");
  const hndGrB = otherCombo.getLevel("hndGr");
  hndGrMeter.classList.toggle("dominant", hndGrA > hndGrB);
  hndGrMeter.style.setProperty("--value", hndGrA);
  hndGrMeter.style.setProperty("--secondary-value", hndGrB);
  hndGrMeter.title = strings[locl].stats["hndGr"] + ": " + hndGrA;

  const hndAgA = selectedCombo.getLevel("hndAg");
  const hndAgB = otherCombo.getLevel("hndAg");
  hndAgMeter.classList.toggle("dominant", hndAgA > hndAgB);
  hndAgMeter.style.setProperty("--value", hndAgA);
  hndAgMeter.style.setProperty("--secondary-value", hndAgB);
  hndAgMeter.title = strings[locl].stats["hndAg"] + ": " + hndAgA;

  const hndWtA = selectedCombo.getLevel("hndWt");
  const hndWtB = otherCombo.getLevel("hndWt");
  hndWtMeter.classList.toggle("dominant", hndWtA > hndWtB);
  hndWtMeter.style.setProperty("--value", hndWtA);
  hndWtMeter.style.setProperty("--secondary-value", hndWtB);
  hndWtMeter.title = strings[locl].stats["hndWt"] + ": " + hndWtA;

  const hndArA = selectedCombo.getLevel("hndAr");
  const hndArB = otherCombo.getLevel("hndAr");
  hndArMeter.classList.toggle("dominant", hndArA > hndArB);
  hndArMeter.style.setProperty("--value", hndArA);
  hndArMeter.style.setProperty("--secondary-value", hndArB);
  hndArMeter.title = strings[locl].stats["hndAr"] + ": " + hndArA;

  const trctnA = selectedCombo.getLevel("trctn");
  const trctnB = otherCombo.getLevel("trctn");
  trctnMeter.classList.toggle("dominant", trctnA > trctnB);
  trctnMeter.style.setProperty("--value", trctnA);
  trctnMeter.style.setProperty("--secondary-value", trctnB);
  trctnMeter.title = strings[locl].stats["trctn"] + ": " + trctnA;

  const invulA = selectedCombo.getLevel("invul");
  const invulB = otherCombo.getLevel("invul");
  invulMeter.classList.toggle("dominant", invulA > invulB);
  invulMeter.style.setProperty("--value", invulA);
  invulMeter.style.setProperty("--secondary-value", invulB);
  invulMeter.title = strings[locl].stats["invul"] + ": " + invulA;

  if (updateURL) updateURLParams();

  drawBetterCombos();
  drawSimilarCombos();
}

function drawPartsGrids() {
  const folders = {};
  for (const driver of Object.keys(gameStats.parts.drivers)) {
    const driverName = strings[locl].drivers[driver];

    const button = document.createElement("button");
    button.value = driver;
    button.title = driverName;

    const icon = document.createElement("img");
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

function getBetterCombos() {
  return listCombos({
    mustDiffer: true,
    mintbMin: selectedCombo.getLevel("mintb"),
    spdGrMin: selectedCombo.getLevel("spdGr"),
    spdWtMin: selectedCombo.getLevel("spdWt"),
    spdAgMin: selectedCombo.getLevel("spdAg"),
    spdArMin: selectedCombo.getLevel("spdAr"),
    accelMin: selectedCombo.getLevel("accel"),
    weigtMin: selectedCombo.getLevel("weigt"),
    hndGrMin: selectedCombo.getLevel("hndGr"),
    hndWtMin: selectedCombo.getLevel("hndWt"),
    hndAgMin: selectedCombo.getLevel("hndAg"),
    hndArMin: selectedCombo.getLevel("hndAr"),
    trctnMin: selectedCombo.getLevel("trctn"),
    invulMin: selectedCombo.getLevel("invul")
  });
}

function getWorseCombos() {
  return listCombos({
    mustDiffer: true,
    mintbMax: selectedCombo.getLevel("mintb"),
    spdGrMax: selectedCombo.getLevel("spdGr"),
    spdWtMax: selectedCombo.getLevel("spdWt"),
    spdAgMax: selectedCombo.getLevel("spdAg"),
    spdArMax: selectedCombo.getLevel("spdAr"),
    accelMax: selectedCombo.getLevel("accel"),
    weigtMax: selectedCombo.getLevel("weigt"),
    hndGrMax: selectedCombo.getLevel("hndGr"),
    hndWtMax: selectedCombo.getLevel("hndWt"),
    hndAgMax: selectedCombo.getLevel("hndAg"),
    hndArMax: selectedCombo.getLevel("hndAr"),
    trctnMax: selectedCombo.getLevel("trctn"),
    invulMax: selectedCombo.getLevel("invul")
  });
}

function getSimilarCombos() {
  const mintb = selectedCombo.getLevel("mintb");
  const spdGr = selectedCombo.getLevel("spdGr");
  const spdWt = selectedCombo.getLevel("spdWt");
  const spdAg = selectedCombo.getLevel("spdAg");
  const spdAr = selectedCombo.getLevel("spdAr");
  const accel = selectedCombo.getLevel("accel");
  const weigt = selectedCombo.getLevel("weigt");
  const hndGr = selectedCombo.getLevel("hndGr");
  const hndWt = selectedCombo.getLevel("hndWt");
  const hndAg = selectedCombo.getLevel("hndAg");
  const hndAr = selectedCombo.getLevel("hndAr");
  const trctn = selectedCombo.getLevel("trctn");
  const invul = selectedCombo.getLevel("invul");
  return listCombos({
    maxAbsDiff: 2, minDiff: -.5,
    mintb: mintb, accel: accel, weigt: weigt, trctn: trctn, invul: invul,
    spdGr: spdGr, spdWt: spdWt, spdAg: spdAg, spdAr: spdAr,
    hndGr: hndGr, hndWt: hndWt, hndAg: hndAg, hndAr: hndAr
  });
}

// TODO: Abstract this and avoid repeated calls to listCombos.
function getTier() {
  const nbCombos = 28224; // Nb of different *class* combinations
  const nbBetterCombos = getBetterCombos().length;

  if (nbBetterCombos == 0) return "S";
  if (nbBetterCombos / nbCombos < .0003) return "A";
  if (nbBetterCombos / nbCombos < .002) return "B";
  if (nbBetterCombos / nbCombos < .0035) return "C";
  return "D";
}

function drawBetterCombos() {
  const betterCombos = getBetterCombos();
  betterCombosRows.innerHTML = "";

  fillTable(betterCombosRows, betterCombos);
}

function drawSimilarCombos() {
  const similarCombos = getSimilarCombos();
  similarCombosRows.innerHTML = "";

  fillTable(similarCombosRows, similarCombos);
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
    const driverDisplay = document.createElement("img");
    driverDisplay.src = "/resources/graphics/drivers/" + driver + ".webp";
    driverDisplay.title = strings[locl].drivers[driver];
    const bodyDisplay = document.createElement("img");
    bodyDisplay.src = "/resources/graphics/bodies/" + body + ".webp";
    bodyDisplay.title = strings[locl].bodies[body];
    const tireDisplay = document.createElement("img");
    tireDisplay.src = "/resources/graphics/tires/" + tire + ".webp";
    tireDisplay.title = strings[locl].tires[tire];
    const gliderDisplay = document.createElement("img");
    gliderDisplay.src = "/resources/graphics/gliders/" + glider + ".webp";
    gliderDisplay.title = strings[locl].gliders[glider];

    // Slot Buttons
    const pickSlot = document.createElement("div");
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

    for (const stat of ["mintb", "spdGr", "spdWt", "spdAg", "spdAr",
    "accel", "weigt", "hndGr", "hndWt", "hndAg", "hndAr", "trctn", "invul"]) {
      const cell = document.createElement("td");
      const diff = combo.getLevel(stat) - selectedCombo.getLevel(stat);
      cell.dataset.value = diff;
      cell.classList.toggle("positive", diff > 0);
      cell.classList.toggle("negative", diff < 0);
      cell.innerText = formatStatDiff(diff);
      row.append(cell);
    }

    tableEl.append(row);
  }
}

function formatStatDiff(diff) {
  let text = Math.abs(diff).toString();
  if (diff != 0 && text[0] == "0") text = text.substr(1);
  if (diff >= 0) { text = "+" + text; }
  else { text = "-" + text; }
  return text;
}

function readURLParams() {
  const url = new URL(window.location.href);
  const aCode = url.searchParams.get("a");
  if (aCode != undefined) combos.a = Combo.fromCode(aCode);
  const bCode = url.searchParams.get("b");
  if (bCode != undefined) combos.b = Combo.fromCode(bCode);
}

function updateURLParams() {
  const aCode = combos.a.getCode();
  const bCode = combos.b.getCode();

  const url = new URL(window.location.href);
  url.searchParams.set("a", aCode);
  url.searchParams.set("b", bCode);
  const paramStr = url.toString();
  window.history.pushState({}, "", paramStr);
}
