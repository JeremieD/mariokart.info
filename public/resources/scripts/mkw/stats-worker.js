"use strict";
// Stats Worker

import {statisticals, combineLevels, SURFACES} from "./stats.js";

self.onmessage = e => {
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
  roadSpeed: 0, dirtSpeed: 1, waterSpeed: 2,
  acceleration: 3, weight: 4,
  roadHandling: 5, dirtHandling: 6, waterHandling: 7,
  size: 8
};

class Combo {
  // TODO: Clean up a bit. Rename some stuff.
  driverID = "";
  bodyID = "";
  bodyVariant = "";
  parts = {
    driver: undefined,
    body: undefined
  };
  classes = {
    driver: undefined,
    body: undefined
  };
  code = "";
  lvl = [...[0,0,0], 0, 0, ...[0,0,0], 0];
  size = -1;

  statisticals = {
    driver: undefined,
    body: undefined,
    combined: undefined
  };

  constructor(driver = "mario", body = "std") {
    // TODO: Check parts
    try {
      this.code = parts.drivers[driver].code + parts.bodies[body].code;
    } catch (e) {
      throw "Error: Unknown combo: “" + driver + ", " + body + "”";
    }

    this.driverID = driver;
    this.bodyID   = body;

    this.bodyVariant = getBodyVariant(body, driver);

    this.statisticals.driver = statisticals.parts.drivers[driver];
    this.statisticals.body = statisticals.parts.bodies[body];
    this.statisticals.combined = combineLevels(this.statisticals.driver.levels, this.statisticals.body.levels);

    this.parts.driver = parts.drivers[driver];
    this.parts.body   = parts.bodies[body];

    const driverClassID = this.parts.driver.class;
    const bodyClassID   = this.parts.body.class;

    this.classes.driver = classes.drivers[driverClassID];
    this.classes.body   = classes.bodies[bodyClassID];

    if (this.classes.driver === undefined) console.log(driver, driverClassID)
    if (this.classes.body === undefined) console.log(body, bodyClassID)

    const stats = this.statisticals.combined;
    this.lvl = [
      ...SURFACES.map(k => stats.speed[k]),
      stats.acceleration, stats.weight,
      ...SURFACES.map(k => stats.handling[k]),
      stats.size
    ];

    this.name = getComboName(driver, body);
  }

  static fromCode(code) {
    // TODO: check code
    let driverCode, bodyCode;
    if (code.length == 2) {
      driverCode = code[0];
      bodyCode   = code[1];
    } else if (code.length == 3) {
      driverCode = code.substring(0, 2);
      bodyCode   = code.substring(2, 3);
    } else {
      return new Combo();
    }

    const driver = driverCodes[driverCode];
    const body   = bodyCodes[bodyCode];
    return new Combo(driver, body);
  }

  // Data from Dospe [docs.google.com/spreadsheets/d/1Z41bvL2DTH6neOD41w6L0_eZwTxZMA3w4KJNzBEKzs8]
  static PERCENT_GR = .75; // Estimated percent of time on ground.
  static PERCENT_AG = .17; // Estimated percent of time in anti-gravity.
  static PERCENT_WT = .03; // Estimated percent of time underwater.
  static PERCENT_AR = .05; // Estimated percent of time airborne.

  // Indices to the stats
  static ROAD_SPEED = 0;
  static COURSE_SPEED = 1;
  static WATER_SPEED = 2;
  static ACCELERATION = 3;
  static WEIGHT = 4;
  static ROAD_HANDLING = 5;
  static COURSE_HANDLING = 6;
  static WATER_HANDLING = 7;

  static SIZE = 8
  static DISPLAY_SPEED = 9;
  static DISPLAY_HANDLING = 10;

}

function getCombo(...args) {
  if (args.length == 1) { // From code
    return Combo.fromCode(args[0]);
  } else if (args.length == 2) { // From part IDs
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
    "yoshi",
    "dk",
    "bowser",
    "bowserJr",
    "koopa",
    "toad",
    "toadette",
    "lakitu",
    "kingboo",
    "shyguy",
    "wario",
    "waluigi",
    "birdo",
    "pauline",
    "rosalina",
    "marioBb",
    "luigiBb",
    "peachBb",
    "daisyBb",
    "rosalinaBb",
    "nabbit",
    "goomba",
    "drybones",
    "piranha",
    "spike",
    "wiggler",
    "hammerbro",
    "crab",
    "cataquack",
    "mole",
    "cheep",
    "pianta",
    "wrench",
    "conkdor",
    "swoop",
    "pokey",
    "peepa",
    "stingby",
    "fishbone",
    "coffer",
    "cow",
    "snowman",
    "penguin",
    "dolphin",
    "biddy",
    "chuck"
  ];

  const randomDriver = drivers[randomInt(drivers.length)];
  if (Array.isArray(randomDriver)) {
    return randomDriver[randomInt(randomDriver.length)]; // Random variant
  }
  return randomDriver;
}
function getRandomBody() { return bodyParts[randomInt(bodyPartCount)]; }
function getRandomCombo(driver, body) {
  const newDriver = driver || getRandomDriver();
  const newBody   =   body || getRandomBody();
  return new Combo(newDriver, newBody);
}

