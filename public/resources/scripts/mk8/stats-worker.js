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
  mtb: 0, spdGr: 1, spdAg: 2, spdWt: 3, spdAr: 4,  acc: 5,
  wgt: 6, hndGr: 7, hndAg: 8, hndWt: 9, hndAr: 10, trn: 11,
  size: 12, spd: 13, hnd: 14
};
const stats = [ "mtb", "spdGr", "spdAg", "spdWt", "spdAr", "acc",
                "wgt", "hndGr", "hndAg", "hndWt", "hndAr", "trn",
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
  lvl = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
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

    for (let stat = 0; stat < 12; stat++) {
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
                                  + this.lvl[statIndex.spdAg] * Combo.PERCENT_AG
                                  + this.lvl[statIndex.spdWt] * Combo.PERCENT_WT
                                  + this.lvl[statIndex.spdAr] * Combo.PERCENT_AR, 3);
    this.lvl[statIndex.hnd] = round(this.lvl[statIndex.hndGr] * Combo.PERCENT_GR
                                  + this.lvl[statIndex.hndAg] * Combo.PERCENT_AG
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

  // Data from Dospe [docs.google.com/spreadsheets/d/1Z41bvL2DTH6neOD41w6L0_eZwTxZMA3w4KJNzBEKzs8]
  static PERCENT_GR = .63; // Estimated percent of time on ground.
  static PERCENT_AG = .28; // Estimated percent of time in anti-gravity.
  static PERCENT_WT = .04; // Estimated percent of time underwater.
  static PERCENT_AR = .05; // Estimated percent of time airborne.
}

function getCombo(...args) {
  if (args.length === 1) { // From code
    return Combo.fromCode(args[0]);
  } else if (args.length === 4) { // From part IDs
    return new Combo(...args);
  }
  return "Error: Invalid arguments for getCombo: “" + args + "”";
}

function getRandomDriver() {
  const drivers = [
    "mario",
    "luigi",
    "peach",
    "daisy",
    "rosalina",
    "marioTan",
    "peachCat",
    [ "yoshi", "yoshi1", "yoshi2", "yoshi3", "yoshi4", "yoshi5", "yoshi6", "yoshi7", "yoshi8" ],
    "toad",
    "koopa",
    [ "shyguy", "shyguy1", "shyguy2", "shyguy3", "shyguy4", "shyguy5", "shyguy6", "shyguy7", "shyguy8" ],
    "lakitu",
    "toadette",
    "marioBb",
    "luigiBb",
    "peachBb",
    "daisyBb",
    "rosalinaBb",
    "marioMetal",
    "peachGold",
    "wario",
    "waluigi",
    "dk",
    "bowser",
    "bowserDry",
    "lemmy",
    "larry",
    "wendy",
    "ludwig",
    "iggy",
    "roy",
    "morton",
    "villagerM",
    "villagerF",
    "isabelle",
    "link",
    [ "miiS", "miiM", "miiL" ]
  ];
  const randomDriver = drivers[randomInt(drivers.length)];
  if (Array.isArray(randomDriver)) {
    return randomDriver[randomInt(randomDriver.length)]; // Random variant
  }
  return randomDriver;
}
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
  const spdAgMin = opts.min?.[2]  ?? 0; const spdAgMax = opts.max?.[2]  ?? 20;
  const spdWtMin = opts.min?.[3]  ?? 0; const spdWtMax = opts.max?.[3]  ?? 20;
  const spdArMin = opts.min?.[4]  ?? 0; const spdArMax = opts.max?.[4]  ?? 20;
  const accMin   = opts.min?.[5]  ?? 0; const accMax   = opts.max?.[5]  ?? 20;
  const wgtMin   = opts.min?.[6]  ?? 0; const wgtMax   = opts.max?.[6]  ?? 20;
  const hndGrMin = opts.min?.[7]  ?? 0; const hndGrMax = opts.max?.[7]  ?? 20;
  const hndAgMin = opts.min?.[8]  ?? 0; const hndAgMax = opts.max?.[8]  ?? 20;
  const hndWtMin = opts.min?.[9]  ?? 0; const hndWtMax = opts.max?.[9]  ?? 20;
  const hndArMin = opts.min?.[10] ?? 0; const hndArMax = opts.max?.[10] ?? 20;
  const trnMin   = opts.min?.[11] ?? 0; const trnMax   = opts.max?.[11] ?? 20;
  const sizeMin  = opts.min?.[12] ?? 0; const sizeMax  = opts.max?.[12] ?? 2;
  const spdMin   = opts.min?.[13] ?? 0; const spdMax   = opts.max?.[13] ?? 20;
  const hndMin   = opts.min?.[14] ?? 0; const hndMax   = opts.max?.[14] ?? 20;
  const excludeKarts      = opts.excludeKarts      ?? false;
  const excludeATVs       = opts.excludeATVs       ?? false;
  const excludeBikes      = opts.excludeBikes      ?? false;
  const excludeSportBikes = opts.excludeSportBikes ?? false;
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
    if (excludeKarts      && parts.bodies[body].type === "kart") continue;
    if (excludeATVs       && parts.bodies[body].type === "atv") continue;
    if (excludeBikes      && parts.bodies[body].type === "bike") continue;
    if (excludeSportBikes && parts.bodies[body].type === "sport") continue;
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
    if (combo.lvl[2]  < spdAgMin || combo.lvl[2]  > spdAgMax) continue;
    if (combo.lvl[3]  < spdWtMin || combo.lvl[3]  > spdWtMax) continue;
    if (combo.lvl[4]  < spdArMin || combo.lvl[4]  > spdArMax) continue;
    if (combo.lvl[5]  < accMin   || combo.lvl[5]  > accMax) continue;
    if (combo.lvl[6]  < wgtMin   || combo.lvl[6]  > wgtMax) continue;
    if (combo.lvl[7]  < hndGrMin || combo.lvl[7]  > hndGrMax) continue;
    if (combo.lvl[8]  < hndAgMin || combo.lvl[8]  > hndAgMax) continue;
    if (combo.lvl[9]  < hndWtMin || combo.lvl[9]  > hndWtMax) continue;
    if (combo.lvl[10] < hndArMin || combo.lvl[10] > hndArMax) continue;
    if (combo.lvl[11] < trnMin   || combo.lvl[11] > trnMax) continue;
    if (combo.lvl[13] < spdMin   || combo.lvl[13] > spdMax) continue;
    if (combo.lvl[14] < hndMin   || combo.lvl[14] > hndMax) continue;

    // Difference Checks
    const diffs = [
      combo.lvl[0]  - refCombo.lvl[0],  // mtb
      combo.lvl[1]  - refCombo.lvl[1],  // spdGr
      combo.lvl[2]  - refCombo.lvl[2],  // spdAg
      combo.lvl[3]  - refCombo.lvl[3],  // spdWt
      combo.lvl[4]  - refCombo.lvl[4],  // spdAr
      combo.lvl[5]  - refCombo.lvl[5],  // acc
      combo.lvl[6]  - refCombo.lvl[6],  // wgt
      combo.lvl[7]  - refCombo.lvl[7],  // hndGr
      combo.lvl[8]  - refCombo.lvl[8],  // hndAg
      combo.lvl[9]  - refCombo.lvl[9],  // hndWt
      combo.lvl[10] - refCombo.lvl[10], // hndAr
      combo.lvl[11] - refCombo.lvl[11] // trn
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
      parts.drivers.daisy,
      parts.drivers.rosalina,
      parts.drivers.marioMetal,
      {
        id: "yoshi",
        folder: [
          parts.drivers.yoshi,
          parts.drivers.yoshi1,
          parts.drivers.yoshi2,
          parts.drivers.yoshi3,
          parts.drivers.yoshi4,
          parts.drivers.yoshi5,
          parts.drivers.yoshi6,
          parts.drivers.yoshi7,
          parts.drivers.yoshi8 ]
      },
      parts.drivers.toad,
      parts.drivers.koopa,
      {
        id: "shyguy",
        folder: [
          parts.drivers.shyguy,
          parts.drivers.shyguy1,
          parts.drivers.shyguy2,
          parts.drivers.shyguy3,
          parts.drivers.shyguy4,
          parts.drivers.shyguy5,
          parts.drivers.shyguy6,
          parts.drivers.shyguy7,
          parts.drivers.shyguy8 ]
      },
      parts.drivers.lakitu,
      parts.drivers.toadette,
      parts.drivers.marioBb,
      parts.drivers.luigiBb,
      parts.drivers.peachBb,
      parts.drivers.daisyBb,
      parts.drivers.rosalinaBb,
      parts.drivers.peachGold,
      parts.drivers.bowser,
      parts.drivers.dk,
      parts.drivers.wario,
      parts.drivers.waluigi,
      parts.drivers.iggy,
      parts.drivers.roy,
      parts.drivers.lemmy,
      parts.drivers.larry,
      parts.drivers.wendy,
      parts.drivers.ludwig,
      parts.drivers.morton,
      {
        id: "mii",
        folder: [
          parts.drivers.miiS,
          parts.drivers.miiM,
          parts.drivers.miiL ]
      },
      parts.drivers.marioTan,
      parts.drivers.peachCat,
      parts.drivers.link,
      {
        id: "villager",
        folder: [
          parts.drivers.villagerM,
          parts.drivers.villagerF ]
      },
      parts.drivers.isabelle,
      parts.drivers.bowserDry
    ],
    bodies: [
      {
        id: "kart",
        folder: [
          parts.bodies.std,
          parts.bodies.pipe,
          parts.bodies.mach,
          parts.bodies.steel,
          parts.bodies.cat,
          parts.bodies.circuit,
          parts.bodies.trispeed,
          parts.bodies.wagon,
          parts.bodies.prancer,
          parts.bodies.biddy,
          parts.bodies.landship,
          parts.bodies.sneeker,
          parts.bodies.coupe,
          parts.bodies.gold,
          parts.bodies.gla,
          parts.bodies.gla25,
          parts.bodies.gla300,
          parts.bodies.falcon,
          parts.bodies.tanooki,
          parts.bodies.dasher,
          parts.bodies.streetle,
          parts.bodies.pwing ]
      },
      {
        id: "atv",
        folder: [
          parts.bodies.atvStd,
          parts.bodies.wiggler,
          parts.bodies.teddy,
          parts.bodies.rattler ]
      },
      {
        id: "bike",
        folder: [
          parts.bodies.bikeStd,
          parts.bodies.duke,
          parts.bodies.flame,
          parts.bodies.varmint,
          parts.bodies.scooty,
          parts.bodies.city ]
      },
      {
        id: "sport",
        folder: [
          parts.bodies.bikeSport,
          parts.bodies.comet,
          parts.bodies.jet,
          parts.bodies.yoshi,
          parts.bodies.master ]
      }
    ],
    tires: [
      parts.tires.std,
      parts.tires.monster,
      parts.tires.roller,
      parts.tires.slim,
      parts.tires.slick,
      parts.tires.metal,
      parts.tires.button,
      parts.tires.offroad,
      parts.tires.sponge,
      parts.tires.wood,
      parts.tires.cushion,
      parts.tires.stdBlue,
      parts.tires.monsterHot,
      parts.tires.rollerBlue,
      parts.tires.slimRed,
      parts.tires.slickPurple,
      parts.tires.offroadRetro,
      parts.tires.gold,
      parts.tires.gla,
      parts.tires.triforce,
      parts.tires.leaf ],
    gliders: [
      parts.gliders.super,
      parts.gliders.cloud,
      parts.gliders.wario,
      parts.gliders.squirrel,
      parts.gliders.parasol,
      parts.gliders.parachute,
      parts.gliders.parafoil,
      parts.gliders.flower,
      parts.gliders.bowser,
      parts.gliders.plane,
      parts.gliders.parafoilTV,
      parts.gliders.gold,
      parts.gliders.hylian,
      parts.gliders.paper ]
  };
}

