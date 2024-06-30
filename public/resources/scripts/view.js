"use strict";

const graphicsRoot = "/resources/graphics/";
const stats = [ "mintb", "spdGr", "spdAg", "spdWt", "spdAr", "accel",
                "weigt", "hndGr", "hndAg", "hndWt", "hndAr", "trctn", "invcb" ];
const scoreStats = [ "mintb", "spd", "spdGr", "spdAg", "spdWt", "spdAr",
            "accel", "weigt", "hnd", "hndGr", "hndAg", "hndWt", "hndAr",
            "trctn", "invcb", "size" ];
const V = {
  combo: {},
  dominant: {},
  similar: {},
  custom: {},
  drivers: {},
  bodies: {},
  tires: {},
  gliders: {},
  formula: {},
  settings: {}
}; // View object

whenDOMReady(() => {
  V.combo.random = document.getElementById("random-combo");
  V.combo.share = document.getElementById("share-combo");
  V.combo.a = document.getElementById("combo-a");
  V.combo.b = document.getElementById("combo-b");

  V.combo.driver     = document.getElementById("driver");
  V.combo.driverImg  = document.getElementById("driver-img");
  V.combo.driverLock = document.getElementById("driver-lock-display");
  V.combo.body       = document.getElementById("body");
  V.combo.bodyImg    = document.getElementById("body-img");
  V.combo.bodyLock   = document.getElementById("body-lock-display");
  V.combo.tire       = document.getElementById("tire");
  V.combo.tireImg    = document.getElementById("tire-img");
  V.combo.tireLock   = document.getElementById("tire-lock-display");
  V.combo.glider     = document.getElementById("glider");
  V.combo.gliderImg  = document.getElementById("glider-img");
  V.combo.gliderLock = document.getElementById("glider-lock-display");
  V.combo.details    = document.getElementById("combo-details");

  V.combo.mintb = document.getElementById("mintb-meter");
  V.combo.spdGr = document.getElementById("spdGr-meter");
  V.combo.spdAg = document.getElementById("spdAg-meter");
  V.combo.spdWt = document.getElementById("spdWt-meter");
  V.combo.spdAr = document.getElementById("spdAr-meter");
  V.combo.accel = document.getElementById("accel-meter");
  V.combo.weigt = document.getElementById("weigt-meter");
  V.combo.hndGr = document.getElementById("hndGr-meter");
  V.combo.hndAg = document.getElementById("hndAg-meter");
  V.combo.hndWt = document.getElementById("hndWt-meter");
  V.combo.hndAr = document.getElementById("hndAr-meter");
  V.combo.trctn = document.getElementById("trctn-meter");
  V.combo.invcb = document.getElementById("invcb-meter");

  V.dominant.rows    = document.getElementById("dominant-combos-rows");
  V.dominant.count   = document.getElementById("dominant-combos-count");
  V.similar.rows     = document.getElementById("similar-combos-rows");
  V.similar.count    = document.getElementById("similar-combos-count");
  V.custom.rows      = document.getElementById("custom-combos-rows");
  V.custom.count     = document.getElementById("custom-combos-count");
  V.custom.formula   = document.getElementById("custom-formula");
  V.custom.customize = document.getElementById("customize-formula");

  V.drivers.dialog = document.getElementById("driver-picker");
  V.drivers.icon = document.getElementById("driver-icon");
  V.drivers.title = document.getElementById("driver-title");
  V.drivers.lock = document.getElementById("driver-lock");
  V.drivers.lockLabel = document.getElementById("driver-lock-label");
  V.drivers.grid = document.getElementById("driver-grid");

  V.bodies.dialog = document.getElementById("body-picker");
  V.bodies.icon = document.getElementById("body-icon");
  V.bodies.title = document.getElementById("body-title");
  V.bodies.lock = document.getElementById("body-lock");
  V.bodies.lockLabel = document.getElementById("body-lock-label");
  V.bodies.grid= document.getElementById("body-grid");

  V.tires.dialog = document.getElementById("tire-picker");
  V.tires.title = document.getElementById("tire-title");
  V.tires.lock = document.getElementById("tire-lock");
  V.tires.lockLabel = document.getElementById("tire-lock-label");
  V.tires.grid = document.getElementById("tire-grid");

  V.gliders.dialog = document.getElementById("glider-picker");
  V.gliders.title = document.getElementById("glider-title");
  V.gliders.lock = document.getElementById("glider-lock");
  V.gliders.lockLabel = document.getElementById("glider-lock-label");
  V.gliders.grid = document.getElementById("glider-grid");

  V.settings.localeSelect = document.getElementById("locale-select");

  V.formula.dialog = document.getElementById("custom-formula-dialog");
  for (const stat of scoreStats) {
    V.formula[stat] = {};
    V.formula[stat].mode   = document.getElementById(`formula-${stat}-mode`);
    V.formula[stat].slider = document.getElementById(`formula-${stat}-slider`);
    V.formula[stat].factor = document.getElementById(`formula-${stat}-factor`);
    V.formula[stat].min    = document.getElementById(`formula-${stat}-min`);
    V.formula[stat].max    = document.getElementById(`formula-${stat}-max`);
  }
  V.formula.spd.use = document.getElementById("formula-use-spd");
  V.formula.spd.collapse = document.getElementById("formula-spd-collapse");
  V.formula.spd.title = document.getElementById("formula-spd-title");
  V.formula.spdGr.title = document.getElementById("formula-spdGr-title");
  V.formula.hnd.use = document.getElementById("formula-use-hnd");
  V.formula.hnd.collapse = document.getElementById("formula-hnd-collapse");
  V.formula.hnd.title = document.getElementById("formula-hnd-title");
  V.formula.hndGr.title = document.getElementById("formula-hndGr-title");

  V.formula.includeKarts = document.getElementById("formula-include-karts");
  V.formula.includeATVs  = document.getElementById("formula-include-atvs");
  V.formula.includeBikes = document.getElementById("formula-include-bikes");
  V.formula.includeSportBikes = document.getElementById("formula-include-sport");

  V.formula.reset  = document.getElementById("formula-reset");
  V.formula.cancel = document.getElementById("formula-cancel");
  V.formula.save   = document.getElementById("formula-save");


  /******** View OUT ********/

  V.combo.random.addEventListener("click", randomCombo);
  V.combo.share.addEventListener("click", share);
  V.combo.a.addEventListener("click", selectA);
  V.combo.b.addEventListener("click", selectB);

  V.combo.driver.addEventListener("click", openDriverDialog);
  V.combo.body.addEventListener("click", openBodyDialog);
  V.combo.tire.addEventListener("click", openTireDialog);
  V.combo.glider.addEventListener("click", openGliderDialog);

  V.custom.customize.addEventListener("click", openFormulaDialog);

  V.drivers.dialog.addEventListener("click", e => {
    if (isOutside(V.drivers.dialog, e)) closeDriverDialog();
  });
  V.drivers.lock.addEventListener("click", toggleDriverLock);

  V.bodies.dialog.addEventListener("click", e => {
    if (isOutside(V.bodies.dialog, e)) closeBodyDialog();
  });
  V.bodies.lock.addEventListener("click", toggleBodyLock);

  V.tires.dialog.addEventListener("click", e => {
    if (isOutside(V.tires.dialog, e)) closeTireDialog();
  });
  V.tires.lock.addEventListener("click", toggleTireLock);

  V.gliders.dialog.addEventListener("click", e => {
    if (isOutside(V.gliders.dialog, e)) closeGliderDialog();
  });
  V.gliders.lock.addEventListener("click", toggleGliderLock);

  V.formula.reset.addEventListener("click", setDefaultFormula);
  V.formula.cancel.addEventListener("click", revertFormula);
  V.formula.save.addEventListener("click", commitFormula);

  for (const stat of scoreStats) {
    const factor = V.formula[stat].factor;
    const slider = V.formula[stat].slider;
    const min = V.formula[stat].min;
    const max = V.formula[stat].max;
    const mode = V.formula[stat].mode;
    factor.addEventListener("input", () => {
      state.workingFormula[stat].factor = factor.value;
      drawFactorWidget(stat);
    });
    slider.addEventListener("change", () => {
      state.workingFormula[stat].factor = slider.value;
      drawFactorWidget(stat);
    });
    slider.linkedInput = factor;
    min.addEventListener("input", () => {
      state.workingFormula[stat].min = parseFloat(min.value);
      validateBounds(stat);
    });
    max.addEventListener("input", () => {
      state.workingFormula[stat].max = parseFloat(max.value);
      validateBounds(stat);
    });
    mode.addEventListener("click", () => { toggleFactorSign(stat); });
    mode.addEventListener("dblclick", () => { resetFactor(stat); });
  }

  V.formula.spd.use.addEventListener("click", toggleSpdMode);
  V.formula.spd.title.addEventListener("click", toggleSpdMode);
  V.formula.spdGr.title.addEventListener("click", toggleSpdMode);
  V.formula.hnd.use.addEventListener("click", toggleHndMode);
  V.formula.hnd.title.addEventListener("click", toggleHndMode);
  V.formula.hndGr.title.addEventListener("click", toggleHndMode);

  V.formula.spd.collapse.addEventListener("transitionstart", e => {
    if (e.target != V.formula.spd.collapse) return;
    V.formula.spd.collapse.classList.add("transitioning");
  });
  V.formula.spd.collapse.addEventListener("transitionend", () => {
    V.formula.spd.collapse.classList.remove("transitioning");
  });
  V.formula.hnd.collapse.addEventListener("transitionstart", e => {
    if (e.target != V.formula.hnd.collapse) return;
    V.formula.hnd.collapse.classList.add("transitioning");
  });
  V.formula.hnd.collapse.addEventListener("transitionend", () => {
    V.formula.hnd.collapse.classList.remove("transitioning");
  });

  V.formula.includeKarts.addEventListener("click", toggleIncludeKarts);
  V.formula.includeATVs.addEventListener("click", toggleIncludeATVs);
  V.formula.includeBikes.addEventListener("click", toggleIncludeBikes);
  V.formula.includeSportBikes.addEventListener("click", toggleIncludeSportBikes);

  locale = V.settings.localeSelect.value; // on init
  V.settings.localeSelect.addEventListener("change", () => {
    changeLocale(V.settings.localeSelect.value);
  });

  // Keyboard Shortcuts
  addEventListener("keydown", e => {
    if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) return;
    if (e.key == "a") {
      selectA();
    } else if (e.key == "b") {
      selectB();
    } else if (e.key == "Escape") {
      closeDriverDialog();
      closeBodyDialog();
      closeTireDialog();
      closeGliderDialog();
      revertFormula();
      e.preventDefault();
    }
  });

  // Redraw on back
  addEventListener("popstate", readURLParams);
});


