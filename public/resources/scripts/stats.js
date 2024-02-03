"use strict";
// There is ?????? parts combinations (excluding color variants).
// There is 649440 parts combinations (excluding driver variants).
// There is  28224 class combinations.
// There is   8064 group combinations (excluding size and invcb stats).

// Represents a combo class (with unique stats).
class ComboC {
  #parts = {};
  #classes = {};
  #code = "";
  #lvl = [];

  constructor(driver = "mario", body = "std", tire = "std", glider = "super") {
    if (gameStats.parts.drivers[driver] !== undefined) {
      this.#parts.driver = driver;
      this.#classes.driver = gameStats.parts.drivers[driver].stats;
    } else { throw "Unknown driver: " + driver }
    if (gameStats.parts.bodies[body] !== undefined) {
      this.#parts.body = body;
      this.#classes.body = gameStats.parts.bodies[body].stats;
    } else { throw "Unknown body: " + body }
    if (gameStats.parts.tires[tire] !== undefined) {
      this.#parts.tire = tire;
      this.#classes.tire = gameStats.parts.tires[tire].stats;
    } else { throw "Unknown tire: " + tire }
    if (gameStats.parts.gliders[glider] !== undefined) {
      this.#parts.glider = glider;
      this.#classes.glider = gameStats.parts.gliders[glider].stats;
    } else { throw "Unknown glider: " + glider }

    this.lvl = {};
    this.size;
    this.#calculateLvls();
    this.#assignCode();
  }

