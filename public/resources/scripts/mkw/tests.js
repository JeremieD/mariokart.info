"use strict";

// Check part codes
state.parts.then(parts => {
  let driverCount = 0;
  let bodyCount = 0;
  const driverCodes = [];
  const bodyCodes = [];

  for (const driver of parts.drivers) {
    if (driver.folder) {
      for (const variant of driver.folder) {
        driverCount++;
        if (driverCodes.includes(variant.code)) {
          console.error("Duplicate driver code: " + variant.code);
          continue;
        }
        driverCodes.push(variant.code);
      }
      continue;
    }
    driverCount++;
    if (driverCodes.includes(driver.code)) {
      console.error("Duplicate driver code: " + driver.code);
      continue;
    }
    driverCodes.push(driver.code);
  }
  for (const folder of parts.bodies)
  for (const body of folder.folder) {
    bodyCount++;
    if (bodyCodes.includes(body.code)) {
      console.error("Duplicate body code: " + body.code);
      continue;
    }
    bodyCodes.push(body.code);
  }

  const codeSpace = [ "A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z",
                      "a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z",
                      "0","1","2","3","4","5","6","7","8","9" ];
  const availableDriverCodes = [];
  const availableBodyCodes = [];
  for (const symbol of codeSpace) {
    if (!driverCodes.includes(symbol)) availableDriverCodes.push(symbol);
    if (!bodyCodes.includes(symbol))   availableBodyCodes.push(symbol);
  }
  console.log("Available driver codes: " + availableDriverCodes);
  console.log("Available body codes: " + availableBodyCodes);
});

