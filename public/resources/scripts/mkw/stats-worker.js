"use strict";
// Stats Worker

let version = "latest";

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
    case "listCombos":
      response[1] = listCombos(...args);
      break;
    case "getAvailableParts":
      response[1] = getAvailableParts(...args);
      break;
    case "setTerrainRatios":
      response[1] = setTerrainRatios(...args);
      break;
    case "setVersion":
      response[1] = setVersion(...args);
      break;
    default:
      response[1] = "Error: Unknown command: “" + cmd + "”";
  }

  postMessage(response);
};

const statIndex = { mtb: 0, spdSr: 1, spdRr: 2, spdWt: 3, acc: 4,
                    wgt: 5, hndSr: 6, hndRr: 7, hndWt: 8, size: 9,
                    spd: 10, hnd: 11 };
const stats = [ "mtb", "spdSr", "spdRr", "spdWt", "acc",
                "wgt", "hndSr", "hndRr", "hndWt", "size", "spd", "hnd" ];

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
  lvl = [0,0,0,0,0,0,0,0,0];
  size = -1;

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

    this.parts.driver = parts.drivers[driver];
    this.parts.body   = parts.bodies[body];

    const driverClassID = this.parts.driver.class;
    const bodyClassID   = this.parts.body.class;

    this.classes.driver = classes.drivers[driverClassID];
    this.classes.body   = classes.bodies[bodyClassID];

    if (this.classes.body === undefined) console.log(body, bodyClassID)

    for (let stat = 0; stat < 9; stat++) {
      let lvl = 0;
      lvl += this.classes.driver[stat];
      lvl += this.classes.body[stat];
      this.lvl[stat] = lvl;
    }
    this.size = this.classes.driver[statIndex.size];
    this.lvl[statIndex.size] = this.size * 10;
    this.lvl[statIndex.spd] = round(this.lvl[statIndex.spdSr] * Combo.PERCENT_GR
                                  + this.lvl[statIndex.spdRr] * Combo.PERCENT_RR
                                  + this.lvl[statIndex.spdWt] * Combo.PERCENT_WT, 3);
    this.lvl[statIndex.hnd] = round(this.lvl[statIndex.hndSr] * Combo.PERCENT_GR
                                  + this.lvl[statIndex.hndRr] * Combo.PERCENT_RR
                                  + this.lvl[statIndex.hndWt] * Combo.PERCENT_WT, 3);

    this.name = getComboName(driver, body);
  }

  static fromCode(code) {
    // TODO: check code
    let driverCode, bodyCode;
    if (code.length === 2) {
      driverCode = code[0];
      bodyCode   = code[1];
    } else if (code.length === 3) {
      driverCode = code.substring(0, 2);
      bodyCode   = code.substring(2, 3);
    } else {
      return new Combo();
    }

    const driver = driverCodes[driverCode];
    const body   = bodyCodes[bodyCode];
    return new Combo(driver, body);
  }

  // Data from ItsManu001 [docs.google.com/spreadsheets/d/1EQd2XYGlB3EFFNE-35hFLaBzJo4cipU9DZT4MRSjBlc]
  static PERCENT_GR = .65; // Estimated percent of time on smooth road.
  static PERCENT_RR = .25; // Estimated percent of time on rough road.
  static PERCENT_WT = .10; // Estimated percent of time on water.
}

