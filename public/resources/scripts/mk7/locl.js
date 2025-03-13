"use strict";
const fallbacks = {
  "en-US": [ "en-GB" ],
  "en-GB": [ "en-US" ],
  "fr-CA": [ "fr-FR", "en-US" ],
  "fr-FR": [ "fr-CA", "en-US" ],
  "de": [ "en-US" ],
  "ja": [ "en-US" ],
  "zh-CN": [ "zh-TW", "en-US" ],
  "zh-TW": [ "zh-CN", "en-US" ],
  "ru": [ "en-US" ],
  "nl": [ "en-US" ],
  "it": [ "en-US" ],
  "ko": [ "en-US" ],
  "pt": [ , "en-US" ],
  "es-MX": [ "es-ES", "en-US" ],
  "es-ES": [ "es-MX", "en-US" ]
};

function S(ns, id, locale) {
  locale ??= state?.settings?.locale ?? "en-US";
  for (const locl of [locale, ...fallbacks[locale]]) {
    const str = strings[locl]?.[ns]?.[id];
    if (str == undefined) continue;
    return str;
  }
  throw "Error: Couldn't find string with ID “" + id + "” in namespace “" + ns + "”";
}

const strings = {
  "en-US": {
    drivers: {
      mario: "Mario",
      luigi: "Luigi",
      peach: "Peach",
      yoshi: "Yoshi",
      bowser: "Bowser",
      dk: "Donkey Kong",
      toad: "Toad",
      koopa: "Koopa Troopa",
      daisy: "Daisy",
      wario: "Wario",
      rosalina: "Rosalina",
      marioMetal: "Metal Mario",
      shyguy: "Shy Guy",
      bee: "Honey Queen",
      wiggler: "Wiggler",
      lakitu: "Lakitu",
      mii: "Mii"
    },
    bodies: {
      std: "Standard",
      bd: "Birthday Girl",
      bolt: "Bolt Buggy",
      bee: "Bumble V",
      bruise: "Bruiser",
      soda: "Soda Jet",
      dasher: "B Dasher",
      egg: "Egg 1",
      train: "Barrel Train",
      tug: "Tiny Tug",
      cactx: "Cact-X",
      koopa: "Koopa Clown",
      cloud: "Cloud 9",
      zucc: "Zucchini",
      blue: "Blue Seven",
      pipe: "Pipe Frame",
      gold: "Gold Standard"
    },
    tires: {
      std: "Standard",
      roller: "Roller",
      monster: "Monster",
      slim: "Slim",
      slick: "Slick",
      sponge: "Sponge",
      mushroom: "Mushroom",
      wood: "Wood",
      monsterRed: "Red Monster",
      gold: "Gold Tires"
    },
    gliders: {
      super: "Super Glider",
      parasol: "Peach Parasol",
      flower: "Flower Glider",
      swoop: "Swooper",
      parafoil: "Paraglider",
      gold: "Gold Glider",
      beast: "Beast Glider"
    },
    stats: {
      mtb:   "Mini-Turbo",
      spd:   "Speed (Unified)",
      spdGr: "Ground Speed",
      spdWt: "Underwater Speed",
      spdAr: "Air Speed",
      acc:   "Acceleration",
      wgt:   "Weight",
      hnd:   "Handling (Unified)",
      hndGr: "Ground Handling",
      hndWt: "Underwater Handling",
      hndAr: "Air Handling",
      off:   "Off-Road",
      stb:   "Stability",
      dft:   "Drift",
      size:  "Size"
    },
    statsAbbr: {
      mtb:   "MTB",
      spd:   "SPD",
      spdGr: "SPDGR",
      spdWt: "SPDWT",
      spdAr: "SPDAR",
      acc:   "ACC",
      wgt:   "WGT",
      hnd:   "HND",
      hndGr: "HNDGR",
      hndWt: "HNDWT",
      hndAr: "HNDAR",
      off:   "OFF",
      stb:   "STB",
      dft:   "DFT",
      size:  "SIZE"
    }
  },
  "en-GB": {
    bodies: {
      bd: "Royal Ribbon",
      bruise: "Growlster",
      zucc: "Gherkin",
      gold: "Gold Kart"
    },
    tires: {
      std: "Normal",
      wood: "Wooden",
      gold: "Gold Wheels"
    },
    gliders: {
      swoop: "Swoop",
      parafoil: "Parafoil",
      beast: "Ghastly Glider"
    }
  },
  "fr-CA": {
    drivers: {
      koopa: "Koopa",
      shyguy: "Maskache",
      lakitu: "Lakitou",
      marioMetal: "Mario de métal"
    },
    bodies: {
      koopa: "Clown Koopa",
      cloud: "Turbomulus",
      zucc: "Courgette",
      gold: "Kart doré"
    },
    tires: {
      roller: "Mini",
      slick: "Antiglisse"
    },
    gliders: {
      super: "Cerf-volant",
      swoop: "Swoopa",
      gold: "Cerf-volant doré"
    }
  },
  "fr-FR": {
    drivers: {
      rosalina: "Harmonie",
      shyguy: "Maskass",
      bee: "Reine des Abeilles",
      lakitu: "Lakitu",
      marioMetal: "Métal Mario"
    },
    bodies: {
      bd: "Turboruban",
      bolt: "Buggy Banane",
      bee: "Butineuse",
      bruise: "Automovile",
      soda: "Jet 7",
      dasher: "Intrépide",
      egg: "Œuf 1",
      train: "Loco Tonneau",
      tug: "Remorqueur",
      cactx: "Karctus",
      koopa: "Koopa-mobile",
      cloud: "Kartocumulus",
      zucc: "Cornichon",
      blue: "Bombe bleue",
      pipe: "Rétro",
      gold: "Or"
    },
    tires: {
      roller: "Roller",
      monster: "Mastodonte",
      slim: "Flanc blanc",
      slick: "Lisse",
      sponge: "Éponge",
      mushroom: "Champignon",
      wood: "Bois",
      monsterRed: "Écrabouilleur",
      gold: "Or"
    },
    gliders: {
      super: "Standard",
      parasol: "Ombrelle Peach",
      flower: "Aile fleurie",
      swoop: "Swooper",
      parafoil: "Parapente",
      gold: "Or",
      beast: "Aile bestiale"
    }
  },
  "es-MX": {
    drivers: {
      rosalina: "Rosalina",
      bee: "Abeja reina"
    },
    bodies: {
      bd: "Rosilazo GTI",
      bee: "Abejomóvil",
      egg: "Huevomóvil",
      cactx: "Cactomóvil",
      koopa: "Koopayaso",
      cloud: "Turbonú B",
      zucc: "Pepinomóvil",
      gold: "Padrão-ouro"
    },
    tires: {
      roller: "Pequeña",
      slim: "Clásica",
      slick: "Lisa",
      gold: "Dorada"
    },
    gliders: {
      swoop: "Vampílago",
      parafoil: "Parapente",
      gold: "Ala dorada",
      beast: "Beast Glider"
    }
  },
  "es-ES": {
    drivers: {
      koopa: "Koopa",
      rosalina: "Estela",
      marioMetal: "Mario de Metal",
      bee: "Abeja Reina",
      wiggler: "Floruga"
    },
    bodies: {
      std: "Estandár",
      bd: "Lazo GTI",
      bolt: "Kartplátano",
      bee: "Abejo-móvil",
      bruise: "Canallículo",
      soda: "Jet Soda",
      dasher: "Rayo GTI",
      egg: "Huevo-móvil",
      train: "Locomokong",
      tug: "Barquiauto",
      cactx: "Kartus",
      koopa: "Helikoopa",
      cloud: "Turbonu B",
      zucc: "Pepino-móvil",
      blue: "Centella Azul",
      pipe: "Tubiturbo",
      gold: "Ouro Padrão"
    },
    tires: {
      std: "Normal",
      roller: "Pequeño",
      monster: "Todoterreno",
      slim: "Clásico",
      slick: "Liso",
      sponge: "Esponja",
      mushroom: "Champiñón",
      wood: "Madera",
      monsterRed: "Rojo",
      gold: "Dorado"
    },
    gliders: {
      super: "Superala",
      parasol: "Parasol Peach",
      flower: "Ala Flor",
      swoop: "Swooper",
      parafoil: "Parapente",
      gold: "Dorada",
      beast: "Besti Ala"
    }
  },
  "it": {
    drivers: {
      koopa: "Koopa",
      rosalina: "Rosalinda",
      marioMetal: "Mario metallo",
      shyguy: "Tipo Timido",
      bee: "Dolceape Regina",
      wiggler: "Torcibruco"
    },
    bodies: {
      bd: "Nastronave",
      bolt: "Bananauto",
      bee: "Apemobile",
      bruise: "Diabolide",
      soda: "Aerobombo",
      dasher: "Fulmine",
      egg: "Ovomobile",
      train: "Barile Ciuf-Ciuf",
      tug: "Kartoscafo",
      cactx: "Kaktus Kart",
      koopa: "Clown Koopa",
      cloud: "Nuvolesta",
      zucc: "Cetriolampo",
      blue: "Blu Blu 7",
      pipe: "Tuboturbo",
      gold: "Kart d’oro"
    },
    tires: {
      std: "Normali",
      roller: "Piccoli",
      monster: "Maxi",
      slim: "Classici",
      slick: "Da corsa",
      sponge: "Spugnosi",
      mushroom: "Fungosi",
      wood: "Legnosi",
      monsterRed: "Maxi Rossi",
      gold: "Gomme d’oro"
    },
    gliders: {
      super: "Superplano",
      parasol: "Parasole Peach",
      flower: "Fiordiplano",
      parafoil: "Parapendio",
      gold: "Ala d’oro",
      beast: "Belvaplano"
    }
  },
  "pt": {
    drivers: {
      marioMetal: "Mario Metálico",
      shyguy: "Masquito",
      bee: "Abelha-Rainha",
      wiggler: "Lagartola"
    },
    bodies: {
      std: "Padrão",
      bd: "Laço Real",
      bolt: "Velozmóvel",
      bee: "Melmóvel",
      bruise: "Diabólide",
      soda: "Sodajato",
      dasher: "Turbólide",
      egg: "Ovomóvel",
      train: "Locomopipa",
      tug: "Barcomóvel",
      cactx: "Cato-X",
      koopa: "Palhaço Koopa",
      cloud: "H2O",
      zucc: "Pepinomóvel",
      blue: "Flecha",
      pipe: "Tubomóvel",
      gold: "Kart Dourado"
    },
    tires: {
      std: "Normal",
      roller: "Pequeno",
      monster: "Grande",
      slim: "Estreito",
      slick: "Liso",
      sponge: "Esponja",
      mushroom: "Cogumelo",
      wood: "Madeira",
      monsterRed: "Vermelho Grande",
      gold: "Dourado"
    },
    gliders: {
      super: "Superparapente",
      parasol: "Guarda-sol Peach",
      flower: "Paraflor",
      swoop: "Asapente",
      parafoil: "Paraquedas",
      gold: "Planadouro",
      beast: "Planamonstro"
    }
  },
  "de": {
    drivers: {
      koopa: "Koopa",
      marioMetal: "Metall-Mario",
      bee: "Honigkönigin"
    },
    bodies: {
      bd: "Schleifenkiste",
      bolt: "Bananabuggy",
      bee: "Bienenmobil",
      bruise: "Fieser Flitzer",
      soda: "Soda-Jet",
      dasher: "Bolide",
      egg: "Ei 1",
      train: "Kokoloko",
      tug: "Turbokutter",
      cactx: "Kaktuskarre",
      koopa: "Clown-Kutsche",
      cloud: "Wolkenwagen",
      zucc: "Renngurke",
      blue: "Karacho 7",
      pipe: "Go-Kart",
      gold: "Goldkart"
    },
    tires: {
      roller: "Klein",
      monster: "Gelände",
      slim: "Retro",
      sponge: "Schwamm",
      mushroom: "Pilz",
      wood: "Holz",
      monsterRed: "Gelände (rot)",
      gold: "Goldräder"
    },
    gliders: {
      parasol: "Sonnenschirm",
      flower: "Blumengleiter",
      swoop: "Flappflapp",
      parafoil: "Gleitschirm",
      gold: "Goldgleiter",
      beast: "Dornengleiter"
    }
  },
  "nl": {
    drivers: {
      marioMetal: "Metalen Mario"
    },
    bodies: {
      std: "Standaard",
      bd: "Royaltyracer",
      bolt: "Bananenbuggy",
      bee: "Bijrijder",
      bruise: "Diabolide",
      soda: "Brokkenpiloot",
      dasher: "Sprinter",
      egg: "Ei 1",
      train: "Locomobiel",
      tug: "Scheurschip",
      cactx: "Au-au-auto",
      koopa: "Koopa-clown",
      cloud: "Wolkenwagen",
      zucc: "Komkommer GTi",
      blue: "Blauwe Bliksem",
      pipe: "Skelter",
      gold: "Gouden kart"
    },
    tires: {
      std: "Standaard",
      roller: "Mini",
      slim: "Klassiek",
      slick: "Glad",
      sponge: "Sponzen",
      mushroom: "Paddenstoel",
      wood: "Boomstam",
      monsterRed: "Monster (rood)",
      gold: "Gouden wielen"
    },
    gliders: {
      super: "Standaard",
      parasol: "Parasol van Peach",
      flower: "Bloem",
      parafoil: "Parachute",
      gold: "Gouden vleugel",
      beast: "Drakenvleugel"
    }
  },
  "ru": {
    drivers: {
      mario: "Марио",
      luigi: "Луиджи",
      peach: "Пич",
      yoshi: "Йоши",
      bowser: "Боузер",
      dk: "Донки Конг",
      toad: "Тоад",
      koopa: "Купа-трупа",
      daisy: "Дэйзи",
      wario: "Варио",
      rosalina: "Розалина",
      marioMetal: "Марио-металл",
      shyguy: "Скромняга",
      bee: "Королева-пчела",
      wiggler: "Егоза",
      lakitu: "Лакиту"
    },
    bodies: {
      std: "Стандартный",
      bd: "Бантомобиль",
      bolt: "Быстрый багги",
      bee: "Жаломобиль",
      bruise: "Зверомобиль",
      soda: "Самолет",
      dasher: "Турбо B",
      egg: "Яйцемобиль",
      train: "Паровозик",
      tug: "Буксир",
      cactx: "Кактусомобиль",
      koopa: "Клоуномобиль",
      cloud: "Облакомобиль",
      zucc: "Корнишон",
      blue: "Гоночный",
      pipe: "Труботурбо",
      gold: "Золотой карт"
      },
    tires: {
      std: "Обычные",
      roller: "Роликовые",
      monster: "Гигантские",
      slim: "Узкие",
      slick: "Слики",
      sponge: "Губки",
      mushroom: "Грибы",
      wood: "Деревянные",
      monsterRed: "Красные",
      gold: "Золотые"
    },
    gliders: {
      super: "Суперпланёр",
      parasol: "Зонтик Пич",
      flower: "Планер-цветок",
      swoop: "Пикировщик",
      parafoil: "Параплан",
      gold: "Золотой планёр",
      beast: "Звероплан"
    }
  },
  "ja": {
    drivers: {
      mario: "マリオ",
      luigi: "ルイージ",
      peach: "ピーチ",
      yoshi: "ヨッシー",
      bowser: "クッパ",
      dk: "ドンキーコング",
      toad: "キノピオ",
      koopa: "ノコノコ",
      daisy: "デイジー",
      wario: "ワリオ",
      rosalina: "ロゼッタ",
      marioMetal: "メタルマリオ",
      shyguy: "ヘイホー",
      bee: "ハニークイーン",
      wiggler: "ハナチャン",
      lakitu: "ジュゲム"
    },
    bodies: {
      std: "スタンダード",
      bd: "バースデーガール",
      bolt: "バナナバギー",
      bee: "マッハクイーン",
      bruise: "ワルビデール",
      soda: "ジェットサイダー",
      dasher: "Ｂダッシュ",
      egg: "エッグワン",
      train: "タルポッポ",
      tug: "レトロまる",
      cactx: "サンドランナー",
      koopa: "クッパクラウン",
      cloud: "Ｈ2Ｏ",
      zucc: "ダンガンダック",
      blue: "コバルトセブン",
      pipe: "スケルトン",
      gold: "ゴールドカート"
      },
    tires: {
      std: "ノーマルタイヤ",
      roller: "ローラータイヤ",
      monster: "ワイルドタイヤ",
      slim: "リングタイヤ",
      slick: "スリックタイヤ",
      sponge: "スポンジタイヤ",
      mushroom: "スーパーキノコ",
      wood: "ウッドリング",
      monsterRed: "ワイルドレッド",
      gold: "ゴールドタイヤ"
    },
    gliders: {
      super: "スーパーカイト",
      parasol: "ピーチパラソル",
      flower: "フラワーカイト",
      swoop: "バサバサカイト",
      parafoil: "パラフォイル",
      gold: "ゴールドカイト",
      beast: "ビーストカイト"
    }
  },
  "ko": {
    drivers: {
      mario: "마리오",
      luigi: "루이지",
      peach: "피치",
      yoshi: "요시",
      bowser: "쿠파",
      dk: "동키콩",
      toad: "키노피오",
      koopa: "엉금엉금",
      daisy: "데이지",
      wario: "와리오",
      rosalina: "로젤리나",
      marioMetal: "메탈마리오",
      shyguy: "헤이호",
      bee: "허니퀸",
      wiggler: "꽃충이",
      lakitu: "김수한무"
    },
    bodies: {
      std: "스탠더드",
      bd: "웨딩카",
      bolt: "바나나버기",
      bee: "마하퀸",
      bruise: "갱스터",
      soda: "제트사이더",
      dasher: "B대시",
      egg: "에그원",
      train: "나무통기차",
      tug: "레트로호",
      cactx: "샌드러너",
      koopa: "쿠파피에로",
      cloud: "H2O",
      zucc: "날쌘돌이",
      blue: "코발트세븐",
      pipe: "스켈레톤",
      gold: "골드카트"
    },
    tires: {
      std: "노멀타이어",
      roller: "롤러타이어",
      monster: "와일드타이어",
      slim: "링타이어",
      slick: "슬릭타이어",
      sponge: "스펀지타이어",
      mushroom: "슈퍼버섯",
      wood: "우드링",
      monsterRed: "와일드레드",
      gold: "골드타이어"
    },
    gliders: {
      super: "슈퍼글라이더",
      parasol: "피치파라솔",
      flower: "플라워글라이더",
      swoop: "스우푸글라이더",
      parafoil: "패러글라이더",
      gold: "골드글라이더",
      beast: "비스트글라이더"
    }
  },
  "zh-CN": {
    drivers: {
      mario: "马力欧",
      luigi: "路易吉",
      peach: "桃花公主",
      yoshi: "耀西",
      bowser: "酷霸王",
      dk: "森喜刚",
      toad: "奇诺比奥",
      koopa: "喏库喏库",
      daisy: "菊花公主",
      wario: "瓦力欧",
      rosalina: "罗莎塔",
      marioMetal: "金属马力欧",
      shyguy: "嘿呵",
      bee: "蜜蜂女王",
      wiggler: "花毛毛",
      lakitu: "朱盖木"
    },
    bodies: {
      std: "标准车",
      bd: "生日女孩",
      bolt: "香蕉越野车",
      bee: "音速女王",
      bruise: "恶魔帝王",
      soda: "喷射苏打",
      dasher: "B冲刺",
      egg: "蛋蛋1号",
      train: "木桶嘟嘟",
      tug: "老爷船",
      cactx: "沙漠跑车",
      koopa: "酷霸王小丑飞船",
      cloud: "Ｈ2Ｏ",
      zucc: "子弹鸭",
      blue: "天蓝7号",
      pipe: "管架车",
      gold: "黄金卡丁车"
    },
    tires: {
      std: "标准轮胎",
      roller: "滚轮轮胎",
      monster: "狂野轮胎",
      slim: "细环窄胎",
      slick: "光头轮胎",
      sponge: "海绵轮胎",
      mushroom: "超级蘑菇",
      wood: "原木环轮",
      monsterRed: "炫红狂野",
      gold: "黄金轮胎"
    },
    gliders: {
      super: "超級滑翔翼",
      parasol: "桃花阳伞",
      flower: "花朵滑翔翼",
      swoop: "啪萨啪萨滑翔翼",
      parafoil: "滑翔伞",
      gold: "黄金滑翔翼",
      beast: "野兽滑翔翼"
    }
  },
  "zh-TW": {
    drivers: {
      mario: "瑪利歐",
      peach: "碧姬公主",
      bowser: "庫巴",
      dk: "森喜剛",
      toad: "奇諾比奧",
      koopa: "慢慢龜",
      daisy: "黛西公主",
      wario: "壞莉歐",
      rosalina: "羅潔塔",
      marioMetal: "金屬瑪利歐",
      shyguy: "嘿呵",
      wiggler: "花毛毛",
      lakitu: "球蓋姆"
    },
    bodies: {
      std: "標準車",
      bolt: "香蕉越野車",
      bruise: "惡魔大王",
      soda: "噴射蘇打",
      dasher: "B衝刺",
      egg: "耀西蛋１號",
      tug: "老爺船",
      cactx: "沙漠跑車",
      koopa: "庫巴小丑飛船",
      zucc: "子彈鴨",
      blue: "鈷藍七號",
      pipe: "管架車",
      gold: "黃金標準車"
    },
    tires: {
      std: "標準輪胎",
      roller: "滾輪輪胎",
      monster: "狂野輪胎",
      slim: "細環窄胎",
      slick: "光頭輪胎",
      sponge: "海綿輪胎",
      mushroom: "超級蘑菇",
      wood: "原木環輪",
      monsterRed: "炫紅狂野",
      gold: "黃金輪胎"
    },
    gliders: {
      parasol: "碧姬陽傘",
      swoop: "啪沙啪沙蝙蝠翼",
      parafoil: "飛行傘",
      gold: "黃金滑翔翼",
      beast: "野獸滑翔翼"
    }
  }
};
