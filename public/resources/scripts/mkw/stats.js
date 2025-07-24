"use strict";

/** Hidden parts of the combined stats SPEED and HANDLING.
 *
 * road: Asphalt, wood, etc.
 * terrain: Dirt, snow, etc.
 * wet: Water, chocolate, lava, etc
 */
export const SURFACES = Object.freeze(["road", "terrain", "water"]);

function baselineObject(baseline, compoundStatExtras = {}) {
    function surfaces() {
        return Object.fromEntries(SURFACES.map(k => [k, baseline]));
    }

    return Object.freeze({
        /**
         * unified: the (rough) average of the hidden stats
         * display: what mkw actually shows on the display
         */
        speed: Object.freeze({...surfaces(), ...compoundStatExtras}),
        acceleration: baseline,
        handling: Object.freeze({...surfaces(), ...compoundStatExtras}),
        weight: baseline,
        size: 0
    });
}

/**
 * Compound stats get these extra helpers:
 * unified: the (rough) average of the hidden stats
 * display: what MKW actually shows on the display
 */
const BASELINE_LEVELS = baselineObject(3, {"unified": 0, "display": 0});

export function combineLevels(driver, body) {
    const result = structuredClone(BASELINE_LEVELS);
    recursiveSum(result, [driver, body]);

    result.speed.unified = displayAverage(result.speed);
    result.speed.display = displayAverage(result.speed, "display");
    result.handling.unified = displayAverage(result.handling);
    result.handling.display = displayAverage(result.handling, "display");

    if (driver.adjustDisplay && body.adjustDisplay) {
        result.speed.display--;
        result.speed.unified--;
        result.handling.display++;
        result.handling.unified++;
    }

    return result;
}

function recursiveSum(dest, sources) {
    for (const [key, value] of Object.entries(dest)) {
        if (typeof value === 'object') {
            recursiveSum(value, sources.map(o => o[key] ?? {}));
        } else {
            dest[key] = sources.reduce((accum, o) => accum + (o[key] ?? 0), value);
        }
    }
}

/**
 * Take the average of the stats as used for the in-game display.
 *
 * The gameplay has a base stat of 3,
 * but the game display does some weird rounding on the terrain-types
 * making it appear like a base stat is 2.
 *
 * Additionally, there are some combos that outright lie about their stats (see Rally Bike / Pipe Frame). We treat these
 * "display stats" that boost the average.
 */
function displayAverage(parts, extraKey = null) {
    // the -1 is to change the base stat from 3 to 2
    const actual = SURFACES.reduce((accum, key) => accum - 1 + parts[key], 0);
    const extra = parts[extraKey] ?? 0;

    return Math.round((actual + extra) / SURFACES.length);
}

const builder = {
    driverClasses: {}, // name -> { members: Set<String>, levels: Levels }
    bodyClasses: {}, // name -> { members: Set<String>, levels: Levels }
    drivers: {}, // name -> Driver: { main, group, class, code, levels }
    bodies: {}, // name -> Body: { main, group, class, code, levels }

    addDriverClass(levels) {
        const self = this;
        levels = self._expandStats(levels);

        return {
            _class: null,
            add(name, code, outfits = {}) {
                if (!this._class) {
                    this._class = { name, members: new Set(), levels };
                    self.driverClasses[name] = this._class;
                }

                const className = this._class.name;
                for (let [alias, aliasCode] of Object.entries({ [name]: code, ...outfits })) {
                    const driver = { main: name, group: className, class: className, code: aliasCode, levels };
                    self.drivers[alias] = driver;
                    this._class.members.add(alias);
                }

                return this;
            }
        };
    },

    addBodyClass(unused, levels) {
        const self = this;
        levels = self._expandStats(levels);

        return {
            _class: null,

            kart(clazz, code, ...bodyCodePairs) {
                return this._add("kart", [clazz, code, ...bodyCodePairs])
            },
            atv(clazz, code, ...bodyCodePairs) {
                return this._add("atv", [clazz, code, ...bodyCodePairs])
            },
            bike(clazz, code, ...bodyCodePairs) {
                return this._add("bike", [clazz, code, ...bodyCodePairs])
            },

            _add(type, bodyCodePairs) {
                if (!this._class) {
                    this._class = { name: bodyCodePairs[0], members: new Set(), levels }; // named after the first member
                    self.bodyClasses[this._class.name] = this._class;
                }

                for (let i = 0; i < bodyCodePairs.length; i += 2) {
                    let name = bodyCodePairs[i];
                    let code = bodyCodePairs[i + 1];
                    self.bodies[name] = { type: type, group: this._class.name, class: this._class.name, code, levels };
                    this._class.members.add(name);
                }

                return this;
            }
        };
    },

    _expandStats({
        speed: [roadSpeed,terrainSpeed,waterSpeed],
        handling: [roadHandling,terrainHandling,waterHandling],
        display: {handling: displayHandling = 0} = {},
        accel, wt, sz = 0,
        adjustDisplay = false}) {

        return {
            speed: { road: roadSpeed, terrain: terrainSpeed, water: waterSpeed },
            handling: { road: roadHandling, terrain: terrainHandling, water: waterHandling, display: displayHandling},
            acceleration: accel,
            weight: wt, size: sz,
            adjustDisplay
        };
    }
};