function listCombos(opts = {}) {
  const refCombo = opts.refCombo ?? undefined;
  const mustDiffer = opts.mustDiffer ?? false;
  const maxAbsDiff = opts.maxAbsDiff ?? Infinity;
  const minDiff = opts.minDiff ?? -Infinity;
  const maxDiff = opts.maxDiff ?? Infinity;
  const driverLock = opts.driverLock ?? false;
  const bodyLock   = opts.bodyLock   ?? false;

  const mins = opts.min ?? [ ...[0, 0, 0], 0, 0, ...[0, 0, 0], 0];
  const maxs = opts.max ?? [ ...[20, 20, 20], 20, 20, ...[20, 20, 20], 2/*size; not 20*/];

  const excludeKarts = opts.excludeKarts ?? false;
  const excludeATVs  = opts.excludeATVs  ?? false;
  const excludeBikes = opts.excludeBikes ?? false;
  const sortBy = opts.sortBy ?? "diff";
  const factors = opts.factors ?? [...[0,0,0],0,0,...[0,0,0],0];
  const limit = opts.limit ?? 51;


  // IDEA: If this is still too slow, I should try to calculate partial diffs
  //       and scores to eliminate whole classes in droves.
  const list = [];
  for (let driver of driverClasses) {
    if (driverLock && driver !== refCombo.parts.driver.class) continue;

    body_checks:
    for (let body of bodyClasses) {
      if (bodyLock && body !== refCombo.parts.body.class) continue;
      if (excludeKarts && parts.bodies[body].type == "kart") continue;
      if (excludeATVs  && parts.bodies[body].type == "atv")  continue;
      if (excludeBikes && parts.bodies[body].type == "bike") continue;

      // Auto variants
      if (refCombo.parts.driver.class == driver) driver = refCombo.driverID;
      if (refCombo.parts.body.class   == body)     body = refCombo.bodyID;
      const combo = new Combo(driver, body);

      // Stat Checks
      for (let stat = 0, end = maxs.length; stat < end; stat++) {
        if (combo.lvl[stat] < mins[stat]) continue body_checks;
        if (combo.lvl[stat] > maxs[stat]) continue body_checks;
      }

      // Difference Checks
      const diffs = combo.lvl.map((stat, idx) => stat - refCombo.lvl[idx]);

      const diffSum = diffs.reduce((accum, stat) => accum + stat, 0); // sum
      if (diffSum > maxDiff || diffSum < minDiff) continue;

      const diffSumAbs = diffs.reduce((accum, stat) => accum + Math.abs(stat), 0);
      if (diffSumAbs > maxAbsDiff) continue;
      if (mustDiffer && diffSumAbs == 0) continue;

      combo.diffs = diffs;
      combo.diffSum = diffSum;
      combo.diffSumAbs = diffSumAbs;

      list.push(combo);
    }
  }

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
  for (let i = 0, end = lvl.length; i < end; i++) {
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
      parts.drivers.yoshi,
      parts.drivers.dk,
      parts.drivers.bowser,
      parts.drivers.bowserJr,
      parts.drivers.koopa,
      parts.drivers.toad,
      parts.drivers.toadette,
      parts.drivers.lakitu,
      parts.drivers.kingboo,
      parts.drivers.shyguy,
      parts.drivers.wario,
      parts.drivers.waluigi,
      parts.drivers.birdo,
      parts.drivers.pauline,
      parts.drivers.rosalina,
      parts.drivers.marioBb,
      parts.drivers.luigiBb,
      parts.drivers.peachBb,
      parts.drivers.daisyBb,
      parts.drivers.rosalinaBb,
      parts.drivers.nabbit,
      parts.drivers.goomba,
      parts.drivers.drybones,
      parts.drivers.piranha,
      parts.drivers.spike,
      parts.drivers.wiggler,
      parts.drivers.hammerbro,
      parts.drivers.crab,
      parts.drivers.cataquack,
      parts.drivers.mole,
      parts.drivers.cheep,
      parts.drivers.pianta,
      parts.drivers.wrench,
      parts.drivers.conkdor,
      parts.drivers.swoop,
      parts.drivers.pokey,
      parts.drivers.peepa,
      parts.drivers.stingby,
      parts.drivers.fishbone,
      parts.drivers.coffer,
      parts.drivers.cow,
      parts.drivers.snowman,
      parts.drivers.penguin,
      parts.drivers.dolphin,
      parts.drivers.biddy,
      parts.drivers.chuck
    ],
    bodies: [
      {
        id: "kart",
        folder: [
          parts.bodies.std,
          parts.bodies.rally,
          parts.bodies.plush,
          parts.bodies.bloop,
          parts.bodies.zoom,
          parts.bodies.truck,
          parts.bodies.rod,
          parts.bodies.frog,
          parts.bodies.royale,
          parts.bodies.dasher,
          parts.bodies.biddy,
          parts.bodies.titan,
          parts.bodies.starSled,
          parts.bodies.reel,
          parts.bodies.bee,
          parts.bodies.carpet,
          parts.bodies.cloud,
          parts.bodies.blast,
          parts.bodies.horn,
          parts.bodies.dump,
          parts.bodies.trike,
          parts.bodies.pipe,
          parts.bodies.bill ]
      },
      {
        id: "atv",
        folder: [
          parts.bodies.dorrie,
          parts.bodies.junk,
          parts.bodies.lobster,
          parts.bodies.dreadSled,
          parts.bodies.gator,
          parts.bodies.bruiser ]
      },
      {
        id: "bike",
        folder: [
          parts.bodies.stdBike,
          parts.bodies.rallyBike,
          parts.bodies.scoot,
          parts.bodies.machBike,
          parts.bodies.pipeBike,
          parts.bodies.radio,
          parts.bodies.chopper,
          parts.bodies.fish,
          parts.bodies.rob,
          parts.bodies.dolphin,
          parts.bodies.loco ]
      }
    ]
  };
  // return {
  //   drivers: [
  //     {
  //       id: "mario",
  //       folder: [
  //         parts.drivers.mario,
  //         parts.drivers["mario-touring"],
  //         parts.drivers["mario-pro"],
  //         parts.drivers["mario-mech"],
  //         parts.drivers["mario-dune"],
  //         parts.drivers["mario-cowboy"],
  //         parts.drivers["mario-sight"],
  //         parts.drivers["mario-aviator"],
  //         parts.drivers["mario-festival"],
  //         parts.drivers["mario-at"] ]
  //     },
  //     {
  //       id: "luigi",
  //       folder: [
  //         parts.drivers.luigi,
  //         parts.drivers["luigi-touring"],
  //         parts.drivers["luigi-pro"],
  //         parts.drivers["luigi-mech"],
  //         parts.drivers["luigi-oasis"],
  //         parts.drivers["luigi-farmer"],
  //         parts.drivers["luigi-festival"],
  //         parts.drivers["luigi-at"],
  //         parts.drivers["luigi-gondolier"] ]
  //     },
  //     {
  //       id: "peach",
  //       folder: [
  //         parts.drivers.peach,
  //         parts.drivers["peach-touring"],
  //         parts.drivers["peach-pro"],
  //         parts.drivers["peach-farmer"],
  //         parts.drivers["peach-sight"],
  //         parts.drivers["peach-aviator"],
  //         parts.drivers["peach-festival"],
  //         parts.drivers["peach-aero"],
  //         parts.drivers["peach-vacation"] ]
  //     },
  //     {
  //       id: "daisy",
  //       folder: [
  //         parts.drivers.daisy,
  //         parts.drivers["daisy-touring"],
  //         parts.drivers["daisy-pro"],
  //         parts.drivers["daisy-oasis"],
  //         parts.drivers["daisy-swim"],
  //         parts.drivers["daisy-aero"],
  //         parts.drivers["daisy-vacation"] ]
  //     },
  //     {
  //       id: "yoshi",
  //       folder: [
  //         parts.drivers.yoshi,
  //         parts.drivers["yoshi-touring"],
  //         parts.drivers["yoshi-pro"],
  //         parts.drivers["yoshi-aristocrat"],
  //         parts.drivers["yoshi-ice"],
  //         parts.drivers["yoshi-biker"],
  //         parts.drivers["yoshi-swim"],
  //         parts.drivers["yoshi-festival"],
  //         parts.drivers["yoshi-food"] ]
  //     },
  //     {
  //       id: "dk",
  //       folder: [
  //         parts.drivers.dk,
  //         parts.drivers["dk-at"] ]
  //     },
  //     {
  //       id: "bowser",
  //       folder: [
  //         parts.drivers.bowser,
  //         parts.drivers["bowser-pro"],
  //         parts.drivers["bowser-charged"],
  //         parts.drivers["bowser-biker"],
  //         parts.drivers["bowser-at"] ]
  //     },
  //     {
  //       id: "bowserJr",
  //       folder: [
  //         parts.drivers.bowserJr,
  //         parts.drivers["bowserJr-pro"],
  //         parts.drivers["bowserJr-biker"],
  //         parts.drivers["bowserJr-explorer"] ]
  //     },
  //     {
  //       id: "koopa",
  //       folder: [
  //         parts.drivers.koopa,
  //         parts.drivers["koopa-runner"],
  //         parts.drivers["koopa-pro"],
  //         parts.drivers["koopa-sailor"],
  //         parts.drivers["koopa-at"],
  //         parts.drivers["koopa-work"] ]
  //     },
  //     {
  //       id: "toad",
  //       folder: [
  //         parts.drivers.toad,
  //         parts.drivers["toad-pro"],
  //         parts.drivers["toad-engi"],
  //         parts.drivers["toad-burger"],
  //         parts.drivers["toad-explorer"] ]
  //     },
  //     {
  //       id: "toadette",
  //       folder: [
  //         parts.drivers.toadette,
  //         parts.drivers["toadette-pro"],
  //         parts.drivers["toadette-conductor"],
  //         parts.drivers["toadette-ice"],
  //         parts.drivers["toadette-explorer"] ]
  //     },
  //     {
  //       id: "lakitu",
  //       folder: [
  //         parts.drivers.lakitu,
  //         parts.drivers["lakitu-pit"],
  //         parts.drivers["lakitu-fish"]
  //       ]
  //     },
  //     {
  //       id: "kingboo",
  //       folder: [
  //         parts.drivers.kingboo,
  //         parts.drivers["kingboo-pro"],
  //         parts.drivers["kingboo-aristocrat"],
  //         parts.drivers["kingboo-pirate"] ]
  //     },
  //     {
  //       id: "shyguy",
  //       folder: [
  //         parts.drivers.shyguy,
  //         parts.drivers["shyguy-pit"],
  //         parts.drivers["shyguy-ski"] ]
  //     },
  //     {
  //       id: "wario",
  //       folder: [
  //         parts.drivers.wario,
  //         parts.drivers["wario-pro"],
  //         parts.drivers["wario-oasis"],
  //         parts.drivers["wario-bee"],
  //         parts.drivers["wario-biker"],
  //         parts.drivers["wario-pirate"],
  //         parts.drivers["wario-ruffian"],
  //         parts.drivers["wario-work"] ]
  //     },
  //     {
  //       id: "waluigi",
  //       folder: [
  //         parts.drivers.waluigi,
  //         parts.drivers["waluigi-pro"],
  //         parts.drivers["waluigi-vampire"],
  //         parts.drivers["waluigi-mariachi"],
  //         parts.drivers["waluigi-biker"],
  //         parts.drivers["waluigi-ruffian"] ]
  //     },
  //     {
  //       id: "birdo",
  //       folder: [
  //         parts.drivers.birdo,
  //         parts.drivers["birdo-pro"],
  //         parts.drivers["birdo-vacation"] ]
  //     },
  //     {
  //       id: "pauline",
  //       folder: [
  //         parts.drivers.pauline,
  //         parts.drivers["pauline-aero"] ]
  //     },
  //     {
  //       id: "rosalina",
  //       folder: [
  //         parts.drivers.rosalina,
  //         parts.drivers["rosalina-touring"],
  //         parts.drivers["rosalina-pro"],
  //         parts.drivers["rosalina-aurora"],
  //         parts.drivers["rosalina-aero"] ]
  //     },
  //     {
  //       id: "marioBb",
  //       folder: [
  //         parts.drivers.marioBb,
  //         parts.drivers["marioBb-pro"],
  //         parts.drivers["marioBb-swim"],
  //         parts.drivers["marioBb-work"] ]
  //     },
  //     {
  //       id: "luigiBb",
  //       folder: [
  //         parts.drivers.luigiBb,
  //         parts.drivers["luigiBb-pro"],
  //         parts.drivers["luigiBb-work"] ]
  //     },
  //     {
  //       id: "peachBb",
  //       folder: [
  //         parts.drivers.peachBb,
  //         parts.drivers["peachBb-touring"],
  //         parts.drivers["peachBb-pro"],
  //         parts.drivers["peachBb-sailor"],
  //         parts.drivers["peachBb-explorer"] ]
  //     },
  //     {
  //       id: "daisyBb",
  //       folder: [
  //         parts.drivers.daisyBb,
  //         parts.drivers["daisyBb-touring"],
  //         parts.drivers["daisyBb-pro"],
  //         parts.drivers["daisyBb-sailor"],
  //         parts.drivers["daisyBb-explorer"] ]
  //     },
  //     {
  //       id: "rosalinaBb",
  //       folder: [
  //         parts.drivers.rosalinaBb,
  //         parts.drivers["rosalinaBb-touring"],
  //         parts.drivers["rosalinaBb-pro"],
  //         parts.drivers["rosalinaBb-sailor"],
  //         parts.drivers["rosalinaBb-explorer"] ]
  //     },
  //     parts.drivers.nabbit,
  //     parts.drivers.goomba,
  //     parts.drivers.drybones,
  //     parts.drivers.piranha,
  //     parts.drivers.spike,
  //     parts.drivers.wiggler,
  //     parts.drivers.hammerbro,
  //     parts.drivers.crab,
  //     parts.drivers.cataquack,
  //     parts.drivers.mole,
  //     parts.drivers.cheep,
  //     parts.drivers.pianta,
  //     parts.drivers.wrench,
  //     parts.drivers.conkdor,
  //     parts.drivers.swoop,
  //     parts.drivers.pokey,
  //     parts.drivers.peepa,
  //     parts.drivers.stingby,
  //     parts.drivers.fishbone,
  //     parts.drivers.coffer,
  //     parts.drivers.cow,
  //     parts.drivers.snowman,
  //     parts.drivers.penguin,
  //     parts.drivers.dolphin,
  //     parts.drivers.biddy,
  //     parts.drivers.chuck
  //   ],
  //   bodies: [
  //     {
  //       id: "kart",
  //       folder: [
  //         parts.bodies.std,
  //         parts.bodies.rally,
  //         parts.bodies.plush,
  //         parts.bodies.bloop,
  //         parts.bodies.zoom,
  //         parts.bodies.truck,
  //         parts.bodies.rod,
  //         parts.bodies.frog,
  //         parts.bodies.royale,
  //         parts.bodies.dasher,
  //         parts.bodies.biddy,
  //         parts.bodies.titan,
  //         parts.bodies.starSled,
  //         parts.bodies.reel,
  //         parts.bodies.bee,
  //         parts.bodies.carpet,
  //         parts.bodies.cloud,
  //         parts.bodies.blast,
  //         parts.bodies.horn,
  //         parts.bodies.dump,
  //         parts.bodies.trike,
  //         parts.bodies.pipe,
  //         parts.bodies.bill ]
  //     },
  //     {
  //       id: "atv",
  //       folder: [
  //         parts.bodies.dorrie,
  //         parts.bodies.junk,
  //         parts.bodies.lobster,
  //         parts.bodies.dreadSled,
  //         parts.bodies.gator,
  //         parts.bodies.bruiser ]
  //     },
  //     {
  //       id: "bike",
  //       folder: [
  //         parts.bodies.stdBike,
  //         parts.bodies.rallyBike,
  //         parts.bodies.scoot,
  //         parts.bodies.machBike,
  //         parts.bodies.pipeBike,
  //         parts.bodies.radio,
  //         parts.bodies.chopper,
  //         parts.bodies.fish,
  //         parts.bodies.rob,
  //         parts.bodies.dolphin,
  //         parts.bodies.loco ]
  //     }
  //   ]
  // };
}

