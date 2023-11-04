// There is ?????? parts combinations (excluding color variants).
// There is 649440 parts combinations (excluding driver variants).
// There is  28224 class combinations.
// There is   8064 group combinations (excluding size and invul stats).

class Combo {
  constructor(driver = "mario", body = "std", tire = "std", glider = "super") {
    if (gameStats.parts.drivers[driver] !== undefined) {
      this.driver = driver;
    } else { throw "Unknown driver: " + driver }

    if (gameStats.parts.bodies[body] !== undefined) {
      this.body = body;
    } else { throw "Unknown body: " + body }

    if (gameStats.parts.tires[tire] !== undefined) {
      this.tire = tire;
    } else { throw "Unknown tire: " + tire }

    if (gameStats.parts.gliders[glider] !== undefined) {
      this.glider = glider;
    } else { throw "Unknown glider: " + glider }
  }

  // TODO: Add cache? Store value?
  getLevel(stat) {
    if (stat == "spd") {
      return this.getLevel("spdGr")*.85 + this.getLevel("spdAg")*.12 +
      this.getLevel("spdWt")*.02 + this.getLevel("spdAr")*.01;
    }

    if (stat == "hnd") {
      return this.getLevel("spdGr")*.85 + this.getLevel("spdAg")*.12 +
      this.getLevel("spdWt")*.02 + this.getLevel("spdAr")*.01;
    }

    let sum = 0;
    for (let i = 0; i < comboPartsS.length; i++) {
      const part = gameStats.parts[comboPartsP[i]][this[comboPartsS[i]]];
      const statsClass = part.stats;
      sum += gameStats.classes[comboPartsP[i]][statsClass][stat];
      if (stat == "size") return sum;
    }
    const level = (sum + 3) / 4;
    if (!Number.isInteger(level*4) || level > 5.75 || level < .75) {
      console.error("Level calculation for " + stat + " returned " + level);
    }
    return level;
  }

  getScore(stats = ["weigt", "accel", "trctn", "mintb",
                    "spdGr", "spdWt", "spdAg", "spdAr",
                    "hndGr", "hndWt", "hndAg", "hndAr", "invul"]) {
    let sum = 0;
    for (const stat of stats) {
      sum += this.getLevel(stat);
    }
    return sum;
  }

  getOptiScore() {
    let sum = 0;
    sum += 8 * this.getLevel("mintb");
    sum += 7.5 * this.getLevel("spd");
    sum += this.getLevel("accel");
    sum += this.getLevel("hnd");
    sum += this.getLevel("weigt") / 8;
    sum += this.getLevel("trctn") / 8;
    // sum += this.getLevel("invul") / 16;
    // sum -= gameStats.parts.bodies[this.body].type == "sport" ? 4 : 0;
    // sum -= this.getLevel("size");
    return sum;
  }

