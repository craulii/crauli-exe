/**
 * ============================================================
 * CRAULI.EXE — CONFIG.JS
 * ============================================================
 * THIS IS THE ONLY FILE YOU NEED TO EDIT TO CUSTOMIZE THE SITE.
 * All links, image lists, music paths, and settings live here.
 * After editing, save and refresh index.html in your browser.
 *
 * See CONFIG.md for full documentation of every property.
 * ============================================================
 */

const CONFIG = {

  // ----------------------------------------------------------
  // PERSONAL LINKS
  // ----------------------------------------------------------

  /**
   * Your LinkedIn profile URL.
   * Clicking any floating photo redirects here.
   * @type {string}
   */
  linkedinURL: "https://www.linkedin.com/in/joseramoncrauli",

  /**
   * List of URLs for the "Ruleta Rusa" (Russian Roulette) image.
   * Each click picks one at random and opens it in a new tab.
   * Add as many as you want — the more chaotic, the better.
   * @type {string[]}
   */
  ruletaLinks: [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://www.youtube.com/watch?v=oHg5SJYRHA0",
    "https://www.twitch.tv/",
    "https://archive.org/",
    "https://www.youtube.com/watch?v=ZZ5LpwO-An4",
    "https://cursedimages.tumblr.com/",
    "https://en.wikipedia.org/wiki/Thelema",
    "https://www.threesixmafia.com/"
  ],

  // ----------------------------------------------------------
  // IMAGES
  // ----------------------------------------------------------

  /**
   * The special image shown in the "Ruleta Rusa" section.
   * Path is relative to index.html.
   * @type {string}
   */
  ruletaImage: "./assets/me/ruleta.jpg",

  /**
   * List of image FILENAMES (not full paths) inside /assets/me/
   * These will float around the screen like DVD screensavers.
   * Each one is clickable and redirects to linkedinURL.
   *
   * How to add: drop an image in /assets/me/ and add its filename here.
   * Example: ["photo1.jpg", "photo2.png", "selfie.webp"]
   * @type {string[]}
   */
  floatingPhotos: [
    "photo1.jpg",
    "photo2.jpg",
    "photo3.jpg"
  ],

  /**
   * Images for each TCG category.
   * Keys MUST match folder names inside /assets/tcg/
   * Values are arrays of filenames inside each folder.
   *
   * How to add: drop a card image in /assets/tcg/pokemon/ and add
   * the filename to the pokemon array below.
   *
   * The filename (without extension) becomes the visible card title.
   * Example: "charizard-holo.jpg" → shows as "charizard-holo"
   *
   * @type {{ pokemon: string[], onepiece: string[], magic: string[] }}
   */
  tcgImages: {
    pokemon: [
      "charizard-holo.jpg",
      "mewtwo-base.jpg",
      "pikachu-promo.jpg"
    ],
    onepiece: [
      "luffy-gear5.jpg",
      "zoro-alt-art.jpg"
    ],
    magic: [
      "black-lotus.jpg",
      "underground-sea.jpg",
      "ancestral-recall.jpg"
    ]
  },

  // ----------------------------------------------------------
  // AUDIO
  // ----------------------------------------------------------

  /**
   * Path to the background music file (relative to index.html).
   * Drop your .mp3 (or .ogg/.wav) in /assets/audio/ and update this.
   * @type {string}
   */
  audioPath: "./assets/audio/background.mp3",

  /**
   * Initial volume — 0.0 (silent) to 1.0 (full blast).
   * 0.3 = 30% volume, recommended to not jumpscare visitors.
   * @type {number}
   */
  audioVolume: 0.3,

  // ----------------------------------------------------------
  // SITE IDENTITY
  // ----------------------------------------------------------

  /**
   * Text shown on the entry/warning screen.
   * Keep it threatening.
   * @type {string}
   */
  warningText: "⚠ ADVERTENCIA ⚠\nEste sitio contiene contenido perturbador,\nmagia oscura, TCG de élite y energía caótica.\nProcede bajo tu propio riesgo.",

  /**
   * Site tagline shown in the header under the main title.
   * @type {string}
   */
  tagline: "[ AGENTE DEL CAOS DIGITAL · THELEMA · CERVEZA · TCG ]",

  // ----------------------------------------------------------
  // EASTER EGGS
  // ----------------------------------------------------------

  /**
   * Number of clicks anywhere on the site before the demon appears.
   * Set to 0 to disable.
   * @type {number}
   */
  demonClickThreshold: 66,

  /**
   * Seconds of idle time before the "NO SIGNAL" flicker activates.
   * Set to 0 to disable.
   * @type {number}
   */
  idleTimeoutSeconds: 30

};

// Freeze the config to prevent accidental mutation at runtime
// (Remove Object.freeze if you need to modify CONFIG dynamically)
Object.freeze(CONFIG);