function setTerrainRatios(gr, ag, wt, ar) {
  if (gr+ag+wt+ar !== 1) throw "Error: Terrain ratios do not add up to 1";
  Combo.PERCENT_GR = gr;
  Combo.PERCENT_AG = ag;
  Combo.PERCENT_WT = wt;
  Combo.PERCENT_AR = ar;
}

const classes = {
  // [[road_speed, course_speed, water_speed], acc, wgt, [road_handling, course_handling, water_handling]]
  drivers: {
    // weight class 0
    peachBb:  [...[0,0,0], 7, 0, ...[6,6,6], 0],

    // weight class 1
    marioBb:  [...[1,0,0], 6, 1, ...[7,5,5], 0],
    luigiBb:  [...[0,1,0], 6, 1, ...[5,7,5], 0],
    rosalinaBb:  [...[0,0,1], 6, 1, ...[5,5,7], 0],

    // weight class 2
    toadette: [...[2,1,1], 5, 2, ...[6,4,4], 0],
    toad: [...[1,2,1], 5, 2, ...[4,6,4], 0],
    koopa: [...[1,1,2], 5, 2, ...[4,4,6], 0],

    // weight class 3
    peach: [...[3,2,2], 4, 3, ...[5,3,3], 1],
    yoshi: [...[2,3,2], 4, 3, ...[3,5,3], 1],
    bowserJr: [...[2,2,3], 4, 3, ...[3,3,5], 1],

    // weight class 4
    mario: [...[4,3,3], 3, 4, ...[4,2,2], 1],
    luigi: [...[3,4,3], 3, 4, ...[2,4,2], 1],
    birdo: [...[3,3,4], 3, 4, ...[2,2,4],1 ],

    // weight class 5
    pauline: [...[5,4,4], 2, 5, ...[3,1,1], 1],
    kingboo: [...[4,5,4], 2, 5, ...[1,3,1], 1],
    rosalina: [...[4,4,5], 2, 5, ...[1,1,3], 1],

    // weight class 6
    wario: [...[6,5,5], 1, 6, ...[2,0,0], 2],
    dk: [...[5,6,5], 1, 6, ...[0,2,0], 2],
    waluigi: [...[5,5,6], 1, 6, ...[0,0,2], 2],

    // weight class 7
    bowser: [...[6,6,6], 0, 7, ...[0,0,0], 2],
  },
  bodies: {

    // weight class 0
    machBike:  [...[6,1,1], 7, 0, ...[10,6,6]], // these bodies trade accel for speed
    rallyBike: [...[0,5,0], 8, 0, ...[0,10,6]], // Yes, these are missing a stat!
    fish:      [...[0,0,5], 8, 0, ...[6,6,10]],

    // weight class 1
    bloop:     [...[7,2,2], 6, 1, ...[9,5,5]], // these bodies trade accel for speed
    biddy:     [...[1,6,1], 7, 1, ...[5,9,5]],
    // n/a:    [...[1,1,6], 7, 1, ...[5,5,9]],

    // weight class 3
    dasher:    [...[8,4,4], 4, 3, ...[8,3,3]],
    rally:      [...[4,8,4], 4, 3, ...[3,8,3]],
    cloud:     [...[4,4,8], 4, 3, ...[3,3,8]],

    // weight class 5
    horn:      [...[9,6,6], 2, 5, ...[7,1,1]], // these bodies trade speed for accel
    truck:     [...[7,10,7], 1, 5, ...[1,7,1]],
    trike:     [...[7,7,10], 1, 5, ...[1,1,7]],

    // weight class 6
    gator:     [...[9,6,6], 3, 6, ...[5,0,0]], // these bodies trade speed for accel
    // n/a:    [...[7,10,7], 2, 6, ...[0,5,0]],
    lobster:   [...[7,7,10], 2, 6, ...[0,0,5]],

    // bodies with flat stats
    stdBike:   [...[1,1,1], 9, 0, ...[7,7,7]],
    pipe:      [...[2,2,2], 8, 1, ...[6,6,6]],
    loco:      [...[4,4,4], 6, 1, ...[6,6,6]],
    blast:     [...[5,5,5], 6, 3, ...[3,3,3]],
    std:       [...[5,5,5], 5, 2, ...[5,5,5]],
    chopper:   [...[7,7,7], 3, 2, ...[5,5,5]],
    reel:      [...[8,8,8], 2, 3, ...[4,4,4]],
    junk:      [...[8,8,8], 3, 4, ...[2,2,2]],

    // bizarre
    dorrie:    [...[4,4,4], 5, 5, ...[1,1,6]],
    dreadSled: [...[3,9,5], 3, 3, ...[3,9,4]],
    starSled:  [...[6,8,11], 0, 5, ...[1,2,8]],
  }
};

