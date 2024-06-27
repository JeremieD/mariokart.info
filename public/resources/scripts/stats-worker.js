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
      reponse[1] = setTerrainRatios(...args);
      break;
    default:
      response[1] = "Error: Unknown command: “" + cmd + "”";
  }

  postMessage(response);
};

const stats = [ "mintb", "spdGr", "spdAg", "spdWt", "spdAr", "accel",
                "weigt", "hndGr", "hndAg", "hndWt", "hndAr", "trctn", "invcb" ];
const scoreStats = [ "mintb", "spd", "spdGr", "spdAg", "spdWt", "spdAr",
            "accel", "weigt", "hnd", "hndGr", "hndAg", "hndWt", "hndAr",
            "trctn", "invcb", "size" ];

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
    glider: undefined,
  };
  classes = {
    driver: undefined,
    body: undefined,
    tire: undefined,
    glider: undefined,
  };
  code = "";
  lvl = {
    mintb: 0,
    spd: 0,
    spdGr: 0,
    spdAg: 0,
    spdWt: 0,
    spdAr: 0,
    accel: 0,
    weigt: 0,
    hnd: 0,
    hndGr: 0,
    hndAg: 0,
    hndWt: 0,
    hndAr: 0,
    trctn: 0,
    invcb: 0,
    size: 0
  };
  size = -1;

  constructor(driver, body, tire, glider) {
    // TODO: Check parts
    try {
      this.code = parts.drivers[driver].code
                + parts.bodies[body].code
                + parts.tires[tire].code
                + parts.gliders[glider].code;
    } catch (e) {
      throw "Error: Unknown combo: “" + driver + ", " + body + ", " + tire + ", " + glider + "”";
    }

    this.driverID = driver;
    this.bodyID   = body;
    this.tireID   = tire;
    this.gliderID = glider;

    this.bodyVariant = getBodyVariant(body, driver);
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

    for (const stat of stats) {
      let lvl = 0;
      lvl += this.classes.driver[stat];
      lvl += this.classes.body[stat];
      lvl += this.classes.tire[stat];
      lvl += this.classes.glider[stat];
      lvl = toLvl(lvl);

      this.lvl[stat] = lvl;
    }
    this.lvl.spd = round(this.lvl.spdGr * Combo.PERCENT_GR +
                         this.lvl.spdAg * Combo.PERCENT_AG +
                         this.lvl.spdWt * Combo.PERCENT_WT +
                         this.lvl.spdAr * Combo.PERCENT_AR, 3);
    this.lvl.hnd = round(this.lvl.hndGr * Combo.PERCENT_GR +
                         this.lvl.hndAg * Combo.PERCENT_AG +
                         this.lvl.hndWt * Combo.PERCENT_WT +
                         this.lvl.hndAr * Combo.PERCENT_AR, 3);
    this.size = this.classes.driver.size;
    this.lvl.size = this.size*2.5 + .75;
  }

  static fromCode(code) {
    // TODO: check code
    let driverCode, bodyCode, tireCode, gliderCode;
    if (code.length == 4) {
      driverCode = code.substring(0, 1);
      bodyCode   = code.substring(1, 2);
      tireCode   = code.substring(2, 3);
      gliderCode = code.substring(3, 4);
    } else if (code.length == 5) {
      driverCode = code.substring(0, 2);
      bodyCode   = code.substring(2, 3);
      tireCode   = code.substring(3, 4);
      gliderCode = code.substring(4, 5);
    } else {
      throw "Error: Could not parse combo code: “" + code + "”";
    }

    const driver = driverCodes[driverCode];
    const body   = bodyCodes[bodyCode];
    const tire   = tireCodes[tireCode];
    const glider = gliderCodes[gliderCode];
    return new Combo(driver, body, tire, glider);
  }

  static PERCENT_GR = .80; // Best estimate for percent of time on ground.
  static PERCENT_AG = .15; // Best estimate for percent of time in anti-gravity.
  static PERCENT_WT = .04; // Best estimate for percent of time underwater.
  static PERCENT_AR = .01; // Best estimate for percent of time airborne.
}

// IDEA: Move this into View. Work with raw values in worker to avoid calculations.
const toLvl = n => (n+3) / 4;

