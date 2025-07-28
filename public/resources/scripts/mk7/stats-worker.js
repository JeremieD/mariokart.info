"use strict";
// Stats Worker

onmessage = e => {
  const exchangeID = e.data[0];
  const data = e.data[1];
  const cmd  = data[0];
  const args = data.slice(1);

  let response = [exchangeID];

  switch (cmd) {
    case "getCombo":
      response[1] = getCombo(...args);
      break;
    case "getRandomCombo":
      response[1] = getRandomCombo(...args);
      break;
    case "getRandomDriver":
     response[1] = getRandomDriver();
     break;
    case "getRandomBody":
      response[1] = getRandomBody();
      break;
    case "getRandomTire":
      response[1] = getRandomTire();
      break;
    case "getRandomGlider":
      response[1] = getRandomGlider();
      break;
    case "listCombos":
      response[1] = listCombos(...args);
      break;
    case "getAvailableParts":
      response[1] = getAvailableParts(...args);
      break;
    case "setTerrainRatios":
      response[1] = setTerrainRatios(...args);
      break;
    default:
      response[1] = "Error: Unknown command: “" + cmd + "”";
  }

  postMessage(response);
};

const statIndex = {
  mtb: 0, spdGr: 1, spdWt: 2, spdAr: 3, acc: 4,
  wgt: 5, hndGr: 6, hndWt: 7, hndAr: 8, off: 9, stb: 10, dft: 11,
  size: 12, spd: 13, hnd: 14
};
const stats = [ "mtb", "spdGr", "spdWt", "spdAr", "acc",
                "wgt", "hndGr", "hndWt", "hndAr", "off", "stb", "dft",
                "size", "spd", "hnd" ];

class Combo {
  // TODO: Clean up a bit. Rename some stuff.
  driverID = "";
  bodyID = "";
  bodyVariant = "";
  tireID = "";
  gliderID = "";
  gliderVariant = "";
  parts = {
    driver: undefined,
    body: undefined,
    tire: undefined,
    glider: undefined
  };
  classes = {
    driver: undefined,
    body: undefined,
    tire: undefined,
    glider: undefined
  };
  code = "";
  lvl = [0,0,0,0,0,0,0,0,0,0,0,0,0];
  size = -1;

  constructor(driver = "mario", body = "std", tire = "std", glider = "super") {
    // TODO: Check parts
    try {
      this.code = parts.drivers[driver].code
                + parts.bodies[body].code
                + parts.tires[tire].code
                + parts.gliders[glider].code;
    } catch (e) {
      throw "Error: Unknown combo: “" + driver + ", "
          + body + ", " + tire + ", " + glider + "”";
    }

    this.driverID = driver;
    this.bodyID   = body;
    this.tireID   = tire;
    this.gliderID = glider;

    this.bodyVariant   = getBodyVariant(body, driver);
    this.gliderVariant = getGliderVariant(glider, driver);

    this.parts.driver = parts.drivers[driver];
    this.parts.body   = parts.bodies[body];
    this.parts.tire   = parts.tires[tire];
    this.parts.glider = parts.gliders[glider];

    const driverClassID = this.parts.driver.class;
    const bodyClassID   = this.parts.body.class;
    const tireClassID   = this.parts.tire.class;
    const gliderClassID = this.parts.glider.class;

    this.classes.driver = classes.drivers[driverClassID];
    this.classes.body   = classes.bodies[bodyClassID];
    this.classes.tire   = classes.tires[tireClassID];
    this.classes.glider = classes.gliders[gliderClassID];

    for (let stat = 0; stat < 15; stat++) {
      let lvl = 0;
      lvl += this.classes.driver[stat];
      lvl += this.classes.body[stat];
      lvl += this.classes.tire[stat];
      lvl += this.classes.glider[stat];
      this.lvl[stat] = lvl;
    }
    this.size = this.classes.driver[statIndex.size];
    this.lvl[statIndex.size] = this.size * 10;
    this.lvl[statIndex.spd] = round(this.lvl[statIndex.spdGr] * Combo.PERCENT_GR
                                  + this.lvl[statIndex.spdWt] * Combo.PERCENT_WT
                                  + this.lvl[statIndex.spdAr] * Combo.PERCENT_AR, 3);
    this.lvl[statIndex.hnd] = round(this.lvl[statIndex.hndGr] * Combo.PERCENT_GR
                                  + this.lvl[statIndex.hndWt] * Combo.PERCENT_WT
                                  + this.lvl[statIndex.hndAr] * Combo.PERCENT_AR, 3);

    this.name = getComboName(driver, body, tire, glider);
  }