function getCombo(...args) {
  if (args.length === 1) { // From code
    return Combo.fromCode(args[0]);
  } else if (args.length === 2) { // From part IDs
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
  // const drivers = [
  //   [ "mario", "mario-touring", "mario-pro", "mario-mech", "mario-desert", "mario-cowboy", "mario-sight", "mario-aviator", "mario-festival", "mario-at" ],
  //   [ "luigi", "luigi-touring", "luigi-pro", "luigi-mech", "luigi-desert", "luigi-farmer", "luigi-festival", "luigi-at", "luigi-gondolier" ],
  //   [ "peach", "peach-touring", "peach-pro", "peach-farmer", "peach-sight", "peach-aviator", "peach-festival", "peach-aero", "peach-vacation" ],
  //   [ "daisy", "daisy-touring", "daisy-pro", "daisy-desert", "daisy-swim", "daisy-aero", "daisy-vacation" ],
  //   [ "yoshi", "yoshi-touring", "yoshi-pro", "yoshi-aristocrat", "yoshi-ice", "yoshi-biker", "yoshi-swim", "yoshi-festival", "yoshi-food" ],
  //   [ "dk", "dk-at" ],
  //   [ "bowser", "bowser-pro", "bowser-charged", "bowser-biker", "bowser-at" ],
  //   [ "bowserJr", "bowserJr-pro", "bowserJr-biker", "bowserJr-explorer" ],
  //   [ "koopa", "koopa-runner", "koopa-pro", "koopa-sailor", "koopa-at", "koopa-work" ],
  //   [ "toad", "toad-pro", "toad-engi", "toad-burger", "toad-explorer" ],
  //   [ "toadette", "toadette-pro", "toadette-conductor", "toadette-ice", "toadette-explorer" ],
  //   [ "lakitu", "lakitu-pit", "lakitu-fish" ],
  //   [ "kingboo", "kingboo-pro", "kingboo-aristocrat", "kingboo-pirate" ],
  //   [ "shyguy", "shyguy-pit", "shyguy-ski" ],
  //   [ "wario", "wario-pro", "wario-desert", "wario-bee", "wario-biker", "wario-pirate", "wario-ruffian", "wario-work" ],
  //   [ "waluigi", "waluigi-pro", "waluigi-vampire", "waluigi-mariachi", "waluigi-biker", "waluigi-ruffian" ],
  //   [ "birdo", "birdo-pro", "birdo-vacation" ],
  //   [ "pauline", "pauline-aero" ],
  //   [ "rosalina", "rosalina-touring", "rosalina-pro", "rosalina-aurora", "rosalina-aero" ],
  //   [ "marioBb", "marioBb-pro", "marioBb-swim", "marioBb-work" ],
  //   [ "luigiBb", "luigiBb-pro", "luigiBb-work" ],
  //   [ "peachBb", "peachBb-touring", "peachBb-pro", "peachBb-sailor", "peachBb-explorer" ],
  //   [ "daisyBb", "daisyBb-touring", "daisyBb-pro", "daisyBb-sailor", "daisyBb-explorer" ],
  //   [ "rosalinaBb", "rosalinaBb-touring", "rosalinaBb-pro", "rosalinaBb-sailor", "rosalinaBb-explorer" ],
  //   "nabbit",
  //   "goomba",
  //   "drybones",
  //   "piranha",
  //   "spike",
  //   "wiggler",
  //   "hammerbro",
  //   "crab",
  //   "cataquack",
  //   "mole",
  //   "cheep",
  //   "pianta",
  //   "wrench",
  //   "conkdor",
  //   "swoop",
  //   "pokey",
  //   "peepa",
  //   "stingby",
  //   "fishbone",
  //   "coffer",
  //   "cow",
  //   "snowman",
  //   "penguin",
  //   "dolphin",
  //   "biddy",
  //   "chuck"
  // ];
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
  const mtbMin   = opts.min?.[statIndex.mtb]   ?? 0; const mtbMax = opts.max?.[statIndex.mtb]     ?? 20;
  const spdSrMin = opts.min?.[statIndex.spdSr] ?? 0; const spdSrMax = opts.max?.[statIndex.spdSr] ?? 20;
  const spdRrMin = opts.min?.[statIndex.spdRr] ?? 0; const spdRrMax = opts.max?.[statIndex.spdRr] ?? 20;
  const spdWtMin = opts.min?.[statIndex.spdWt] ?? 0; const spdWtMax = opts.max?.[statIndex.spdWt] ?? 20;
  const accMin   = opts.min?.[statIndex.acc]   ?? 0; const accMax   = opts.max?.[statIndex.acc]   ?? 20;
  const wgtMin   = opts.min?.[statIndex.wgt]   ?? 0; const wgtMax   = opts.max?.[statIndex.wgt]   ?? 20;
  const hndSrMin = opts.min?.[statIndex.hndSr] ?? 0; const hndSrMax = opts.max?.[statIndex.hndSr] ?? 20;
  const hndRrMin = opts.min?.[statIndex.hndRr] ?? 0; const hndRrMax = opts.max?.[statIndex.hndRr] ?? 20;
  const hndWtMin = opts.min?.[statIndex.hndWt] ?? 0; const hndWtMax = opts.max?.[statIndex.hndWt] ?? 20;
  const sizeMin  = opts.min?.[statIndex.size]  ?? 0; const sizeMax  = opts.max?.[statIndex.size]  ?? 2;
  const spdMin   = opts.min?.[statIndex.spd]   ?? 0; const spdMax   = opts.max?.[statIndex.spd]   ?? 20;
  const hndMin   = opts.min?.[statIndex.hnd]   ?? 0; const hndMax   = opts.max?.[statIndex.hnd]   ?? 20;
  const excludeKarts = opts.excludeKarts ?? false;
  const excludeATVs  = opts.excludeATVs  ?? false;
  const excludeBikes = opts.excludeBikes ?? false;
  const sortBy = opts.sortBy ?? "diff";
  const factors = opts.factors ?? [0,0,0,0,0,0,0,0,0,0,0];
  const limit = opts.limit ?? 51;


  // IDEA: If this is still too slow, I should try to calculate partial diffs
  //       and scores to eliminate whole classes in droves.
  const list = [];
  for (let driver of driverClasses) {
    if (driverLock && driver !== refCombo.parts.driver.class) continue;
    if (classes.drivers[driver][statIndex.size] < sizeMin || classes.drivers[driver][statIndex.size] > sizeMax) continue;
  for (let body of bodyClasses) {
    if (bodyLock && body !== refCombo.parts.body.class) continue;
    if (excludeKarts && parts.bodies[body].type === "kart") continue;
    if (excludeATVs  && parts.bodies[body].type === "atv")  continue;
    if (excludeBikes && parts.bodies[body].type === "bike") continue;

    // Auto variants
    if (refCombo.parts.driver.class === driver) driver = refCombo.driverID;
    if (refCombo.parts.body.class   === body)     body = refCombo.bodyID;
    const combo = new Combo(driver, body);

    // Stat Checks
    if (combo.lvl[statIndex.mtb]   < mtbMin   || combo.lvl[statIndex.mtb]   > mtbMax)   continue;
    if (combo.lvl[statIndex.spdSr] < spdSrMin || combo.lvl[statIndex.spdSr] > spdSrMax) continue;
    if (combo.lvl[statIndex.spdRr] < spdRrMin || combo.lvl[statIndex.spdRr] > spdRrMax) continue;
    if (combo.lvl[statIndex.spdWt] < spdWtMin || combo.lvl[statIndex.spdWt] > spdWtMax) continue;
    if (combo.lvl[statIndex.acc]   < accMin   || combo.lvl[statIndex.acc]   > accMax)   continue;
    if (combo.lvl[statIndex.wgt]   < wgtMin   || combo.lvl[statIndex.wgt]   > wgtMax)   continue;
    if (combo.lvl[statIndex.hndSr] < hndSrMin || combo.lvl[statIndex.hndSr] > hndSrMax) continue;
    if (combo.lvl[statIndex.hndRr] < hndRrMin || combo.lvl[statIndex.hndRr] > hndRrMax) continue;
    if (combo.lvl[statIndex.hndWt] < hndWtMin || combo.lvl[statIndex.hndWt] > hndWtMax) continue;
    if (combo.lvl[statIndex.spd]   < spdMin   || combo.lvl[statIndex.spd]   > spdMax)   continue;
    if (combo.lvl[statIndex.hnd]   < hndMin   || combo.lvl[statIndex.hnd]   > hndMax)   continue;

    // Difference Checks
    const diffs = [
      combo.lvl[statIndex.mtb]   - refCombo.lvl[statIndex.mtb],
      combo.lvl[statIndex.spdSr] - refCombo.lvl[statIndex.spdSr],
      combo.lvl[statIndex.spdRr] - refCombo.lvl[statIndex.spdRr],
      combo.lvl[statIndex.spdWt] - refCombo.lvl[statIndex.spdWt],
      combo.lvl[statIndex.acc]   - refCombo.lvl[statIndex.acc],
      combo.lvl[statIndex.wgt]   - refCombo.lvl[statIndex.wgt],
      combo.lvl[statIndex.hndSr] - refCombo.lvl[statIndex.hndSr],
      combo.lvl[statIndex.hndRr] - refCombo.lvl[statIndex.hndRr],
      combo.lvl[statIndex.hndWt] - refCombo.lvl[statIndex.hndWt]
    ];

    const diffSum = diffs.reduce((s, a) => s + a, 0); // sum
    if (diffSum > maxDiff || diffSum < minDiff) continue;

    const diffSumAbs = diffs.reduce((s, a) => s + Math.abs(a), 0);
    if (diffSumAbs > maxAbsDiff) continue;
    if (mustDiffer && diffSumAbs === 0) continue;

    combo.diffs = diffs;
    combo.diffSum = diffSum;
    combo.diffSumAbs = diffSumAbs;

    list.push(combo);
  } }

  // Sort
  let compare = (a, b) => b.lvl[statIndex[sortBy]] - a.lvl[statIndex[sortBy]];
  switch (sortBy) {
    case "diff":
      compare = (a, b) => b.diffSum - a.diffSum;
      break;
    case "similar":
      compare = (a, b) => {
        const s = a.diffSumAbs - b.diffSumAbs;
        if (s === 0) return b.diffSum - a.diffSum;
        return s;
      };
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
  for (let i = 0; i < 12; i++) {
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
          parts.bodies.fin,
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
  //         parts.drivers["mario-desert"],
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
  //         parts.drivers["luigi-desert"],
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
  //         parts.drivers["daisy-desert"],
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
  //         parts.drivers["wario-desert"],
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
  //         parts.bodies.fin,
  //         parts.bodies.rob,
  //         parts.bodies.dolphin,
  //         parts.bodies.loco ]
  //     }
  //   ]
  // };
}

function setTerrainRatios(gr, rr, wt) {
  if (gr+rr+wt !== 1) throw "Error: Terrain ratios do not add up to 1";
  Combo.PERCENT_GR = gr;
  Combo.PERCENT_RR = rr;
  Combo.PERCENT_WT = wt;
}

function setVersion(version) {
  switch (version) {
    case "1.1.2":
      classes.bodies.rallyBike[statIndex.hndSr] = 0
      break;
    default:
      classes.bodies.rallyBike[statIndex.hndSr] = 6
  }
  return;
}

const classes = { // [mtb, spdSr, spdRr, spdWt, acc, wgt, hndSr, hndRr, hndWt, size]
  drivers: {
    mario:      [1,4,3,3,3,4,4,2,2,1],
    luigi:      [1,3,4,3,3,4,2,4,2,1],
    peach:      [2,3,2,2,4,3,5,3,3,1],
    yoshi:      [2,2,3,2,4,3,3,5,3,1],
    dk:         [0,5,6,5,1,6,0,2,0,2],
    bowser:     [0,6,6,6,0,7,0,0,0,2],
    bowserJr:   [2,2,2,3,4,3,3,3,5,1],
    koopa:      [3,1,1,2,5,2,4,4,6,0],
    toad:       [3,1,2,1,5,2,4,6,4,0],
    toadette:   [3,2,1,1,5,2,6,4,4,0],
    kingboo:    [0,4,5,4,2,5,1,3,1,2],
    wario:      [0,6,5,5,1,6,2,0,0,2],
    waluigi:    [0,5,5,6,1,6,0,0,2,2],
    birdo:      [1,3,3,4,3,4,2,2,4,1],
    pauline:    [0,5,4,4,2,5,3,1,1,2],
    rosalina:   [0,4,4,5,2,5,1,1,3,2],
    marioBb:    [3,1,0,0,6,1,7,5,5,0],
    luigiBb:    [3,0,1,0,6,1,5,7,5,0],
    peachBb:    [4,0,0,0,7,0,6,6,6,0],
    rosalinaBb: [3,0,0,1,6,1,5,5,7,0]
  },
  bodies: {
    std:       [5,5,5,5,5,2,5,5,5],
    rally:     [4,4,8,4,4,3,3,8,3],
    stdBike:   [9,1,1,1,9,0,7,7,7],
    rallyBike: [8,0,5,0,8,0,6,10,6],
    bloop:     [6,7,2,2,6,1,9,5,5],
    machBike:  [7,6,1,1,7,0,10,6,6],
    truck:     [1,7,10,7,1,5,1,7,1],
    dorrie:    [5,4,4,8,5,4,1,1,6],
    rod:       [4,8,4,4,4,3,8,3,3],
    frog:      [4,4,4,8,4,3,3,3,8],
    junk:      [3,8,8,8,3,4,2,2,2],
    chopper:   [3,7,7,7,3,2,5,5,5],
    lobster:   [2,7,7,10,2,6,0,0,5],
    biddy:     [7,1,6,1,7,1,5,9,5],
    dreadSled: [3,3,9,5,3,3,3,9,4],
    starSled:  [0,6,8,11,0,5,1,2,8],
    reel:      [2,8,8,8,2,3,4,4,4],
    fin:       [8,0,0,5,8,0,6,6,10],
    blast:     [6,5,5,5,6,3,3,3,3],
    horn:      [2,9,6,6,2,5,7,1,1],
    loco:      [6,4,4,4,6,1,6,6,6],
    trike:     [1,7,7,10,1,5,1,1,7],
    pipe:      [8,2,2,2,8,1,6,6,6],
    gator:     [3,9,6,6,3,6,5,0,0],
  }
};
const driverClasses = Object.keys(classes.drivers);
const bodyClasses   = Object.keys(classes.bodies);
const driverClassCount = driverClasses.length;
const bodyClassCount   = bodyClasses.length;

const parts = {
  drivers: {
    mario: {
      class: "mario",
      group: "mario",
      code: "M"
    },
      "mario-touring": {
        class: "mario",
        group: "mario",
        code: "Mt"
      },
      "mario-pro": {
        class: "mario",
        group: "mario",
        code: "Mp"
      },
      "mario-mech": {
        class: "mario",
        group: "mario",
        code: "Mm"
      },
      "mario-desert": {
        class: "mario",
        group: "mario",
        code: "Md"
      },
      "mario-cowboy": {
        class: "mario",
        group: "mario",
        code: "MC"
      },
      "mario-sight": {
        class: "mario",
        group: "mario",
        code: "MS"
      },
      "mario-aviator": {
        class: "mario",
        group: "mario",
        code: "MP"
      },
      "mario-festival": {
        class: "mario",
        group: "mario",
        code: "Mh"
      },
      "mario-at": {
        class: "mario",
        group: "mario",
        code: "MT"
      },
    luigi: {
      class: "luigi",
      group: "luigi",
      code: "L"
    },
      "luigi-touring": {
        class: "luigi",
        group: "luigi",
        code: "Lt"
      },
      "luigi-pro": {
        class: "luigi",
        group: "luigi",
        code: "Lp"
      },
      "luigi-mech": {
        class: "luigi",
        group: "luigi",
        code: "Lm"
      },
      "luigi-desert": {
        class: "luigi",
        group: "luigi",
        code: "Ld"
      },
      "luigi-farmer": {
        class: "luigi",
        group: "luigi",
        code: "Lf"
      },
      "luigi-festival": {
        class: "luigi",
        group: "luigi",
        code: "Lh"
      },
      "luigi-at": {
        class: "luigi",
        group: "luigi",
        code: "LT"
      },
      "luigi-gondolier": {
        class: "luigi",
        group: "luigi",
        code: "LG"
      },
    peach: {
      class: "peach",
      group: "peach",
      code: "P"
    },
      "peach-touring": {
        class: "peach",
        group: "peach",
        code: "Pt"
      },
      "peach-pro": {
        class: "peach",
        group: "peach",
        code: "Pp"
      },
      "peach-farmer": {
        class: "peach",
        group: "peach",
        code: "Pf"
      },
      "peach-sight": {
        class: "peach",
        group: "peach",
        code: "PS"
      },
      "peach-aviator": {
        class: "peach",
        group: "peach",
        code: "PP"
      },
      "peach-festival": {
        class: "peach",
        group: "peach",
        code: "Py"
      },
      "peach-aero": {
        class: "peach",
        group: "peach",
        code: "Pa"
      },
      "peach-vacation": {
        class: "peach",
        group: "peach",
        code: "Pv"
      },
    daisy: {
      class: "peach",
      group: "peach",
      code: "J"
    },
      "daisy-touring": {
        class: "peach",
        group: "peach",
        code: "Jt"
      },
      "daisy-pro": {
        class: "peach",
        group: "peach",
        code: "Jp"
      },
      "daisy-desert": {
        class: "peach",
        group: "peach",
        code: "Jd"
      },
      "daisy-swim": {
        class: "peach",
        group: "peach",
        code: "JW"
      },
      "daisy-aero": {
        class: "peach",
        group: "peach",
        code: "Ja"
      },
      "daisy-vacation": {
        class: "peach",
        group: "peach",
        code: "Jv"
      },
    yoshi: {
      class: "yoshi",
      group: "yoshi",
      code: "Y"
    },
      "yoshi-touring": {
        class: "yoshi",
        group: "yoshi",
        code: "Y5"
      },
      "yoshi-pro": {
        class: "yoshi",
        group: "yoshi",
        code: "Y3"
      },
      "yoshi-aristocrat": {
        class: "yoshi",
        group: "yoshi",
        code: "Y9"
      },
      "yoshi-ice": {
        class: "yoshi",
        group: "yoshi",
        code: "Y7"
      },
      "yoshi-biker": {
        class: "yoshi",
        group: "yoshi",
        code: "Y6"
      },
      "yoshi-swim": {
        class: "yoshi",
        group: "yoshi",
        code: "Y8"
      },
      "yoshi-festival": {
        class: "yoshi",
        group: "yoshi",
        code: "Y4"
      },
      "yoshi-food": {
        class: "yoshi",
        group: "yoshi",
        code: "Y1"
      },
    dk: {
      class: "dk",
      group: "dk",
      code: "D"
    },
      "dk-at": {
        class: "dk",
        group: "dk",
        code: "DT"
      },
    bowser: {
      class: "bowser",
      group: "bowser",
      code: "B"
    },
      "bowser-pro": {
        class: "bowser",
        group: "bowser",
        code: "Bp"
      },
      "bowser-charged": {
        class: "bowser",
        group: "bowser",
        code: "BC"
      },
      "bowser-biker": {
        class: "bowser",
        group: "bowser",
        code: "Bb"
      },
      "bowser-at": {
        class: "bowser",
        group: "bowser",
        code: "BT"
      },
    bowserJr: {
      class: "bowserJr",
      group: "bowserJr",
      code: "b"
    },
      "bowserJr-pro": {
        class: "bowserJr",
        group: "bowserJr",
        code: "bp"
      },
      "bowserJr-biker": {
        class: "bowserJr",
        group: "bowserJr",
        code: "bb"
      },
      "bowserJr-explorer": {
        class: "bowserJr",
        group: "bowserJr",
        code: "be"
      },
    koopa: {
      class: "koopa",
      group: "koopa",
      code: "k"
    },
      "koopa-runner": {
        class: "koopa",
        group: "koopa",
        code: "kR"
      },
      "koopa-pro": {
        class: "koopa",
        group: "koopa",
        code: "kp"
      },
      "koopa-sailor": {
        class: "koopa",
        group: "koopa",
        code: "ks"
      },
      "koopa-at": {
        class: "koopa",
        group: "koopa",
        code: "kT"
      },
      "koopa-work": {
        class: "koopa",
        group: "koopa",
        code: "kw"
      },
    toad: {
      class: "toad",
      group: "toad",
      code: "T"
    },
      "toad-pro": {
        class: "toad",
        group: "toad",
        code: "Tp"
      },
      "toad-engi": {
        class: "toad",
        group: "toad",
        code: "TE"
      },
      "toad-burger": {
        class: "toad",
        group: "toad",
        code: "TB"
      },
      "toad-explorer": {
        class: "toad",
        group: "toad",
        code: "Te"
      },
    toadette: {
      class: "toadette",
      group: "toadette",
      code: "t"
    },
      "toadette-pro": {
        class: "toadette",
        group: "toadette",
        code: "tp"
      },
      "toadette-conductor": {
        class: "toadette",
        group: "toadette",
        code: "tC"
      },
      "toadette-ice": {
        class: "toadette",
        group: "toadette",
        code: "tI"
      },
      "toadette-explorer": {
        class: "toadette",
        group: "toadette",
        code: "te"
      },
    lakitu: {
      class: "koopa",
      group: "koopa",
      code: "u"
    },
      "lakitu-pit": {
        class: "koopa",
        group: "koopa",
        code: "up"
      },
      "lakitu-fish": {
        class: "koopa",
        group: "koopa",
        code: "uF"
      },
    kingboo: {
      class: "kingboo",
      group: "kingboo",
      code: "K"
    },
      "kingboo-pro": {
        class: "kingboo",
        group: "kingboo",
        code: "Kp"
      },
      "kingboo-aristocrat": {
        class: "kingboo",
        group: "kingboo",
        code: "KA"
      },
      "kingboo-pirate": {
        class: "kingboo",
        group: "kingboo",
        code: "KP"
      },
    shyguy: {
      class: "toad",
      group: "toad",
      code: "s"
    },
      "shyguy-pit": {
        class: "toad",
        group: "toad",
        code: "sp"
      },
      "shyguy-ski": {
        class: "toad",
        group: "toad",
        code: "sS"
      },
    wario: {
      class: "wario",
      group: "wario",
      code: "W"
    },
      "wario-pro": {
        class: "wario",
        group: "wario",
        code: "Wp"
      },
      "wario-desert": {
        class: "wario",
        group: "wario",
        code: "Wd"
      },
      "wario-bee": {
        class: "wario",
        group: "wario",
        code: "WW"
      },
      "wario-biker": {
        class: "wario",
        group: "wario",
        code: "Wb"
      },
      "wario-pirate": {
        class: "wario",
        group: "wario",
        code: "WP"
      },
      "wario-ruffian": {
        class: "wario",
        group: "wario",
        code: "WE"
      },
      "wario-work": {
        class: "wario",
        group: "wario",
        code: "Ww"
      },
    waluigi: {
      class: "waluigi",
      group: "waluigi",
      code: "w"
    },
      "waluigi-pro": {
        class: "waluigi",
        group: "waluigi",
        code: "wp"
      },
      "waluigi-vampire": {
        class: "waluigi",
        group: "waluigi",
        code: "wW"
      },
      "waluigi-mariachi": {
        class: "waluigi",
        group: "waluigi",
        code: "wM"
      },
      "waluigi-biker": {
        class: "waluigi",
        group: "waluigi",
        code: "wb"
      },
      "waluigi-ruffian": {
        class: "waluigi",
        group: "waluigi",
        code: "wR"
      },
    birdo: {
      class: "birdo",
      group: "birdo",
      code: "y"
    },
      "birdo-pro": {
        class: "birdo",
        group: "birdo",
        code: "yp"
      },
      "birdo-vacation": {
        class: "birdo",
        group: "birdo",
        code: "yv"
      },
    pauline: {
      class: "pauline",
      group: "pauline",
      code: "U"
    },
      "pauline-aero": {
        class: "pauline",
        group: "pauline",
        code: "Ua"
      },
    rosalina: {
      class: "rosalina",
      group: "rosalina",
      code: "R"
    },
      "rosalina-touring": {
        class: "rosalina",
        group: "rosalina",
        code: "Rt"
      },
      "rosalina-pro": {
        class: "rosalina",
        group: "rosalina",
        code: "Rp"
      },
      "rosalina-aurora": {
        class: "rosalina",
        group: "rosalina",
        code: "RA"
      },
      "rosalina-aero": {
        class: "rosalina",
        group: "rosalina",
        code: "Ra"
      },
    marioBb: {
      class: "marioBb",
      group: "marioBb",
      code: "m"
    },
      "marioBb-pro": {
        class: "marioBb",
        group: "marioBb",
        code: "mp"
      },
      "marioBb-swim": {
        class: "marioBb",
        group: "marioBb",
        code: "mW"
      },
      "marioBb-work": {
        class: "marioBb",
        group: "marioBb",
        code: "mw"
      },
    luigiBb: {
      class: "luigiBb",
      group: "luigiBb",
      code: "l"
    },
      "luigiBb-pro": {
        class: "luigiBb",
        group: "luigiBb",
        code: "lp"
      },
      "luigiBb-work": {
        class: "luigiBb",
        group: "luigiBb",
        code: "lw"
      },
    peachBb: {
      class: "peachBb",
      group: "peachBb",
      code: "p"
    },
      "peachBb-touring": {
        class: "peachBb",
        group: "peachBb",
        code: "pt"
      },
      "peachBb-pro": {
        class: "peachBb",
        group: "peachBb",
        code: "pp"
      },
      "peachBb-sailor": {
        class: "peachBb",
        group: "peachBb",
        code: "ps"
      },
      "peachBb-explorer": {
        class: "peachBb",
        group: "peachBb",
        code: "pe"
      },
    daisyBb: {
      class: "peachBb",
      group: "peachBb",
      code: "j"
    },
      "daisyBb-touring": {
        class: "peachBb",
        group: "peachBb",
        code: "jt"
      },
      "daisyBb-pro": {
        class: "peachBb",
        group: "peachBb",
        code: "jp"
      },
      "daisyBb-sailor": {
        class: "peachBb",
        group: "peachBb",
        code: "js"
      },
      "daisyBb-explorer": {
        class: "peachBb",
        group: "peachBb",
        code: "je"
      },
    rosalinaBb: {
      class: "rosalinaBb",
      group: "rosalinaBb",
      code: "r"
    },
      "rosalinaBb-touring": {
        class: "rosalinaBb",
        group: "rosalinaBb",
        code: "rt"
      },
      "rosalinaBb-pro": {
        class: "rosalinaBb",
        group: "rosalinaBb",
        code: "rp"
      },
      "rosalinaBb-sailor": {
        class: "rosalinaBb",
        group: "rosalinaBb",
        code: "rs"
      },
      "rosalinaBb-explorer": {
        class: "rosalinaBb",
        group: "rosalinaBb",
        code: "re"
      },
    nabbit: {
      class: "toadette",
      group: "toadette",
      code: "n"
    },
    goomba: {
      class: "marioBb",
      group: "marioBb",
      code: "g"
    },
    drybones: {
      class: "luigiBb",
      group: "luigiBb",
      code: "x"
    },
    piranha: {
      class: "pauline",
      group: "pauline",
      code: "X"
    },
    spike: {
      class: "marioBb",
      group: "marioBb",
      code: "S"
    },
    wiggler: {
      class: "wario",
      group: "wario",
      code: "H"
    },
    hammerbro: {
      class: "luigi",
      group: "luigi",
      code: "v"
    },
    crab: {
      class: "rosalinaBb",
      group: "rosalinaBb",
      code: "i"
    },
    cataquack: {
      class: "rosalina",
      group: "rosalina",
      code: "a"
    },
    mole: {
      class: "yoshi",
      group: "yoshi",
      code: "E"
    },
    cheep: {
      class: "koopa",
      group: "koopa",
      code: "Q"
    },
    pianta: {
      class: "waluigi",
      group: "waluigi",
      code: "A"
    },
    wrench: {
      class: "mario",
      group: "mario",
      code: "e"
    },
    conkdor: {
      class: "kingboo",
      group: "kingboo",
      code: "c"
    },
    swoop: {
      class: "peachBb",
      group: "peachBb",
      code: "o"
    },
    pokey: {
      class: "luigi",
      group: "luigi",
      code: "O"
    },
    peepa: {
      class: "luigiBb",
      group: "luigiBb",
      code: "Z"
    },
    stingby: {
      class: "toad",
      group: "toad",
      code: "z"
    },
    fishbone: {
      class: "rosalinaBb",
      group: "rosalinaBb",
      code: "q"
    },
    coffer: {
      class: "peach",
      group: "peach",
      code: "G"
    },
    cow: {
      class: "dk",
      group: "dk",
      code: "C"
    },
    snowman: {
      class: "pauline",
      group: "pauline",
      code: "8"
    },
    penguin: {
      class: "birdo",
      group: "birdo",
      code: "N"
    },
    dolphin: {
      class: "bowserJr",
      group: "bowserJr",
      code: "h"
    },
    biddy: {
      class: "peachBb",
      group: "peachBb",
      code: "I"
    },
    chuck: {
      class: "dk",
      group: "dk",
      code: "V"
    }
  },
  bodies: {
    std: {
      type: "kart",
      class: "std",
      group: "std",
      code: "A"
    },
    rally: {
      type: "kart",
      class: "rally",
      group: "rally",
      code: "R"
    },
    stdBike: {
      type: "bike",
      class: "stdBike",
      group: "stdBike",
      code: "a"
    },
    rallyBike: {
      type: "bike",
      class: "rallyBike",
      group: "rallyBike",
      code: "r"
    },
    plush: {
      type: "kart",
      class: "std",
      group: "std",
      code: "T"
    },
    bloop: {
      type: "kart",
      class: "bloop",
      group: "bloop",
      code: "o"
    },
    scoot: {
      type: "bike",
      class: "stdBike",
      group: "stdBike",
      code: "s"
    },
    machBike: {
      type: "bike",
      class: "machBike",
      group: "machBike",
      code: "m"
    },
    zoom: {
      type: "kart",
      class: "rally",
      group: "rally",
      code: "Z"
    },
    truck: {
      type: "kart",
      class: "truck",
      group: "truck",
      code: "C"
    },
    pipeBike: {
      type: "bike",
      class: "rallyBike",
      group: "rallyBike",
      code: "p"
    },
    dorrie: {
      type: "atv",
      class: "dorrie",
      group: "dorrie",
      code: "D"
    },
    rod: {
      type: "kart",
      class: "rod",
      group: "rod",
      code: "M"
    },
    frog: {
      type: "kart",
      class: "frog",
      group: "frog",
      code: "F"
    },
    radio: {
      type: "bike",
      class: "stdBike",
      group: "stdBike",
      code: "O"
    },
    junk: {
      type: "atv",
      class: "junk",
      group: "junk",
      code: "J"
    },
    royale: {
      type: "kart",
      class: "rod",
      group: "rod",
      code: "e"
    },
    dasher: {
      type: "kart",
      class: "rod",
      group: "rod",
      code: "b"
    },
    chopper: {
      type: "bike",
      class: "chopper",
      group: "chopper",
      code: "w"
    },
    lobster: {
      type: "atv",
      class: "lobster",
      group: "lobster",
      code: "L"
    },
    biddy: {
      type: "kart",
      class: "biddy",
      group: "biddy",
      code: "B"
    },
    titan: {
      type: "kart",
      class: "truck",
      group: "truck",
      code: "t"
    },
    dreadSled: {
      type: "atv",
      class: "dreadSled",
      group: "dreadSled",
      code: "x"
    },
    starSled: {
      type: "kart",
      class: "starSled",
      group: "starSled",
      code: "S"
    },
    reel: {
      type: "kart",
      class: "reel",
      group: "reel",
      code: "k"
    },
    bee: {
      type: "kart",
      class: "rod",
      group: "rod",
      code: "V"
    },
    fin: {
      type: "bike",
      class: "fin",
      group: "fin",
      code: "f"
    },
    rob: {
      type: "bike",
      class: "machBike",
      group: "machBike",
      code: "h"
    },
    carpet: {
      type: "kart",
      class: "frog",
      group: "frog",
      code: "c"
    },
    cloud: {
      type: "kart",
      class: "frog",
      group: "frog",
      code: "9"
    },
    dolphin: {
      type: "bike",
      class: "fin",
      group: "fin",
      code: "d"
    },
    blast: {
      type: "kart",
      class: "blast",
      group: "blast",
      code: "3"
    },
    horn: {
      type: "kart",
      class: "horn",
      group: "horn",
      code: "H"
    },
    dump: {
      type: "kart",
      class: "truck",
      group: "truck",
      code: "y"
    },
    loco: {
      type: "bike",
      class: "loco",
      group: "loco",
      code: "l"
    },
    trike: {
      type: "atv",
      class: "trike",
      group: "trike",
      code: "Y"
    },
    pipe: {
      type: "kart",
      class: "pipe",
      group: "pipe",
      code: "P"
    },
    bill: {
      type: "kart",
      class: "horn",
      group: "horn",
      code: "z"
    },
    gator: {
      type: "atv",
      class: "gator",
      group: "gator",
      code: "G"
    },
    bruiser: {
      type: "atv",
      class: "truck",
      group: "truck",
      code: "X"
    }
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
  // if (variant !== undefined) return "-" + variant;
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
    fin: { or: "Fin" },
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
  if (driver === "mario" && body === "std") return "The Standard";

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