/******** View IN ********/

function drawCurrentCombo() {
  // A-B Tabs
  V.combo.a.classList.toggle("selected", state.selectedSlotID == "A");
  V.combo.b.classList.toggle("selected", state.selectedSlotID == "B");

  const combo = state.selectedSlot.combo;
  const driverImg = combo.driverID;
  const bodyImg = combo.bodyID + combo.bodyVariant;
  const tireImg = combo.tireID;
  const gliderImg = combo.gliderID + combo.gliderVariant;
  const driverName = S("drivers", combo.driverID);
  const bodyName = S("bodies", combo.bodyID);
  const tireName = S("tires", combo.tireID);
  const gliderName = S("gliders", combo.gliderID);
  V.combo.driverImg.src = graphicsRoot + "drivers/" + driverImg + ".webp";
  V.combo.bodyImg.src = graphicsRoot + "bodies/" + bodyImg + ".webp";
  V.combo.tireImg.src = graphicsRoot + "tires/" + tireImg + ".webp";
  V.combo.gliderImg.src = graphicsRoot + "gliders/" + gliderImg + ".webp";
  V.combo.driverImg.alt = driverName;
  V.combo.bodyImg.alt = bodyName;
  V.combo.tireImg.alt = tireName;
  V.combo.gliderImg.alt = gliderName;
  V.combo.driver.title = driverName;
  V.combo.body.title = bodyName;
  V.combo.tire.title = tireName;
  V.combo.glider.title = gliderName;
  V.combo.driverLock.classList.toggle("selected", state.locks.driver);
  V.combo.bodyLock.classList.toggle("selected", state.locks.body);
  V.combo.tireLock.classList.toggle("selected", state.locks.tire);
  V.combo.gliderLock.classList.toggle("selected", state.locks.glider);

  // Combo Details
  let detailStr;
  switch (combo.classes.driver.size) {
    case 0:
      detailStr = "Small Frame";
      break;
    case 1:
      detailStr = "Medium Frame";
      break;
    case 2:
      detailStr = "Large Frame";
      break;
    default: throw "Error: Unknown size: “" + combo.classes.driver.size + "”";
  }
  detailStr += combo.parts.body.type == "sport" ? ", Inside Drift" : "";
  V.combo.details.innerText = detailStr;

  // Meters
  for (const stat of stats) {
    V.combo[stat].style.setProperty("--value", combo.lvl[stat]);
  }

  // Page Title
  document.title = combo.name + " | MK8DX Combo Builder";
}