function setTerrainRatios(gr, ag, wt, ar) {
  if (gr+ag+wt+ar !== 1) throw "Error: Terrain ratios do not add up to 1";
  Combo.PERCENT_GR = gr;
  Combo.PERCENT_AG = ag;
  Combo.PERCENT_WT = wt;
  Combo.PERCENT_AR = ar;
}

const classes = {
  drivers: {
    marioBb:    [5,0, 0, 0, 0, 5,0, 10,10,10,10,5,0],
    toad:       [4,2, 2, 2, 2, 4,2, 8, 8, 8, 8, 4,0],
    peachCat:   [4,4, 4, 4, 4, 4,3, 6, 6, 6, 6, 3,1],
    peach:      [3,4, 4, 4, 4, 3,4, 6, 6, 6, 6, 3,1],
    marioTan:   [3,6, 6, 6, 6, 3,5, 4, 4, 4, 4, 2,1],
    mario:      [2,6, 6, 6, 6, 2,6, 4, 4, 4, 4, 2,1],
    marioMetal: [0,8, 8, 8, 8, 0,10,2, 2, 2, 2, 0,1],
    rosalina:   [1,8, 8, 8, 8, 1,8, 2, 2, 2, 2, 1,2],
    bowser:     [0,10,10,10,10,0,10,0, 0, 0, 0, 0,2]
  },
  bodies: {
    std:     [3,3,4,3,2,2,2,2,3,2,1,5],
    pipe:    [4,3,3,4,3,3,1,4,4,4,3,3],
    mach:    [1,5,5,4,4,1,3,2,2,2,1,1],
    steel:   [0,3,3,5,2,0,4,0,0,5,0,7],
    biddy:   [7,0,0,5,4,7,0,4,3,5,4,4],
    falcon:  [3,4,5,3,3,3,1,2,3,2,1,3],
    tanooki: [1,3,3,5,3,1,3,1,1,5,4,6],
    comet:   [5,3,3,3,2,5,1,5,5,5,4,0],
    master:  [3,4,3,5,4,2,2,4,5,4,4,2]
  },
  tires: {
    std:     [2,2,2,4,2,2,2,3,3,3,3,4],
    monster: [0,2,2,2,0,0,4,0,0,0,0,7],
    roller:  [6,0,0,4,4,6,0,4,4,4,4,3],
    slim:    [1,3,3,3,3,1,2,4,4,4,4,2],
    slick:   [1,4,4,0,4,1,3,3,3,3,3,0],
    metal:   [0,3,3,3,3,0,4,3,3,3,3,2],
    sponge:  [3,1,1,0,3,3,1,2,2,1,3,6]
  },
  gliders: {
    super: [1,1,1,1,2,1,2,1,1,1,1,1],
    cloud: [2,1,1,1,1,2,1,1,1,1,2,1],
    wario: [1,1,1,1,2,1,2,1,1,1,1,1]
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
      class: "rosalina",
      group: "rosalina",
      code: "R" },
    marioTan: {
      class: "marioTan",
      group: "marioTan",
      code: "N" },
    peachCat: {
      class: "peachCat",
      group: "peachCat",
      code: "C" },
    yoshi: {
      class: "peach",
      group: "peach",
      code: "Y" },
      yoshi1: {
        class: "peach",
        group: "peach",
        code: "Y1" },
      yoshi2: {
        class: "peach",
        group: "peach",
        code: "Y2" },
      yoshi3: {
        class: "peach",
        group: "peach",
        code: "Y3" },
      yoshi4: {
        class: "peach",
        group: "peach",
        code: "Y4" },
      yoshi5: {
        class: "peach",
        group: "peach",
        code: "Y5" },
      yoshi6: {
        class: "peach",
        group: "peach",
        code: "Y6" },
      yoshi7: {
        class: "peach",
        group: "peach",
        code: "Y7" },
      yoshi8: {
        class: "peach",
        group: "peach",
        code: "Y8" },
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
      shyguy1: {
        class: "toad",
        group: "toad",
        code: "s1" },
      shyguy2: {
        class: "toad",
        group: "toad",
        code: "s2" },
      shyguy3: {
        class: "toad",
        group: "toad",
        code: "s3" },
      shyguy4: {
        class: "toad",
        group: "toad",
        code: "s4" },
      shyguy5: {
        class: "toad",
        group: "toad",
        code: "s5" },
      shyguy6: {
        class: "toad",
        group: "toad",
        code: "s6" },
      shyguy7: {
        class: "toad",
        group: "toad",
        code: "s7" },
      shyguy8: {
        class: "toad",
        group: "toad",
        code: "s8" },
    lakitu: {
      class: "toad",
      group: "toad",
      code: "u" },
    toadette: {
      class: "toad",
      group: "toad",
      code: "t" },
    marioBb: {
      class: "marioBb",
      group: "marioBb",
      code: "m" },
    luigiBb: {
      class: "marioBb",
      group: "marioBb",
      code: "l" },
    peachBb: {
      class: "marioBb",
      group: "marioBb",
      code: "p" },
    daisyBb: {
      class: "marioBb",
      group: "marioBb",
      code: "j" },
    rosalinaBb: {
      class: "marioBb",
      group: "marioBb",
      code: "r" },
    marioMetal: {
      class: "marioMetal",
      group: "marioMetal",
      code: "G" },
    peachGold: {
      class: "marioMetal",
      group: "marioMetal",
      code: "a" },
    wario: {
      class: "bowser",
      group: "bowser",
      code: "W" },
    waluigi: {
      class: "rosalina",
      group: "rosalina",
      code: "w" },
    dk: {
      class: "rosalina",
      group: "rosalina",
      code: "D" },
    bowser: {
      class: "bowser",
      group: "bowser",
      code: "B" },
    bowserDry: {
      class: "bowser",
      group: "bowser",
      code: "X" },
    lemmy: {
      class: "marioBb",
      group: "marioBb",
      code: "0" },
    larry: {
      class: "toad",
      group: "toad",
      code: "1" },
    wendy: {
      class: "toad",
      group: "toad",
      code: "2" },
    ludwig: {
      class: "mario",
      group: "mario",
      code: "3" },
    iggy: {
      class: "mario",
      group: "mario",
      code: "4" },
    roy: {
      class: "rosalina",
      group: "rosalina",
      code: "5" },
    morton: {
      class: "bowser",
      group: "bowser",
      code: "6" },
    villagerM: {
      class: "marioTan",
      group: "marioTan",
      code: "V" },
    villagerF: {
      class: "peachCat",
      group: "peachCat",
      code: "v" },
    isabelle: {
      class: "toad",
      group: "toad",
      code: "e" },
    link: {
      class: "rosalina",
      group: "rosalina",
      code: "Z" },
    miiS: {
      class: "marioBb",
      group: "marioBb",
      code: "7" },
    miiM: {
      class: "mario",
      group: "mario",
      code: "8" },
    miiL: {
      class: "bowser",
      group: "bowser",
      code: "9" }
  },
  bodies: {
    std: {
      type: "kart",
      class: "std",
      group: "std",
      code: "A" },
    pipe: {
      type: "kart",
      class: "pipe",
      group: "pipe",
      code: "P" },
    mach: {
      type: "kart",
      class: "mach",
      group: "mach",
      code: "M" },
    steel: {
      type: "kart",
      class: "steel",
      group: "steel",
      code: "R" },
    cat: {
      type: "kart",
      class: "std",
      group: "std",
      code: "C" },
    circuit: {
      type: "kart",
      class: "mach",
      group: "mach",
      code: "e" },
    trispeed: {
      type: "kart",
      class: "steel",
      group: "steel",
      code: "Y" },
    wagon: {
      type: "kart",
      class: "steel",
      group: "steel",
      code: "w" },
    prancer: {
      type: "kart",
      class: "std",
      group: "std",
      code: "H" },
    biddy: {
      type: "kart",
      class: "biddy",
      group: "biddy",
      code: "B" },
    landship: {
      type: "kart",
      class: "biddy",
      group: "biddy",
      code: "L" },
    sneeker: {
      type: "kart",
      class: "std",
      group: "std",
      code: "U" },
    coupe: {
      type: "kart",
      class: "mach",
      group: "mach",
      code: "m" },
    gold: {
      type: "kart",
      class: "mach",
      group: "mach",
      code: "G" },
    bikeStd: {
      type: "bike",
      class: "pipe",
      group: "pipe",
      code: "E" },
    bikeSport: {
      type: "sport",
      class: "comet",
      group: "comet",
      code: "h" },
    comet: {
      type: "sport",
      class: "comet",
      group: "comet",
      code: "c" },
    duke: {
      type: "bike",
      class: "std",
      group: "std",
      code: "D" },
    flame: {
      type: "bike",
      class: "pipe",
      group: "pipe",
      code: "f" },
    varmint: {
      type: "bike",
      class: "pipe",
      group: "pipe",
      code: "V" },
    scooty: {
      type: "bike",
      class: "biddy",
      group: "biddy",
      code: "s" },
    jet: {
      type: "sport",
      class: "comet",
      group: "comet",
      code: "j" },
    yoshi: {
      type: "sport",
      class: "comet",
      group: "comet",
      code: "y" },
    atvStd: {
      type: "atv",
      class: "steel",
      group: "steel",
      code: "a" },
    wiggler: {
      type: "atv",
      class: "pipe",
      group: "pipe",
      code: "W" },
    teddy: {
      type: "atv",
      class: "std",
      group: "std",
      code: "T" },
    gla: {
      type: "kart",
      class: "steel",
      group: "steel",
      code: "g" },
    gla25: {
      type: "kart",
      class: "pipe",
      group: "pipe",
      code: "2" },
    gla300: {
      type: "kart",
      class: "std",
      group: "std",
      code: "3" },
    falcon: {
      type: "kart",
      class: "falcon",
      group: "falcon",
      code: "F" },
    tanooki: {
      type: "kart",
      class: "tanooki",
      group: "tanooki",
      code: "t" },
    dasher: {
      type: "kart",
      class: "mach",
      group: "mach",
      code: "b" },
    master: {
      type: "sport",
      class: "master",
      group: "master",
      code: "z" },
    streetle: {
      type: "kart",
      class: "falcon",
      group: "falcon",
      code: "S" },
    pwing: {
      type: "kart",
      class: "mach",
      group: "mach",
      code: "p" },
    city: {
      type: "bike",
      class: "pipe",
      group: "pipe",
      code: "v" },
    rattler: {
      type: "atv",
      class: "tanooki",
      group: "tanooki",
      code: "r" }
  },
  tires: {
    std: {
      class: "std",
      group: "std",
      code: "A" },
    monster: {
      class: "monster",
      group: "monster",
      code: "M" },
    roller: {
      class: "roller",
      group: "roller",
      code: "R" },
    slim: {
      class: "slim",
      group: "slim",
      code: "S" },
    slick: {
      class: "slick",
      group: "slick",
      code: "K" },
    metal: {
      class: "metal",
      group: "metal",
      code: "T" },
    button: {
      class: "roller",
      group: "roller",
      code: "B" },
    offroad: {
      class: "std",
      group: "std",
      code: "O" },
    sponge: {
      class: "sponge",
      group: "sponge",
      code: "c" },
    wood: {
      class: "sponge",
      group: "sponge",
      code: "W" },
    cushion: {
      class: "sponge",
      group: "sponge",
      code: "C" },
    stdBlue: {
      class: "std",
      group: "std",
      code: "a" },
    monsterHot: {
      class: "monster",
      group: "monster",
      code: "m" },
    rollerBlue: {
      class: "roller",
      group: "roller",
      code: "r" },
    slimRed: {
      class: "slim",
      group: "slim",
      code: "s" },
    slickPurple: {
      class: "slick",
      group: "slick",
      code: "k" },
    offroadRetro: {
      class: "std",
      group: "std",
      code: "o" },
    gold: {
      class: "metal",
      group: "metal",
      code: "G" },
    gla: {
      class: "std",
      group: "std",
      code: "g" },
    triforce: {
      class: "slim",
      group: "slim",
      code: "z" },
    leaf: {
      class: "roller",
      group: "roller",
      code: "L" }
  },
  gliders: {
    super: {
      class: "super",
      group: "super",
      code: "A" },
    cloud: {
      class: "cloud",
      group: "cloud",
      code: "C" },
    wario: {
      class: "wario",
      group: "wario",
      code: "W" },
    squirrel: {
      class: "wario",
      group: "wario",
      code: "S" },
    parasol: {
      class: "cloud",
      group: "cloud",
      code: "s" },
    parachute: {
      class: "cloud",
      group: "cloud",
      code: "c" },
    parafoil: {
      class: "cloud",
      group: "cloud",
      code: "f" },
    flower: {
      class: "cloud",
      group: "cloud",
      code: "F" },
    bowser: {
      class: "cloud",
      group: "cloud",
      code: "B" },
    plane: {
      class: "wario",
      group: "wario",
      code: "w" },
    parafoilTV: {
      class: "cloud",
      group: "cloud",
      code: "T" },
    gold: {
      class: "wario",
      group: "wario",
      code: "G" },
    hylian: {
      class: "cloud",
      group: "cloud",
      code: "z" },
    paper: {
      class: "super",
      group: "super",
      code: "P" }
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
    luigi: "green",
    peach: "pink",
    daisy: "daisy",
    rosalina: "rosalina",
    marioTan: "marioTan",
    peachCat: "peachCat",
    yoshi: "yoshi",
      yoshi1: "lightblue",
      yoshi2: "black",
      yoshi4: "yellow",
      yoshi5: "white",
      yoshi6: "blue",
      yoshi7: "pink",
      yoshi8: "orange",
    toad: "toad",
    koopa: "koopa",
    shyguy: "shyguy",
      shyguy1: "lightblue",
      shyguy2: "black",
      shyguy3: "green",
      shyguy4: "yellow",
      shyguy5: "white",
      shyguy6: "blue",
      shyguy7: "pink",
      shyguy8: "orange",
    lakitu: "lightblue",
    toadette: "toadette",
    luigiBb: "green",
    peachBb: "pink",
    daisyBb: "daisy",
    rosalinaBb: "rosalina",
    marioMetal: "marioMetal",
    peachGold: "peachGold",
    wario: "wario",
    waluigi: "waluigi",
    dk: "dk",
    bowser: "bowser",
    bowserDry: "bowserDry",
    lemmy: "lemmy",
    larry: "larry",
    wendy: "wendy",
    ludwig: "ludwig",
    iggy: "iggy",
    roy: "roy",
    morton: "morton",
    villagerM: "villagerM",
    villagerF: "villagerF",
    isabelle: "isabelle",
    link: "link",
    miiS: "lightblue",
    miiM: "blue",
    miiL: "purple"
  },
  pipe: {
    luigi: "green",
    peach: "pink",
    daisy: "orange",
    rosalina: "lightblue",
    marioTan: "orange",
    peachCat: "pink",
    yoshi: "lightgreen",
      yoshi1: "lightblue",
      yoshi2: "black",
      yoshi4: "yellow",
      yoshi5: "white",
      yoshi6: "blue",
      yoshi7: "pink",
      yoshi8: "orange",
    toad: "blue",
    koopa: "yellow",
    shyguy: "black",
      shyguy1: "lightblue",
      shyguy2: "black",
      shyguy3: "green",
      shyguy4: "yellow",
      shyguy5: "white",
      shyguy6: "blue",
      shyguy7: "pink",
      shyguy8: "orange",
    lakitu: "lightblue",
    toadette: "pink",
    luigiBb: "green",
    peachBb: "pink",
    daisyBb: "orange",
    rosalinaBb: "lightblue",
    marioMetal: "marioMetal",
    peachGold: "peachGold",
    wario: "purple",
    waluigi: "waluigi",
    dk: "yellow",
    bowser: "bowser",
    bowserDry: "black",
    lemmy: "lemmy",
    larry: "larry",
    wendy: "wendy",
    ludwig: "ludwig",
    iggy: "iggy",
    roy: "roy",
    morton: "morton",
    villagerM: "bowser",
    villagerF: "pink",
    isabelle: "lightgreen",
    link: "blue",
    miiS: "lightblue",
    miiM: "blue",
    miiL: "purple"
  },
  circuit: {
    luigi: "green",
    peach: "orange",
    daisy: "orange",
    marioTan: "orange",
    peachCat: "orange",
    yoshi: "green",
      yoshi2: "black",
      yoshi4: "black",
      yoshi7: "orange",
      yoshi8: "orange",
    koopa: "green",
    shyguy: "black",
      shyguy2: "black",
      shyguy3: "green",
      shyguy4: "black",
      shyguy7: "orange",
      shyguy8: "orange",
    toadette: "orange",
    luigiBb: "green",
    peachBb: "orange",
    daisyBb: "orange",
    marioMetal: "black",
    peachGold: "orange",
    wario: "black",
    dk: "orange",
    bowser: "black",
    lemmy: "green",
    larry: "orange",
    wendy: "black",
    iggy: "green",
    roy: "black",
    morton: "black",
      villagerM1: "black",
      villagerM2: "green",
    villagerF: "orange",
      villagerF1: "green",
      villagerF2: "black",
    isabelle: "orange",
    pauline: "black",
    miiS: "orange",
    miiL: "black"
  },
  biddy: {
    luigi: "green",
    peach: "pink",
    daisy: "yellow",
    rosalina: "blue",
    peachCat: "pink",
    yoshi: "green",
      yoshi1: "blue",
      yoshi4: "yellow",
      yoshi5: "blue",
      yoshi6: "blue",
      yoshi7: "pink",
      yoshi8: "yellow",
    toad: "blue",
    koopa: "green",
      shyguy1: "blue",
      shyguy3: "green",
      shyguy4: "yellow",
      shyguy5: "blue",
      shyguy6: "blue",
      shyguy7: "pink",
      shyguy8: "yellow",
    lakitu: "blue",
    toadette: "pink",
    luigiBb: "green",
    peachBb: "pink",
    daisyBb: "yellow",
    rosalinaBb: "blue",
    peachGold: "pink",
    wario: "yellow",
    waluigi: "blue",
    bowser: "yellow",
    bowserDry: "yellow",
    lemmy: "blue",
    larry: "yellow",
    wendy: "pink",
    ludwig: "blue",
    iggy: "green",
    roy: "pink",
    villagerF: "pink",
    isabelle: "green",
    link: "green",
    miiS: "green",
    miiM: "blue"
  },
  landship: {
    lemmy: "lemmy",
    larry: "larry",
    wendy: "wendy",
    ludwig: "ludwig",
    iggy: "iggy",
    roy: "roy",
    morton: "morton"
  },
  sneeker: {
    peach: "pink",
    daisy: "yellow",
    rosalina: "pink",
    marioTan: "yellow",
    peachCat: "pink",
      yoshi1: "pink",
      yoshi2: "grey",
      yoshi4: "yellow",
      yoshi5: "pink",
      yoshi7: "pink",
      yoshi8: "grey",
    koopa: "yellow",
    shyguy: "grey",
      shyguy1: "pink",
      shyguy2: "grey",
      shyguy4: "yellow",
      shyguy5: "pink",
      shyguy7: "pink",
      shyguy8: "grey",
    toadette: "pink",
    peachBb: "pink",
    daisyBb: "yellow",
    rosalinaBb: "pink",
    marioMetal: "grey",
    peachGold: "pink",
    wario: "yellow",
    waluigi: "yellow",
    bowser: "grey",
    bowserDry: "grey",
    lemmy: "yellow",
    larry: "yellow",
    wendy: "pink",
    ludwig: "grey",
    iggy: "grey",
    roy: "yellow",
    morton: "grey",
    villagerF: "pink",
    isabelle: "pink",
    miiS: "pink",
    miiL: "yellow"
  },
  gla: {
    luigi: "blue",
    peach: "red",
    daisy: "red",
    rosalina: "grey",
    marioTan: "red",
    peachCat: "white",
    yoshi: "white",
      yoshi1: "lightblue",
      yoshi2: "black",
      yoshi3: "red",
      yoshi5: "white",
      yoshi6: "blue",
      yoshi7: "white",
      yoshi8: "red",
    toad: "blue",
    koopa: "lightblue",
    shyguy: "black",
      shyguy1: "lightblue",
      shyguy2: "black",
      shyguy3: "grey",
      shyguy5: "white",
      shyguy6: "blue",
      shyguy7: "white",
      shyguy8: "red",
    lakitu: "white",
    toadette: "white",
    luigiBb: "blue",
    peachBb: "red",
    daisyBb: "red",
    rosalinaBb: "grey",
    marioMetal: "grey",
    peachGold: "brown",
    wario: "purple",
    waluigi: "blue",
    dk: "brown",
    bowser: "black",
    lemmy: "brown",
    larry: "lightblue",
    wendy: "red",
    ludwig: "blue",
    roy: "purple",
    morton: "white",
    villagerM: "blue",
    villagerF: "white",
    isabelle: "white",
    link: "blue",
    miiS: "lightblue",
    miiM: "blue",
    miiL: "purple"
  },
  bikeStd: {
    luigi: "green",
    peach: "pink",
    daisy: "orange",
    rosalina: "rosalina",
    marioTan: "marioTan",
    peachCat: "peachCat",
    yoshi: "yoshi",
      yoshi1: "lightblue",
      yoshi2: "black",
      yoshi4: "yellow",
      yoshi5: "white",
      yoshi6: "blue",
      yoshi7: "pink",
      yoshi8: "orange",
    toad: "toad",
    koopa: "lightgreen",
    shyguy: "shyguy",
      shyguy1: "lightblue",
      shyguy2: "black",
      shyguy3: "green",
      shyguy4: "yellow",
      shyguy5: "white",
      shyguy6: "blue",
      shyguy7: "pink",
      shyguy8: "orange",
    lakitu: "lightblue",
    toadette: "toadette",
    luigiBb: "green",
    peachBb: "pink",
    daisyBb: "orange",
    rosalinaBb: "rosalina",
    marioMetal: "marioMetal",
    peachGold: "peachGold",
    wario: "yellow",
    waluigi: "waluigi",
    dk: "dk",
    bowser: "bowser",
    bowserDry: "bowserDry",
    lemmy: "lemmy",
    larry: "larry",
    wendy: "wendy",
    ludwig: "ludwig",
    iggy: "iggy",
    roy: "roy",
    morton: "morton",
    villagerM: "villagerM",
    villagerF: "villagerF",
    isabelle: "isabelle",
    link: "link",
    miiS: "lightblue",
    miiM: "blue",
    miiL: "purple"
  },
  city: {
    mario: "white",
    luigi: "green",
    peach: "pink",
    daisy: "orange",
    rosalina: "lightblue",
    marioTan: "red",
    peachCat: "brown",
      yoshi1: "lightblue",
      yoshi2: "black",
      yoshi3: "red",
      yoshi4: "yellow",
      yoshi5: "white",
      yoshi6: "blue",
      yoshi7: "pink",
      yoshi8: "orange",
    toad: "blue",
    koopa: "green",
    shyguy: "red",
      shyguy1: "lightblue",
      shyguy2: "black",
      shyguy3: "green",
      shyguy4: "yellow",
      shyguy5: "white",
      shyguy6: "blue",
      shyguy7: "pink",
      shyguy8: "orange",
    toadette: "pink",
    marioBb: "white",
    luigiBb: "green",
    peachBb: "pink",
    daisyBb: "orange",
    rosalinaBb: "lightblue",
    marioMetal: "black",
    peachGold: "brown",
    wario: "yellow",
    waluigi: "blue",
    dk: "red",
    bowser: "black",
    bowserDry: "black",
    kamek: "purple",
    lemmy: "yellow",
    larry: "lightblue",
    wendy: "purple",
    ludwig: "blue",
    iggy: "green",
    roy: "purple",
    morton: "black",
    villagerM: "red",
    villagerF: "pink",
    link: "blue",
    miiS: "lightblue",
    miiM: "blue",
    miiL: "purple"
  },
  bikeSport: {
    luigi: "green",
    peach: "orange",
    daisy: "orange",
    rosalina: "orange",
    marioTan: "orange",
    peachCat: "orange",
    yoshi: "green",
      yoshi4: "orange",
      yoshi5: "green",
      yoshi7: "orange",
      yoshi8: "orange",
    koopa: "green",
      shyguy3: "green",
      shyguy4: "orange",
      shyguy5: "green",
      shyguy7: "orange",
      shyguy8: "orange",
    lakitu: "green",
    toadette: "orange",
    luigiBb: "green",
    peachBb: "orange",
    daisyBb: "orange",
    rosalinaBb: "orange",
    peachGold: "orange",
    dk: "orange",
    lemmy: "green",
    wendy: "orange",
    ludwig: "green",
    iggy: "green",
    villagerM: "green",
    villagerF: "orange",
    isabelle: "green",
    miiS: "green",
    miiL: "orange"
  },
  atvStd: {
    luigi: "green",
    peach: "peach",
    daisy: "orange",
    rosalina: "rosalina",
    marioTan: "marioTan",
    peachCat: "peachCat",
    yoshi: "lightgreen",
      yoshi1: "lightblue",
      yoshi2: "black",
      yoshi4: "yellow",
      yoshi5: "white",
      yoshi6: "blue",
      yoshi7: "pink",
      yoshi8: "orange",
    toad: "blue",
    koopa: "koopa",
    shyguy: "black",
      shyguy1: "lightblue",
      shyguy2: "black",
      shyguy3: "green",
      shyguy4: "yellow",
      shyguy5: "white",
      shyguy6: "blue",
      shyguy7: "pink",
      shyguy8: "orange",
    lakitu: "lightblue",
    toadette: "pink",
    luigiBb: "green",
    peachBb: "peach",
    daisyBb: "orange",
    rosalinaBb: "rosalina",
    marioMetal: "marioMetal",
    peachGold: "peachGold",
    wario: "purple",
    waluigi: "waluigi",
    dk: "dk",
    bowser: "bowser",
    bowserDry: "bowserDry",
    lemmy: "lemmy",
    larry: "yellow",
    wendy: "wendy",
    ludwig: "ludwig",
    iggy: "iggy",
    roy: "roy",
    morton: "morton",
    villagerM: "villagerM",
    villagerF: "villagerF",
    isabelle: "isabelle",
    link: "link",
    miiS: "lightblue",
    miiM: "blue",
    miiL: "purple"
  }
};
function getBodyVariant(body, driver) {
  const variant = bodyVariants[body]?.[driver];
  if (variant !== undefined) return "-" + variant;
  return "";
}