const driverClasses = Object.keys(classes.drivers);
const bodyClasses   = Object.keys(classes.bodies);
const driverClassCount = driverClasses.length;
const bodyClassCount   = bodyClasses.length;

function driverClass(group, codes) {
  var members = {}

  for (let [name, code] of Object.entries(codes)) {
    members[name] = { group: group, class: group, code: code };
  }

  return members;
}
function bodyClass(type, group, codes) {
  var members = {}

  for (let [name, code] of Object.entries(codes)) {
    members[name] = { type: type, group: group, class: group, code: code };
  }

  return members;
}
function kartClass(group, codes) {
  return bodyClass("kart", group, codes);
}
function bikeClass(group, codes) {
  return bodyClass("bike", group, codes);
}
function kart(name, code) {
  return kartClass(name, {[name]: code});
}
function bike(name, code) {
  return bikeClass(name, {[name]: code});
}
function atv(name, code) {
  return bodyClass("atv", name, {[name]: code});
}

const parts = {
  drivers: {
    // weight class 0
    ...driverClass("peachBb", {
      "peachBb": "p",
      "peachBb-touring": "pt",
      "peachBb-pro": "pp",
      "peachBb-sailor": "ps",
      "peachBb-explorer": "pe",

      "daisyBb": "j",
      "daisyBb-touring": "jt",
      "daisyBb-pro": "jp",
      "daisyBb-sailor": "js",
      "daisyBb-explorer": "je",

      "swoop": "o",
      "biddy": "I",
    }),

    // weight class 1
    ...driverClass("marioBb", {
      "marioBb": "m",
      "marioBb-pro": "mp",
      "marioBb-swim": "mW",
      "marioBb-work": "mw",

      "goomba": "g",
      "spike": "S",
    }),
    ...driverClass("luigiBb", {
      "luigiBb": "l",
      "luigiBb-pro": "lp",
      "luigiBb-work": "lw",

      "drybones": "x",
      "peepa": "Z",
    }),
    ...driverClass("rosalinaBb", {
      "rosalinaBb": "r",
      "rosalinaBb-touring": "rt",
      "rosalinaBb-pro": "rp",
      "rosalinaBb-sailor": "rs",
      "rosalinaBb-explorer": "re",

      "crab": "i",
      "fishbone": "q",
    }),

    // weight class 2
    ...driverClass("toadette", {
      "toadette": "t",
      "toadette-pro": "tp",
      "toadette-conductor": "tC",
      "toadette-ice": "tI",
      "toadette-explorer": "te",

      "nabbit": "n",
    }),
    ...driverClass("toad", {
      "toad": "T",
      "toad-pro": "Tp",
      "toad-engi": "TE",
      "toad-burger": "TB",
      "toad-explorer": "Te",

      "shyguy": "s",
      "shyguy-pit": "sp",
      "shyguy-ski": "sS",

      "stingby": "z",
    }),
    ...driverClass("koopa", {
      "koopa": "k",
      "koopa-runner": "kR",
      "koopa-pro": "kp",
      "koopa-sailor": "ks",
      "koopa-at": "kT",
      "koopa-work": "kw",

      "lakitu": "u",
      "lakitu-pit": "up",
      "lakitu-fish": "uF",

      "cheep": "Q",
    }),

    // weight class 3
    ...driverClass("peach", {
      "peach": "P",
      "peach-touring": "Pt",
      "peach-pro": "Pp",
      "peach-farmer": "Pf",
      "peach-sight": "PS",
      "peach-aviator": "PP",
      "peach-festival": "Py",
      "peach-aero": "Pa",
      "peach-vacation": "Pv",

      "daisy": "J",
      "daisy-touring": "Jt",
      "daisy-pro": "Jp",
      "daisy-oasis": "Jo",
      "daisy-swim": "JW",
      "daisy-aero": "Ja",
      "daisy-vacation": "Jv",

      "coffer": "G",
    }),
    ...driverClass("yoshi", {
      "yoshi": "Y",
      "yoshi-food": "Y1",
      "yoshi-pro": "Y3",
      "yoshi-festival": "Y4",
      "yoshi-touring": "Y5",
      "yoshi-biker": "Y6",
      "yoshi-ice": "Y7",
      "yoshi-swim": "Y8",
      "yoshi-aristocrat": "Y9",

      "mole": "E",
    }),
    ...driverClass("bowserJr", {
      "bowserJr": "b",
      "bowserJr-pro": "bp",
      "bowserJr-biker": "bb",
      "bowserJr-explorer": "be",

      "dolphin": "h",
    }),

    // weight class 4
    ...driverClass("mario", {
      "mario": "M",
      "mario-touring": "Mt",
      "mario-pro": "Mp",
      "mario-mech": "Mm",
      "mario-dune": "Md",
      "mario-cowboy": "MC",
      "mario-sight": "MS",
      "mario-aviator": "MP",
      "mario-festival": "Mh",
      "mario-at": "MT",

      "wrench": "e",
    }),
    ...driverClass("luigi", {
      "luigi": "L",
      "luigi-touring": "Lt",
      "luigi-pro": "Lp",
      "luigi-mech": "Lm",
      "luigi-oasis": "Lo",
      "luigi-farmer": "Lf",
      "luigi-festival": "Lh",
      "luigi-at": "LT",
      "luigi-gondolier": "LG",

      "hammerbro": "v",
      "pokey": "O",
    }),
    ...driverClass("birdo", {
      "birdo": "y",
      "birdo-pro": "yp",
      "birdo-vacation": "yv",

      "penguin": "N",
    }),

    // weight class 5
    ...driverClass("pauline", {
      "pauline": "U",
      "pauline-aero": "Ua",

      "piranha": "X",
      "snowman": "8",
    }),
    ...driverClass("kingboo", {
      "kingboo": "K",
      "kingboo-pro": "Kp",
      "kingboo-aristocrat": "KA",
      "kingboo-pirate": "KP",

      "conkdor": "c",
    }),
    ...driverClass("rosalina", {
      "rosalina": "R",
      "rosalina-touring": "Rt",
      "rosalina-pro": "Rp",
      "rosalina-aurora": "RA",
      "rosalina-aero": "Ra",

      "cataquack": "a",
    }),

    // weight class 6
    ...driverClass("wario", {
      "wario": "W",
      "wario-pro": "Wp",
      "wario-oasis": "Wo",
      "wario-bee": "WW",
      "wario-biker": "Wb",
      "wario-pirate": "WP",
      "wario-ruffian": "WE",
      "wario-work": "Ww",

      "wiggler": "H"
    }),
    ...driverClass("dk", {
      "dk": "D",
      "dk-at": "DT",

      "cow": "C",
      "chuck": "V",
    }),
    ...driverClass("waluigi", {
      "waluigi": "w",
      "waluigi-pro": "wp",
      "waluigi-vampire": "wW",
      "waluigi-mariachi": "wM",
      "waluigi-biker": "wb",
      "waluigi-ruffian": "wR",

      "pianta": "A",
    }),

    // weight class 7
    ...driverClass("bowser", {
      "bowser": "B",
      "bowser-pro": "Bp",
      "bowser-charged": "BC",
      "bowser-biker": "Bb",
      "bowser-at": "BT"
    }),
  },
  bodies: {
    // weight class 0
    ...bikeClass("machBike", {
      machBike: "m",
      rob: "h"
    }),
    ...bikeClass("rallyBike", {
      rallyBike: "r",
      pipeBike: "p"
    }),
    ...bikeClass("fish", {
      fish: "f",
      dolphin: "d"
    }),

    // weight class 1
    ...kartClass("bloop", {
      bloop: "o",
    }),
    ...kartClass("biddy", {
      "biddy": "B",
    }),

    // weight class 3
    ...kartClass("dasher", {
      dasher: "b",
      royale: "e",
      rod: "M",
      bee: "V"
    }),
    ...kartClass("rally", {
      rally: "R",
      zoom: "Z"
    }),
    ...kartClass("cloud", {
      cloud: "9",
      carpet: "c",
      frog: "F"
    }),

    // weight class 5
    ...kartClass("horn", {
      horn: "H",
      bill: "z"
    }),
    ...kartClass("truck", {
      truck: "C",
      titan: "t",
      dump: "y"
    }),
    ...bodyClass("atv", "truck", {
      bruiser: "X"
    }),
    ...atv("trike", "Y"),

    // weight class 6
    ...kart("gator", "G"),
    ...atv("lobster", "L"),

    /// misc
    ...bikeClass("stdBike", {
      stdBike: "a",
      scoot: "s",
      radio: "O"
    }),
    ...kart("pipe", "P"),
    ...bike("loco", "l"),
    ...kart("blast", "3"),
    ...kartClass("std", {
      std: "A",
      plush: "T"
    }),
    ...bike("chopper", "w"),
    ...kart("reel", "k"),
    ...atv("junk", "J"),
    ...atv("dorrie", "D"),
    ...atv("dreadSled", "x"),
    ...kart("starSled", "S")
  }
};
const driverParts = Object.keys(parts.drivers);
const bodyParts   = Object.keys(parts.bodies);
const driverPartCount = driverParts.length;
const bodyPartCount   = bodyParts.length;
for (const id of driverParts) { parts.drivers[id].id = id; }
for (const id of bodyParts) { parts.bodies[id].id = id; }