  static fromCode(code) {
    // TODO: check code
    let driverCode, bodyCode, tireCode, gliderCode;
    if (code.length === 4) {
      driverCode = code.substring(0, 1);
      bodyCode   = code.substring(1, 2);
      tireCode   = code.substring(2, 3);
      gliderCode = code.substring(3, 4);
    } else if (code.length === 5) {
      driverCode = code.substring(0, 2);
      bodyCode   = code.substring(2, 3);
      tireCode   = code.substring(3, 4);
      gliderCode = code.substring(4, 5);
    } else {
      return new Combo();
    }

    const driver = driverCodes[driverCode];
    const body   = bodyCodes[bodyCode];
    const tire   = tireCodes[tireCode];
    const glider = gliderCodes[gliderCode];
    return new Combo(driver, body, tire, glider);
  }

  // Raw data: [https://docs.google.com/spreadsheets/d/1OPSPNbtrmYpeqNDBfNXFwJXcH1KAxxd9XjjDuDSBl9I]
  static PERCENT_GR = .85; // Estimated percent of time on ground.
  static PERCENT_WT = .5;  // Estimated percent of time underwater.
  static PERCENT_AR = .10; // Estimated percent of time airborne.
}

function getCombo(...args) {
  if (args.length === 1) { // From code
    return Combo.fromCode(args[0]);
  } else if (args.length === 4) { // From part IDs
    return new Combo(...args);
  }
  return "Error: Invalid arguments for getCombo: “" + args + "”";
}

function getRandomDriver() { return driverParts[randomInt(driverPartCount)]; }
function getRandomBody()   { return bodyParts[randomInt(bodyPartCount)]; }
function getRandomTire()   { return tireParts[randomInt(tirePartCount)]; }
function getRandomGlider() { return gliderParts[randomInt(gliderPartCount)]; }
function getRandomCombo(driver, body, tire, glider) {
  const newDriver = driver || getRandomDriver();
  const newBody   =   body || getRandomBody();
  const newTire   =   tire || getRandomTire();
  const newGlider = glider || getRandomGlider();
  return new Combo(newDriver, newBody, newTire, newGlider);
}