// Test important combos' stats
testStats("mario", "std", [2, 2.2, 1.8, 2, 1]); // Mario Std
testStats("mario", "dorrie", [2.2, 2.2, 2.2, 1.4, 1]);
testStats("luigi", "rally", [2.2, 2, 2, 1.8, 1]);
testStats("peach", "plush", [1.8, 2.4, 1.6, 2.2, 1]);
testStats("daisy", "rallyBike", [1.2, 3, 1.2, 2.6, 1]);
testStats("yoshi", "frog", [2, 2.2, 1.8, 2, 1]);
testStats("dk", "truck", [3, 1, 2.8, 1.2, 2]);
testStats("bowser", "bruiser", [3.2, .8, 3, 1, 2]);
testStats("bowser", "std", [2.6, 1.6, 2.4, 1.4, 2]);
testStats("bowser", "dorrie", [2.6, 1.6, 2.8, 1, 2]);
testStats("bowser", "dasher", [2.6, 1.4, 2.6, 1.4, 2]); // Heaviest adjust
testStats("bowserJr", "trike", [2.4, 1.6, 2.2, 1.8, 1]);
testStats("koopa", "pipeBike", [1, 3.2, 1, 2.8, 0]);
testStats("toad", "dump", [2.2, 1.8, 2, 2, 0]);
testStats("toadette", "loco", [1.4, 2.8, 1.2, 2.6, 0]);
testStats("lakitu", "cloud", [1.8, 2.4, 1.6, 2.2, 0]);
testStats("kingboo", "reel", [2.8, 1.4, 2.2, 1.6, 2]);
testStats("shyguy", "rod", [1.8, 2.4, 1.6, 2.2, 0]);
testStats("shyguy", "carpet", [1.8, 2.4, 1.6, 2.2, 0]);
testStats("wario", "chopper", [2.8, 1.4, 2.2, 1.6, 2]);
testStats("waluigi", "chopper", [2.8, 1.4, 2.2, 1.6, 2]);
testStats("waluigi", "gator", [2.8, 1.4, 3, .8, 2]);
testStats("birdo", "royale", [2.2, 2, 2, 1.8, 1]);
testStats("pauline", "bill", [2.6, 1.4, 2.6, 1.4, 2]);
testStats("rosalina", "starSled", [3, 1, 2.6, 1.4, 2]);
testStats("marioBb", "pipe", [.8, 3.4, 1, 2.8, 0]);
testStats("luigiBb", "blast", [1.4, 3, 1.4, 2.2, 0]);
testStats("peachBb", "titan", [2, 2.2, 1.6, 2.2, 0]);
testStats("daisyBb", "zoom", [1.4, 2.8, 1.2, 2.6, 0]); // Lightest adjust
testStats("daisyBb", "scoot", [.6, 3.8, .6, 3, 0]);
testStats("rosalinaBb", "biddy", [1, 3.2, 1, 2.8, 0]);
testStats("nabbit", "junk", [2.2, 2.2, 1.8, 1.8, 0]);
testStats("goomba", "pipeBike", [.8, 3.4, .8, 3, 0]);
testStats("drybones", "stdBike", [.6, 3.6, .8, 3, 0]);
testStats("piranha", "horn", [2.6, 1.4, 2.6, 1.4, 2]);
testStats("spike", "gator", [1.8, 2.4, 2, 1.8, 0]);
testStats("wiggler", "machBike", [2, 2.2, 1.8, 2, 2]);
testStats("hammerbro", "zoom", [2.2, 2, 2, 1.8, 1]);
testStats("crab", "lobster", [2, 2.2, 2, 1.8, 0]);
testStats("cataquack", "pipe", [1.6, 2.6, 1.8, 2, 2]);
testStats("mole", "trike", [2.4, 1.6, 2.2, 1.8, 1]);
testStats("cheep", "fin", [1, 3.2, 1, 2.8, 0]);
testStats("pianta", "royale", [2.6, 1.6, 2.4, 1.4, 2]);
testStats("pianta", "dorrie", [2.6, 1.8, 2.6, 1, 2]);
testStats("wrench", "pipeBike", [1.4, 2.8, 1.4, 2.4, 1]);
testStats("conkdor", "bloop", [2, 2.2, 1.8, 2, 2]);
testStats("swoop", "chopper", [1.8, 2.6, 1, 2.6, 0]);
testStats("pokey", "dreadSled", [2.2, 1.8, 2, 2, 1]);
testStats("peepa", "rob", [1, 3.2, .8, 3, 0]);
testStats("stingby", "bee", [1.8, 2.4, 1.6, 2.2, 0]);
testStats("coffer", "frog", [2, 2.2, 1.8, 2, 1]);
testStats("cow", "radio", [1.6, 2.6, 1.8, 2, 2]);
testStats("snowman", "starSled", [3, 1, 2.6, 1.4, 2]);
testStats("penguin", "dolphin", [1.4, 2.8, 1.4, 2.4, 1]);
testStats("dolphin", "dolphin", [1.2, 3, 1.2, 2.6, 1]);
testStats("biddy", "biddy", [1, 3.4, .8, 2.8, 0]);
testStats("chuck", "truck", [3, 1, 2.8, 1.2, 2]);

testRandomDistribution();

// In-game stats: spd [?], acc[3], wgt[4], hnd[?], (size[8])
function testStats(driver, body, expectedStats) {
  Stats.post("getCombo", driver, body).then(combo => {
    // if (toLvl(combo.lvl[statIndex.spd]) !== expectedStats[0]) throw new Error("spd does not match for combo " + combo.code);
    if (toLvl(combo.lvl[statIndex.acc]) !== expectedStats[1]) throw new Error("acc does not match for combo " + combo.code);
    if (toLvl(combo.lvl[statIndex.wgt]) !== expectedStats[2]) throw new Error("wgt does not match for combo " + combo.code);
    // if (toLvl(combo.lvl[statIndex.hnd]) !== expectedStats[3]) throw new Error("hnd does not match for combo " + combo.code);
    if (combo.size !== expectedStats[4]) throw new Error("size does not match for combo " + combo.code);
  });
}

function testRandomDistribution() {
  const combos = [];
  for (let i = 0; i < 5000; i++) combos.push(Stats.post("getRandomCombo"));

  Promise.all(combos).then(combos => {
    const drivers = {};
    const bodies = {};

    for (const combo of combos) {
      if (drivers[combo.driverID] === undefined) drivers[combo.driverID] = 1;
      else drivers[combo.driverID]++;

      if (bodies[combo.bodyID] === undefined) bodies[combo.bodyID] = 1;
      else bodies[combo.bodyID]++;
    }

    console.log(drivers, bodies);
  });
}