function getCombo(...args) {
  if (args.length == 1) { // From code
    return Combo.fromCode(args[0]);
  } else if (args.length == 4) { // From part IDs
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
  const bodyLock = opts.bodyLock ?? false;
  const tireLock = opts.tireLock ?? false;
  const gliderLock = opts.gliderLock ?? false;
  const mintbMin = opts.mintb?.min ?? 0; const mintbMax = opts.mintb?.max ?? 6;
  const spdMin = opts.spd?.min ?? 0; const spdMax = opts.spd?.max ?? 6;
  const spdGrMin = opts.spdGr?.min ?? 0; const spdGrMax = opts.spdGr?.max ?? 6;
  const spdWtMin = opts.spdWt?.min ?? 0; const spdWtMax = opts.spdWt?.max ?? 6;
  const spdAgMin = opts.spdAg?.min ?? 0; const spdAgMax = opts.spdAg?.max ?? 6;
  const spdArMin = opts.spdAr?.min ?? 0; const spdArMax = opts.spdAr?.max ?? 6;
  const accelMin = opts.accel?.min ?? 0; const accelMax = opts.accel?.max ?? 6;
  const weigtMin = opts.weigt?.min ?? 0; const weigtMax = opts.weigt?.max ?? 6;
  const hndMin = opts.hnd?.min ?? 0; const hndMax = opts.hnd?.max ?? 6;
  const hndGrMin = opts.hndGr?.min ?? 0; const hndGrMax = opts.hndGr?.max ?? 6;
  const hndWtMin = opts.hndWt?.min ?? 0; const hndWtMax = opts.hndWt?.max ?? 6;
  const hndAgMin = opts.hndAg?.min ?? 0; const hndAgMax = opts.hndAg?.max ?? 6;
  const hndArMin = opts.hndAr?.min ?? 0; const hndArMax = opts.hndAr?.max ?? 6;
  const trctnMin = opts.trctn?.min ?? 0; const trctnMax = opts.trctn?.max ?? 6;
  const invcbMin = opts.invcb?.min ?? 0; const invcbMax = opts.invcb?.max ?? 6;
  const sizeMin = opts.size?.min ?? 0; const sizeMax = opts.size?.max ?? 2;
  const excludeKarts = opts.excludeKarts ?? false;
  const excludeATVs = opts.excludeATVs ?? false;
  const excludeBikes = opts.excludeBikes ?? false;
  const excludeSportBikes = opts.excludeSportBikes ?? false;
  const sortBy = opts.sortBy ?? "diff";
  const factors = [
    opts.mintb?.factor ?? 0,
    opts.spd?.factor ?? 0,
    opts.spdGr?.factor ?? 0, opts.spdAg?.factor ?? 0,
    opts.spdWt?.factor ?? 0, opts.spdAr?.factor ?? 0,
    opts.accel?.factor ?? 0, opts.weigt?.factor ?? 0,
    opts.hnd?.factor ?? 0,
    opts.hndGr?.factor ?? 0, opts.hndAg?.factor ?? 0,
    opts.hndWt?.factor ?? 0, opts.hndAr?.factor ?? 0,
    opts.trctn?.factor ?? 0, opts.invcb?.factor ?? 0,
    opts.size?.factor ?? 0
  ];
  const limit = opts.limit ?? 51;


  // IDEA: If this is still too slow, I should try to calculate partial diffs
  //       and scores to eliminate whole classes in droves.
  //       I should also use an array for lvls.
  const list = [];
  for (let driver of driverClasses) {
    if (driverLock && driver !== refCombo.parts.driver.class) continue;
  for (let body of bodyClasses) {
    if (bodyLock && body !== refCombo.parts.body.class) continue;
    if (excludeKarts && parts.bodies[body].type == "kart") continue;
    if (excludeATVs && parts.bodies[body].type == "atv") continue;
    if (excludeBikes && parts.bodies[body].type == "bike") continue;
    if (excludeSportBikes && parts.bodies[body].type == "sport") continue;
  for (let tire of tireClasses) {
    if (tireLock && tire !== refCombo.parts.tire.class) continue;
  for (let glider of gliderClasses) {
    if (gliderLock && glider !== refCombo.parts.glider.class) continue;

    // Auto variants
    if (refCombo.parts.driver.class == driver) driver = refCombo.driverID;
    if (refCombo.parts.body.class   == body)     body = refCombo.bodyID;
    if (refCombo.parts.tire.class   == tire)     tire = refCombo.tireID;
    if (refCombo.parts.glider.class == glider) glider = refCombo.gliderID;
    const combo = new Combo(driver, body, tire, glider);

    // Stat Checks
    if (combo.lvl.mintb < mintbMin || combo.lvl.mintb > mintbMax) continue;
    if (combo.lvl.spd < spdMin || combo.lvl.spd > spdMax) continue;
    if (combo.lvl.spdGr < spdGrMin || combo.lvl.spdGr > spdGrMax) continue;
    if (combo.lvl.spdWt < spdWtMin || combo.lvl.spdWt > spdWtMax) continue;
    if (combo.lvl.spdAg < spdAgMin || combo.lvl.spdAg > spdAgMax) continue;
    if (combo.lvl.spdAr < spdArMin || combo.lvl.spdAr > spdArMax) continue;
    if (combo.lvl.accel < accelMin || combo.lvl.accel > accelMax) continue;
    if (combo.lvl.weigt < weigtMin || combo.lvl.weigt > weigtMax) continue;
    if (combo.lvl.hnd < hndMin || combo.lvl.hnd > hndMax) continue;
    if (combo.lvl.hndGr < hndGrMin || combo.lvl.hndGr > hndGrMax) continue;
    if (combo.lvl.hndWt < hndWtMin || combo.lvl.hndWt > hndWtMax) continue;
    if (combo.lvl.hndAg < hndAgMin || combo.lvl.hndAg > hndAgMax) continue;
    if (combo.lvl.hndAr < hndArMin || combo.lvl.hndAr > hndArMax) continue;
    if (combo.lvl.trctn < trctnMin || combo.lvl.trctn > trctnMax) continue;
    if (combo.lvl.invcb < invcbMin || combo.lvl.invcb > invcbMax) continue;
    if (combo.size < sizeMin || combo.size > sizeMax) continue;

    // Difference Checks
    const diff = {
      mintb: combo.lvl.mintb - refCombo.lvl.mintb,
      spdGr: combo.lvl.spdGr - refCombo.lvl.spdGr,
      spdWt: combo.lvl.spdWt - refCombo.lvl.spdWt,
      spdAg: combo.lvl.spdAg - refCombo.lvl.spdAg,
      spdAr: combo.lvl.spdAr - refCombo.lvl.spdAr,
      accel: combo.lvl.accel - refCombo.lvl.accel,
      weigt: combo.lvl.weigt - refCombo.lvl.weigt,
      hndGr: combo.lvl.hndGr - refCombo.lvl.hndGr,
      hndWt: combo.lvl.hndWt - refCombo.lvl.hndWt,
      hndAg: combo.lvl.hndAg - refCombo.lvl.hndAg,
      hndAr: combo.lvl.hndAr - refCombo.lvl.hndAr,
      trctn: combo.lvl.trctn - refCombo.lvl.trctn,
      invcb: combo.lvl.invcb - refCombo.lvl.invcb
    };

    diff.total = diff.mintb + diff.spdGr + diff.spdWt + diff.spdAg + diff.spdAr
               + diff.accel + diff.weigt + diff.hndGr + diff.hndWt + diff.hndAg
               + diff.hndAr + diff.trctn + diff.invcb;
    if (diff.total > maxDiff || diff.total < minDiff) continue;

    diff.absTotal = Math.abs(diff.mintb)
                  + Math.abs(diff.spdGr) + Math.abs(diff.spdWt)
                  + Math.abs(diff.spdAg) + Math.abs(diff.spdAr)
                  + Math.abs(diff.accel) + Math.abs(diff.weigt)
                  + Math.abs(diff.hndGr) + Math.abs(diff.hndWt)
                  + Math.abs(diff.hndAg) + Math.abs(diff.hndAr)
                  + Math.abs(diff.trctn) + Math.abs(diff.invcb);
    if (diff.absTotal > maxAbsDiff) continue;
    if (mustDiffer && diff.absTotal == 0) continue;

    combo.diff = diff;

    list.push(combo);
  } } } }

  // Sort
  let compare = (a, b) => b.lvl[sortBy] - a.lvl[sortBy];
  switch (sortBy) {
    case "diff":
      compare = (a, b) => b.diff.total - a.diff.total;
      break;
    case "score":
      compare = (a, b) => getScore(b, factors) - getScore(a, factors);
  }

  list.sort(compare);

  return { length: list.length,
           combos: list.slice(0, limit) };
}

function getScore(combo, factors) {
  const lvls = combo.lvl;
  let score = 0;
  for (let i = 0; i < factors.length; i++) {
    score += factors[i] * lvls[scoreStats[i]];
  }
  return score;
}

function getAvailableParts(set) {
  switch (set) {
    case "unlocks":
      return {
        drivers: [],
        bodies: [],
        tires: [],
        gliders: [],
      };
    case "base":
      return {
        drivers: [],
        bodies: [],
        tires: [],
        gliders: [],
      };
    case "all":
    default:
      return {
        drivers: [
          parts.drivers.mario,
          parts.drivers.luigi,
          parts.drivers.peach,
          parts.drivers.daisy,
          parts.drivers.rosalina,
          parts.drivers.marioTan,
          parts.drivers.peachCat,
          {
            id: "birdo",
            folder: [
              parts.drivers.birdo,
              parts.drivers.birdo1,
              parts.drivers.birdo2,
              parts.drivers.birdo3,
              parts.drivers.birdo4,
              parts.drivers.birdo5,
              parts.drivers.birdo6,
              parts.drivers.birdo7,
              parts.drivers.birdo8 ]
          },
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
          parts.drivers.kingboo,
          parts.drivers.petey,
          parts.drivers.marioBb,
          parts.drivers.luigiBb,
          parts.drivers.peachBb,
          parts.drivers.daisyBb,
          parts.drivers.rosalinaBb,
          {
            id: "marioGold",
            folder: [
              parts.drivers.marioGold1,
              parts.drivers.marioGold ]
          },
          parts.drivers.peachGold,
          parts.drivers.wiggler,
          parts.drivers.wario,
          parts.drivers.waluigi,
          parts.drivers.dk,
          parts.drivers.bowser,
          parts.drivers.drybones,
          parts.drivers.bowserJr,
          parts.drivers.bowserDry,
          parts.drivers.kamek,
          parts.drivers.lemmy,
          parts.drivers.larry,
          parts.drivers.wendy,
          parts.drivers.ludwig,
          parts.drivers.iggy,
          parts.drivers.roy,
          parts.drivers.morton,
          parts.drivers.peachette,
          {
            id: "inkling",
            folder: [
              parts.drivers.inklingF,
              parts.drivers.inklingF1,
              parts.drivers.inklingF2,
              parts.drivers.inklingM,
              parts.drivers.inklingM1,
              parts.drivers.inklingM2 ]
          },
          {
            id: "villager",
            folder: [
              parts.drivers.villagerM,
              parts.drivers.villagerF ]
          },
          parts.drivers.isabelle,
          {
            id: "link",
            folder: [
              parts.drivers.link,
              parts.drivers.link1 ]
          },
          parts.drivers.ddk,
          parts.drivers.fk,
          parts.drivers.pauline,
          {
            id: "mii",
            folder: [
              parts.drivers.miiS,
              parts.drivers.miiM,
              parts.drivers.miiL ]
          }
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
              parts.bodies.pwing,
              parts.bodies.koopa ]
          },
          {
            id: "atv",
            folder: [
              parts.bodies.atvStd,
              parts.bodies.wiggler,
              parts.bodies.teddy,
              parts.bodies.rattler,
              parts.bodies.splat,
              parts.bodies.ink ]
          },
          {
            id: "bike",
            folder: [
              parts.bodies.bikeStd,
              parts.bodies.duke,
              parts.bodies.flame,
              parts.bodies.varmint,
              parts.bodies.scooty,
              parts.bodies.city,
              parts.bodies.masterZero ]
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
          parts.tires.leaf,
          parts.tires.ancient ],
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
          parts.gliders.paper,
          parts.gliders.paraglider ]
      };
  }
}