function drawDominantCombos() {
  state.selectedSlot.dominant.then(data => {
    V.dominant.count.innerText = data.length;
    drawComboTable(V.dominant.rows, data.combos);
  });
}

function drawSimilarCombos() {
  state.selectedSlot.similar.then(data => {
    V.similar.count.innerText = data.length;
    drawComboTable(V.similar.rows, data.combos);
  });
}

function drawCustomCombos() {
  state.selectedSlot.custom.then(data => {
    V.custom.count.innerText = data.length;
    V.custom.formula.innerHTML = formatFormula(state.formula);
    drawComboTable(V.custom.rows, data.combos);
  });
}

// TODO: Find a way to pass the limit from listCombos.
function drawComboTable(container, combos, limit = 50) {
  container.innerHTML = "";

  if (combos.length == 0) {
    container.classList.add("empty");
    const para = document.createElement("p");
    para.innerText = "No combos found.";
    container.append(para);
    return;
  }
  container.classList.remove("empty");

  const selectedCombo = state.selectedSlot.combo;

  let i = 0;
  for (const combo of combos) {
    if (i > limit) break;

    const li = document.createElement("li");

    const top = document.createElement("div");

    const comboDisplay = document.createElement("div");
    comboDisplay.classList.add("combo", "button-group", "radio");
    const driverBox = document.createElement("div");
    const bodyBox   = document.createElement("div");
    const tireBox   = document.createElement("div");
    const gliderBox = document.createElement("div");
    const driverImg = document.createElement("img");
    const bodyImg   = document.createElement("img");
    const tireImg   = document.createElement("img");
    const gliderImg = document.createElement("img");
    const driverName = S("drivers", combo.driverID);
    const bodyName = S("bodies", combo.bodyID);
    const tireName = S("tires", combo.tireID);
    const gliderName = S("gliders", combo.gliderID);
    const driverImgPath = combo.driverID;
    const bodyImgPath = combo.bodyID + combo.bodyVariant;
    const tireImgPath = combo.tireID;
    const gliderImgPath = combo.gliderID + combo.gliderVariant;
    driverImg.src = graphicsRoot + "drivers/" + driverImgPath + ".webp";
    bodyImg.src = graphicsRoot + "bodies/" + bodyImgPath + ".webp";
    tireImg.src = graphicsRoot + "tires/" + tireImgPath + ".webp";
    gliderImg.src = graphicsRoot + "gliders/" + gliderImgPath + ".webp";
    driverImg.alt = driverName;
    bodyImg.alt = bodyName;
    tireImg.alt = tireName;
    gliderImg.alt = gliderName;
    driverImg.loading = "lazy"; bodyImg.loading = "lazy";
    tireImg.loading = "lazy"; gliderImg.loading = "lazy";
    driverBox.title = driverName;
    bodyBox.title = bodyName;
    tireBox.title = tireName;
    gliderBox.title = gliderName;
    driverBox.append(driverImg); bodyBox.append(bodyImg);
    tireBox.append(tireImg); gliderBox.append(gliderImg);
    comboDisplay.append(driverBox, bodyBox, tireBox, gliderBox);

    const buttonsDisplay = document.createElement("div");
    buttonsDisplay.classList.add("button-group", "radio");
    const loadInA = document.createElement("button");
    const loadInB = document.createElement("button");
    loadInA.innerText = "→A";
    loadInB.innerText = "→B";
    loadInA.classList.toggle("primary", state.selectedSlotID == "A");
    loadInB.classList.toggle("primary", state.selectedSlotID == "B");
    loadInA.addEventListener("click", () => { setCombo(combo, "A") });
    loadInB.addEventListener("click", () => { setCombo(combo, "B") });
    buttonsDisplay.append(loadInA, loadInB);

    top.append(comboDisplay, buttonsDisplay);

    const statsDisplay = document.createElement("div");
    statsDisplay.classList.add("stat-diffs");
    for (const stat of stats) {
      const diff = combo.diff[stat];
      if (diff == 0) continue;
      const statDiff = document.createElement("div");
      const label = document.createElement("label");
      label.innerText = stat;
      const value = document.createElement("output");
      if (diff > 0) value.classList.add("positive");
      if (diff < 0) value.classList.add("negative");
      value.innerText = formatStatDiff(diff);
      statDiff.append(label, value);
      statsDisplay.append(statDiff);
    }
    if (statsDisplay.children.length == 0) {
      const statDiff = document.createElement("div");
      const label = document.createElement("label");
      label.innerText = "No change";
      statDiff.append(label);
      statsDisplay.append(statDiff);
    }

    li.append(top, statsDisplay);
    const hr = document.createElement("hr");
    container.append(li);
    if (i < limit && i < combos.length - 1) container.append(li, hr);
    i++;
  }

  if (combos.length > limit) {
    const para = document.createElement("p");
    para.innerHTML = "Showing top " + limit + " matches.<br>Try another formula to see more.";
    container.append(para);
  }
}

