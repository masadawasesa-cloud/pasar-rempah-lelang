"use strict";
// Lots, values and warehouses. A warehouse ("rack") holds won cards as
// { t, v, stamped } — the spice type, the value locked in when the card was
// won (double if it carried the market stamp that round), and the stamp flag.

// mulberry32 — small seeded RNG so staged scenes and self-tests are stable.
PR.rng = function (seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// A fresh lot is 2–4 cards; the market spice shows up in most lots so the
// stamp matters every round.
PR.makeLot = function (rand, market) {
  const n = 2 + Math.floor(rand() * 3);
  const lot = [];
  for (let i = 0; i < n; i++) lot.push(Math.floor(rand() * 4));
  if (!lot.includes(market) && rand() < 0.55) lot[0] = market;
  return lot;
};

PR.cardValue = function (type, market) {
  const base = PR.SPICES[type].price;
  return type === market ? base * 2 : base;
};

PR.lotValue = function (lot, market) {
  return lot.reduce((sum, t) => sum + PR.cardValue(t, market), 0);
};

// Complete sets in a rack: the scarcest spice decides.
PR.setsIn = function (rack) {
  const counts = [0, 0, 0, 0];
  for (const card of rack) counts[card.t]++;
  return Math.min(counts[0], counts[1], counts[2], counts[3]);
};

PR.typeCounts = function (rack) {
  const counts = [0, 0, 0, 0];
  for (const card of rack) counts[card.t]++;
  return counts;
};

PR.goodsValue = function (rack) {
  return rack.reduce((sum, card) => sum + card.v, 0);
};

// Final wealth: coins left + goods at locked-in value + set bonuses.
PR.wealth = function (player) {
  return player.coins + PR.goodsValue(player.rack) + PR.setsIn(player.rack) * PR.SET_BONUS;
};