function setTerrainRatios(gr = .8, ag = .15, wt = .04, ar = .01) {
  if (gr+ag+wt+ar !== 1) throw "Error: Terrain ratios do not add up to 1";
  Combo.PERCENT_GR = gr;
  Combo.PERCENT_AG = ag;
  Combo.PERCENT_WT = wt;
  Combo.PERCENT_AR = ar;
}

const classes = {
  drivers: {
    mario: {
      weigt: 6,
      accel: 2,
      trctn: 2,
      mintb: 3,
      spdGr: 7,
      spdWt: 7,
      spdAg: 7,
      spdAr: 7,
      hndGr: 4,
      hndWt: 4,
      hndAg: 4,
      hndAr: 4,
      invcb: 3,
      size: 1
    },
    luigi: {
      weigt: 6,
      accel: 2,
      trctn: 1,
      mintb: 3,
      spdGr: 7,
      spdWt: 7,
      spdAg: 7,
      spdAr: 7,
      hndGr: 5,
      hndWt: 5,
      hndAg: 5,
      hndAr: 5,
      invcb: 3,
      size: 1
    },
    peach: {
      weigt: 4,
      accel: 3,
      trctn: 3,
      mintb: 4,
      spdGr: 6,
      spdWt: 6,
      spdAg: 6,
      spdAr: 6,
      hndGr: 5,
      hndWt: 5,
      hndAg: 5,
      hndAr: 5,
      invcb: 1,
      size: 1
    },
    rosalina: {
      weigt: 7,
      accel: 1,
      trctn: 3,
      mintb: 2,
      spdGr: 8,
      spdWt: 8,
      spdAg: 8,
      spdAr: 8,
      hndGr: 3,
      hndWt: 3,
      hndAg: 3,
      hndAr: 3,
      invcb: 4,
      size: 2
    },
    petey: {
      weigt: 10,
      accel: 1,
      trctn: 1,
      mintb: 1,
      spdGr: 8,
      spdWt: 8,
      spdAg: 8,
      spdAr: 8,
      hndGr: 3,
      hndWt: 3,
      hndAg: 3,
      hndAr: 3,
      invcb: 6,
      size: 2
    },
    marioTan: {
      weigt: 5,
      accel: 3,
      trctn: 1,
      mintb: 4,
      spdGr: 6,
      spdWt: 6,
      spdAg: 6,
      spdAr: 6,
      hndGr: 5,
      hndWt: 5,
      hndAg: 5,
      hndAr: 5,
      invcb: 1,
      size: 1
    },
    peachCat: {
      weigt: 3,
      accel: 4,
      trctn: 3,
      mintb: 4,
      spdGr: 5,
      spdWt: 5,
      spdAg: 5,
      spdAr: 5,
      hndGr: 6,
      hndWt: 6,
      hndAg: 6,
      hndAr: 6,
      invcb: 3,
      size: 1
    },
    toad: {
      weigt: 3,
      accel: 4,
      trctn: 4,
      mintb: 4,
      spdGr: 4,
      spdWt: 4,
      spdAg: 4,
      spdAr: 4,
      hndGr: 7,
      hndWt: 7,
      hndAg: 7,
      hndAr: 7,
      invcb: 3,
      size: 0
    },
    koopa: {
      weigt: 2,
      accel: 4,
      trctn: 5,
      mintb: 4,
      spdGr: 3,
      spdWt: 3,
      spdAg: 3,
      spdAr: 3,
      hndGr: 8,
      hndWt: 8,
      hndAg: 8,
      hndAr: 8,
      invcb: 4,
      size: 0
    },
    toadette: {
      weigt: 2,
      accel: 5,
      trctn: 2,
      mintb: 4,
      spdGr: 3,
      spdWt: 3,
      spdAg: 3,
      spdAr: 3,
      hndGr: 7,
      hndWt: 7,
      hndAg: 7,
      hndAr: 7,
      invcb: 3,
      size: 0
    },
    marioBb: {
      weigt: 1,
      accel: 5,
      trctn: 4,
      mintb: 5,
      spdGr: 2,
      spdWt: 2,
      spdAg: 2,
      spdAr: 2,
      hndGr: 8,
      hndWt: 8,
      hndAg: 8,
      hndAr: 8,
      invcb: 5,
      size: 0
    },
    peachBb: {
      weigt: 0,
      accel: 4,
      trctn: 5,
      mintb: 5,
      spdGr: 1,
      spdWt: 1,
      spdAg: 1,
      spdAr: 1,
      hndGr: 10,
      hndWt: 10,
      hndAg: 10,
      hndAr: 10,
      invcb: 6,
      size: 0
    },
    rosalinaBb: {
      weigt: 0,
      accel: 5,
      trctn: 3,
      mintb: 5,
      spdGr: 1,
      spdWt: 1,
      spdAg: 1,
      spdAr: 1,
      hndGr: 9,
      hndWt: 9,
      hndAg: 9,
      hndAr: 9,
      invcb: 6,
      size: 0
    },
    marioGold: {
      weigt: 10,
      accel: 1,
      trctn: 1,
      mintb: 1,
      spdGr: 8,
      spdWt: 8,
      spdAg: 8,
      spdAr: 8,
      hndGr: 3,
      hndWt: 3,
      hndAg: 3,
      hndAr: 3,
      invcb: 3,
      size: 1
    },
    wiggler: {
      weigt: 8,
      accel: 1,
      trctn: 0,
      mintb: 1,
      spdGr: 9,
      spdWt: 9,
      spdAg: 9,
      spdAr: 9,
      hndGr: 2,
      hndWt: 2,
      hndAg: 2,
      hndAr: 2,
      invcb: 4,
      size: 1
    },
    wario: {
      weigt: 9,
      accel: 0,
      trctn: 1,
      mintb: 0,
      spdGr: 10,
      spdWt: 10,
      spdAg: 10,
      spdAr: 10,
      hndGr: 1,
      hndWt: 1,
      hndAg: 1,
      hndAr: 1,
      invcb: 5,
      size: 2
    },
    waluigi: {
      weigt: 8,
      accel: 1,
      trctn: 0,
      mintb: 1,
      spdGr: 9,
      spdWt: 9,
      spdAg: 9,
      spdAr: 9,
      hndGr: 2,
      hndWt: 2,
      hndAg: 2,
      hndAr: 2,
      invcb: 4,
      size: 2
    },
    bowser: {
      weigt: 10,
      accel: 0,
      trctn: 0,
      mintb: 0,
      spdGr: 10,
      spdWt: 10,
      spdAg: 10,
      spdAr: 10,
      hndGr: 0,
      hndWt: 0,
      hndAg: 0,
      hndAr: 0,
      invcb: 6,
      size: 2
    }
  },
  bodies: {
    std: {
      weigt: 2,
      accel: 4,
      trctn: 3,
      mintb: 5,
      spdGr: 3,
      spdWt: 3,
      spdAg: 3,
      spdAr: 3,
      hndGr: 3,
      hndWt: 2,
      hndAg: 3,
      hndAr: 3,
      invcb: 3
    },
    gla300: {
      weigt: 2,
      accel: 4,
      trctn: 3,
      mintb: 5,
      spdGr: 3,
      spdWt: 3,
      spdAg: 3,
      spdAr: 3,
      hndGr: 3,
      hndWt: 2,
      hndAg: 3,
      hndAr: 3,
      invcb: 4
    },
    pipe: {
      weigt: 1,
      accel: 6,
      trctn: 4,
      mintb: 6,
      spdGr: 2,
      spdWt: 3,
      spdAg: 1,
      spdAr: 1,
      hndGr: 5,
      hndWt: 4,
      hndAg: 4,
      hndAr: 2,
      invcb: 3
    },
    varmint: {
      weigt: 1,
      accel: 6,
      trctn: 4,
      mintb: 6,
      spdGr: 2,
      spdWt: 3,
      spdAg: 1,
      spdAr: 1,
      hndGr: 5,
      hndWt: 4,
      hndAg: 4,
      hndAr: 2,
      invcb: 2
    },
    mach: {
      weigt: 3,
      accel: 3,
      trctn: 4,
      mintb: 5,
      spdGr: 3,
      spdWt: 3,
      spdAg: 5,
      spdAr: 4,
      hndGr: 2,
      hndWt: 2,
      hndAg: 4,
      hndAr: 2,
      invcb: 3
    },
    ink: {
      weigt: 3,
      accel: 3,
      trctn: 4,
      mintb: 5,
      spdGr: 3,
      spdWt: 3,
      spdAg: 5,
      spdAr: 4,
      hndGr: 2,
      hndWt: 2,
      hndAg: 4,
      hndAr: 2,
      invcb: 1
    },
    steel: {
      weigt: 4,
      accel: 1,
      trctn: 3,
      mintb: 3,
      spdGr: 4,
      spdWt: 5,
      spdAg: 2,
      spdAr: 0,
      hndGr: 1,
      hndWt: 5,
      hndAg: 1,
      hndAr: 1,
      invcb: 6
    },
    rattler: {
      weigt: 4,
      accel: 1,
      trctn: 3,
      mintb: 3,
      spdGr: 4,
      spdWt: 5,
      spdAg: 2,
      spdAr: 0,
      hndGr: 1,
      hndWt: 5,
      hndAg: 1,
      hndAr: 1,
      invcb: 5
    },
    cat: {
      weigt: 2,
      accel: 5,
      trctn: 3,
      mintb: 6,
      spdGr: 2,
      spdWt: 2,
      spdAg: 3,
      spdAr: 4,
      hndGr: 4,
      hndWt: 2,
      hndAg: 3,
      hndAr: 4,
      invcb: 3
    },
    comet: {
      weigt: 2,
      accel: 5,
      trctn: 3,
      mintb: 6,
      spdGr: 2,
      spdWt: 2,
      spdAg: 3,
      spdAr: 4,
      hndGr: 4,
      hndWt: 2,
      hndAg: 3,
      hndAr: 4,
      invcb: 3
    },
    yoshi: {
      weigt: 2,
      accel: 5,
      trctn: 3,
      mintb: 6,
      spdGr: 2,
      spdWt: 2,
      spdAg: 3,
      spdAr: 4,
      hndGr: 4,
      hndWt: 2,
      hndAg: 3,
      hndAr: 4,
      invcb: 2
    },
    teddy: {
      weigt: 2,
      accel: 5,
      trctn: 3,
      mintb: 6,
      spdGr: 2,
      spdWt: 2,
      spdAg: 3,
      spdAr: 4,
      hndGr: 4,
      hndWt: 2,
      hndAg: 3,
      hndAr: 4,
      invcb: 1
    },
    circuit: {
      weigt: 3,
      accel: 1,
      trctn: 1,
      mintb: 3,
      spdGr: 5,
      spdWt: 1,
      spdAg: 4,
      spdAr: 2,
      hndGr: 1,
      hndWt: 1,
      hndAg: 2,
      hndAr: 0,
      invcb: 6
    },
    wagon: {
      weigt: 4,
      accel: 0,
      trctn: 5,
      mintb: 3,
      spdGr: 5,
      spdWt: 2,
      spdAg: 3,
      spdAr: 1,
      hndGr: 0,
      hndWt: 1,
      hndAg: 1,
      hndAr: 0,
      invcb: 7
    },
    atvStd: {
      weigt: 4,
      accel: 0,
      trctn: 5,
      mintb: 3,
      spdGr: 5,
      spdWt: 2,
      spdAg: 3,
      spdAr: 1,
      hndGr: 0,
      hndWt: 1,
      hndAg: 1,
      hndAr: 0,
      invcb: 6
    },
    prancer: {
      weigt: 1,
      accel: 2,
      trctn: 2,
      mintb: 4,
      spdGr: 4,
      spdWt: 3,
      spdAg: 3,
      spdAr: 3,
      hndGr: 3,
      hndWt: 3,
      hndAg: 2,
      hndAr: 3,
      invcb: 5
    },
    bikeSport: {
      weigt: 1,
      accel: 2,
      trctn: 2,
      mintb: 4,
      spdGr: 4,
      spdWt: 3,
      spdAg: 3,
      spdAr: 3,
      hndGr: 3,
      hndWt: 3,
      hndAg: 2,
      hndAr: 3,
      invcb: 3
    },
    biddy: {
      weigt: 0,
      accel: 7,
      trctn: 4,
      mintb: 7,
      spdGr: 0,
      spdWt: 1,
      spdAg: 2,
      spdAr: 1,
      hndGr: 5,
      hndWt: 4,
      hndAg: 5,
      hndAr: 4,
      invcb: 0
    },
    sneeker: {
      weigt: 2,
      accel: 2,
      trctn: 0,
      mintb: 4,
      spdGr: 4,
      spdWt: 2,
      spdAg: 3,
      spdAr: 3,
      hndGr: 3,
      hndWt: 2,
      hndAg: 3,
      hndAr: 2,
      invcb: 5
    },
    gold: {
      weigt: 2,
      accel: 2,
      trctn: 0,
      mintb: 4,
      spdGr: 4,
      spdWt: 2,
      spdAg: 3,
      spdAr: 3,
      hndGr: 3,
      hndWt: 2,
      hndAg: 3,
      hndAr: 2,
      invcb: 4
    },
    master: {
      weigt: 2,
      accel: 2,
      trctn: 0,
      mintb: 4,
      spdGr: 4,
      spdWt: 2,
      spdAg: 3,
      spdAr: 3,
      hndGr: 3,
      hndWt: 2,
      hndAg: 3,
      hndAr: 2,
      invcb: 3
    },
    gla25: {
      weigt: 1,
      accel: 5,
      trctn: 5,
      mintb: 5,
      spdGr: 2,
      spdWt: 2,
      spdAg: 4,
      spdAr: 3,
      hndGr: 4,
      hndWt: 3,
      hndAg: 4,
      hndAr: 3,
      invcb: 4
    },
    bikeStd: {
      weigt: 1,
      accel: 5,
      trctn: 5,
      mintb: 5,
      spdGr: 2,
      spdWt: 2,
      spdAg: 4,
      spdAr: 3,
      hndGr: 4,
      hndWt: 3,
      hndAg: 4,
      hndAr: 3,
      invcb: 4
    },
    wiggler: {
      weigt: 1,
      accel: 5,
      trctn: 5,
      mintb: 5,
      spdGr: 2,
      spdWt: 2,
      spdAg: 4,
      spdAr: 3,
      hndGr: 4,
      hndWt: 3,
      hndAg: 4,
      hndAr: 3,
      invcb: 4
    },
    falcon: {
      weigt: 0,
      accel: 3,
      trctn: 3,
      mintb: 4,
      spdGr: 4,
      spdWt: 2,
      spdAg: 4,
      spdAr: 3,
      hndGr: 2,
      hndWt: 3,
      hndAg: 5,
      hndAr: 1,
      invcb: 4
    },
    splat: {
      weigt: 0,
      accel: 3,
      trctn: 3,
      mintb: 4,
      spdGr: 4,
      spdWt: 2,
      spdAg: 4,
      spdAr: 3,
      hndGr: 2,
      hndWt: 3,
      hndAg: 5,
      hndAr: 1,
      invcb: 3
    },
    tanooki: {
      weigt: 3,
      accel: 2,
      trctn: 7,
      mintb: 5,
      spdGr: 3,
      spdWt: 4,
      spdAg: 3,
      spdAr: 3,
      hndGr: 4,
      hndWt: 4,
      hndAg: 3,
      hndAr: 3,
      invcb: 4
    },
    koopa: {
      weigt: 3,
      accel: 2,
      trctn: 7,
      mintb: 5,
      spdGr: 3,
      spdWt: 4,
      spdAg: 3,
      spdAr: 3,
      hndGr: 4,
      hndWt: 4,
      hndAg: 3,
      hndAr: 3,
      invcb: 3
    },
    streetle: {
      weigt: 0,
      accel: 6,
      trctn: 6,
      mintb: 6,
      spdGr: 2,
      spdWt: 5,
      spdAg: 0,
      spdAr: 2,
      hndGr: 4,
      hndWt: 5,
      hndAg: 2,
      hndAr: 3,
      invcb: 3
    },
    landship: {
      weigt: 0,
      accel: 6,
      trctn: 6,
      mintb: 6,
      spdGr: 2,
      spdWt: 5,
      spdAg: 0,
      spdAr: 2,
      hndGr: 4,
      hndWt: 5,
      hndAg: 2,
      hndAr: 3,
      invcb: 2
    }
  },
  tires: {
    std: {
      weigt: 2,
      accel: 4,
      trctn: 5,
      mintb: 4,
      spdGr: 2,
      spdWt: 3,
      spdAg: 2,
      spdAr: 3,
      hndGr: 3,
      hndWt: 3,
      hndAg: 3,
      hndAr: 3,
      invcb: 4
    },
    gla: {
      weigt: 2,
      accel: 4,
      trctn: 5,
      mintb: 4,
      spdGr: 2,
      spdWt: 3,
      spdAg: 2,
      spdAr: 3,
      hndGr: 3,
      hndWt: 3,
      hndAg: 3,
      hndAr: 3,
      invcb: 5
    },
    monster: {
      weigt: 4,
      accel: 2,
      trctn: 7,
      mintb: 3,
      spdGr: 3,
      spdWt: 2,
      spdAg: 2,
      spdAr: 1,
      hndGr: 0,
      hndWt: 1,
      hndAg: 0,
      hndAr: 1,
      invcb: 6
    },
    ancient: {
      weigt: 4,
      accel: 2,
      trctn: 7,
      mintb: 3,
      spdGr: 3,
      spdWt: 2,
      spdAg: 2,
      spdAr: 1,
      hndGr: 0,
      hndWt: 1,
      hndAg: 0,
      hndAr: 1,
      invcb: 5
    },
    roller: {
      weigt: 0,
      accel: 6,
      trctn: 4,
      mintb: 6,
      spdGr: 0,
      spdWt: 3,
      spdAg: 0,
      spdAr: 3,
      hndGr: 4,
      hndWt: 4,
      hndAg: 4,
      hndAr: 4,
      invcb: 0
    },
    slim: {
      weigt: 2,
      accel: 2,
      trctn: 1,
      mintb: 3,
      spdGr: 3,
      spdWt: 2,
      spdAg: 4,
      spdAr: 2,
      hndGr: 4,
      hndWt: 4,
      hndAg: 3,
      hndAr: 4,
      invcb: 5
    },
    slick: {
      weigt: 3,
      accel: 1,
      trctn: 0,
      mintb: 2,
      spdGr: 4,
      spdWt: 0,
      spdAg: 4,
      spdAr: 0,
      hndGr: 2,
      hndWt: 0,
      hndAg: 2,
      hndAr: 1,
      invcb: 5
    },
    metal: {
      weigt: 4,
      accel: 0,
      trctn: 2,
      mintb: 2,
      spdGr: 4,
      spdWt: 3,
      spdAg: 1,
      spdAr: 2,
      hndGr: 2,
      hndWt: 2,
      hndAg: 1,
      hndAr: 0,
      invcb: 6
    },
    gold: {
      weigt: 4,
      accel: 0,
      trctn: 2,
      mintb: 2,
      spdGr: 4,
      spdWt: 3,
      spdAg: 1,
      spdAr: 2,
      hndGr: 2,
      hndWt: 2,
      hndAg: 1,
      hndAr: 0,
      invcb: 5
    },
    button: {
      weigt: 0,
      accel: 5,
      trctn: 3,
      mintb: 5,
      spdGr: 1,
      spdWt: 2,
      spdAg: 2,
      spdAr: 2,
      hndGr: 3,
      hndWt: 3,
      hndAg: 4,
      hndAr: 2,
      invcb: 3
    },
    offroad: {
      weigt: 3,
      accel: 3,
      trctn: 6,
      mintb: 3,
      spdGr: 3,
      spdWt: 4,
      spdAg: 2,
      spdAr: 1,
      hndGr: 1,
      hndWt: 1,
      hndAg: 2,
      hndAr: 2,
      invcb: 6
    },
    cushion: {
      weigt: 1,
      accel: 4,
      trctn: 6,
      mintb: 5,
      spdGr: 1,
      spdWt: 1,
      spdAg: 1,
      spdAr: 4,
      hndGr: 2,
      hndWt: 1,
      hndAg: 2,
      hndAr: 3,
      invcb: 6
    },
    sponge: {
      weigt: 1,
      accel: 4,
      trctn: 6,
      mintb: 5,
      spdGr: 1,
      spdWt: 1,
      spdAg: 1,
      spdAr: 4,
      hndGr: 2,
      hndWt: 1,
      hndAg: 2,
      hndAr: 3,
      invcb: 4
    }
  },
  gliders: {
    super: {
      weigt: 1,
      accel: 1,
      trctn: 1,
      mintb: 1,
      spdGr: 1,
      spdWt: 1,
      spdAg: 0,
      spdAr: 2,
      hndGr: 1,
      hndWt: 0,
      hndAg: 1,
      hndAr: 1,
      invcb: 1
    },
    cloud: {
      weigt: 0,
      accel: 2,
      trctn: 1,
      mintb: 2,
      spdGr: 0,
      spdWt: 1,
      spdAg: 1,
      spdAr: 1,
      hndGr: 1,
      hndWt: 0,
      hndAg: 1,
      hndAr: 2,
      invcb: 0
    },
    parafoil: {
      weigt: 1,
      accel: 2,
      trctn: 0,
      mintb: 2,
      spdGr: 0,
      spdWt: 0,
      spdAg: 1,
      spdAr: 1,
      hndGr: 1,
      hndWt: 1,
      hndAg: 0,
      hndAr: 2,
      invcb: 0
    },
    gold: {
      weigt: 2,
      accel: 1,
      trctn: 0,
      mintb: 1,
      spdGr: 1,
      spdWt: 0,
      spdAg: 1,
      spdAr: 2,
      hndGr: 1,
      hndWt: 1,
      hndAg: 0,
      hndAr: 1,
      invcb: 1
    }
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
      class: "luigi",
      group: "luigi",
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
    birdo: {
      class: "peach",
      group: "peach",
      code: "y" },
      birdo1: {
        class: "peach",
        group: "peach",
        code: "y1" },
      birdo2: {
        class: "peach",
        group: "peach",
        code: "y2" },
      birdo3: {
        class: "peach",
        group: "peach",
        code: "y3" },
      birdo4: {
        class: "peach",
        group: "peach",
        code: "y4" },
      birdo5: {
        class: "peach",
        group: "peach",
        code: "y5" },
      birdo6: {
        class: "peach",
        group: "peach",
        code: "y6" },
      birdo7: {
        class: "peach",
        group: "peach",
        code: "y7" },
      birdo8: {
        class: "peach",
        group: "peach",
        code: "y8" },
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
      class: "koopa",
      group: "koopa",
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
      class: "koopa",
      group: "koopa",
      code: "u" },
    toadette: {
      class: "toadette",
      group: "toadette",
      code: "t" },
    kingboo: {
      class: "rosalina",
      group: "rosalina",
      code: "K" },
    petey: {
      class: "petey",
      group: "marioGold",
      code: "Q" },
    marioBb: {
      class: "marioBb",
      group: "marioBb",
      code: "m" },
    luigiBb: {
      class: "marioBb",
      group: "marioBb",
      code: "l" },
    peachBb: {
      class: "peachBb",
      group: "peachBb",
      code: "p" },
    daisyBb: {
      class: "peachBb",
      group: "peachBb",
      code: "j" },
    rosalinaBb: {
      class: "rosalinaBb",
      group: "rosalinaBb",
      code: "r" },
    marioGold: {
      class: "marioGold",
      group: "marioGold",
      code: "G" },
      marioGold1: {
        class: "marioGold",
        group: "marioGold",
        code: "G1" },
    peachGold: {
      class: "marioGold",
      group: "marioGold",
      code: "a" },
    wiggler: {
      class: "wiggler",
      group: "waluigi",
      code: "H" },
    wario: {
      class: "wario",
      group: "wario",
      code: "W" },
    waluigi: {
      class: "waluigi",
      group: "waluigi",
      code: "w" },
    dk: {
      class: "waluigi",
      group: "waluigi",
      code: "D" },
    bowser: {
      class: "bowser",
      group: "bowser",
      code: "B" },
    drybones: {
      class: "marioBb",
      group: "marioBb",
      code: "x" },
    bowserJr: {
      class: "koopa",
      group: "koopa",
      code: "b" },
    bowserDry: {
      class: "wario",
      group: "wario",
      code: "X" },
    kamek: {
      class: "luigi",
      group: "luigi",
      code: "E" },
    lemmy: {
      class: "rosalinaBb",
      group: "rosalinaBb",
      code: "0" },
    larry: {
      class: "toad",
      group: "toad",
      code: "1" },
    wendy: {
      class: "toadette",
      group: "toadette",
      code: "2" },
    ludwig: {
      class: "mario",
      group: "mario",
      code: "3" },
    iggy: {
      class: "luigi",
      group: "luigi",
      code: "4" },
    roy: {
      class: "waluigi",
      group: "waluigi",
      code: "5" },
    morton: {
      class: "bowser",
      group: "bowser",
      code: "6" },
    inklingM: {
      class: "marioTan",
      group: "marioTan",
      code: "I" },
      inklingM1: {
        class: "marioTan",
        group: "marioTan",
        code: "I1" },
      inklingM2: {
        class: "marioTan",
        group: "marioTan",
        code: "I2" },
    inklingF: {
      class: "peachCat",
      group: "peachCat",
      code: "i" },
      inklingF1: {
        class: "peachCat",
        group: "peachCat",
        code: "i1" },
      inklingF2: {
        class: "peachCat",
        group: "peachCat",
        code: "i2" },
    villagerM: {
      class: "marioTan",
      group: "marioTan",
      code: "V" },
    villagerF: {
      class: "peachCat",
      group: "peachCat",
      code: "v" },
    isabelle: {
      class: "toadette",
      group: "toadette",
      code: "e" },
    link: {
      class: "rosalina",
      group: "rosalina",
      code: "Z" },
      link1: {
        class: "rosalina",
        group: "rosalina",
        code: "Z1" },
    peachette: {
      class: "peach",
      group: "peach",
      code: "c" },
    ddk: {
      class: "peachCat",
      group: "peachCat",
      code: "d" },
    fk: {
      class: "wario",
      group: "wario",
      code: "F" },
    pauline: {
      class: "rosalina",
      group: "rosalina",
      code: "U" },
    miiS: {
      class: "marioBb",
      group: "marioBb",
      code: "7" },
    miiM: {
      class: "mario",
      group: "mario",
      code: "8" },
    miiL: {
      class: "wario",
      group: "wario",
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
      class: "cat",
      group: "cat",
      code: "C" },
    circuit: {
      type: "kart",
      class: "circuit",
      group: "circuit",
      code: "e" },
    trispeed: {
      type: "kart",
      class: "steel",
      group: "steel",
      code: "3" },
    wagon: {
      type: "kart",
      class: "wagon",
      group: "wagon",
      code: "w" },
    prancer: {
      type: "kart",
      class: "prancer",
      group: "prancer",
      code: "H" },
    biddy: {
      type: "kart",
      class: "biddy",
      group: "biddy",
      code: "B" },
    landship: {
      type: "kart",
      class: "landship",
      group: "streetle",
      code: "L" },
    sneeker: {
      type: "kart",
      class: "sneeker",
      group: "sneeker",
      code: "U" },
    coupe: {
      type: "kart",
      class: "mach",
      group: "mach",
      code: "m" },
    gold: {
      type: "kart",
      class: "gold",
      group: "sneeker",
      code: "G" },
    bikeStd: {
      type: "bike",
      class: "gla25",
      group: "gla25",
      code: "E" },
    bikeSport: {
      type: "sport",
      class: "bikeSport",
      group: "prancer",
      code: "h" },
    comet: {
      type: "sport",
      class: "cat",
      group: "cat",
      code: "c" },
    duke: {
      type: "bike",
      class: "std",
      group: "std",
      code: "D" },
    flame: {
      type: "bike",
      class: "gla25",
      group: "gla25",
      code: "f" },
    varmint: {
      type: "bike",
      class: "varmint",
      group: "pipe",
      code: "V" },
    scooty: {
      type: "bike",
      class: "biddy",
      group: "biddy",
      code: "s" },
    jet: {
      type: "sport",
      class: "bikeSport",
      group: "prancer",
      code: "j" },
    yoshi: {
      type: "sport",
      class: "yoshi",
      group: "cat",
      code: "y" },
    atvStd: {
      type: "atv",
      class: "atvStd",
      group: "wagon",
      code: "a" },
    wiggler: {
      type: "atv",
      class: "gla25",
      group: "gla25",
      code: "W" },
    teddy: {
      type: "atv",
      class: "teddy",
      group: "cat",
      code: "T" },
    gla: {
      type: "kart",
      class: "wagon",
      group: "wagon",
      code: "g" },
    gla25: {
      type: "kart",
      class: "gla25",
      group: "gla25",
      code: "2" },
    gla300: {
      type: "kart",
      class: "gla300",
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
      class: "circuit",
      group: "circuit",
      code: "b" },
    master: {
      type: "sport",
      class: "master",
      group: "sneeker",
      code: "z" },
    streetle: {
      type: "kart",
      class: "streetle",
      group: "streetle",
      code: "S" },
    pwing: {
      type: "kart",
      class: "circuit",
      group: "circuit",
      code: "p" },
    city: {
      type: "bike",
      class: "varmint",
      group: "pipe",
      code: "v" },
    rattler: {
      type: "atv",
      class: "rattler",
      group: "steel",
      code: "r" },
    koopa: {
      type: "kart",
      class: "koopa",
      group: "tanooki",
      code: "K" },
    splat: {
      type: "atv",
      class: "splat",
      group: "falcon",
      code: "i" },
    ink: {
      type: "atv",
      class: "ink",
      group: "mach",
      code: "I" },
    masterZero: {
      type: "bike",
      class: "koopa",
      group: "tanooki",
      code: "Z" }
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
      class: "button",
      group: "button",
      code: "B" },
    offroad: {
      class: "offroad",
      group: "offroad",
      code: "O" },
    sponge: {
      class: "sponge",
      group: "cushion",
      code: "c" },
    wood: {
      class: "slim",
      group: "slim",
      code: "W" },
    cushion: {
      class: "cushion",
      group: "cushion",
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
      class: "offroad",
      group: "offroad",
      code: "o" },
    gold: {
      class: "gold",
      group: "metal",
      code: "G" },
    gla: {
      class: "gla",
      group: "std",
      code: "g" },
    triforce: {
      class: "offroad",
      group: "offroad",
      code: "z" },
    leaf: {
      class: "button",
      group: "button",
      code: "L" },
    ancient: {
      class: "ancient",
      group: "monster",
      code: "Z" }
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
      class: "gold",
      group: "gold",
      code: "W" },
    squirrel: {
      class: "super",
      group: "super",
      code: "S" },
    parasol: {
      class: "parafoil",
      group: "parafoil",
      code: "s" },
    parachute: {
      class: "cloud",
      group: "cloud",
      code: "c" },
    parafoil: {
      class: "parafoil",
      group: "parafoil",
      code: "f" },
    flower: {
      class: "cloud",
      group: "cloud",
      code: "F" },
    bowser: {
      class: "parafoil",
      group: "parafoil",
      code: "B" },
    plane: {
      class: "gold",
      group: "gold",
      code: "w" },
    parafoilTV: {
      class: "parafoil",
      group: "parafoil",
      code: "T" },
    gold: {
      class: "gold",
      group: "gold",
      code: "G" },
    hylian: {
      class: "super",
      group: "super",
      code: "z" },
    paper: {
      class: "cloud",
      group: "cloud",
      code: "P" },
    paraglider: {
      class: "gold",
      group: "gold",
      code: "Z" }
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
for (const id of driverParts) {
  parts.drivers[id].id = id;
}
for (const id of bodyParts) {
  parts.bodies[id].id = id;
}
for (const id of tireParts) {
  parts.tires[id].id = id;
}
for (const id of gliderParts) {
  parts.gliders[id].id = id;
}

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
    birdo: "toadette",
      birdo1: "lightblue",
      birdo2: "black",
      birdo4: "yellow",
      birdo5: "white",
      birdo6: "blue",
      birdo7: "green",
      birdo8: "orange",
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
    kingboo: "kingboo",
    petey: "green",
    luigiBb: "green",
    peachBb: "pink",
    daisyBb: "daisy",
    rosalinaBb: "rosalina",
    marioGold: "marioGold",
      marioGold1: "marioGold",
    peachGold: "peachGold",
    wiggler: "daisy",
    wario: "wario",
    waluigi: "waluigi",
    dk: "dk",
    bowser: "bowser",
    drybones: "drybones",
    bowserJr: "bowserJr",
    bowserDry: "bowserDry",
    kamek: "lightblue",
    lemmy: "lemmy",
    larry: "larry",
    wendy: "wendy",
    ludwig: "ludwig",
    iggy: "iggy",
    roy: "roy",
    morton: "morton",
    inklingM: "inklingM",
      inklingM1: "inklingM1",
      inklingM2: "inklingM2",
    inklingF: "inklingF",
      inklingF1: "inklingF1",
      inklingF2: "inklingF2",
    villagerM: "villagerM",
    villagerF: "villagerF",
    isabelle: "isabelle",
    link: "link",
      link1: "link",
    peachette: "toadette",
    fk: "lightblue",
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
    birdo: "birdo",
      birdo1: "lightblue",
      birdo2: "black",
      birdo4: "yellow",
      birdo5: "white",
      birdo6: "blue",
      birdo7: "green",
      birdo8: "orange",
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
    kingboo: "black",
    petey: "green",
    luigiBb: "green",
    peachBb: "pink",
    daisyBb: "orange",
    rosalinaBb: "lightblue",
    marioGold: "marioGold",
      marioGold1: "marioGold",
    peachGold: "peachGold",
    wiggler: "orange",
    wario: "purple",
    waluigi: "waluigi",
    dk: "yellow",
    bowser: "bowser",
    drybones: "lightblue",
    bowserJr: "green",
    bowserDry: "black",
    kamek: "lightblue",
    lemmy: "lemmy",
    larry: "larry",
    wendy: "wendy",
    ludwig: "ludwig",
    iggy: "iggy",
    roy: "roy",
    morton: "morton",
    inklingM: "blue",
      inklingM1: "purple",
      inklingM2: "lightblue",
    inklingF: "yellow",
      inklingF1: "lightgreen",
      inklingF2: "pink",
    villagerM: "bowser",
    villagerF: "pink",
    isabelle: "lightgreen",
    link: "blue",
      link1: "yellow",
    peachette: "pink",
    fk: "lightblue",
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
    birdo: "orange",
      birdo2: "black",
      birdo4: "black",
      birdo7: "green",
      birdo8: "orange",
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
    kingboo: "black",
    petey: "green",
    luigiBb: "green",
    peachBb: "orange",
    daisyBb: "orange",
    marioGold: "black",
      marioGold1: "black",
    peachGold: "orange",
    wiggler: "orange",
    wario: "black",
    dk: "orange",
    bowser: "black",
    bowserJr: "green",
    bowserDry: "black",
    lemmy: "green",
    larry: "orange",
    wendy: "black",
    iggy: "green",
    roy: "black",
    morton: "black",
    inklingF: "orange",
      villagerM1: "black",
      villagerM2: "green",
    villagerF: "orange",
      villagerF1: "green",
      villagerF2: "black",
    isabelle: "orange",
      link1: "green",
    peachette: "orange",
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
    birdo: "pink",
      birdo1: "blue",
      birdo4: "yellow",
      birdo5: "blue",
      birdo6: "blue",
      birdo7: "green",
      birdo8: "yellow",
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
    petey: "green",
    luigiBb: "green",
    peachBb: "pink",
    daisyBb: "yellow",
    rosalinaBb: "blue",
    peachGold: "pink",
    wiggler: "yellow",
    wario: "yellow",
    waluigi: "blue",
    bowser: "yellow",
    drybones: "blue",
    bowserJr: "green",
    bowserDry: "yellow",
    kamek: "blue",
    lemmy: "blue",
    larry: "yellow",
    wendy: "pink",
    ludwig: "blue",
    iggy: "green",
    roy: "pink",
    inklingM: "blue",
      inklingM1: "yellow",
      inklingM2: "green",
      inklingF1: "green",
      inklingF2: "pink",
    villagerF: "pink",
    isabelle: "green",
    link: "green",
      link1: "green",
    peachette: "pink",
    fk: "blue",
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
    birdo: "pink",
      birdo1: "pink",
      birdo2: "grey",
      birdo4: "yellow",
      birdo5: "pink",
      birdo8: "grey",
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
    kingboo: "grey",
    petey: "grey",
    peachBb: "pink",
    daisyBb: "yellow",
    rosalinaBb: "pink",
    marioGold: "grey",
      marioGold1: "grey",
    peachGold: "pink",
    wiggler: "yellow",
    wario: "yellow",
    waluigi: "yellow",
    bowser: "grey",
    drybones: "grey",
    bowserJr: "grey",
    bowserDry: "grey",
    lemmy: "yellow",
    larry: "yellow",
    wendy: "pink",
    ludwig: "grey",
    iggy: "grey",
    roy: "yellow",
    morton: "grey",
    inklingM: "yellow",
      inklingM1: "grey",
    inklingF: "yellow",
      inklingF1: "grey",
    villagerF: "pink",
    isabelle: "pink",
      link1: "grey",
    peachette: "pink",
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
    birdo: "red",
      birdo1: "lightblue",
      birdo2: "black",
      birdo3: "red",
      birdo5: "white",
      birdo6: "blue",
      birdo7: "grey",
      birdo8: "red",
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
    kingboo: "purple",
    petey: "red",
    luigiBb: "blue",
    peachBb: "red",
    daisyBb: "red",
    rosalinaBb: "grey",
    marioGold: "grey",
      marioGold1: "grey",
    peachGold: "brown",
    wiggler: "brown",
    wario: "purple",
    waluigi: "blue",
    dk: "brown",
    bowser: "black",
    drybones: "lightblue",
    kamek: "white",
    lemmy: "brown",
    larry: "lightblue",
    wendy: "red",
    ludwig: "blue",
    roy: "purple",
    morton: "white",
    inklingM: "blue",
      inklingM1: "purple",
      inklingM2: "grey",
    inklingF: "red",
      inklingF1: "black",
      inklingF2: "white",
    villagerM: "blue",
    villagerF: "white",
    isabelle: "white",
    link: "blue",
      link1: "grey",
    peachette: "white",
    ddk: "red",
    fk: "white",
    pauline: "red",
    miiS: "lightblue",
    miiM: "blue",
    miiL: "purple"
  },
  koopa: {
    lemmy: "lemmy",
    larry: "larry",
    wendy: "wendy",
    ludwig: "ludwig",
    iggy: "iggy",
    roy: "roy",
    morton: "morton"
  },
  bikeStd: {
    luigi: "green",
    peach: "pink",
    daisy: "orange",
    rosalina: "rosalina",
    marioTan: "marioTan",
    peachCat: "peachCat",
    birdo: "toadette",
      birdo1: "lightblue",
      birdo2: "black",
      birdo4: "yellow",
      birdo5: "white",
      birdo6: "blue",
      birdo7: "green",
      birdo8: "orange",
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
    kingboo: "kingboo",
    petey: "green",
    luigiBb: "green",
    peachBb: "pink",
    daisyBb: "orange",
    rosalinaBb: "rosalina",
    marioGold: "marioGold",
      marioGold1: "marioGold",
    peachGold: "peachGold",
    wiggler: "orange",
    wario: "yellow",
    waluigi: "waluigi",
    dk: "dk",
    bowser: "bowser",
    drybones: "drybones",
    bowserJr: "bowserJr",
    bowserDry: "bowserDry",
    kamek: "lightblue",
    lemmy: "lemmy",
    larry: "larry",
    wendy: "wendy",
    ludwig: "ludwig",
    iggy: "iggy",
    roy: "roy",
    morton: "morton",
    inklingM: "inklingM",
      inklingM1: "inklingM1",
      inklingM2: "inklingM2",
    inklingF: "inklingF",
      inklingF1: "inklingF1",
      inklingF2: "inklingF2",
    villagerM: "villagerM",
    villagerF: "villagerF",
    isabelle: "isabelle",
    link: "link",
      link1: "link",
    peachette: "toadette",
    fk: "lightblue",
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
    birdo: "pink",
      birdo1: "lightblue",
      birdo2: "black",
      birdo3: "red",
      birdo4: "yellow",
      birdo5: "white",
      birdo6: "blue",
      birdo7: "green",
      birdo8: "orange",
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
    kingboo: "black",
    petey: "green",
    marioBb: "white",
    luigiBb: "green",
    peachBb: "pink",
    daisyBb: "orange",
    rosalinaBb: "lightblue",
    marioGold: "black",
      marioGold1: "black",
    peachGold: "brown",
    wiggler: "orange",
    wario: "yellow",
    waluigi: "blue",
    dk: "red",
    bowser: "black",
    drybones: "lightblue",
    bowserJr: "black",
    bowserDry: "black",
    kamek: "purple",
    lemmy: "yellow",
    larry: "lightblue",
    wendy: "purple",
    ludwig: "blue",
    iggy: "green",
    roy: "purple",
    morton: "black",
    inklingM: "blue",
      inklingM1: "black",
      inklingM2: "lightblue",
    inklingF: "red",
      inklingF1: "green",
      inklingF2: "brown",
    villagerM: "red",
    villagerF: "pink",
    link: "blue",
      link1: "red",
    peachette: "pink",
    ddk: "white",
    fk: "black",
    pauline: "red",
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
    birdo: "orange",
      birdo4: "orange",
      birdo5: "green",
      birdo7: "green",
      birdo8: "orange",
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
    petey: "green",
    luigiBb: "green",
    peachBb: "orange",
    daisyBb: "orange",
    rosalinaBb: "orange",
    peachGold: "orange",
    wiggler: "orange",
    dk: "orange",
    drybones: "green",
    bowserJr: "green",
    kamek: "green",
    lemmy: "green",
    wendy: "orange",
    ludwig: "green",
    iggy: "green",
    inklingF: "orange",
      inklingF1: "green",
      inklingM1: "orange",
      inklingM2: "green",
    villagerM: "green",
    villagerF: "orange",
    isabelle: "green",
    peachette: "orange",
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
    birdo: "pink",
      birdo1: "lightblue",
      birdo2: "black",
      birdo4: "yellow",
      birdo5: "white",
      birdo6: "blue",
      birdo7: "green",
      birdo8: "orange",
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
    kingboo: "kingboo",
    petey: "green",
    luigiBb: "green",
    peachBb: "peach",
    daisyBb: "orange",
    rosalinaBb: "rosalina",
    marioGold: "marioGold",
      marioGold1: "marioGold",
    peachGold: "peachGold",
    wiggler: "orange",
    wario: "purple",
    waluigi: "waluigi",
    dk: "dk",
    bowser: "bowser",
    drybones: "drybones",
    bowserJr: "bowserJr",
    bowserDry: "bowserDry",
    kamek: "lightblue",
    lemmy: "lemmy",
    larry: "yellow",
    wendy: "wendy",
    ludwig: "ludwig",
    iggy: "iggy",
    roy: "roy",
    morton: "morton",
    inklingM: "inklingM",
      inklingM1: "inklingM1",
      inklingM2: "inklingM2",
    inklingF: "inklingF",
      inklingF1: "inklingF1",
      inklingF2: "inklingF2",
    villagerM: "villagerM",
    villagerF: "villagerF",
    isabelle: "isabelle",
    link: "link",
      link1: "link",
    peachette: "pink",
    fk: "lightblue",
    miiS: "lightblue",
    miiM: "blue",
    miiL: "purple"
  },
  splat: {
    inklingF: "inklingF",
      inklingF1: "inklingF1",
      inklingF2: "inklingF2",
    inklingM: "inklingM",
      inklingM1: "inklingM1",
      inklingM2: "inklingM2"
  },
  ink: {
    inklingF: "inklingF",
      inklingF1: "inklingF1",
      inklingF2: "inklingF2",
    inklingM: "inklingM",
      inklingM1: "inklingM1",
      inklingM2: "inklingM2"
  }
}
function getBodyVariant(body, driver) {
  const variant = bodyVariants[body]?.[driver];
  if (variant != undefined) return "-" + variant;
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
    birdo: "toadette",
      birdo1: "lightblue",
      birdo2: "black",
      birdo4: "yellow",
      birdo5: "white",
      birdo6: "blue",
      birdo7: "green",
      birdo8: "orange",
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
    kingboo: "kingboo",
    petey: "green",
    luigiBb: "green",
    peachBb: "pink",
    daisyBb: "orange",
    rosalinaBb: "rosalina",
    marioGold: "marioGold",
      marioGold1: "marioGold",
    peachGold: "peachGold",
    wiggler: "orange",
    wario: "wario",
    waluigi: "waluigi",
    dk: "dk",
    bowser: "bowser",
    drybones: "drybones",
    bowserJr: "bowserJr",
    bowserDry: "bowserDry",
    kamek: "lightblue",
    lemmy: "lemmy",
    larry: "larry",
    wendy: "wendy",
    ludwig: "ludwig",
    iggy: "iggy",
    roy: "roy",
    morton: "morton",
    inklingM: "inklingM",
      inklingM1: "inklingM1",
      inklingM2: "inklingM2",
    inklingF: "inklingF",
      inklingF1: "inklingF1",
      inklingF2: "inklingF2",
    villagerM: "villagerM",
    villagerF: "villagerF",
    isabelle: "isabelle",
    link: "link",
      link1: "link",
    peachette: "toadette",
    miiS: "lightblue",
    miiM: "blue",
    miiL: "purple"
  },
  parasol: {
    daisy: "daisy",
    daisyBb: "daisy",
    wiggler: "daisy",
    rosalina: "rosalina",
    rosalinaBb: "rosalina",
    kamek: "rosalina",
    fk: "rosalina",
  }
};
function getGliderVariant(glider, driver) {
  const variant = gliderVariants[glider]?.[driver];
  if (variant != undefined) return "-" + variant;
  return "";
}

function randomInt(a, b) {
  if (b == undefined) {
    b = a;
    a = 0;
  }
  return Math.floor(Math.random() * (b - a) + a);
}

// Round n to p decimal digits.
const round = (n, p) => Math.round(n * 10**p) / 10**p;