function listCombos(opts = {}) {
  const refCombo = opts.refCombo ?? undefined;
  const mustDiffer = opts.mustDiffer ?? false;
  const maxAbsDiff = opts.maxAbsDiff ?? Infinity;
  const minDiff = opts.minDiff ?? -Infinity;
  const maxDiff = opts.maxDiff ?? Infinity;
  const driverLock = opts.driverLock ?? false;
  const bodyLock   = opts.bodyLock   ?? false;
  const tireLock   = opts.tireLock   ?? false;
  const gliderLock = opts.gliderLock ?? false;
  const mtbMin   = opts.min?.[0]  ?? 0; const mtbMax   = opts.max?.[0]  ?? 20;
  const spdGrMin = opts.min?.[1]  ?? 0; const spdGrMax = opts.max?.[1]  ?? 20;
  const spdWtMin = opts.min?.[2]  ?? 0; const spdWtMax = opts.max?.[2]  ?? 20;
  const spdArMin = opts.min?.[3]  ?? 0; const spdArMax = opts.max?.[3]  ?? 20;
  const accMin   = opts.min?.[4]  ?? 0; const accMax   = opts.max?.[4]  ?? 20;
  const wgtMin   = opts.min?.[5]  ?? 0; const wgtMax   = opts.max?.[5]  ?? 20;
  const hndGrMin = opts.min?.[6]  ?? 0; const hndGrMax = opts.max?.[6]  ?? 20;
  const hndWtMin = opts.min?.[7]  ?? 0; const hndWtMax = opts.max?.[7]  ?? 20;
  const hndArMin = opts.min?.[8]  ?? 0; const hndArMax = opts.max?.[8]  ?? 20;
  const offMin   = opts.min?.[9]  ?? 0; const offMax   = opts.max?.[9]  ?? 20;
  const stbMin   = opts.min?.[10] ?? 0; const stbMax   = opts.max?.[10] ?? 20;
  const dftMin   = opts.min?.[11] ?? 0; const dftMax   = opts.max?.[11] ?? 20;
  const sizeMin  = opts.min?.[12] ?? 0; const sizeMax  = opts.max?.[12] ?? 2;
  const spdMin   = opts.min?.[13] ?? 0; const spdMax   = opts.max?.[13] ?? 20;
  const hndMin   = opts.min?.[14] ?? 0; const hndMax   = opts.max?.[14] ?? 20;
  const sortBy = opts.sortBy ?? "diff";
  const factors = opts.factors ?? [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  const limit = opts.limit ?? 51;

  // IDEA: If this is still too slow, I should try to calculate partial diffs
  //       and scores to eliminate whole classes in droves.
  const list = [];
  for (let driver of driverClasses) {
    if (driverLock && driver !== refCombo.parts.driver.class) continue;
    if (classes.drivers[driver][statIndex.size] < sizeMin || classes.drivers[driver][statIndex.size] > sizeMax) continue;
  for (let body of bodyClasses) {
    if (bodyLock && body !== refCombo.parts.body.class) continue;
  for (let tire of tireClasses) {
    if (tireLock && tire !== refCombo.parts.tire.class) continue;
  for (let glider of gliderClasses) {
    if (gliderLock && glider !== refCombo.parts.glider.class) continue;

    // Auto variants
    if (refCombo.parts.driver.class === driver) driver = refCombo.driverID;
    if (refCombo.parts.body.class   === body)     body = refCombo.bodyID;
    if (refCombo.parts.tire.class   === tire)     tire = refCombo.tireID;
    if (refCombo.parts.glider.class === glider) glider = refCombo.gliderID;
    const combo = new Combo(driver, body, tire, glider);

    // Stat Checks
    if (combo.lvl[0]  < mtbMin   || combo.lvl[0]  > mtbMax) continue;
    if (combo.lvl[1]  < spdGrMin || combo.lvl[1]  > spdGrMax) continue;
    if (combo.lvl[2]  < spdWtMin || combo.lvl[2]  > spdWtMax) continue;
    if (combo.lvl[3]  < spdArMin || combo.lvl[3]  > spdArMax) continue;
    if (combo.lvl[4]  < accMin   || combo.lvl[4]  > accMax) continue;
    if (combo.lvl[5]  < wgtMin   || combo.lvl[5]  > wgtMax) continue;
    if (combo.lvl[6]  < hndGrMin || combo.lvl[6]  > hndGrMax) continue;
    if (combo.lvl[7]  < hndWtMin || combo.lvl[7]  > hndWtMax) continue;
    if (combo.lvl[8]  < hndArMin || combo.lvl[8]  > hndArMax) continue;
    if (combo.lvl[9]  < offMin   || combo.lvl[9]  > offMax) continue;
    if (combo.lvl[10] < stbMin   || combo.lvl[10] > stbMax) continue;
    if (combo.lvl[11] < dftMin   || combo.lvl[11] > dftMax) continue;
    if (combo.lvl[13] < spdMin   || combo.lvl[13] > spdMax) continue;
    if (combo.lvl[14] < hndMin   || combo.lvl[14] > hndMax) continue;

    // Difference Checks
    const diffs = [
      combo.lvl[0]  - refCombo.lvl[0],  // mtb
      combo.lvl[1]  - refCombo.lvl[1],  // spdGr
      combo.lvl[2]  - refCombo.lvl[2],  // spdWt
      combo.lvl[3]  - refCombo.lvl[3],  // spdAr
      combo.lvl[4]  - refCombo.lvl[4],  // acc
      combo.lvl[5]  - refCombo.lvl[5],  // wgt
      combo.lvl[6]  - refCombo.lvl[6],  // hndGr
      combo.lvl[7]  - refCombo.lvl[7],  // hndWt
      combo.lvl[8]  - refCombo.lvl[8],  // hndAr
      combo.lvl[9]  - refCombo.lvl[9],  // off
      combo.lvl[10] - refCombo.lvl[10], // stb
      combo.lvl[11] - refCombo.lvl[11]  // dft
    ];

    const diffSum = diffs.reduce((s, a) => s + a, 0); // sum
    if (diffSum > maxDiff || diffSum < minDiff) continue;

    const diffSumAbs = Math.abs(diffs[0])
                     + Math.abs(diffs[1]) + Math.abs(diffs[2])
                     + Math.abs(diffs[3]) + Math.abs(diffs[4])
                     + Math.abs(diffs[5]) + Math.abs(diffs[6])
                     + Math.abs(diffs[7]) + Math.abs(diffs[8])
                     + Math.abs(diffs[9]) + Math.abs(diffs[10])
                     + Math.abs(diffs[11]);
    if (diffSumAbs > maxAbsDiff) continue;
    if (mustDiffer && diffSumAbs === 0) continue;

    combo.diffs = diffs;
    combo.diffSum = diffSum;
    combo.diffSumAbs = diffSumAbs;

    list.push(combo);
  } } } }

  // Sort
  let compare = (a, b) => b.lvl[statIndex[sortBy]] - a.lvl[statIndex[sortBy]];
  switch (sortBy) {
    case "diff":
      compare = (a, b) => b.diffSum - a.diffSum;
      break;
    case "similar":
      compare = (a, b) => a.diffSumAbs - b.diffSumAbs;
      break;
    case "score":
      compare = (a, b) => getScore(b.lvl, factors) - getScore(a.lvl, factors);
  }

  list.sort(compare);

  return { length: list.length,
           combos: list.slice(0, limit) };
}

function getScore(lvl, factors) {
  let score = 0;
  for (let i = 0; i < 15; i++) {
    score += factors[i] * lvl[i];
  }
  return score;
}

function getAvailableParts(set) {
  return {
    drivers: [
      parts.drivers.mario,
      parts.drivers.luigi,
      parts.drivers.peach,
      parts.drivers.yoshi,
      parts.drivers.bowser,
      parts.drivers.dk,
      parts.drivers.toad,
      parts.drivers.koopa,
      parts.drivers.daisy,
      parts.drivers.wario,
      parts.drivers.rosalina,
      parts.drivers.marioMetal,
      parts.drivers.shyguy,
      parts.drivers.bee,
      parts.drivers.wiggler,
      parts.drivers.lakitu,
      parts.drivers.mii
    ],
    bodies: [
      {
        id: "kart",
        folder: [
          parts.bodies.std,
          parts.bodies.gold,
          parts.bodies.bd,
          parts.bodies.bee,
          parts.bodies.bruise,
          parts.bodies.soda,
          parts.bodies.dasher,
          parts.bodies.egg,
          parts.bodies.train,
          parts.bodies.tug,
          parts.bodies.cactx,
          parts.bodies.koopa,
          parts.bodies.cloud,
          parts.bodies.zucc,
          parts.bodies.blue,
          parts.bodies.bolt,
          parts.bodies.pipe ]
      }
    ],
    tires: [
      parts.tires.std,
      parts.tires.gold,
      parts.tires.roller,
      parts.tires.slim,
      parts.tires.slick,
      parts.tires.sponge,
      parts.tires.mushroom,
      parts.tires.wood,
      parts.tires.monsterRed,
      parts.tires.monster ],
    gliders: [
      parts.gliders.super,
      parts.gliders.gold,
      parts.gliders.parasol,
      parts.gliders.flower,
      parts.gliders.beast,
      parts.gliders.swoop,
      parts.gliders.parafoil ]
  };
}

function setTerrainRatios(gr, wt, ar) {
  if (gr+wt+ar !== 1) throw "Error: Terrain ratios do not add up to 1";
  Combo.PERCENT_GR = gr;
  Combo.PERCENT_WT = wt;
  Combo.PERCENT_AR = ar;
}

const classes = {
  drivers: {
    mario:      [2,2,1,0,4,4,1,1,1,1,1,4,1],
    peach:      [2,1,2,0,6,2,2,2,2,1,1,4,1],
    bowser:     [1,4,0,0,0,8,0,0,0,0,1,0,2],
    toad:       [3,0,2,0,8,0,2,2,2,2,1,8,0],
    dk:         [1,3,0,0,2,6,0,0,0,1,1,0,2],
    marioMetal: [1,4,0,0,0,8,0,0,0,0,1,0,1]
  },
  bodies: {
    std:    [2,6, 4,2,3,2,3,1,1,2,0,2],
    gold:   [2,7, 4,1,2,3,3,1,1,1,0,1],
    bd:     [4,4, 6,4,5,1,5,2,2,1,0,3],
    bee:    [8,6, 4,4,5,1,1,1,2,3,0,3],
    bruise: [2,8, 2,1,2,3,1,1,1,2,0,1],
    soda:   [4,7, 2,4,4,1,3,1,2,1,0,3],
    dasher: [2,8, 2,2,1,2,4,1,1,1,0,2],
    egg:    [4,5,10,4,5,1,3,1,1,2,0,3],
    train:  [8,7, 1,1,3,3,1,1,1,2,0,1],
    tug:    [0,4,10,1,3,3,3,3,1,3,0,1],
    cactx:  [0,5, 6,1,2,2,4,1,1,3,0,2],
    koopa:  [8,6, 4,2,2,2,5,2,2,1,0,2],
    cloud:  [4,4, 8,4,4,1,5,3,2,2,0,3],
    zucc:   [0,8, 2,1,2,2,2,1,1,2,0,2],
    blue:   [0,8, 4,1,1,3,2,1,1,2,0,1],
    bolt:   [0,7, 2,1,1,3,2,1,1,3,0,1],
    pipe:   [4,5, 8,4,4,1,3,1,1,3,0,3]
  },
  tires: {
    std:        [4,4,4,0,3,4, 5, 5,4,10,4,4],
    gold:       [4,8,0,0,1,6, 0, 5,0, 0,4,0],
    roller:     [8,1,8,4,6,0,13,10,8, 5,8,0],
    slim:       [0,3,4,0,4,3,10,10,4, 5,8,8],
    slick:      [4,8,0,0,2,5, 0, 0,4, 0,4,8],
    sponge:     [4,3,0,4,5,1, 5, 0,8,10,4,8],
    mushroom:   [4,5,4,0,2,2,10, 5,4, 5,4,0],
    wood:       [0,2,8,4,5,2,10,15,8,10,8,8],
    monsterRed: [5,7,0,0,1,7, 0, 0,0,15,0,0],
    monster:    [4,7,0,0,0,8, 0, 0,0,15,0,4]
  },
  gliders: {
    super:   [0,0,0,12,0,1,0,0,0,0,0,1],
    parasol: [1,0,0, 0,1,0,0,0,8,0,0,0],
    swoop:   [1,0,0, 6,1,0,0,0,4,0,0,0]
  }
};
const driverClasses = Object.keys(classes.drivers);
const bodyClasses   = Object.keys(classes.bodies);
const tireClasses   = Object.keys(classes.tires);
const gliderClasses = Object.keys(classes.gliders);
const driverClassCount = driverClasses.length;
const bodyClassCount   = bodyClasses.length;
const tireClassCount   = tireClasses.length;
const gliderClassCount = gliderClasses.length;

const parts = {
  drivers: {
    mario: {
      class: "mario",
      group: "mario",
      code: "M" },
    luigi: {
      class: "mario",
      group: "mario",
      code: "L" },
    peach: {
      class: "peach",
      group: "peach",
      code: "P" },
    daisy: {
      class: "peach",
      group: "peach",
      code: "J" },
    rosalina: {
      class: "dk",
      group: "dk",
      code: "R" },
    yoshi: {
      class: "peach",
      group: "peach",
      code: "Y" },
    toad: {
      class: "toad",
      group: "toad",
      code: "T" },
    koopa: {
      class: "toad",
      group: "toad",
      code: "k" },
    shyguy: {
      class: "toad",
      group: "toad",
      code: "s" },
    lakitu: {
      class: "toad",
      group: "toad",
      code: "u" },
    marioMetal: {
      class: "marioMetal",
      group: "bowser",
      code: "G" },
    wario: {
      class: "bowser",
      group: "bowser",
      code: "W" },
    dk: {
      class: "dk",
      group: "dk",
      code: "D" },
    wiggler: {
      class: "dk",
      group: "dk",
      code: "H" },
    bowser: {
      class: "bowser",
      group: "bowser",
      code: "B" },
    mii: {
      class: "mario",
      group: "mario",
      code: "8" },
    bee: {
      class: "bowser",
      group: "bowser",
      code: "h" }
  },
  bodies: {
    std: {
      class: "std",
      group: "std",
      code: "A" },
    bd: {
      class: "bd",
      group: "bd",
      code: "d" },
    bolt: {
      class: "bolt",
      group: "bolt",
      code: "p" },
    bee: {
      class: "bee",
      group: "bee",
      code: "V" },
    bruise: {
      class: "bruise",
      group: "bruise",
      code: "B" },
    soda: {
      class: "soda",
      group: "soda",
      code: "S" },
    dasher: {
      class: "dasher",
      group: "dasher",
      code: "b" },
    egg: {
      class: "egg",
      group: "egg",
      code: "Y" },
    train: {
      class: "train",
      group: "train",
      code: "T" },
    tug: {
      class: "tug",
      group: "tug",
      code: "t" },
    cactx: {
      class: "cactx",
      group: "cactx",
      code: "X" },
    koopa: {
      class: "koopa",
      group: "koopa",
      code: "K" },
    cloud: {
      class: "cloud",
      group: "cloud",
      code: "9" },
    zucc: {
      class: "zucc",
      group: "zucc",
      code: "Z" },
    blue: {
      class: "blue",
      group: "blue",
      code: "7" },
    pipe: {
      class: "pipe",
      group: "pipe",
      code: "P" },
    gold: {
      class: "gold",
      group: "gold",
      code: "G" }
  },
  tires: {
    std: {
      class: "std",
      group: "std",
      code: "A" },
    roller: {
      class: "roller",
      group: "roller",
      code: "R" },
    monster: {
      class: "monster",
      group: "monster",
      code: "M" },
    slim: {
      class: "slim",
      group: "slim",
      code: "S" },
    slick: {
      class: "slick",
      group: "slick",
      code: "K" },
    sponge: {
      class: "sponge",
      group: "sponge",
      code: "c" },
    mushroom: {
      class: "mushroom",
      group: "mushroom",
      code: "H" },
    wood: {
      class: "wood",
      group: "wood",
      code: "W" },
    monsterRed: {
      class: "monsterRed",
      group: "monsterRed",
      code: "m" },
    gold: {
      class: "gold",
      group: "gold",
      code: "G" }
  },
  gliders: {
    super: {
      class: "super",
      group: "super",
      code: "A" },
    parafoil: {
      class: "swoop",
      group: "swoop",
      code: "f" },
    parasol: {
      class: "parasol",
      group: "parasol",
      code: "s" },
    flower: {
      class: "parasol",
      group: "parasol",
      code: "F" },
    swoop: {
      class: "swoop",
      group: "swoop",
      code: "S" },
    gold: {
      class: "super",
      group: "super",
      code: "G" },
    beast: {
      class: "super",
      group: "super",
      code: "B" }
  }
};
const driverParts = Object.keys(parts.drivers);
const bodyParts   = Object.keys(parts.bodies);
const tireParts   = Object.keys(parts.tires);
const gliderParts = Object.keys(parts.gliders);
const driverPartCount = driverParts.length;
const bodyPartCount   = bodyParts.length;
const tirePartCount   = tireParts.length;
const gliderPartCount = gliderParts.length;
for (const id of driverParts) { parts.drivers[id].id = id; }
for (const id of bodyParts) { parts.bodies[id].id = id; }
for (const id of tireParts) { parts.tires[id].id = id; }
for (const id of gliderParts) { parts.gliders[id].id = id; }

const driverCodes = {};
for (const driver of driverParts) {
  driverCodes[parts.drivers[driver].code] = driver;
}
const bodyCodes = {};
for (const body of bodyParts) {
  bodyCodes[parts.bodies[body].code] = body;
}
const tireCodes = {};
for (const tire of tireParts) {
  tireCodes[parts.tires[tire].code] = tire;
}
const gliderCodes = {};
for (const glider of gliderParts) {
  gliderCodes[parts.gliders[glider].code] = glider;
}

const bodyVariants = {
  std: {
    luigi: "luigi",
    peach: "peach",
    daisy: "daisy",
    rosalina: "rosalina",
    yoshi: "yoshi",
    toad: "toad",
    koopa: "koopa",
    shyguy: "shyguy",
    lakitu: "lakitu",
    marioMetal: "marioMetal",
    wario: "wario",
    dk: "dk",
    bowser: "bowser",
    wiggler: "wiggler",
    bee: "bee",
    mii: "mii"
  },
  bd: {
    daisy: "daisy",
    rosalina: "rosalina",
    bee: "bee"
  },
  pipe: {
    luigi: "luigi",
    peach: "peach",
    daisy: "daisy",
    rosalina: "rosalina",
    yoshi: "yoshi",
    toad: "toad",
    koopa: "koopa",
    shyguy: "shyguy",
    lakitu: "lakitu",
    marioMetal: "marioMetal",
    wario: "wario",
    dk: "dk",
    bowser: "bowser",
    wiggler: "wiggler",
    bee: "bee",
    mii: "mii"
  }
};
function getBodyVariant(body, driver) {
  const variant = bodyVariants[body]?.[driver];
  if (variant !== undefined) return "-" + variant;
  return "";
}

const gliderVariants = {
  super: {
    luigi: "luigi",
    peach: "peach",
    yoshi: "yoshi",
    daisy: "daisy",
    rosalina: "rosalina",
    toad: "toad",
    koopa: "koopa",
    shyguy: "shyguy",
    lakitu: "lakitu",
    marioMetal: "marioMetal",
    wario: "wario",
    dk: "dk",
    bowser: "bowser",
    wiggler: "wiggler",
    bee: "bee",
    mii: "mii"
  },
  parasol: {
    daisy: "daisy",
    rosalina: "rosalina",
    bee: "bee"
  }
};
function getGliderVariant(glider, driver) {
  const variant = gliderVariants[glider]?.[driver];
  if (variant !== undefined) return "-" + variant;
  return "";
}

const partMorphemes = {
  drivers: {
    mario: { or: "Mario" },
    luigi: { or: "Luigi" },
    peach: { or: "Peach" },
    daisy: { or: "Daisy" },
    rosalina: { or: "Rosalina" },
    yoshi: { or: "Yoshi" },
    toad: { or: "Toad" },
    koopa: { or: "Koopa" },
    shyguy: { pre: "Shy", post: "Guy", full: "Shy Guy" },
    lakitu: { or: "Lakitu" },
    marioMetal: { or: "Metal", full: "Metal Mario" },
    wario: { pre: "Wario" },
    wiggler: { or: "Wiggler" },
    dk: { pre: "DK" },
    bowser: { or: "Bowser" },
    bee: { pre: "Honey", post: "Queen" },
    mii: { or: "Mii" }
  },
  bodies: {
    std: { full: "Kart" },
    bd: { pre: "Birthday", post: "Girl" },
    bolt: { post: "Bolt" },
    bee: { or: "Bumble" },
    bruise: { or: "Bruiser" },
    soda: { or: "Soda" },
    dasher: { post: "-Dasher", pre: "Dasher" },
    egg: { or: "Egg" },
    train: { or: "Train" },
    tug: { or: "Tug" },
    cactx: { post: "-X", full: "Cact-X" },
    koopa: { post: "Clown" },
    cloud: { or: "Cloud" },
    zucc: { or: "Zucchini" },
    blue: { post: "Seven" },
    pipe: { or: "Pipe" },
    gold: { or: "Gold" }
  }
};
function getComboName(driver, body, tire, glider) {
  let driverMorphs = partMorphemes.drivers[driver];
  if (!driverMorphs) driverMorphs = partMorphemes.drivers[driver.replaceAll(/\d$/g, "")];
  const bodyMorphs = partMorphemes.bodies[body];

  // Special Cases
  if (driver === "mario" && body === "std" &&
      tire === "std" && glider === "super") return "The Standard";
  if (body === "gold" && tire === "gold" && glider === "gold") return "24 Carat Gold";
  if (driver === "bee" && body === "bee") return "Bumble Bee";
  if (driver === "lakitu" && body === "cloud") return "Camera Koopa";
  if (driver === "dk" && body === "train") return "Bodacious Jumbo Barrel";
  if (driver === "koopa" && body === "tug") return "Koopa Thug";
  if (driver === "bowser" && body === "koopa") return "King Koopa";
  if (driver.isAny("peach", "daisy", "rosalina", "bee") && body === "bd" && glider === "parasol") return "Birthday Princess";

  // Generative
  if (Object.keys(bodyMorphs)[0] === "full") {
    if (driverMorphs.full) return fuse(driverMorphs.full, bodyMorphs.full);
    if (driverMorphs.pre) return fuse(driverMorphs.pre, bodyMorphs.full);
    if (driverMorphs.or) return fuse(driverMorphs.or, bodyMorphs.full);
  }
  if (!driverMorphs.pre || !driverMorphs.post) {
    for (const form of Object.keys(driverMorphs)) {
      switch (form) {
        case "pre":
          if (bodyMorphs.post) return fuse(driverMorphs.pre, bodyMorphs.post);
          if (bodyMorphs.or) return fuse(driverMorphs.pre, bodyMorphs.or);
          break;
        case "post":
          if (bodyMorphs.pre) return fuse(bodyMorphs.pre, driverMorphs.post);
          if (bodyMorphs.or) return fuse(bodyMorphs.or, driverMorphs.post);
          break;
      }
    }
  }
  for (const bodyForm of Object.keys(bodyMorphs)) {
    switch (bodyForm) {
      case "pre":
        if (driverMorphs.post) return fuse(bodyMorphs.pre, driverMorphs.post);
        if (driverMorphs.or) return fuse(bodyMorphs.pre, driverMorphs.or);
      case "post":
        if (driverMorphs.pre) return fuse(driverMorphs.pre, bodyMorphs.post);
        if (driverMorphs.or) return fuse(driverMorphs.or, bodyMorphs.post);
      case "or":
        if (driverMorphs.pre) return fuse(driverMorphs.pre, bodyMorphs.or);
        if (driverMorphs.post) return fuse(bodyMorphs.or, driverMorphs.post);
        if (driverMorphs.or) return fuse(driverMorphs.or, bodyMorphs.or);
    }
  }
  throw [driver, body];
}
function fuse(fst, snd) {
  const fstDashed = fst.endsWith("-");
  const sndDashed = snd.startsWith("-");
  if (fstDashed !== sndDashed) return fst + snd; // XOR
  if (fstDashed && sndDashed) return fst + snd.substring(1);
  return fst + " " + snd;
}
String.prototype.isAny = function(...patterns) {
  for (const pattern of patterns) {
    if (this === pattern) return true;
  }
  return false;
};

function randomInt(a, b) {
  if (b === undefined) {
    b = a;
    a = 0;
  }
  return Math.floor(Math.random() * (b - a) + a);
}

// Round n to p decimal digits.
const round = (n, p = 3) => Math.round(n * 10**p) / 10**p;