  getCode() {
    const driverCode = driverCodes[this.driver];
    const bodyCode = bodyCodes[this.body];
    const tireCode = tireCodes[this.tire];
    const gliderCode = gliderCodes[this.glider];
    return driverCode + bodyCode + tireCode + gliderCode;
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

function listCombos(opts = {}) {
  opts.mustDiffer ??= false; opts.maxAbsDiff ??= Infinity;
  opts.minDiff ??= -Infinity; opts.maxDiff ??= Infinity;
  opts.sortBy ??= "diff";
  opts.mintbMin ??= 0; opts.mintbMax ??= 6; opts.mintb ??= opts.mintbMin;
  opts.spdGrMin ??= 0; opts.spdGrMax ??= 6; opts.spdGr ??= opts.spdGrMin;
  opts.spdWtMin ??= 0; opts.spdWtMax ??= 6; opts.spdWt ??= opts.spdWtMin;
  opts.spdAgMin ??= 0; opts.spdAgMax ??= 6; opts.spdAg ??= opts.spdAgMin;
  opts.spdArMin ??= 0; opts.spdArMax ??= 6; opts.spdAr ??= opts.spdArMin;
  opts.accelMin ??= 0; opts.accelMax ??= 6; opts.accel ??= opts.accelMin;
  opts.weigtMin ??= 0; opts.weigtMax ??= 6; opts.weigt ??= opts.weigtMin;
  opts.hndGrMin ??= 0; opts.hndGrMax ??= 6; opts.hndGr ??= opts.hndGrMin;
  opts.hndWtMin ??= 0; opts.hndWtMax ??= 6; opts.hndWt ??= opts.hndWtMin;
  opts.hndAgMin ??= 0; opts.hndAgMax ??= 6; opts.hndAg ??= opts.hndAgMin;
  opts.hndArMin ??= 0; opts.hndArMax ??= 6; opts.hndAr ??= opts.hndArMin;
  opts.trctnMin ??= 0; opts.trctnMax ??= 6; opts.trctn ??= opts.trctnMin;
  opts.invulMin ??= 0; opts.invulMax ??= 6; opts.invul ??= opts.invulMin;
  opts.sizeMin ??= 0; opts.sizeMax ??= 2; opts.size ??= opts.sizeMin;

  const list = [];

  for (const driver of Object.keys(gameStats.classes.drivers)) {
    for (const body of Object.keys(gameStats.classes.bodies)) {
      for (const tire of Object.keys(gameStats.classes.tires)) {
        for (const glider of Object.keys(gameStats.classes.gliders)) {
          const combo = new Combo(driver, body, tire, glider);
          const mintb = combo.getLevel("mintb");
          const spdGr = combo.getLevel("spdGr");
          const spdWt = combo.getLevel("spdWt");
          const spdAg = combo.getLevel("spdAg");
          const spdAr = combo.getLevel("spdAr");
          const accel = combo.getLevel("accel");
          const weigt = combo.getLevel("weigt");
          const hndGr = combo.getLevel("hndGr");
          const hndWt = combo.getLevel("hndWt");
          const hndAg = combo.getLevel("hndAg");
          const hndAr = combo.getLevel("hndAr");
          const trctn = combo.getLevel("trctn");
          const invul = combo.getLevel("invul");
          const size = combo.getLevel("size");

          const absDiff = Math.abs(mintb - opts.mintb) +
          Math.abs(spdGr - opts.spdGr) + Math.abs(spdWt - opts.spdWt) +
          Math.abs(spdAg - opts.spdAg) + Math.abs(spdAr - opts.spdAr) +
          Math.abs(accel - opts.accel) + Math.abs(weigt - opts.weigt) +
          Math.abs(hndGr - opts.hndGr) + Math.abs(hndWt - opts.hndWt) +
          Math.abs(hndAg - opts.hndAg) + Math.abs(hndAr - opts.hndAr) +
          Math.abs(trctn - opts.trctn) + Math.abs(invul - opts.invul);
          if (absDiff > opts.maxAbsDiff) continue;
          if (opts.mustDiffer && absDiff == 0) continue;

          combo.diff = (mintb - opts.mintb) +
          (spdGr - opts.spdGr) + (spdWt - opts.spdWt) +
          (spdAg - opts.spdAg) + (spdAr - opts.spdAr) +
          (accel - opts.accel) + (weigt - opts.weigt) +
          (hndGr - opts.hndGr) + (hndWt - opts.hndWt) +
          (hndAg - opts.hndAg) + (hndAr - opts.hndAr) +
          (trctn - opts.trctn) + (invul - opts.invul);
          if (combo.diff < opts.minDiff) continue;
          if (combo.diff > opts.maxDiff) continue;

          if (mintb < opts.mintbMin || mintb > opts.mintbMax) continue;
          if (spdGr < opts.spdGrMin || spdGr > opts.spdGrMax) continue;
          if (spdWt < opts.spdWtMin || spdWt > opts.spdWtMax) continue;
          if (spdAg < opts.spdAgMin || spdAg > opts.spdAgMax) continue;
          if (spdAr < opts.spdArMin || spdAr > opts.spdArMax) continue;
          if (accel < opts.accelMin || accel > opts.accelMax) continue;
          if (weigt < opts.weigtMin || weigt > opts.weigtMax) continue;
          if (hndGr < opts.hndGrMin || hndGr > opts.hndGrMax) continue;
          if (hndWt < opts.hndWtMin || hndWt > opts.hndWtMax) continue;
          if (hndAg < opts.hndAgMin || hndAg > opts.hndAgMax) continue;
          if (hndAr < opts.hndArMin || hndAr > opts.hndArMax) continue;
          if (trctn < opts.trctnMin || trctn > opts.trctnMax) continue;
          if (invul < opts.invulMin || invul > opts.invulMax) continue;
          if (size < opts.sizeMin || size > opts.sizeMax) continue;

          list.push(combo);
        }
      }
    }
  }

  if (!(opts.sortBy instanceof Array)) opts.sortBy = [opts.sortBy];
  const compare = function(a, b) {
      for (const stat of opts.sortBy) {
        let statA, statB;
        if (stat == "diff") {
          statA = a.diff;
          statB = b.diff;

        } else if (stat == "score") {
          const stats = ["mintb", "spd"];
          statA = a.getScore(stats);
          statB = b.getScore(stats);

        } else if (stat == "optiScore") {
          statA = a.getOptiScore();
          statB = b.getOptiScore();

        } else {
          statA = a.getLevel(stat);
          statB = b.getLevel(stat);
        }

        if (statA == statB) continue;
        return statB - statA;
      }
      return 0;
  }

  list.sort(compare);

  return list;
}
