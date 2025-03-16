"use strict";

// Check part codes
state.parts.then(parts => {
  let driverCount = 0;
  let bodyCount = 0;
  let tireCount = 0;
  let gliderCount = 0;
  const driverCodes = [];
  const bodyCodes = [];
  const tireCodes = [];
  const gliderCodes = [];

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
  for (const folder of parts.bodies) {
    for (const body of folder.folder) {
      bodyCount++;
      if (bodyCodes.includes(body.code)) {
        console.error("Duplicate body code: " + body.code);
        continue;
      }
      bodyCodes.push(body.code);
    }
  }
  for (const tire of parts.tires) {
    tireCount++;
    if (tireCodes.includes(tire.code)) {
      console.error("Duplicate tire code: " + tire.code);
      continue;
    }
    tireCodes.push(tire.code);
  }
  for (const glider of parts.gliders) {
    gliderCount++;
    if (gliderCodes.includes(glider.code)) {
      console.error("Duplicate glider code: " + glider.code);
      continue;
    }
    gliderCodes.push(glider.code);
  }

  const codeSpace =  ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z",
                      "a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z",
                      "0","1","2","3","4","5","6","7","8","9"];
  const availableDriverCodes = [];
  const availableBodyCodes = [];
  const availableTireCodes = [];
  const availableGliderCodes = [];
  for (const symbol of codeSpace) {
    if (!driverCodes.includes(symbol)) availableDriverCodes.push(symbol);
    if (!bodyCodes.includes(symbol))   availableBodyCodes.push(symbol);
    if (!tireCodes.includes(symbol))   availableTireCodes.push(symbol);
    if (!gliderCodes.includes(symbol)) availableGliderCodes.push(symbol);
  }
  console.log("Available driver codes: " + availableDriverCodes);
  console.log("Available body codes: " + availableBodyCodes);
  console.log("Available tire codes: " + availableTireCodes);
  console.log("Available glider codes: " + availableGliderCodes);
});

// Test important combos' stats
// testStats("mario", "std", "std", "super", [4, 3.5, 3.5, 3.5, 3.5, 1]); // Mario Std
// testStats("luigi", "mach", "slim", "super", [4.25, 2.75, 3.75, 3.75, 2.5, 1]); // Luigi Mach
testStats("mario", "std", "std", "super", [3.75, 2.5, 3.75, 3.25, 3.75, 1]);
testStats("luigi", "mach", "slim", "super", [4.5, 2, 4, 3.5, 2.25, 1]);
testStats("lemmy", "bikeSport", "slim", "bowser", [2.5, 4, 1.75, 5.75, 2.75, 0]);
testStats("yoshi", "teddy", "rollerBlue", "flower", [2.75, 4, 2.5, 4, 3.75, 1]); // Yoshi Meta
testStats("waluigi", "wiggler", "roller", "parachute", [3.75, 3.75, 3.25, 3.5, 2.75, 2]); // Old Meta
testStats("shyguy4", "biddy", "roller", "cloud", [1.5, 5.5, 1.5, 5, 3.75, 0]); // Jej
testStats("marioMetal", "gold", "gold", "gold", [5, 1.25, 5.5, 2.75, 1.75, 1]); // Metal
testStats("roy", "falcon", "slick", "plane", [5, 2.25, 4.25, 2.75, 2, 2]);
testStats("villagerM", "city", "leaf", "paper", [3.25, 4, 2.75, 4, 3, 1]); // AC
testStats("link", "master", "triforce", "hylian", [4.75, 2.25, 4, 3.5, 2.25, 2]); // Zelda
testStats("toadette", "atvStd", "roller", "parafoil", [2.25, 3.75, 2.5, 4, 4.5, 0]);
testStats("dk", "circuit", "slickPurple", "wario", [5.25, 1.75, 4.75, 2.75, 1.5, 2]);
testStats("lakitu", "tanooki", "monster", "squirrel", [2.75, 2.25, 3.5, 3.25, 5.25, 0]);

testRandomDistribution();

// In-game stats: spdGr[1], acc[5], wgt[6], hndGr[7], trn[11], size
function testStats(driver, body, tire, glider, expectedStats) {
  Stats.post("getCombo", driver, body, tire, glider)
  .then(combo => {
    if (toLvl(combo.lvl[1])  !== expectedStats[0]) throw new Error("spdGr does not match for combo " + combo.code);
    if (toLvl(combo.lvl[5])  !== expectedStats[1]) throw new Error("acc does not match for combo " + combo.code);
    if (toLvl(combo.lvl[6])  !== expectedStats[2]) throw new Error("wgt does not match for combo " + combo.code);
    if (toLvl(combo.lvl[7])  !== expectedStats[3]) throw new Error("hndGr does not match for combo " + combo.code);
    if (toLvl(combo.lvl[11]) !== expectedStats[4]) throw new Error("trn does not match for combo " + combo.code);
    if (combo.size !== expectedStats[5]) throw new Error("size does not match for combo " + combo.code);
  });
}

function testRandomDistribution() {
  const combos = [];
  for (let i = 0; i < 5000; i++) {
    combos.push(Stats.post("getRandomCombo"));
  }

  Promise.all(combos).then(combos => {
    const drivers = {};
    const bodies = {};
    const tires = {};
    const gliders = {};

    for (const combo of combos) {
      if (drivers[combo.driverID] == undefined) {
        drivers[combo.driverID] = 1;
      } else {
        drivers[combo.driverID]++;
      }

      if (bodies[combo.bodyID] == undefined) {
        bodies[combo.bodyID] = 1;
      } else {
        bodies[combo.bodyID]++;
      }

      if (tires[combo.tireID] == undefined) {
        tires[combo.tireID] = 1;
      } else {
        tires[combo.tireID]++;
      }

      if (gliders[combo.gliderID] == undefined) {
        gliders[combo.gliderID] = 1;
      } else {
        gliders[combo.gliderID]++;
      }
    }

    console.log(drivers, bodies, tires, gliders);
  });
}
