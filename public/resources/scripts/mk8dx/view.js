"use strict";

const graphicsRoot = "/resources/graphics/mk8dx/";
const V = {
  menu: {},
  combo: {},
  dominant: {},
  similar: {},
  custom: {},
  drivers: {},
  bodies: {},
  tires: {},
  gliders: {},
  favorites: {},
  formula: {},
  help: {},
  settings: {},
  changelog: {},
  credits: {}
}; // View object

whenDOMReady(() => {
  V.menu.dialog = document.getElementById("menu");
  V.menu.open = document.getElementById("menu-open");

  V.combo.favorite = document.getElementById("favorite");
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
  V.combo.meters     = document.getElementById("combo-stats");

  V.combo.mtb = {
    meter: document.getElementById("mtb-meter"),
    value: document.getElementById("mtb-value")
  };
  V.combo.spdGr = {
    meter: document.getElementById("spdGr-meter"),
    value: document.getElementById("spdGr-value")
  };
  V.combo.spdAg = {
    meter: document.getElementById("spdAg-meter"),
    value: document.getElementById("spdAg-value")
  };
  V.combo.spdWt = {
    meter: document.getElementById("spdWt-meter"),
    value: document.getElementById("spdWt-value")
  };
  V.combo.spdAr = {
    meter: document.getElementById("spdAr-meter"),
    value: document.getElementById("spdAr-value")
  };
  V.combo.acc = {
    meter: document.getElementById("acc-meter"),
    value: document.getElementById("acc-value")
  };
  V.combo.wgt = {
    meter: document.getElementById("wgt-meter"),
    value: document.getElementById("wgt-value")
  };
  V.combo.hndGr = {
    meter: document.getElementById("hndGr-meter"),
    value: document.getElementById("hndGr-value")
  };
  V.combo.hndAg = {
    meter: document.getElementById("hndAg-meter"),
    value: document.getElementById("hndAg-value")
  };
  V.combo.hndWt = {
    meter: document.getElementById("hndWt-meter"),
    value: document.getElementById("hndWt-value")
  };
  V.combo.hndAr = {
    meter: document.getElementById("hndAr-meter"),
    value: document.getElementById("hndAr-value")
  };
  V.combo.trn = {
    meter: document.getElementById("trn-meter"),
    value: document.getElementById("trn-value")
  };
  V.combo.inv = {
    meter: document.getElementById("inv-meter"),
    value: document.getElementById("inv-value")
  };

  V.combo.spdMultimeter = document.getElementById("spd-multimeter");
  V.combo.hndMultimeter = document.getElementById("hnd-multimeter");

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

  V.favorites.open = document.getElementById("favorites-open");
  V.favorites.close = document.getElementById("favorites-close");
  V.favorites.dialog = document.getElementById("favorites-dialog");
  V.favorites.list = document.getElementById("favorites-list");
  V.favorites.unfavoriteDialog = document.getElementById("unfavorite-dialog");
  V.favorites.unfavoriteMessage = document.getElementById("unfavorite-message");
  V.favorites.unfavoriteConfirmButton = document.getElementById("unfavorite-confirm");
  V.favorites.unfavoriteCancelButton = document.getElementById("unfavorite-cancel");

  V.formula.dialog = document.getElementById("custom-formula-dialog");
  for (const stat of stats) {
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

  V.formula.helpOpen   = document.getElementById("formula-help-open");
  V.formula.helpClose  = document.getElementById("formula-help-close");
  V.formula.helpDialog = document.getElementById("formula-help");

  V.help.open   = document.getElementById("help-open");
  V.help.close  = document.getElementById("help-close");
  V.help.dialog = document.getElementById("help-dialog");

  V.settings.open   = document.getElementById("settings-open");
  V.settings.close  = document.getElementById("settings-close");
  V.settings.dialog = document.getElementById("settings-dialog");
  V.settings.cookiesToggle     = document.getElementById("settings-cookies");
  V.settings.localeSelect      = document.getElementById("settings-locale");
  V.settings.statScaleSelect   = document.getElementById("settings-stat-scale");
  V.settings.meterValuesToggle = document.getElementById("settings-show-meter-values");

  V.changelog.open   = document.getElementById("changelog-open");
  V.changelog.close  = document.getElementById("changelog-close");
  V.changelog.dialog = document.getElementById("changelog-dialog");

  V.credits.open   = document.getElementById("credits-open");
  V.credits.close  = document.getElementById("credits-close");
  V.credits.dialog = document.getElementById("credits-dialog");


  /******** View OUT ********/

  V.menu.open.addEventListener("click", e => {
    if (isOutside(V.menu.dialog, e)) toggleMenu();
  }, { passive: true });
  addEventListener("pointerdown", e => {
    if (isOutside(V.menu.open, e) && isOutside(V.menu.dialog, e)) closeMenu();
  }, { passive: true });
  addEventListener("focusin", () => {
    if (!V.menu.open.contains(document.activeElement)) closeMenu();
  }, { passive: true });

  V.combo.favorite.addEventListener("click", () => {
    if (!state.settings.allowCookies) return openFavoritesDialog();
    if (!V.combo.favorite.classList.contains("selected")) {
      V.combo.favorite.classList.add("user");
      favoriteCombo();
    } else {
      unfavorite(state.selectedSlot.combo);
    }
  }, { passive: true });
  V.combo.favorite.addEventListener("animationend", () => {
    V.combo.favorite.classList.remove("user");
  }, { passive: true });
  V.combo.random.addEventListener("click", randomCombo, { passive: true });
  V.combo.share.addEventListener("click", share, { passive: true });
  V.combo.a.addEventListener("click", () => {
    if (isMobile) {
      toggleSelectedCombo();
    } else {
      selectA();
    }
  }, { passive: true });
  V.combo.b.addEventListener("click", () => {
    if (isMobile) {
      toggleSelectedCombo();
    } else {
      selectB();
    }
  }, { passive: true });

  V.combo.driver.addEventListener("click", e => {
    if (e.altKey) {
      toggleDriverLock(true);
    } else {
      openDriverDialog();
    }
  }, { passive: true });
  V.combo.body.addEventListener("click", e => {
    if (e.altKey) {
      toggleBodyLock(true);
    } else {
      openBodyDialog();
    }
  }, { passive: true });
  V.combo.tire.addEventListener("click", e => {
    if (e.altKey) {
      toggleTireLock(true);
    } else {
      openTireDialog();
    }
  }, { passive: true });
  V.combo.glider.addEventListener("click", e => {
    if (e.altKey) {
      toggleGliderLock(true);
    } else {
      openGliderDialog();
    }
  }, { passive: true });

  V.combo.spdMultimeter.addEventListener("click", () => {
    if (V.combo.spdMultimeter.classList.contains("show")) return;
    V.combo.spdMultimeter.classList.add("show");
    V.combo.spdMultimeter.addEventListener("animationend", () => {
      V.combo.spdMultimeter.classList.remove("show");
    }, { passive: true });
  }, { passive: true });
  V.combo.hndMultimeter.addEventListener("click", () => {
    if (V.combo.hndMultimeter.classList.contains("show")) return;
    V.combo.hndMultimeter.classList.add("show");
    V.combo.hndMultimeter.addEventListener("animationend", () => {
      V.combo.hndMultimeter.classList.remove("show");
    }, { passive: true });
  }, { passive: true });

  V.custom.customize.addEventListener("click", openFormulaDialog, { passive: true });

  V.drivers.dialog.addEventListener("click", e => {
    if (state.openedDialog !== "driver") return;
    if (isOutside(V.drivers.dialog, e)) closeDriverDialog();
  }, { passive: true });
  V.drivers.lock.addEventListener("click", toggleDriverLock, { passive: true });

  V.bodies.dialog.addEventListener("click", e => {
    if (state.openedDialog !== "body") return;
    if (isOutside(V.bodies.dialog, e)) closeBodyDialog();
  }, { passive: true });
  V.bodies.lock.addEventListener("click", toggleBodyLock, { passive: true });

  V.tires.dialog.addEventListener("click", e => {
    if (state.openedDialog !== "tire") return;
    if (isOutside(V.tires.dialog, e)) closeTireDialog();
  }, { passive: true });
  V.tires.lock.addEventListener("click", toggleTireLock, { passive: true });

  V.gliders.dialog.addEventListener("click", e => {
    if (state.openedDialog !== "glider") return;
    if (isOutside(V.gliders.dialog, e)) closeGliderDialog();
  }, { passive: true });
  V.gliders.lock.addEventListener("click", toggleGliderLock, { passive: true });

  V.favorites.open.addEventListener("click", e => {
    openFavoritesDialog();
    e.preventDefault(); // To conserve page scroll position
  });
  V.favorites.close.addEventListener("click", closeFavoritesDialog, { passive: true });
  V.favorites.dialog.addEventListener("click", e => {
    if (state.openedDialog !== "favorites") return;
    if (isOutside(V.favorites.dialog, e)) closeFavoritesDialog();
  }, { passive: true });

  addEventListener("keydown", e => {
    if (e.key === "Alt") V.formula.reset.innerText = "Revert to Blank Formula";
  });
  addEventListener("keyup", e => {
    if (e.key === "Alt") V.formula.reset.innerText = "Revert to Default Formula";
  });
  V.formula.reset.addEventListener("click", e => {
    if (e.altKey) {
      setBlankFormula();
    } else {
      setDefaultFormula();
    }
  }, { passive: true });
  V.formula.cancel.addEventListener("click", revertFormula, { passive: true });
  V.formula.save.addEventListener("click", commitFormula, { passive: true });

  for (let i = 0; i < 16; i++) {
    const stat = stats[i];
    const factor = V.formula[stat].factor;
    const slider = V.formula[stat].slider;
    const min = V.formula[stat].min;
    const max = V.formula[stat].max;
    const mode = V.formula[stat].mode;
    factor.addEventListener("input", () => {
      state.workingFormula.factors[i] = parseValue(factor.value);
      drawFactorWidget(stat);
    }, { passive: true });
    slider.addEventListener("change", () => {
      state.workingFormula.factors[i] = slider.value;
      drawFactorWidget(stat);
    }, { passive: true });
    slider.linkedInput = factor;
    min.addEventListener("input", () => {
      state.workingFormula.min[i] = unscaleStat(parseValue(min.value), i);
      validateBounds(stat);
    }, { passive: true });
    max.addEventListener("input", () => {
      state.workingFormula.max[i] = unscaleStat(parseValue(max.value, max.max), i);
      validateBounds(stat);
    }, { passive: true });
    mode.addEventListener("click", e => {
      if (e.altKey) {
        for (let j = 0; j < 16; j++) {
          toggleFactorSign(j, true);
        }
      } else {
        toggleFactorSign(i);
      }
    }, { passive: true });
    mode.addEventListener("dblclick", () => { resetFactor(i); }, { passive: true });
  }

  V.formula.spd.use.addEventListener("click", toggleSpdMode, { passive: true });
  V.formula.spd.title.addEventListener("click", toggleSpdMode, { passive: true });
  V.formula.spdGr.title.addEventListener("click", toggleSpdMode, { passive: true });
  V.formula.hnd.use.addEventListener("click", toggleHndMode, { passive: true });
  V.formula.hnd.title.addEventListener("click", toggleHndMode, { passive: true });
  V.formula.hndGr.title.addEventListener("click", toggleHndMode, { passive: true });

  V.formula.spd.collapse.addEventListener("transitionstart", e => {
    if (e.target !== V.formula.spd.collapse) return;
    V.formula.spd.collapse.classList.add("transitioning");
  }, { passive: true });
  V.formula.spd.collapse.addEventListener("transitionend", () => {
    V.formula.spd.collapse.classList.remove("transitioning");
  }, { passive: true });
  V.formula.hnd.collapse.addEventListener("transitionstart", e => {
    if (e.target !== V.formula.hnd.collapse) return;
    V.formula.hnd.collapse.classList.add("transitioning");
  }, { passive: true });
  V.formula.hnd.collapse.addEventListener("transitionend", () => {
    V.formula.hnd.collapse.classList.remove("transitioning");
  }, { passive: true });

  V.formula.includeKarts.addEventListener("click", e => {
    if (e.altKey) return invertIncludes();
    toggleIncludeKarts();
  }, { passive: true });
  V.formula.includeATVs.addEventListener("click", e => {
    if (e.altKey) return invertIncludes();
    toggleIncludeATVs();
  }, { passive: true });
  V.formula.includeBikes.addEventListener("click", e => {
    if (e.altKey) return invertIncludes();
    toggleIncludeBikes();
  }, { passive: true });
  V.formula.includeSportBikes.addEventListener("click", e => {
    if (e.altKey) return invertIncludes();
    toggleIncludeSportBikes();
  }, { passive: true });

  V.formula.helpOpen.addEventListener("click", openFormulaHelpDialog, { passive: true });
  V.formula.helpClose.addEventListener("click", closeFormulaHelpDialog, { passive: true });
  V.formula.helpDialog.addEventListener("click", e => {
    if (state.openedDialog !== "formula-help") return;
    if (isOutside(V.formula.helpDialog, e)) closeFormulaHelpDialog();
  }, { passive: true });

  V.help.open.addEventListener("click", e => {
    openHelpDialog();
    e.preventDefault(); // To conserve page scroll position
  });
  V.help.close.addEventListener("click", closeHelpDialog, { passive: true });
  V.help.dialog.addEventListener("click", e => {
    if (state.openedDialog !== "help") return;
    if (isOutside(V.help.dialog, e)) closeHelpDialog();
  }, { passive: true });

  V.settings.open.addEventListener("click", e => {
    openSettingsDialog();
    e.preventDefault(); // To conserve page scroll position
  });
  V.settings.close.addEventListener("click", closeSettingsDialog, { passive: true });
  V.settings.dialog.addEventListener("click", e => {
    if (state.openedDialog !== "settings") return;
    if (isOutside(V.settings.dialog, e)) closeSettingsDialog();
  }, { passive: true });
  V.settings.cookiesToggle.addEventListener("click", toggleCookies, { passive: true });
  V.settings.localeSelect.addEventListener("change", () => {
    changeLocale(V.settings.localeSelect.value);
  }, { passive: true });
  V.settings.localeSelect.addEventListener("open", () => {
    V.settings.statScaleSelect.close();
  }, { passive: true });
  V.settings.statScaleSelect.addEventListener("change", () => {
    changeStatScale(V.settings.statScaleSelect.value);
  }, { passive: true });
  V.settings.statScaleSelect.addEventListener("open", () => {
    V.settings.localeSelect.close();
  }, { passive: true });
  V.settings.meterValuesToggle.addEventListener("click", toggleMeterValues, { passive: true });

  V.changelog.open.addEventListener("click", e => {
    openChangelogDialog();
    e.preventDefault(); // To conserve page scroll position
  });
  V.changelog.close.addEventListener("click", closeChangelogDialog, { passive: true });
  V.changelog.dialog.addEventListener("click", e => {
    if (state.openedDialog !== "changelog") return;
    if (isOutside(V.changelog.dialog, e)) closeChangelogDialog();
  }, { passive: true });

  V.credits.open.addEventListener("click", e => {
    openCreditsDialog();
    e.preventDefault(); // To conserve page scroll position
  });
  V.credits.close.addEventListener("click", closeCreditsDialog, { passive: true });
  V.credits.dialog.addEventListener("click", e => {
    if (state.openedDialog !== "credits") return;
    if (isOutside(V.credits.dialog, e)) closeCreditsDialog();
  }, { passive: true });

  // Keyboard Shortcuts
  addEventListener("keydown", e => {
    document.body.classList.toggle("opt-down", e.altKey);
    if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) return;
    if (e.key === "a" || e.key === "A") {
      selectA();
    } else if (e.key === "b" || e.key === "B") {
      selectB();
    } else if (e.key === "Escape") {
      if (state.openedDialog !== "") e.preventDefault();
      switch (state.openedDialog) {
        case "driver": return closeDriverDialog();
        case "body": return closeBodyDialog();
        case "tire": return closeTireDialog();
        case "glider": return closeGliderDialog();
        case "favorites": return closeFavoritesDialog();
        case "formula": return revertFormula();
        case "formula-help": return closeFormulaHelpDialog();
        case "help": return closeHelpDialog();
        case "settings": return closeSettingsDialog();
        case "changelog": return closeChangelogDialog();
        case "credits": return closeCreditsDialog();
      }
    } else if (e.key === "Enter") {
      if (state.openedDialog !== "formula") return;
      commitFormula();
      e.preventDefault();
    }
  });
  addEventListener("keyup", e => {
    document.body.classList.toggle("opt-down", e.altKey);
  });

  // Redraw on back
  addEventListener("popstate", readState, { passive: true });

  initView();
});