// weight class 0
builder.addDriverClass({ speed: [0,0,0], accel: 7, wt: 0, handling: [6,6,6], sz: 0, adjustDisplay: true })
    .add("peachBb", "p", {
        "peachBb-touring": "pt",
        "peachBb-pro": "pp",
        "peachBb-sailor": "ps",
        "peachBb-explorer": "pe"
    })
    .add("daisyBb", "j", {
        "daisyBb-touring": "jt",
        "daisyBb-pro": "jp",
        "daisyBb-sailor": "js",
        "daisyBb-explorer": "je"
    })
    .add("swoop", "o")
    .add("biddy", "I");

// weight class 1
builder.addDriverClass({ speed: [1,0,0], accel: 6, wt: 1, handling: [7,5,5], sz: 0 })
    .add("marioBb", "m", {
        "marioBb-pro": "mp",
        "marioBb-swim": "mW",
        "marioBb-work": "mw"
    })
    .add("goomba", "g")
    .add("spike", "S");
builder.addDriverClass({ speed: [0,1,0], accel: 6, wt: 1, handling: [5,7,5], sz: 0 })
    .add("luigiBb", "l", {
        "luigiBb-pro": "lp",
        "luigiBb-work": "lw",
    })
    .add("drybones", "x")
    .add("peepa", "Z");
builder.addDriverClass({ speed: [0,0,1], accel: 6, wt: 1, handling: [5,5,7], sz: 0 })
    .add("rosalinaBb", "r", {
        "rosalinaBb-touring": "rt",
        "rosalinaBb-pro": "rp",
        "rosalinaBb-sailor": "rs",
        "rosalinaBb-explorer": "re",
    })
    .add("crab", "i")
    .add("fishbone", "q");

// weight class 2
builder.addDriverClass({ speed: [2,1,1], accel: 5, wt: 2, handling: [6,4,4], sz: 0 })
    .add("toadette", "t", {
        "toadette-pro": "tp",
        "toadette-conductor": "tC",
        "toadette-ice": "tI",
        "toadette-explorer": "te",
    })
    .add("nabbit", "n");
builder.addDriverClass({ speed: [1,2,1], accel: 5, wt: 2, handling: [4,6,4], sz: 0 })
    .add("toad", "T", {
        "toad-pro": "Tp",
        "toad-engi": "TE",
        "toad-burger": "TB",
        "toad-explorer": "Te",
    })
    .add("shyguy", "s", {
        "shyguy-pit": "sp",
        "shyguy-ski": "sS",
    })
    .add("stingby", "z");
builder.addDriverClass({ speed: [1,1,2], accel: 5, wt: 2, handling: [4,4,6], sz: 0 })
    .add("koopa", "k", {
        "koopa-runner": "kR",
        "koopa-pro": "kp",
        "koopa-sailor": "ks",
        "koopa-at": "kT",
        "koopa-work": "kw"
    })
    .add("lakitu", "u", {
        "lakitu-pit": "up",
        "lakitu-fish": "uF"
    })
    .add("cheep", "Q");

// // weight class 3
builder.addDriverClass({ speed: [3,2,2], accel: 4, wt: 3, handling: [5,3,3], sz: 1 })
    .add("peach", "P", {
        "peach-touring": "Pt",
        "peach-pro": "Pp",
        "peach-farmer": "Pf",
        "peach-sight": "PS",
        "peach-aviator": "PP",
        "peach-festival": "Py",
        "peach-aero": "Pa",
        "peach-vacation": "Pv"
    })
    .add("daisy", "J", {
        "daisy-touring": "Jt",
        "daisy-pro": "Jp",
        "daisy-oasis": "Jo",
        "daisy-swim": "JW",
        "daisy-aero": "Ja",
        "daisy-vacation": "Jv"
    })
    .add("coffer", "G");
builder.addDriverClass({ speed: [2,3,2], accel: 4, wt: 3, handling: [3,5,3], sz: 1 })
    .add("yoshi", "Y", {
        "yoshi-food": "Y1",
        "yoshi-pro": "Y3",
        "yoshi-festival": "Y4",
        "yoshi-touring": "Y5",
        "yoshi-biker": "Y6",
        "yoshi-ice": "Y7",
        "yoshi-swim": "Y8",
        "yoshi-aristocrat": "Y9"
    })
    .add("mole", "E");