const driverCodes = {};
for (const driver of driverParts) {
  driverCodes[parts.drivers[driver].code] = driver;
}
const bodyCodes = {};
for (const body of bodyParts) {
  bodyCodes[parts.bodies[body].code] = body;
}

const bodyVariants = {
  std: {
    luigi: "green",
    peach: "pink",
    daisy: "daisy",
    rosalina: "rosalina",
    birdo: "toadette",
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
    lakitu: "lightblue",
    toadette: "toadette",
    kingboo: "kingboo",
    petey: "green",
    luigiBb: "green",
    peachBb: "pink",
    daisyBb: "daisy",
    rosalinaBb: "rosalina",
    wiggler: "daisy",
    wario: "wario",
    waluigi: "waluigi",
    dk: "dk",
    bowser: "bowser",
    drybones: "drybones",
    bowserJr: "bowserJr"
  },
  pipe: {
    luigi: "green",
    peach: "pink",
    daisy: "orange",
    rosalina: "lightblue",
    birdo: "birdo",
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
    lakitu: "lightblue",
    toadette: "pink",
    kingboo: "black",
    luigiBb: "green",
    peachBb: "pink",
    daisyBb: "orange",
    rosalinaBb: "lightblue",
    wiggler: "orange",
    wario: "purple",
    waluigi: "waluigi",
    dk: "yellow",
    bowser: "bowser",
    drybones: "lightblue",
    bowserJr: "green"
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
  bikeStd: {
    luigi: "green",
    peach: "pink",
    daisy: "orange",
    rosalina: "rosalina",
    birdo: "toadette",
    yoshi: "yoshi",
      yoshi8: "orange",
    toad: "toad",
    koopa: "lightgreen",
    shyguy: "shyguy",
    lakitu: "lightblue",
    toadette: "toadette",
    kingboo: "kingboo",
    luigiBb: "green",
    peachBb: "pink",
    daisyBb: "orange",
    rosalinaBb: "rosalina",
    peachGold: "peachGold",
    wiggler: "orange",
    wario: "yellow",
    waluigi: "waluigi",
    dk: "dk",
    bowser: "bowser",
    drybones: "drybones",
    bowserJr: "bowserJr"
  }
};
function getBodyVariant(body, driver) {
  // const variant = bodyVariants[body]?.[driver];
  // if (variant != undefined) return "-" + variant;
  return "";
}

const partMorphemes = {
  drivers: {
    mario: { or: "Mario" },
    luigi: { or: "Luigi" },
    peach: { or: "Peach" },
    daisy: { or: "Daisy" },
    yoshi: { or: "Yoshi" },
    dk: { pre: "DK" },
    bowser: { or: "Bowser" },
    bowserJr: { post: "Jr.", full: "Bowser Jr." },
    koopa: { or: "Koopa" },
    toad: { or: "Toad" },
    toadette: { or: "Toadette" },
    lakitu: { or: "Lakitu" },
    kingboo: { or: "Boo" },
    shyguy: { pre: "Shy", post: "Guy", full: "Shy Guy" },
    wario: { pre: "Wario" },
    waluigi: { pre: "Waluigi" },
    birdo: { or: "Birdo" },
    pauline: { pre: "Pauline" },
    rosalina: { or: "Rosalina" },
    marioBb: { pre: "Baby" },
    luigiBb: { pre: "Baby" },
    peachBb: { pre: "Baby" },
    daisyBb: { pre: "Baby" },
    rosalinaBb: { pre: "Baby" },
    nabbit: { or: "Nabbit" },
    goomba: { or: "Goomba" },
    drybones: { post: "Bones", or: "Bones", full: "Dry Bones" },
    piranha: { or: "Piranha" },
    spike: { or: "Spike" },
    wiggler: { or: "Wiggler" },
    hammerbro: { pre: "Hammer" },
    crab: { post: "Stepper", pre: "Side", full: "Crab" },
    cataquack: { post: "Quack", pre: "Cata", full: "Cataquack" },
    mole: { post: "Mole", pre: "Monty", full: "Monty Mole" },
    cheep: { post: "Cheep", or: "Cheep", full: "Cheep Cheep" },
    pianta: { or: "Pianta" },
    wrench: { pre: "Rocky", post: "Wrench", full: "Rocky Wrench" },
    conkdor: { or: "Conkdor" },
    swoop: { or: "Swoop" },
    pokey: { or: "Pokey" },
    peepa: { or: "Peepa" },
    stingby: { or: "Stingby" },
    fishbone: { or: "Fish", post: "Bones", full: "Fish Bone" },
    coffer: { pre: "Coin", post: "Coffer", full: "Coin Coffer" },
    cow: { or: "Cow" },
    snowman: { pre: "Snow", full: "Snowman" },
    penguin: { or: "Penguin" },
    dolphin: { or: "Dolphin" },
    biddy: { pre: "Para-", full: "Para-Biddybud" },
    chuck: { post: "Chuck", pre: "Chargin’", full: "Chargin' Chuck" }
  },
  bodies: {
    std: { full: "Kart" },
    rally: { or: "Rally" },
    plush: { or: "Plushy" },
    bloop: { or: "Blooper" },
    zoom: { or: "Zoom" },
    truck: { post: "Truck", pre: "Chargin’" },
    rod: { post: "Rod", pre: "Hot" },
    frog: { or: "Revster" },
    royale: { or: "Royale" },
    dasher: { post: "-Dasher", pre: "Dasher" },
    biddy: { or: "Biddy" },
    titan: { or: "Titan" },
    starSled: { pre: "Stellar", or: "Sled" },
    reel: { or: "Racer" },
    bee: { or: "Bumble" },
    carpet: { or: "Flyer" },
    cloud: { or: "Cloud" },
    blast: { or: "Blast" },
    horn: { or: "Horn" },
    dump: { pre: "Li’l", or: "Dumpy" },
    trike: { pre: "Mecha", or: "Trike" },
    pipe: { or: "Pipe" },
    bill: { or: "Dozer" },
    dorrie: { post: "Dorrie", pre: "Funky" },
    junk: { or: "Hog" },
    lobster: { or: "Lobster" },
    dreadSled: { or: "Dread" },
    gator: { or: "Gator" },
    bruiser: { or: "Bruiser" },
    stdBike: { or: "Bike" },
    rallyBike: { or: "Rally" },
    scoot: { or: "Scoot", pre: "Cute" },
    machBike: { or: "Rocket" },
    pipeBike: { pre: "Hyper", or: "Pipe" },
    radio: { or: "Thumper" },
    chopper: { or: "Chopper" },
    fish: { or: "Fin" },
    rob: { or: "H. O. G." },
    dolphin: { or: "Dasher", pre: "Dolphin" },
    loco: { or: "Moto", pre: "Loco" }
  }
};
function getComboName(driver, body) {
  let driverMorphs = partMorphemes.drivers[driver];
  if (!driverMorphs) driverMorphs = partMorphemes.drivers[driver.replaceAll(/-\w+$/g, "")];
  const bodyMorphs = partMorphemes.bodies[body];

  // Special Cases
  if (driver == "mario" && body == "std") return "The Standard";

  // Generative
  if (Object.keys(bodyMorphs)[0] == "full") {
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
  if (fstDashed != sndDashed) return fst + snd; // XOR
  if (fstDashed && sndDashed) return fst + snd.substring(1);
  return fst + " " + snd;
}
String.prototype.isAny = function(...patterns) {
  for (const pattern of patterns) {
    if (this == pattern) return true;
  }
  return false;
};

function randomInt(a, b) {
  if (b == undefined) {
    b = a;
    a = 0;
  }
  return Math.floor(Math.random() * (b - a) + a);
}

function displayAverage(...xs) {
  // The gameplay has a base stat of 3,
  // but the game display does some weird rounding on the terrain-types
  // making it appear like the base stat is 2
  return Math.round(xs.reduce((accum, x) => accum + x - 1, 0.0) / xs.length);
}