/******** View IN ********/

function initView() {
  initDriverDialog();
  initBodyDialog();
  initTireDialog();
  initGliderDialog();
  viewLoaded = true;
  dispatchEvent(new Event("viewLoaded"));
}

function drawPageTitle() {
  // Don't update if user has not interacted with the page.
  if (!navigator.userActivation.hasBeenActive) return;

  const combo = state.selectedSlot.combo;
  document.title = (getCustomName(combo) ?? combo.name) + " | MK8DX Combo Builder";
}

function drawMenu() {
  V.menu.dialog.inert = !state.menuOpened;
  V.menu.open.classList.toggle("open", state.menuOpened);
}

function drawCurrentCombo() {
  // A-B Tabs
  V.combo.a.classList.toggle("selected", state.selectedSlotID === "A");
  V.combo.b.classList.toggle("selected", state.selectedSlotID === "B");

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
  V.combo.driver.title = driverName + ". Click to change.";
  V.combo.body.title = bodyName + ". Click to change.";
  V.combo.tire.title = tireName + ". Click to change.";
  V.combo.glider.title = gliderName + ". Click to change.";
  V.combo.driverLock.classList.toggle("selected", state.locks.driver);
  V.combo.bodyLock.classList.toggle("selected", state.locks.body);
  V.combo.tireLock.classList.toggle("selected", state.locks.tire);
  V.combo.gliderLock.classList.toggle("selected", state.locks.glider);
  V.combo.driverLock.title = "Driver is " + (state.locks.driver ? "" : "un") + "locked. ⌥+Click to toggle.";
  V.combo.bodyLock.title = "Body is " + (state.locks.body ? "" : "un") + "locked. ⌥+Click to toggle.";
  V.combo.tireLock.title = "Tire is " + (state.locks.tire ? "" : "un") + "locked. ⌥+Click to toggle.";
  V.combo.gliderLock.title = "Glider is " + (state.locks.glider ? "" : "un") + "locked. ⌥+Click to toggle.";

  // Combo Details
  let detailStr;
  switch (combo.classes.driver[statIndex.size]) {
    case 0:
      detailStr = "Small Frame";
      break;
    case 1:
      detailStr = "Medium Frame";
      break;
    case 2:
      detailStr = "Large Frame";
      break;
    default: throw "Error: Unknown size: “" + combo.classes.driver[statIndex.size] + "”";
  }
  detailStr += combo.parts.body.type === "sport" ? ", Inside Drift" : "";
  V.combo.details.innerText = detailStr;

  // Meters
  V.combo.meters.classList.toggle("values-hidden", !state.settings.showMeterValues);
  for (let i = 0; i < 13; i++) {
    const stat = stats[i];
    V.combo[stat].meter.style.setProperty("--value", toLvl(combo.lvl[i]));
    V.combo[stat].meter.title = S("stats", stat) + ": " + toLvl(combo.lvl[i], stat);
    V.combo.meters.classList.toggle("internal", state.settings.statScale === "internal");
    if (state.settings.showMeterValues) {
      V.combo[stat].value.innerText = scaleStat(combo.lvl[i]).toLocaleString("en", getStatLocaleOptions());
    } else {
      V.combo[stat].value.innerText = "";
    }
  }

  // Favorite
  V.combo.favorite.classList.toggle("selected", state.selectedSlot.isFavorite);
  V.combo.favorite.title = state.selectedSlot.isFavorite ? "Remove this combo from your favourites." : "Save this combo to your favourites.";

  drawPageTitle();
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

    const comboDisplay = newComboDisplay(combo);

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
    for (let i = 0; i < 13; i++) {
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

function formatFormula(formula) {
  let s = "";
  const combo = state.selectedSlot.combo;

  const terms = [];
  for (let stat of ["mtb", "spd", "spdGr", "spdAg", "spdWt", "spdAr", "acc",
                    "wgt", "hnd", "hndGr", "hndAg", "hndWt", "hndAr", "trn", "inv", "size"]) {
    if (stat === "spd"   && !formula.unified.spd) continue;
    if (stat === "spdGr" &&  formula.unified.spd) continue;
    if (stat === "spdAg" &&  formula.unified.spd) continue;
    if (stat === "spdWt" &&  formula.unified.spd) continue;
    if (stat === "spdWt" &&  formula.unified.spd) continue;
    if (stat === "hnd"   && !formula.unified.hnd) continue;
    if (stat === "hndGr" &&  formula.unified.hnd) continue;
    if (stat === "hndAg" &&  formula.unified.hnd) continue;
    if (stat === "hndWt" &&  formula.unified.hnd) continue;
    if (stat === "hndWt" &&  formula.unified.hnd) continue;
    const i = statIndex[stat];
    let factor = formula.factors[i];
    let isMinSet = formula.min[i] > 0;
    let isMaxSet = formula.max[i] < getMax(i);
    if (factor === 0 && !isMinSet && !isMaxSet) continue;
    const sign = factor < 0 ? "−" : "";
    let term = "<span";
    if (factor < 0) term += " class='negative'";
    if (factor > 0) term += " class='positive'";
    term += " title='" + S("stats", stat) + "'";
    term += ">";
    factor = Math.abs(factor).toString();
    if (factor[0] === "0") factor = factor.substr(1);
    term += sign;
    if (factor !== "") term += factor + "<span class='multiply'>×</span>";
    term += S("statsAbbr", stat);
    if (isMinSet || isMaxSet) {
      term += "<span";
      if (!isMinSet || !isMaxSet) term += " class='subdued'";
      term += ">*</span>";
    }
    term += "</span>";
    terms.push(term);
  }
  s += '<span class="formula">' + terms.join(" + ") + "</span>";

  const locks = [];
  if (state.locks.driver) locks.push(S("drivers", combo.driverID));
  if (state.locks.body) locks.push(S("bodies", combo.bodyID));
  if (state.locks.tire) locks.push(S("tires", combo.tireID));
  if (state.locks.glider) locks.push(S("gliders", combo.gliderID));

  let exclusionsString = "";
  const bodyConflict = state.locks.body && (
     (combo.parts.body.type === "kart"  && formula.excludeKarts) ||
     (combo.parts.body.type === "atv"   && formula.excludeATVs)  ||
     (combo.parts.body.type === "bike"  && formula.excludeBikes) ||
     (combo.parts.body.type === "sport" && formula.excludeSportBikes));
  if (!state.locks.body || bodyConflict) {
    const exclusions = [];
    if (formula.excludeKarts) exclusions.push("karts");
    if (formula.excludeATVs) exclusions.push("ATVs");
    if (formula.excludeBikes) exclusions.push("outside drifting bikes");
    if (formula.excludeSportBikes) exclusions.push("inside drifting bikes");

    if (exclusions.length === 3) {
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
  const listFormatter = new Intl.ListFormat(state.settings.locale, {
    style: "short",
    type: "unit"
  });
  s += listFormatter.format(locks);
  if (locks.length > 0 && exclusionsString.length > 0) s += " — ";
  s += exclusionsString;
  s += "</span>";

  return s;
}

function drawShareNotice() {
  Tooltip.draw("Link copied to clipboard.", { el: V.combo.share, pos: "bottom" });
}

function initDriverDialog() {
  state.parts.then(({drivers}) => {
    for (const driver of drivers) {
      let eventHandler, folder;
      const id = driver.id;
      if (driver.folder === undefined) {
        eventHandler = () => { setDriver(id); };
      } else {
        folder = document.createElement("div");
        folder.setAttribute("inert", "");
        folder.classList.add("parts-grid", "square");
        if (driver.folder.length === 2) folder.classList.add("two");
        if (driver.folder.length >= 3) folder.classList.add("three");
        eventHandler = e => {
          if (!folder.contains(e.target)) drawPopover(folder);
        };
        V.drivers.dialog.addEventListener("focusout", e => {
          if (!folder.contains(e.relatedTarget)) closePopover(folder);
        });
        V.drivers.dialog.addEventListener("click", e => {
          if (isOutside(folder, e)) closePopover(folder);
        }, { passive: true });
        for (const driverVariant of driver.folder) {
          const variantID = driverVariant.id;
          const button = newPartButton("drivers", variantID, "driver-" + variantID);
          button.addEventListener("click", () => {
            closePopover(folder);
            setDriver(variantID);
          }, { passive: true });
          button.addEventListener("mouseenter", () => { drawDriverTitle(variantID); }, { passive: true });
          button.addEventListener("mouseleave", () => { delay(() => drawDriverTitle(state.driver)) }, { passive: true });
          button.addEventListener("focus", () => { drawDriverTitle(variantID); }, { passive: true });
          button.addEventListener("blur", () => { drawDriverTitle(state.driver); }, { passive: true });
          folder.append(button);
        }
      }
      const buttonID = (folder === undefined ? "driver-" : "folder-") + id;
      const button = newPartButton("drivers", folder === undefined ? id : undefined, buttonID);
      button.dataset.value = id;
      button.addEventListener("click", eventHandler, { passive: true });
      if (folder !== undefined) { button.append(folder); }
      button.addEventListener("mouseenter", () => { drawDriverTitle(button.dataset.value); }, { passive: true });
      button.addEventListener("mouseleave", () => { delay(() => drawDriverTitle(state.driver)) }, { passive: true });
      button.addEventListener("focus", () => { drawDriverTitle(button.dataset.value); }, { passive: true });
      button.addEventListener("blur", () => { drawDriverTitle(state.driver); }, { passive: true });
      V.drivers.grid.append(button);
    }
  });
}
function drawDriverDialog() {
  if (state.openedDialog !== "driver") {
    V.drivers.dialog.inert = true;
    V.drivers.dialog.close();
    enableScroll(document.documentElement);
    return;
  }
  state.parts.then(({drivers}) => {
    for (const driver of drivers) {
      const id = driver.id;
      if (driver.folder === undefined) {
        const button = document.getElementById("driver-" + id);
        const name = S("drivers", id);
        button.querySelector("img").alt = name;
        button.title = name;
        button.classList.toggle("selected", id === state.driver);
        button.classList.toggle("highlight", driver.group === state.selectedSlot.combo.parts.driver.group);
      } else {
        const button = document.getElementById("folder-" + id);
        const driverPref = state.driverPrefs[id];
        button.dataset.value = driverPref;
        const img = button.querySelector("img");
        img.src = graphicsRoot + "drivers/" + driverPref + ".webp";
        const name = S("drivers", driverPref);
        img.alt = name;
        button.title = name;
        button.classList.remove("selected", "highlight");
        for (const driverVariant of driver.folder) {
          const variantID = driverVariant.id;
          const variantButton = document.getElementById("driver-" + variantID);
          const variantName = S("drivers", variantID);
          variantButton.querySelector("img").alt = variantName;
          variantButton.title = variantName;
          const selected = variantID === state.driver;
          variantButton.classList.toggle("selected", selected);
          const highlight = driverVariant.group === state.selectedSlot.combo.parts.driver.group;
          variantButton.classList.toggle("highlight", highlight);
          if (selected) button.classList.add("selected");
          if (highlight) button.classList.add("highlight");
        }
      }
    }
  });
  drawDriverTitle(state.driver);
  drawDriverLock();
  disableScroll(document.documentElement);
  V.drivers.dialog.inert = false;
  if (!V.drivers.dialog.open) V.drivers.dialog.showModal();
}

function initBodyDialog() {
  state.parts.then(({bodies: types}) => {
    for (const bodies of types) {
    for (const body of bodies.folder) {
      const id = body.id;
      const button = newPartButton("bodies", id, "body-" + id);
      button.addEventListener("click", () => { setBody(id); }, { passive: true });
      button.addEventListener("mouseenter", () => {
        drawBodyTitle(id, bodies.id);
      }, { passive: true });
      button.addEventListener("mouseleave", () => {
        delay(() => drawBodyTitle(state.body, state.selectedSlot.combo.parts.body.type));
      }, { passive: true });
      button.addEventListener("focus", () => {
        drawBodyTitle(id, bodies.id);
      }, { passive: true });
      button.addEventListener("blur", () => {
        drawBodyTitle(state.body, state.selectedSlot.combo.parts.body.type);
      }, { passive: true });
      V.bodies.grid.append(button);
    }
    V.bodies.grid.append(document.createElement("hr"));
    }
    // Remove last hr. (ugly)
    V.bodies.grid.children[V.bodies.grid.children.length - 1].remove();

  });
}
function drawBodyDialog() {
  if (state.openedDialog !== "body") {
    V.bodies.dialog.inert = true;
    V.bodies.dialog.close();
    enableScroll(document.documentElement);
    return;
  }
  state.parts.then(({bodies: types}) => {
    for (const bodies of types) {
    for (const body of bodies.folder) {
      const id = body.id;
      const button = document.getElementById("body-" + id);
      const name = S("bodies", id);
      button.querySelector("img").alt = name;
      button.title = name;
      button.classList.toggle("selected", id === state.body);
      button.classList.toggle("highlight", body.group === state.selectedSlot.combo.parts.body.group);
    } }
  });
  V.bodies.icon.setAttribute("icon", state.selectedSlot.combo.parts.body.type);
  V.bodies.title.innerText = S("bodies", state.body);
  drawBodyLock();
  disableScroll(document.documentElement);
  V.bodies.dialog.inert = false;
  if (!V.bodies.dialog.open) V.bodies.dialog.showModal();
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

function drawDriverTitle(id) {
  clearTimeout(state.inspectorTimeout);
  V.drivers.title.innerText = S("drivers", id);
  V.drivers.icon.dataset.emblem = id;
}
function drawBodyTitle(id, type) {
  clearTimeout(state.inspectorTimeout);
  V.bodies.title.innerText = S("bodies", id);
  V.bodies.icon.setAttribute("icon", type);
}
function drawTireTitle(id) {
  clearTimeout(state.inspectorTimeout);
  V.tires.title.innerText = S("tires", id);
}
function drawGliderTitle(id) {
  clearTimeout(state.inspectorTimeout);
  V.gliders.title.innerText = S("gliders", id);
}

function delay(fn) { state.inspectorTimeout = setTimeout(fn, 500); }

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

function newPartButton(ns, partID, id) {
  const button = document.createElement("button");
  if (id) button.id = id;
  const img = document.createElement("img");
  if (partID) {
    img.src = graphicsRoot + ns + "/" + partID + ".webp";
    img.alt = S(ns, partID);
  }
  img.width = ns === "drivers" ? "128" : "200";
  img.height = "128";
  img.loading = "lazy";
  button.append(img);
  return button;
}
function newComboDisplay(combo) {
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

  driverImg.alt = driverName; bodyImg.alt = bodyName;
  tireImg.alt = tireName; gliderImg.alt = gliderName;

  driverImg.width = "128"; driverImg.height = "128";
  bodyImg.width = "200"; bodyImg.height = "128";
  tireImg.width = "200"; tireImg.height = "128";
  gliderImg.width = "200"; gliderImg.height = "128";

  driverImg.loading = "lazy"; bodyImg.loading = "lazy";
  tireImg.loading = "lazy"; gliderImg.loading = "lazy";

  driverBox.title = driverName; bodyBox.title = bodyName;
  tireBox.title = tireName; gliderBox.title = gliderName;

  driverBox.append(driverImg); bodyBox.append(bodyImg);
  tireBox.append(tireImg); gliderBox.append(gliderImg);
  comboDisplay.append(driverBox, bodyBox, tireBox, gliderBox);
  return comboDisplay;
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
  if (li === undefined) return;
  li.style.height = li.offsetHeight + "px";
  li.getClientRects(); // Force recalculation of layout.
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

function drawFormulaDialog() {
  if (state.openedDialog !== "formula") {
    state.formulaDialogScrollTop = V.formula.dialog.scrollTop;
    V.formula.dialog.inert = true;
    V.formula.dialog.close();
    enableScroll(document.documentElement);
    return;
  }

  const formula = state.workingFormula;
  for (const stat of stats) {
    const i = statIndex[stat];
    const scaledMin = getScaledMin(i);
    const scaledMax = getScaledMax(i);
    const scaledStep = getScaledStep(i);
    const scaledPlaceholder = getScaledPlaceholder(i);

    V.formula[stat].min.min = scaledMin;
    V.formula[stat].min.max = scaledMax;
    V.formula[stat].min.step = scaledStep;
    V.formula[stat].max.min = scaledMin;
    V.formula[stat].max.max = scaledMax;
    V.formula[stat].max.step = scaledStep;
    V.formula[stat].max.placeholder = scaledPlaceholder;

    let factor = formula.factors[i];
    V.formula[stat].slider.value = factor;
    if (factor === 0) factor = "";
    V.formula[stat].factor.value = factor;
    drawFactorWidget(stat);

    let min = scaleStat(formula.min[i], i);
    if (min == V.formula[stat].min.min) min = "";
    V.formula[stat].min.value = min;

    let max = scaleStat(formula.max[i], i);
    if (max == V.formula[stat].min.max) max = "";
    V.formula[stat].max.value = max;

    validateBounds(stat);
  }

  V.formula.includeKarts.classList.toggle("selected", !state.workingFormula.excludeKarts);
  V.formula.includeATVs.classList.toggle("selected", !state.workingFormula.excludeATVs);
  V.formula.includeBikes.classList.toggle("selected", !state.workingFormula.excludeBikes);
  V.formula.includeSportBikes.classList.toggle("selected", !state.workingFormula.excludeSportBikes);

  drawCollapses();

  V.formula.dialog.inert = false;
  disableScroll(document.documentElement);
  if (V.formula.dialog.open) return;
  V.formula.dialog.showModal();
  V.formula.dialog.scrollTop = state.formulaDialogScrollTop;
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

function drawSettingsDialog() {
  if (state.openedDialog !== "settings") {
    V.settings.dialog.inert = true;
    V.settings.dialog.close();
    return;
  }

  V.settings.cookiesToggle.classList.toggle("selected", state.settings.allowCookies);
  V.settings.localeSelect.value = state.settings.locale;
  V.settings.statScaleSelect.value = state.settings.statScale;
  V.settings.meterValuesToggle.classList.toggle("selected", state.settings.showMeterValues);

  V.settings.dialog.inert = false;
  if (V.settings.dialog.open) return;
  V.settings.dialog.showModal();
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

function disableScroll(el) { el.classList.add("no-scroll"); }
function enableScroll(el)  { el.classList.remove("no-scroll"); }

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

function parseValue(v, defaultV = 0) {
  v = parseFloat(v);
  if (isNaN(v)) return parseFloat(defaultV);
  return v;
}

function scaleStat(x, stat) {
  if (x < 0) return 0;
  if (x >= 20) return state.settings.statScale === "internal" ? 20 : 5.75;
  if (state.settings.statScale === "internal" || stat === statIndex.size) return x;
  return toLvl(x);
}
function scaleStatAbs(x) {
  if (state.settings.statScale === "internal") return x;
  return x/4;
}
const getMin = () => 0;
const getScaledMin = stat => {
 if (stat === statIndex.size) return 0;
 return state.settings.statScale === "internal" ? 0 : .75;
}
const getMax = stat => stat === statIndex.size ? 2 : 20;
const getScaledMax = stat => {
  if (stat === statIndex.size) return 2;
  return state.settings.statScale === "internal" ? 20 : 5.75;
};
const getScaledStep = stat => {
  if (stat === statIndex.size) return 1;
  return state.settings.statScale === "internal" ? 1 : .25;
};
const getScaledPlaceholder = stat => {
  if (stat === statIndex.size) return 2;
  return state.settings.statScale === "internal" ? 20 : 6;
};
function unscaleStat(x, stat) {
  if (state.settings.statScale === "internal" || stat === statIndex.size) return x;
  return fromLvl(x);
}
const toLvl = n => (n+3) / 4;
const fromLvl = n => Math.max(n*4 - 3, 0);
function getStatLocaleOptions() {
  return state.settings.statScale === "internal" ? { minimumIntegerDigits: 1 } : { minimumFractionDigits: 2 };
}
