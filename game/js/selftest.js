"use strict";
// ?test=1 — plays three full seeded games through the pure flow functions
// (startRound once, then lock/settle per round; settle starts the next
// round itself) and writes the result into #testout for headless checks.
(function () {
  const q = new URLSearchParams(location.search);
  if (!q.has("test")) return;
  const lines = [];
  let allOk = true;
  for (const seed of [12345, 777, 20261123]) {
    const g = PR.newGame(seed);
    PR.startRound(g);
    for (let r = 0; r < PR.ROUNDS; r++) {
      g.playerBid = Math.min(g.players[0].coins, PR.lotValue(g.lot, g.market));
      PR.lockBids(g);
      PR.settle(g);
    }
    const ok =
      g.mode === "tally" &&
      g.players.every((p) => p.coins >= 0) &&
      Array.isArray(g.tallyOrder) && g.tallyOrder.length === 3 &&
      g.players.some((p) => p.rack.length > 0);
    if (!ok) allOk = false;
    lines.push(
      "seed " + seed + ": mode=" + g.mode +
      " wealths=" + g.players.map((p) => PR.wealth(p)).join("/") +
      " racks=" + g.players.map((p) => p.rack.length).join("/") +
      " " + (ok ? "OK" : "FAIL")
    );
  }
  lines.push(allOk ? "SELFTEST PASS" : "SELFTEST FAIL");
  document.getElementById("testout").textContent = lines.join("\n");
  window.__testDone = true;
})();