const gliderVariants = {
  super: {
    luigi: "green",
    peach: "pink",
    daisy: "orange",
    rosalina: "rosalina",
    marioTan: "marioTan",
    peachCat: "peachCat",
    yoshi: "yoshi",
      yoshi1: "lightblue",
      yoshi2: "black",
      yoshi4: "yellow",
      yoshi5: "white",
      yoshi6: "blue",
      yoshi7: "pink",
      yoshi8: "orange",
    toad: "toad",
    koopa: "koopa",
    shyguy: "shyguy",
      shyguy1: "lightblue",
      shyguy2: "black",
      shyguy3: "green",
      shyguy4: "yellow",
      shyguy5: "white",
      shyguy6: "blue",
      shyguy7: "pink",
      shyguy8: "orange",
    lakitu: "lakitu",
    toadette: "toadette",
    luigiBb: "green",
    peachBb: "pink",
    daisyBb: "orange",
    rosalinaBb: "rosalina",
    marioMetal: "marioMetal",
    peachGold: "peachGold",
    wario: "wario",
    waluigi: "waluigi",
    dk: "dk",
    bowser: "bowser",
    bowserDry: "bowserDry",
    lemmy: "lemmy",
    larry: "larry",
    wendy: "wendy",
    ludwig: "ludwig",
    iggy: "iggy",
    roy: "roy",
    morton: "morton",
    villagerM: "villagerM",
    villagerF: "villagerF",
    isabelle: "isabelle",
    link: "link",
    miiS: "lightblue",
    miiM: "blue",
    miiL: "purple"
  },
  parasol: {
    daisy: "daisy",
    daisyBb: "daisy",
    rosalina: "rosalina",
    rosalinaBb: "rosalina"
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
    marioTan: { pre: "Tanooki" },
    peachCat: { pre: "Cat", full: "Cat Peach" },
    yoshi: { or: "Yoshi" },
    toad: { or: "Toad" },
    koopa: { or: "Koopa" },
    shyguy: { pre: "Shy", post: "Guy", full: "Shy Guy" },
    lakitu: { or: "Lakitu" },
    toadette: { or: "Toadette" },
    marioBb: { pre: "Baby" },
    luigiBb: { pre: "Baby" },
    peachBb: { pre: "Baby" },
    daisyBb: { pre: "Baby" },
    rosalinaBb: { pre: "Baby" },
    marioMetal: { or: "Metal", full: "Metal Mario" },
    peachGold: { pre: "Pink Gold", full: "Pink Gold Peach" },
    wario: { pre: "Wario" },
    waluigi: { pre: "Waluigi" },
    dk: { pre: "DK" },
    bowser: { or: "Bowser" },
    bowserDry: { pre: "Dry", full: "Dry Bowser" },
    lemmy: { or: "Lemmy" },
    larry: { or: "Larry" },
    wendy: { or: "Wendy" },
    ludwig: { or: "Ludwig" },
    iggy: { or: "Iggy" },
    roy: { or: "Roy" },
    morton: { or: "Morton" },
    villagerM: { or: "Villager" },
    villagerF: { or: "Villager" },
    isabelle: { or: "Isabelle" },
    link: { or: "Link" },
    miiS: { or: "Mii" },
    miiM: { or: "Mii" },
    miiL: { or: "Mii" }
  },
  bodies: {
    std: { full: "Kart" },
    pipe: { or: "Pipe" },
    mach: { pre: "Mach", post: "Mach" },
    steel: { pre: "Steel", post: "Driver" },
    cat: { post: "Cruiser", pre: "Cat" },
    circuit: { post: "Special", pre: "Circuit" },
    trispeed: { post: "Speeder", pre: "Tri" },
    wagon: { post: "Wagon", pre: "Bad" },
    prancer: { or: "Prancer" },
    biddy: { or: "Biddy" },
    landship: { or: "Landship" },
    sneeker: { or: "Sneeker" },
    coupe: { or: "Coupe" },
    gold: { or: "Gold" },
    bikeStd: { or: "Bike" },
    bikeSport: { or: "Sport Bike" },
    comet: { or: "Comet" },
    duke: { pre: "Duke", post: "Duke" },
    flame: { pre: "Flame", post: "Rider" },
    varmint: { or: "Varmint" },
    scooty: { pre: "Mr.", post: "Scooty" },
    jet: { pre: "Jet", post: "Jet" },
    yoshi: { or: "Yoshi" },
    atvStd: { or: "ATV" },
    wiggler: { or: "Wiggler" },
    teddy: { or: "Teddy" },
    gla: { or: "GLA" },
    gla25: { post: "Arrow", pre: "Silver" },
    gla300: { or: "Roadster" },
    falcon: { or: "Falcon" },
    tanooki: { or: "Tanooki" },
    dasher: { post: "-Dasher", pre: "Dasher" },
    master: { or: "Master" },
    streetle: { or: "Streetle" },
    pwing: { post: "-Wing", pre: "Wing" },
    city: { post: "Tripper", pre: "City" },
    rattler: { post: "Rattler", pre: "Bone" }
  }
};
function getComboName(driver, body, tire, glider) {
  let driverMorphs = partMorphemes.drivers[driver];
  if (!driverMorphs) driverMorphs = partMorphemes.drivers[driver.replaceAll(/\d$/g, "")];
  const bodyMorphs = partMorphemes.bodies[body];

  // Special Cases
  if (driver === "mario" && body === "std" &&
      tire === "std" && glider === "super") return "The Standard";
  if (driver === "peachGold" && body === "gold" &&
      tire === "gold" && glider === "gold") return "24 Carat Gold";
  if (driver.isAny("villagerF", "villagerM", "isabelle") && body === "city" &&
      tire === "leaf" && glider === "paper") return "City Folk";
  if (driver === "link" && body === "master" &&
      tire === "triforce" && glider === "hylian") return "Hero of the Sky";
  if (driver.isAny("miiS", "miiM", "miiL")) {
    if (body === "scooty") return fuse("Mx.", driverMorphs.post ?? driverMorphs.or ?? driverMorphs.full ?? driverMorphs.pre);
  }
  if (driver.isAny("peach", "daisy", "rosalina", "peachCat",
       "toadette", // "peachBb", "daisyBb", "rosalinaBb", "peachGold",
       "wendy", "villagerF", "isabelle")) {
    if (body === "scooty") return fuse("Mrs.", driverMorphs.post ?? driverMorphs.or ?? driverMorphs.full ?? driverMorphs.pre);
    if (body === "duke") return fuse("Duchess", driverMorphs.post ?? driverMorphs.or ?? driverMorphs.full ?? driverMorphs.pre);
  }

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