function formatStatDiff(x) {
  let s = Math.abs(x).toString();
  if (x != 0 && s[0] == "0") s = s.substring(1);
  if (x >= 0) { s = "+" + s; }
  else { s = "−" + s; }
  return s;
}

function formatFormula(formula) {
  let s = "";
  const combo = state.selectedSlot.combo;

  const stats = [];
  for (const stat of scoreStats) {
    if (stat == "spd"   && !formula.spd.use) continue;
    if (stat == "spdGr" &&  formula.spd.use) continue;
    if (stat == "spdAg" &&  formula.spd.use) continue;
    if (stat == "spdWt" &&  formula.spd.use) continue;
    if (stat == "spdAr" &&  formula.spd.use) continue;
    if (stat == "hnd"   && !formula.hnd.use) continue;
    if (stat == "hndGr" &&  formula.hnd.use) continue;
    if (stat == "hndAg" &&  formula.hnd.use) continue;
    if (stat == "hndWt" &&  formula.hnd.use) continue;
    if (stat == "hndAr" &&  formula.hnd.use) continue;
    let factor = formula[stat].factor;
    if (factor == 0) continue;
    const sign = factor < 0 ? "−" : "";
    const className = factor < 0 ? "negative" : "positive";
    factor = Math.abs(factor).toString();
    if (factor[0] == "0") factor = factor.substr(1);
    const term = '<span class="' + className + '">' + sign + factor
               + '<span class="multiply">×</span>' + stat + "</span>";
    stats.push(term);
  }
  s += '<span class="formula">' + stats.join(" + ") + "</span>";

  const locks = [];
  if (state.locks.driver) locks.push(S("drivers", combo.driverID));
  if (state.locks.body) locks.push(S("bodies", combo.bodyID));
  if (state.locks.tire) locks.push(S("tires", combo.tireID));
  if (state.locks.glider) locks.push(S("gliders", combo.gliderID));

  let exclusionsString = "";
  const bodyConflict = state.locks.body &&
      ((combo.parts.body.type == "kart"  && formula.excludeKarts) ||
      (combo.parts.body.type == "atv"   && formula.excludeATVs) ||
      (combo.parts.body.type == "bike"  && formula.excludeBikes) ||
      (combo.parts.body.type == "sport" && formula.excludeSportBikes));
  if (!state.locks.body || bodyConflict) {
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
  if (!bodyConflict) { s += "<span>"; }
  else { s += "<span class=\"invalid\">"; }
  s += locks.join(", ");
  if (locks.length > 0 && exclusionsString.length > 0) s += " — ";
  s += exclusionsString;
  s += "</span>";

  return s;
}

function drawShareNotice() {
  Tooltip.draw("Link copied to clipboard.", { el: V.combo.share, pos: "bottom" });
}

function drawDriverDialog() {
  if (state.openedDialog !== "driver") {
    V.drivers.dialog.close();
    return;
  }
  state.parts.then(data => {
    V.drivers.grid.innerHTML = "";
    const drivers = data.drivers;
    for (const driver of drivers) {
      let id;
      let eventHandler;
      const classes = [];
      let folder;
      if (driver.folder == undefined) {
        id = driver.id;
        if (driver.id == state.driver) classes.push("selected");
        if (driver.group == state.selectedSlot.combo.parts.driver.group) classes.push("highlight");
        eventHandler = () => { setDriver(driver.id); };
      } else {
        id = state.driverPrefs[driver.id];
        folder = document.createElement("div");
        folder.setAttribute("inert", "");
        folder.classList.add("parts-grid", "square");
        if (driver.folder.length == 2) folder.classList.add("two");
        if (driver.folder.length >= 3) folder.classList.add("three");
        eventHandler = e => { drawPopover(folder); };
        addEventListener("click", e => {
          if (state.openedDialog !== "driver") return;
          if (isOutside(folder, e)) {
            folder.removeAttribute("open");
            folder.setAttribute("inert", "");
          }
        });
        for (const driverVariant of driver.folder) {
          const variantID = driverVariant.id;
          const variantClasses = [];
          if (variantID == state.driver) {
            variantClasses.push("selected");
            classes.push("selected");
          }
          if (driverVariant.group == state.selectedSlot.combo.parts.driver.group) {
            variantClasses.push("highlight");
            classes.push("highlight");
          }
          const button = newPartButton("drivers/" + variantID, variantID, variantClasses, S("drivers", variantID));
          button.addEventListener("click", () => { setDriver(variantID); });
          button.addEventListener("mouseenter", () => { drawDriverTitle(variantID); });
          button.addEventListener("mouseleave", () => { drawDriverTitle(state.driver); });
          button.addEventListener("focus", () => { drawDriverTitle(variantID); });
          button.addEventListener("blur", () => { drawDriverTitle(state.driver); });
          folder.append(button);
      } }
      const button = newPartButton("drivers/" + id, driver.id, classes, S("drivers", id));
      button.addEventListener("click", eventHandler);
      if (folder !== undefined) { button.append(folder); }
      button.addEventListener("mouseenter", () => { drawDriverTitle(id); });
      button.addEventListener("mouseleave", () => { drawDriverTitle(state.driver); });
      button.addEventListener("focus", () => { drawDriverTitle(id); });
      button.addEventListener("blur", () => { drawDriverTitle(state.driver); });
      V.drivers.grid.append(button);
    }
  });
  V.drivers.icon.setAttribute("src",
    graphicsRoot + "emblems/" + state.driver + ".webp");
  V.drivers.title.innerText = S("drivers", state.driver);
  V.drivers.lock.classList.toggle("selected", state.locks.driver);
  V.drivers.lockLabel.innerText = state.locks.driver ? "Unlock Driver" : "Lock Driver";
  V.drivers.dialog.showModal();
}

function drawBodyDialog() {
  if (state.openedDialog !== "body") {
    V.bodies.dialog.close();
    return;
  }
  state.parts.then(data => {
    V.bodies.grid.innerHTML = "";
    const types = data.bodies;
    for (const bodies of types) {
      for (const body of bodies.folder) {
        const id = body.id;
        const classes = [];
        if (id == state.body) classes.push("selected");
        if (body.group == state.selectedSlot.combo.parts.body.group) classes.push("highlight");
        const button = newPartButton("bodies/" + id, id, classes, S("bodies", id));
        button.addEventListener("click", () => { setBody(id); });
        button.addEventListener("mouseenter", () => {
          drawBodyTitle(id, bodies.id);
        });
        button.addEventListener("mouseleave", () => {
          drawBodyTitle(state.body, state.selectedSlot.combo.parts.body.type);
        });
        button.addEventListener("focus", () => {
          drawBodyTitle(id, bodies.id);
        });
        button.addEventListener("blur", () => {
          drawBodyTitle(state.body, state.selectedSlot.combo.parts.body.type);
        });
        V.bodies.grid.append(button);
      }
      V.bodies.grid.append(document.createElement("hr"));
    }
    // Remove last hr. (ugly)
    V.bodies.grid.children[V.bodies.grid.children.length - 1].remove();
  });
  V.bodies.icon.setAttribute("src",
    graphicsRoot + "icons/" + state.selectedSlot.combo.parts.body.type + ".svg");
  V.bodies.title.innerText = S("bodies", state.body);
  V.bodies.lock.classList.toggle("selected", state.locks.body);
  V.bodies.lockLabel.innerText = state.locks.body ? "Unlock body" : "Lock body";
  V.bodies.dialog.showModal();
}

function drawTireDialog() {
  if (state.openedDialog !== "tire") {
    V.tires.dialog.close();
    return;
  }
  state.parts.then(data => {
    V.tires.grid.innerHTML = "";
    const tires = data.tires;
    for (const tire of tires) {
      const id = tire.id;
      const classes = [];
      if (id == state.tire) classes.push("selected");
      if (tire.group == state.selectedSlot.combo.parts.tire.group) classes.push("highlight");
      const button = newPartButton("tires/" + id, id, classes, S("tires", id));
      button.addEventListener("click", () => { setTire(id); });
      button.addEventListener("mouseenter", () => { drawTireTitle(id); });
      button.addEventListener("mouseleave", () => { drawTireTitle(state.tire); });
      button.addEventListener("focus", () => { drawTireTitle(id); });
      button.addEventListener("blur", () => { drawTireTitle(state.tire); });
      V.tires.grid.append(button);
    }
  });
  V.tires.title.innerText = S("tires", state.tire);
  V.tires.lock.classList.toggle("selected", state.locks.tire);
  V.tires.lockLabel.innerText = state.locks.tire ? "Unlock Tire" : "Lock Tire";
  V.tires.dialog.showModal();
}

function drawGliderDialog() {
  if (state.openedDialog !== "glider") {
    V.gliders.dialog.close();
    return;
  }
  state.parts.then(data => {
    V.gliders.grid.innerHTML = "";
    const gliders = data.gliders;
    for (const glider of gliders) {
      const id = glider.id;
      const classes = [];
      if (id == state.glider) classes.push("selected");
      if (glider.group == state.selectedSlot.combo.parts.glider.group) classes.push("highlight");
      const button = newPartButton("gliders/" + id, id, classes, S("gliders", id));
      button.addEventListener("click", () => { setGlider(id); });
      button.addEventListener("mouseenter", () => { drawGliderTitle(id); });
      button.addEventListener("mouseleave", () => { drawGliderTitle(state.glider); });
      button.addEventListener("focus", () => { drawGliderTitle(id); });
      button.addEventListener("blur", () => { drawGliderTitle(state.glider); });
      V.gliders.grid.append(button);
    }
  });
  V.gliders.title.innerText = S("gliders", state.glider);
  V.gliders.lock.classList.toggle("selected", state.locks.glider);
  V.gliders.lockLabel.innerText = state.locks.glider ? "Unlock Glider" : "Lock Glider";
  V.gliders.dialog.showModal();
}

function drawDriverTitle(id) {
  V.drivers.title.innerText = S("drivers", id);
  V.drivers.icon.src = graphicsRoot + "emblems/" + id + ".webp";
}
function drawBodyTitle(id, type) {
  V.bodies.title.innerText = S("bodies", id);
  V.bodies.icon.setAttribute("src", graphicsRoot + "icons/" + type + ".svg");
}
function drawTireTitle(id) {
  V.tires.title.innerText = S("tires", id);
}
function drawGliderTitle(id) {
  V.gliders.title.innerText = S("gliders", id);;
}

function newPartButton(imgSrc, value, classes = [], alt = "") {
  const button = document.createElement("button");
  button.classList.add(...classes);
  const img = document.createElement("img");
  img.src = graphicsRoot + imgSrc + ".webp";
  if (alt !== "") img.alt = alt;
  button.append(img);
  return button;
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

function drawFormulaDialog() {
  if (state.openedDialog !== "formula") {
    V.formula.dialog.close();
    return;
  }

  V.formula.dialog.showModal();
  drawCollapses();

  const formula = state.workingFormula;
  for (const stat of scoreStats) {
    let factor = formula[stat].factor;
    if (factor == 0) factor = "";
    V.formula[stat].factor.value = factor;
    V.formula[stat].slider.value = factor;
    drawFactorWidget(stat);
    let min = formula[stat].min;
    if (min == V.formula[stat].min.min) min = "";
    V.formula[stat].min.value = min;
    let max = formula[stat].max;
    if (max == V.formula[stat].max.max) max = "";
    V.formula[stat].max.value = max;
    validateBounds(stat);
  }

  V.formula.includeKarts.classList.toggle("selected", !state.workingFormula.excludeKarts);
  V.formula.includeATVs.classList.toggle("selected", !state.workingFormula.excludeATVs);
  V.formula.includeBikes.classList.toggle("selected", !state.workingFormula.excludeBikes);
  V.formula.includeSportBikes.classList.toggle("selected", !state.workingFormula.excludeSportBikes);
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
  const min = state.workingFormula[stat].min;
  const max = state.workingFormula[stat].max;
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
    const isOn = formula[stat].use;
    chevron.classList.toggle("rotated", !isOn);
    tabOn.classList.toggle("selected", isOn);
    tabOn.toggleAttribute("inert", !isOn);
    tabOff.toggleAttribute("inert", isOn);
    tabOff.classList.toggle("selected", !isOn);
    const height = (isOn ? tabOn : tabOff).getBoundingClientRect().height;
    container.style.height = height + "px";
  }
}

// Returns whether the click event *e* is inside element *el*.
function isOutside(el, e) {
  const rect = el.getBoundingClientRect();
  // If the click event was fired with a keyboard press, e.detail will be 0.
  if (e.detail == 0) {
    // In that case, clientX and Y will be 0, so we use the target element's position instead.
    const target = e.originalTarget.getBoundingClientRect();
    return target.top < rect.top   || target.bottom > rect.bottom
        || target.left < rect.left || target.right > rect.right;
  }
  return e.clientY < rect.top  || e.clientY > rect.bottom
      || e.clientX < rect.left || e.clientX > rect.right;
}