  get code() { return this.#code; }
  get driver() { return this.#parts.driver; }
  get body() { return this.#parts.body; }
  get tire() { return this.#parts.tire; }
  get glider() { return this.#parts.glider; }

  #assignCode() {
    const driverCode = driverCodes[this.driver];
    const bodyCode = bodyCodes[this.body];
    const tireCode = tireCodes[this.tire];
    const gliderCode = gliderCodes[this.glider];
    this.#code = driverCode + bodyCode + tireCode + gliderCode;
  }

  #calculateLvls() {
    for (const stat of ["weigt", "accel", "trctn", "mintb",
                        "spdGr", "spdWt", "spdAg", "spdAr",
                        "hndGr", "hndWt", "hndAg", "hndAr", "invcb"]) {
      let sum = 0;
      for (let i = 0; i < comboPartsS.length; i++) {
        sum += gameStats.classes[comboPartsP[i]][this.#classes[comboPartsS[i]]][stat];
      }
      const lvl = (sum + 3) / 4;
      if (!Number.isInteger(lvl*4) || lvl > 5.75 || lvl < .75) {
        console.error("Level calculation for " + stat + " returned " + lvl);
      }
      this.lvl[stat] = lvl;
    }

    this.lvl.spd = round(this.lvl.spdGr*ComboC.PERCENT_GR +
                         this.lvl.spdAg*ComboC.PERCENT_AG +
                         this.lvl.spdWt*ComboC.PERCENT_WT +
                         this.lvl.spdAr*ComboC.PERCENT_AR, 3);
    this.lvl.hnd = round(this.lvl.hndGr*ComboC.PERCENT_GR +
                         this.lvl.hndAg*ComboC.PERCENT_AG +
                         this.lvl.hndWt*ComboC.PERCENT_WT +
                         this.lvl.hndAr*ComboC.PERCENT_AR, 3);

    // The driver's size [0-2] is converted to the lvl range [.75-5.75]
    this.size = gameStats.classes.drivers[this.#classes.driver].size;
    this.lvl.size = this.size*2.5 + .75;

    // Reflect to array.
    for (let i = 0; i < ComboC.SCORE_STATS.length; i++) {
      this.#lvl.push(this.lvl[ComboC.SCORE_STATS[i]]);
    }
  }

  getScore(weights) {
    let sum = 0;
    for (let i = 0; i < 16; i++) {
      sum += weights[i] * this.#lvl[i];
    }
    return sum;
  }

  static SCORE_STATS = [ "mintb", "spd", "spdGr", "spdAg", "spdWt", "spdAr", "accel",
                         "weigt", "hnd", "hndGr", "hndAg", "hndWt", "hndAr", "trctn", "invcb", "size" ];
  static OPTISCORE = [16, 15, 0, 0, 0, 0, 1,
                      .25, 1, 0, 0, 0, 0, .25, 0, 0];

  static PERCENT_GR = .80; // Best estimate for percent of time on ground.
  static PERCENT_AG = .15; // Best estimate for percent of time in anti-gravity.
  static PERCENT_WT = .04; // Best estimate for percent of time underwater.
  static PERCENT_AR = .01; // Best estimate for percent of time airborne.
}

const AllCombos = [];
const AllComboCodes = [];
for (const driver of Object.keys(gameStats.classes.drivers)) {
  for (const body of Object.keys(gameStats.classes.bodies)) {
    for (const tire of Object.keys(gameStats.classes.tires)) {
      for (const glider of Object.keys(gameStats.classes.gliders)) {
        const combo = new ComboC(driver, body, tire, glider);
        AllCombos.push(combo);
        AllComboCodes.push(combo.code);
      }
    }
  }
}

async function listCombos(opts = {}) {
  return new Promise(function(resolve, reject) {
    opts.mustDiffer ??= false; opts.maxAbsDiff ??= Infinity;
    opts.minDiff ??= -Infinity; opts.maxDiff ??= Infinity;
    opts.sortBy ??= "diff";
    opts.mintbMin ??= 0; opts.mintbMax ??= 6; opts.mintb ??= opts.mintbMin;
    opts.spdMin ??= 0; opts.spdMax ??= 6;
    opts.spdGrMin ??= 0; opts.spdGrMax ??= 6; opts.spdGr ??= opts.spdGrMin;
    opts.spdWtMin ??= 0; opts.spdWtMax ??= 6; opts.spdWt ??= opts.spdWtMin;
    opts.spdAgMin ??= 0; opts.spdAgMax ??= 6; opts.spdAg ??= opts.spdAgMin;
    opts.spdArMin ??= 0; opts.spdArMax ??= 6; opts.spdAr ??= opts.spdArMin;
    opts.accelMin ??= 0; opts.accelMax ??= 6; opts.accel ??= opts.accelMin;
    opts.weigtMin ??= 0; opts.weigtMax ??= 6; opts.weigt ??= opts.weigtMin;
    opts.hndMin ??= 0; opts.hndMax ??= 6;
    opts.hndGrMin ??= 0; opts.hndGrMax ??= 6; opts.hndGr ??= opts.hndGrMin;
    opts.hndWtMin ??= 0; opts.hndWtMax ??= 6; opts.hndWt ??= opts.hndWtMin;
    opts.hndAgMin ??= 0; opts.hndAgMax ??= 6; opts.hndAg ??= opts.hndAgMin;
    opts.hndArMin ??= 0; opts.hndArMax ??= 6; opts.hndAr ??= opts.hndArMin;
    opts.trctnMin ??= 0; opts.trctnMax ??= 6; opts.trctn ??= opts.trctnMin;
    opts.invcbMin ??= 0; opts.invcbMax ??= 6; opts.invcb ??= opts.invcbMin;
    opts.sizeMin ??= 0; opts.sizeMax ??= 2; opts.size ??= opts.sizeMin;
    opts.driverLock ??= undefined; opts.bodyLock ??= undefined;
    opts.tireLock ??= undefined; opts.gliderLock ??= undefined;
    opts.excludeKarts ??= false; opts.excludeATVs ??= false;
    opts.excludeBikes ??= false; opts.excludeSportBikes ??= false;
    opts.scoreFormula ??= undefined;

    const list = [];

    for (const combo of AllCombos) {
      if (opts.driverLock !== undefined &&
          gameStats.parts.drivers[opts.driverLock].stats !== combo.driver) continue;
      if (opts.bodyLock !== undefined &&
          gameStats.parts.bodies[opts.bodyLock].stats !== combo.body) continue;
      if (opts.tireLock !== undefined &&
          gameStats.parts.tires[opts.tireLock].stats !== combo.tire) continue;
      if (opts.gliderLock !== undefined &&
          gameStats.parts.gliders[opts.gliderLock].stats !== combo.glider) continue;

      const bodyType = gameStats.parts.bodies[combo.body].type;
      if (opts.excludeKarts      && bodyType == "kart") continue;
      if (opts.excludeATVs       && bodyType == "atv")   continue;
      if (opts.excludeBikes      && bodyType == "bike")  continue;
      if (opts.excludeSportBikes && bodyType == "sport") continue;

      const mintb = combo.lvl.mintb; const accel = combo.lvl.accel;
      const spd = combo.lvl.spd;
      const spdGr = combo.lvl.spdGr; const spdWt = combo.lvl.spdWt;
      const spdAg = combo.lvl.spdAg; const spdAr = combo.lvl.spdAr;
      const weigt = combo.lvl.weigt; const trctn = combo.lvl.trctn;
      const hnd = combo.lvl.hnd;
      const hndGr = combo.lvl.hndGr; const hndWt = combo.lvl.hndWt;
      const hndAg = combo.lvl.hndAg; const hndAr = combo.lvl.hndAr;
      const invcb = combo.lvl.invcb;
      const size = combo.size;

      const absDiff = Math.abs(mintb - opts.mintb) +
      Math.abs(spdGr - opts.spdGr) + Math.abs(spdWt - opts.spdWt) +
      Math.abs(spdAg - opts.spdAg) + Math.abs(spdAr - opts.spdAr) +
      Math.abs(accel - opts.accel) + Math.abs(weigt - opts.weigt) +
      Math.abs(hndGr - opts.hndGr) + Math.abs(hndWt - opts.hndWt) +
      Math.abs(hndAg - opts.hndAg) + Math.abs(hndAr - opts.hndAr) +
      Math.abs(trctn - opts.trctn) + Math.abs(invcb - opts.invcb);
      if (absDiff > opts.maxAbsDiff) continue;
      if (opts.mustDiffer && absDiff == 0) continue;

      combo.diff = (mintb - opts.mintb) +
      (spdGr - opts.spdGr) + (spdWt - opts.spdWt) +
      (spdAg - opts.spdAg) + (spdAr - opts.spdAr) +
      (accel - opts.accel) + (weigt - opts.weigt) +
      (hndGr - opts.hndGr) + (hndWt - opts.hndWt) +
      (hndAg - opts.hndAg) + (hndAr - opts.hndAr) +
      (trctn - opts.trctn) + (invcb - opts.invcb);
      if (combo.diff < opts.minDiff) continue;
      if (combo.diff > opts.maxDiff) continue;

      if (mintb < opts.mintbMin || mintb > opts.mintbMax) continue;
      if (spd < opts.spdMin || spd > opts.spdMax) continue;
      if (spdGr < opts.spdGrMin || spdGr > opts.spdGrMax) continue;
      if (spdWt < opts.spdWtMin || spdWt > opts.spdWtMax) continue;
      if (spdAg < opts.spdAgMin || spdAg > opts.spdAgMax) continue;
      if (spdAr < opts.spdArMin || spdAr > opts.spdArMax) continue;
      if (accel < opts.accelMin || accel > opts.accelMax) continue;
      if (weigt < opts.weigtMin || weigt > opts.weigtMax) continue;
      if (hnd < opts.hndMin || hnd > opts.hndMax) continue;
      if (hndGr < opts.hndGrMin || hndGr > opts.hndGrMax) continue;
      if (hndWt < opts.hndWtMin || hndWt > opts.hndWtMax) continue;
      if (hndAg < opts.hndAgMin || hndAg > opts.hndAgMax) continue;
      if (hndAr < opts.hndArMin || hndAr > opts.hndArMax) continue;
      if (trctn < opts.trctnMin || trctn > opts.trctnMax) continue;
      if (invcb < opts.invcbMin || invcb > opts.invcbMax) continue;
      if (size < opts.sizeMin || size > opts.sizeMax) continue;

      list.push(combo);
    }

    if (!(opts.sortBy instanceof Array)) opts.sortBy = [opts.sortBy];
    let statA, statB;
    const compare = function(a, b) {
      for (const stat of opts.sortBy) {
        if (stat == "diff") {
          statA = a.diff;
          statB = b.diff;

        } else if (stat == "score") {
          statA = a.getScore(opts.scoreFormula);
          statB = b.getScore(opts.scoreFormula);

        } else {
          statA = a.lvl[stat];
          statB = b.lvl[stat];
        }

        if (statA == statB) continue;
        return statB - statA;
      }
      return 0;
    }

    list.sort(compare);

    resolve(list);
  });
}

// Represents a visually unique combo that points to a class in AllCombos.
class Combo {
  #code = "MAAA";
  #class = {};
  #parts = {};
  #classes = {};

  #setDriver(val) {
    if (gameStats.parts.drivers[val] == undefined) throw "Unknown driver: " + val;
    this.#parts.driver = val;
    this.#classes.driver = gameStats.parts.drivers[val].stats;
    this.#code = this.#code.replaceAt(0, driverCodes[val]);
  }
  set driver(val) {
    this.#setDriver(val)
    this.#assignClass();
  }
  #setBody(val) {
    if (gameStats.parts.bodies[val] == undefined) throw "Unknown body: " + val;
    this.#parts.body = val;
    this.#classes.body = gameStats.parts.bodies[val].stats;
    this.#code = this.#code.replaceAt(1, bodyCodes[val]);
  }
  set body(val) {
    this.#setBody(val);
    this.#assignClass();
  }
  #setTire(val) {
    if (gameStats.parts.tires[val] == undefined) throw "Unknown tire: " + val;
    this.#parts.tire = val;
    this.#classes.tire = gameStats.parts.tires[val].stats;
    this.#code = this.#code.replaceAt(2, tireCodes[val]);
  }
  set tire(val) {
   this.#setTire(val);
    this.#assignClass();
  }
  #setGlider(val) {
    if (gameStats.parts.gliders[val] == undefined) throw "Unknown glider: " + val;
    this.#parts.glider = val;
    this.#classes.glider = gameStats.parts.gliders[val].stats;
    this.#code = this.#code.replaceAt(3, gliderCodes[val]);
  }
  set glider(val) {
    this.#setGlider(val);
    this.#assignClass();
  }

  constructor(driver = "mario", body = "std", tire = "std", glider = "super") {
    this.#setDriver(driver);
    this.#setBody(body);
    this.#setTire(tire);
    this.#setGlider(glider);
    this.#assignClass();
  }

  get code() { return this.#code; }
  get driver() { return this.#parts.driver; }
  get body() { return this.#parts.body; }
  get tire() { return this.#parts.tire; }
  get glider() { return this.#parts.glider; }

  get lvl() { return this.#class.lvl }
  get size() { return this.#class.size }

  #assignClass() {
    const driverClass = gameStats.parts.drivers[this.driver].stats;
    const bodyClass = gameStats.parts.bodies[this.body].stats;
    const tireClass = gameStats.parts.tires[this.tire].stats;
    const gliderClass = gameStats.parts.gliders[this.glider].stats;
    const classCode = driverCodes[driverClass] + bodyCodes[bodyClass] +
                      tireCodes[tireClass] + gliderCodes[gliderClass]
    this.#class = AllCombos[AllComboCodes.indexOf(classCode)];
  }

  static fromCode(comboCode) {
    let driver, body, tire, glider;
    for (const name of Object.keys(driverCodes)) {
      if (comboCode[0] == driverCodes[name]) driver = name;
    }
    for (const name of Object.keys(bodyCodes)) {
      if (comboCode[1] == bodyCodes[name]) body = name;
    }
    for (const name of Object.keys(tireCodes)) {
      if (comboCode[2] == tireCodes[name]) tire = name;
    }
    for (const name of Object.keys(gliderCodes)) {
      if (comboCode[3] == gliderCodes[name]) glider = name;
    }

    return new Combo(driver, body, tire, glider);
  }

  static randomDriver() {
    const keys = Object.keys(gameStats.parts.drivers);
    return keys[randomInt(keys.length-1)];
  }
  static randomBody() {
    const keys = Object.keys(gameStats.parts.bodies);
    return keys[randomInt(keys.length-1)];
  }
  static randomTire() {
    const keys = Object.keys(gameStats.parts.tires);
    return keys[randomInt(keys.length-1)];
  }
  static randomGlider() {
    const keys = Object.keys(gameStats.parts.gliders);
    return keys[randomInt(keys.length-1)];
  }
}
