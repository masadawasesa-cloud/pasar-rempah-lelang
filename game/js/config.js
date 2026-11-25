"use strict";
// Pasar Rempah — shared constants. The PR namespace is declared here only;
// every other script attaches to it.
const PR = {
  W: 1280,
  H: 800,
  TOP: 42,          // height of the top strip inside the playfield
  FIELD_W: 928,     // playfield width; the panel takes the rest
  PANEL_X: 928,
  PANEL_W: 352,
  STEP: 1 / 60,     // fixed timestep for the scripted playthrough hooks

  ROUNDS: 9,
  START_COINS: 30,
  SET_BONUS: 12,    // a full set of all four spices pays this on top
  LOT_CAP: 7,       // a rolled-over lot never grows past this many cards

  // The four spices of the market. `panel` is the colour of the card's art
  // field; `price` is its plain value in gold coins. The round's market
  // spice is worth double to whoever wins it that round, and keeps the
  // stamped value in the warehouse.
  SPICES: [
    { id: "pala",    name: "PALA",       price: 5, panel: "#7a8c3f" },
    { id: "cengkeh", name: "CENGKEH",    price: 4, panel: "#a03a2a" },
    { id: "lada",    name: "LADA",       price: 3, panel: "#4a4a52" },
    { id: "kayu",    name: "KAYU MANIS", price: 2, panel: "#c9862b" },
  ],
};
