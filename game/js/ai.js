"use strict";
// The two rival merchants. Both value a lot at its market prices, then shade
// the bid by character:
//   Haji Karim — aggressive, overbids, and bluffs hardest on cheap lots.
//   Nyonya Lie — patient, bids under value, but pays a premium when a lot
//   completes one of her sets or carries the spice she is shortest on.
// Either may sit a cheap lot out entirely. Bids are clamped to their coins.

// Does this lot hold a spice the rack is shortest on (a set bottleneck)?
PR.lotHelpsSet = function (lot, rack) {
  const counts = PR.typeCounts(rack);
  const scarcest = Math.min(counts[0], counts[1], counts[2], counts[3]);
  return lot.some((t) => counts[t] === scarcest);
};

PR.aiBid = function (who, lot, market, rack, coins, rand) {
  const base = PR.lotValue(lot, market);
  if (base <= 0 || coins <= 0) return 0;
  let bid;
  if (who === "karim") {
    let factor = 0.95 + rand() * 0.3;
    if (base <= 8) factor += 0.18; // the bluff: push hard on small lots
    if (PR.lotHelpsSet(lot, rack)) factor *= 1.08;
    bid = Math.round(base * factor);
    if (base <= 5 && rand() < 0.12) bid = 0; // even Karim naps sometimes
  } else {
    let factor = 0.78 + rand() * 0.22;
    if (PR.lotHelpsSet(lot, rack)) factor *= 1.18; // the set is worth paying for
    bid = Math.round(base * factor);
    if (base <= 5 && rand() < 0.2) bid = 0; // Lie lets trifles go
  }
  return Math.max(0, Math.min(coins, bid));
};

PR.QUIPS = {
  karim: {
    win: ["Sudah kuduga. Punyaku.", "Hah! Pelabuhan ini milikku.", "Mahal? Demi rempah, tidak."],
    lose: ["Hmph. Ambil saja dulu.", "Dua puluh! Berani-beraninya.", "Awas kau ronde depan."],
    idle: ["Dua puluh! Berani?", "Rempah bagus tak menunggu.", "Tawar yang tinggi, nak."],
  },
  lie: {
    win: ["Pas. Masuk gudangku.", "Sabar itu membuahkan set.", "Pala lagi… aku ambil."],
    lose: ["Silakan. Aku menunggu yang lebih baik.", "Terlalu mahal untukku.", "Belum rezekiku."],
    idle: ["Pala lagi… aku ambil.", "Set-ku hampir lengkap.", "Pelan-pelan saja."],
  },
};

PR.pickQuip = function (rand, list) {
  return list[Math.floor(rand() * list.length)];
};