builder.addDriverClass({ speed: [2,2,3], accel: 4, wt: 3, handling: [3,3,5], sz: 1 })
    .add("bowserJr", "b", {
        "bowserJr-pro": "bp",
        "bowserJr-biker": "bb",
        "bowserJr-explorer": "be"
    })
    .add("dolphin", "h");

// weight class 4
builder.addDriverClass({ speed: [4,3,3], accel: 3, wt: 4, handling: [4,2,2], sz: 1 })
    .add("mario", "M", {
        "mario-touring": "Mt",
        "mario-pro": "Mp",
        "mario-mech": "Mm",
        "mario-dune": "Md",
        "mario-cowboy": "MC",
        "mario-sight": "MS",
        "mario-aviator": "MP",
        "mario-festival": "Mh",
        "mario-at": "MT"
    })
    .add("wrench", "e");
builder.addDriverClass({ speed: [3,4,3], accel: 3, wt: 4, handling: [2,4,2], sz: 1 })
    .add("luigi", "L", {
        "luigi-touring": "Lt",
        "luigi-pro": "Lp",
        "luigi-mech": "Lm",
        "luigi-oasis": "Lo",
        "luigi-farmer": "Lf",
        "luigi-festival": "Lh",
        "luigi-at": "LT",
        "luigi-gondolier": "LG"
    })
    .add("hammerbro", "v")
    .add("pokey", "O");
builder.addDriverClass({ speed: [3,3,4], accel: 3, wt: 4, handling: [2,2,4], sz: 1 })
    .add("birdo", "y", {
        "birdo-pro": "yp",
        "birdo-vacation": "yv"
    })
    .add("penguin", "N");

// weight class 5
builder.addDriverClass({ speed: [5,4,4], accel: 2, wt: 5, handling: [3,1,1], sz: 1 })
    .add("pauline", "U", {
        "pauline-aero": "Ua"
    })
    .add("piranha", "X")
    .add("snowman", "8");
builder.addDriverClass({ speed: [4,5,4], accel: 2, wt: 5, handling: [1,3,1], sz: 1 })
    .add("kingboo", "K", {
        "kingboo-pro": "Kp",
        "kingboo-aristocrat": "KA",
        "kingboo-pirate": "KP"
    })
    .add("conkdor", "c");
builder.addDriverClass({ speed: [4,4,5], accel: 2, wt: 5, handling: [1,1,3], sz: 1 })
    .add("rosalina", "R", {
        "rosalina-touring": "Rt",
        "rosalina-pro": "Rp",
        "rosalina-aurora": "RA",
        "rosalina-aero": "Ra"
    })
    .add("cataquack", "a");

// weight class 6
builder.addDriverClass({ speed: [6,5,5], accel: 1, wt: 6, handling: [2,0,0], sz: 2 })
    .add("wario", "W", {
        "wario-pro": "Wp",
        "wario-oasis": "Wo",
        "wario-bee": "WW",
        "wario-biker": "Wb",
        "wario-pirate": "WP",
        "wario-ruffian": "WE",
        "wario-work": "Ww"
    })
    .add("wiggler", "H");
builder.addDriverClass({ speed: [5,6,5], accel: 1, wt: 6, handling: [0,2,0], sz: 2 })
    .add("dk", "D", {
        "dk-at": "DT"
    })
    .add("cow", "C")
    .add("chuck", "V");
builder.addDriverClass({ speed: [5,5,6], accel: 1, wt: 6, handling: [0,0,2], sz: 2 })
    .add("waluigi", "w", {
        "waluigi-pro": "wp",
        "waluigi-vampire": "wW",
        "waluigi-mariachi": "wM",
        "waluigi-biker": "wb",
        "waluigi-ruffian": "wR"
    })
    .add("pianta", "A");

// weight class 7
builder.addDriverClass({ speed: [6,6,6], accel: 0, wt: 7, handling: [0,0,0], sz: 2, adjustDisplay: true })
    .add("bowser", "B", {
        "bowser-pro": "Bp",
        "bowser-charged": "BC",
        "bowser-biker": "Bb",
        "bowser-at": "BT"
    });




// weight class 0
builder.addBodyClass("machBike", { speed: [6,1,1], accel: 7, wt: 0, handling: [10,6,6] }) // these bodies trade accel for speed
    .bike(  "machBike", "m",
            "rob", "h");
// Yes, it's missing a stat that the in-game meter lies about!
builder.addBodyClass("rallyBike", { speed: [0,5,0], accel: 8, wt: 0, handling: [0,10,6], display: {handling: 6}})
    .bike(  "rallyBike", "r",
            "pipeBike", "p");
builder.addBodyClass("fish", { speed: [0,0,5], accel: 8, wt: 0, handling: [6,6,10] })
    .bike(  "fish", "f",
            "dolphin", "d");

