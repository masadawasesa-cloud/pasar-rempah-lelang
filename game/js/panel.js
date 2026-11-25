"use strict";
// The labelled side panel and the top strip. Everything the judge needs to
// understand the game is named here in words: standings, the market card,
// the lot's arithmetic, set progress, rules and controls.

PR.drawPanel = function (x, g) {
  const PX = PR.PANEL_X;
  // top strip over the playfield
  rrect(x, 28, 8, 872, 42, 10, "rgba(16,10,6,0.85)");
  strokeR(x, 28, 8, 872, 42, 10, "#c9a44a", 2);
  txt(x, "RONDE " + Math.max(1, g.round) + " / " + PR.ROUNDS, 52, 30, 16, "#ffd964", "left", "bold", "Arial");
  const phase = {
    title: "PASAR REMPAH",
    intro: "PAGI DI PELABUHAN",
    bid: "TAWARAN DIBUKA…",
    reveal: g.winner === "tie" ? "SERI — LOT MENGGELINDING" : g.winner ? "PALU JATUH!" : "PALU JATUH!",
    tally: "LELANG SELESAI",
  }[g.mode];
  txt(x, phase, 330, 30, 15, "#fff6e0", "left", "bold", "Georgia");
  txt(x, "KOINMU: " + g.players[0].coins, 876, 30, 16, "#ffe9b0", "right", "bold", "Arial");

  // panel body
  rrect(x, PX, 96, PR.PANEL_W - 36, 676, 16, "#123a34");
  strokeR(x, PX, 96, PR.PANEL_W - 36, 676, 16, "#c9a44a", 3);
  const L = PX + 22, R = PX + PR.PANEL_W - 58;
  txt(x, "PASAR REMPAH", PX + (PR.PANEL_W - 36) / 2, 128, 27, "#ffd964", "center", "bold", "Georgia");
  txt(x, "Lelang rempah pelabuhan • Ronde " + Math.max(1, g.round) + " dari " + PR.ROUNDS, PX + (PR.PANEL_W - 36) / 2, 152, 12, "#bfe3d8", "center", "normal", "Arial");
  line(x, L, 168, R, 168, "rgba(201,164,74,0.6)", 2);

  txt(x, "KLASEMEN (kekayaan)", L, 190, 13, "#ffd964", "left", "bold", "Arial");
  const order = [0, 1, 2].slice().sort((a, b) => PR.wealth(g.players[b]) - PR.wealth(g.players[a]));
  const dots = ["#7fb2ff", "#e8b93b", "#39d0ba"];
  order.forEach((pi, i) => {
    const p = g.players[pi], py = 214 + i * 30;
    circ(x, L + 8, py, 5, dots[pi]);
    txt(x, p.name, L + 22, py, 14, "#fff6e0", "left", "bold", "Arial");
    txt(x, p.coins + " koin", L + 174, py, 12.5, "#ffe9b0", "right", "bold", "Arial");
    txt(x, "barang " + PR.goodsValue(p.rack), R, py, 11, "#bfe3d8", "right", "normal", "Arial");
  });

  // market card box
  rrect(x, L - 4, 312, R - L + 8, 86, 10, "rgba(255,217,100,0.13)");
  strokeR(x, L - 4, 312, R - L + 8, 86, 10, "#c9a44a", 1.5);
  txt(x, "KARTU PASAR RONDE INI", L + 12, 332, 12, "#ffd964", "left", "bold", "Arial");
  const mk = PR.SPICES[g.market];
  txt(x, mk.name + " ×2 — kartu " + mk.name.toLowerCase() + " yang", L + 12, 354, 13.5, "#fff6e0", "left", "normal", "Georgia");
  txt(x, "dimenangkan ronde ini bernilai ganda", L + 12, 374, 13.5, "#fff6e0", "left", "normal", "Georgia");

  txt(x, "LOT DI MEJA", L, 424, 13, "#ffd964", "left", "bold", "Arial");
  const lotCounts = [0, 0, 0, 0];
  for (const t of g.lot) lotCounts[t]++;
  const parts = [];
  PR.SPICES.forEach((sp, i) => {
    if (!lotCounts[i]) return;
    const nm = sp.name.split(" ")[0];
    parts.push(lotCounts[i] > 1 ? nm + " ×" + lotCounts[i] + "=" + PR.cardValue(i, g.market) * lotCounts[i] : nm + " " + PR.cardValue(i, g.market));
  });
  txt(x, parts.join(" + ") + " = " + PR.lotValue(g.lot, g.market), L, 446, 11.5, "#fff6e0", "left", "normal", "Arial");
  txt(x, g.carryNote || (g.lot.length + " kartu di atas tikar"), L, 466, 12.5, "#bfe3d8", "left", "normal", "Arial");

  txt(x, "SET LENGKAP +12", L, 494, 13, "#ffd964", "left", "bold", "Arial");
  const counts = PR.typeCounts(g.players[0].rack);
  PR.SPICES.forEach((sp, i) => {
    const sx = L + i * 30;
    rrect(x, sx, 512, 24, 32, 4, counts[i] > 0 ? sp.panel : "rgba(255,255,255,0.08)");
    txt(x, String(counts[i]), sx + 12, 529, 13, counts[i] > 0 ? "#fff6e0" : "#8fb8ad", "center", "bold", "Arial");
  });
  const sets = PR.setsIn(g.players[0].rack);
  txt(x, sets > 0 ? sets + " set lengkap terkumpul" : "Kumpulkan 4 jenis untuk +12", L + 130, 529, 11.5, "#bfe3d8", "left", "normal", "Arial");

  txt(x, "ATURAN MAIN", L, 576, 13, "#ffd964", "left", "bold", "Arial");
  txt(x, "• Tawar diam-diam, tertinggi menang", L, 596, 12, "#fff6e0", "left", "normal", "Arial");
  txt(x, "• Pemenang membayar tawarannya sendiri", L, 614, 12, "#fff6e0", "left", "normal", "Arial");
  txt(x, "• Seri → lot menggelinding ke ronde depan", L, 632, 12, "#fff6e0", "left", "normal", "Arial");

  txt(x, "KENDALI", L, 662, 13, "#ffd964", "left", "bold", "Arial");
  txt(x, "Klik keping +1/+5/+10, tombol −/+", L, 682, 12, "#fff6e0", "left", "normal", "Arial");
  txt(x, "Enter atau TAWAR! untuk mengunci", L, 700, 12, "#fff6e0", "left", "normal", "Arial");
  txt(x, "Panah ↑↓ atur tawaran • M: bisu", L, 718, 12, "#fff6e0", "left", "normal", "Arial");
};