// weight class 1
builder.addBodyClass("bloop", { speed: [7,2,2], accel: 6, wt: 1, handling: [9,5,5] }) // these bodies trade accel for speed
    .kart("bloop", "o");
builder.addBodyClass("biddy", { speed: [1,6,1], accel: 7, wt: 1, handling: [5,9,5] })
    .kart("biddy", "B");
builder.addBodyClass("none", { speed: [1,1,6], accel: 7, wt: 1, handling: [5,5,9] }); // empty class

// weight class 3
builder.addBodyClass("dasher", { speed: [8,4,4], accel: 4, wt: 3, handling: [8,3,3], adjustDisplay: true })
    .kart(  "dasher", "b",
            "royale", "e",
            "rod", "M",
            "bee", "V");
builder.addBodyClass("rally", { speed: [4,8,4], accel: 4, wt: 3, handling: [3,8,3], adjustDisplay: true })
    .kart(  "rally", "R",
            "zoom", "Z");
builder.addBodyClass("cloud", { speed: [4,4,8], accel: 4, wt: 3, handling: [3,3,8], adjustDisplay: true })
    .kart(  "cloud", "9",
            "carpet", "c",
            "frog", "F");

// weight class 5
builder.addBodyClass("horn", { speed: [9,6,6], accel: 2, wt: 5, handling: [7,1,1] }) // these bodies trade speed for accel
    .kart(  "horn", "H",
            "bill", "z");
builder.addBodyClass("truck", { speed: [7,10,7], accel: 1, wt: 5, handling: [1,7,1] })
    .kart(  "truck", "C",
            "titan", "t",
            "dump", "y")
    .atv(   "bruiser", "X");
builder.addBodyClass("trike", { speed: [7,7,10], accel: 1, wt: 5, handling: [1,1,7] })
    .atv(   "trike", "Y")

// weight class 6
builder.addBodyClass("gator", { speed: [9,6,6], accel: 3, wt: 6, handling: [5,0,0] }) // these bodies trade speed for accel
    .kart(  "gator", "G");
builder.addBodyClass("", { speed: [7,10,7], accel: 2, wt: 6, handling: [0,5,0] }); // empty class
builder.addBodyClass("lobster", { speed: [7,7,10], accel: 2, wt: 6, handling: [0,0,5] })
    .atv(   "lobster", "L");

// bodies with flat stats
builder.addBodyClass("stdBike", { speed: [1,1,1], accel: 9, wt: 0, handling: [7,7,7] })
    .bike(  "stdBike", "a",
            "scoot", "s",
            "radio", "O");
builder.addBodyClass("pipe", { speed: [2,2,2], accel: 8, wt: 1, handling: [6,6,6] })
    .kart(  "pipe", "P");
builder.addBodyClass("loco", { speed: [4,4,4], accel: 6, wt: 1, handling: [6,6,6] })
    .bike(  "loco", "l");
builder.addBodyClass("blast", { speed: [5,5,5], accel: 6, wt: 3, handling: [3,3,3] })
    .kart(  "blast", "3");
builder.addBodyClass("std", { speed: [5,5,5], accel: 5, wt: 2, handling: [5,5,5] })
    .kart(  "std", "A",
            "plush", "T");
builder.addBodyClass("chopper", { speed: [7,7,7], accel: 3, wt: 2, handling: [5,5,5] })
    .bike(  "chopper", "w");
builder.addBodyClass("reel", { speed: [8,8,8], accel: 2, wt: 3, handling: [4,4,4] })
    .kart(  "reel", "k");
builder.addBodyClass("junk", { speed: [8,8,8], accel: 3, wt: 4, handling: [2,2,2] })
    .atv(   "junk", "J");

// one-off
builder.addBodyClass("dorrie", { speed: [4,4,4], accel: 5, wt: 5, handling: [1,1,6], adjustDisplay: true })
    .atv(   "dorrie", "D");
builder.addBodyClass("dreadSled", { speed: [3,9,5], accel: 3, wt: 3, handling: [3,9,4] })
    .atv(   "dreadSled", "x");
builder.addBodyClass("starSled", { speed: [6,8,11], accel: 0, wt: 5, handling: [1,2,8], adjustDisplay: true })
    .kart(  "starSled", "S");

// const classCombos = [];
// for (const body of Object.values(builder.bodyClasses)) {
//     for (const driver of Object.values(builder.driverClasses)) {
//         classCombos.push({
//             driver,
//             body,
//             combined: combineLevels(driver.levels, body.levels),
//         });
//     }
// }

export const statisticals = {
    parts: { drivers: builder.drivers, bodies: builder.bodies },
    classes: { drivers: builder.driverClasses, bodies: builder.bodyClasses },
    // classCombos,
};