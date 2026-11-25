"use strict";
// Game flow: title → intro → bid → reveal → (next round | tally).
// The pure steps (startRound / lockBids / settle) are separate from the
// timers so the self-test and the scripted playthrough can drive them.

PR.newPlayer = function (id, name) {
  return { id, name, coins: PR.START_COINS, rack: [] };
};

PR.newGame = function (seed) {
  return {
    mode: "title",
    time: 0,
    seed,
    rand: PR.rng(seed),
    round: 0,
    market: 0,
    lot: [],
    carry: [],
    carryNote: "",
    players: [
      PR.newPlayer("you", "Kamu"),
      PR.newPlayer("karim", "Haji Karim"),
      PR.newPlayer("lie", "Nyonya Lie"),
    ],
    playerBid: 0,
    bids: null,
    winner: null,
    phaseT: 0,
    flipPlayed: false,
    settleDone: false,
    quips: {
      karim: { text: "", t: 0 },
      lie: { text: "", t: 0 },
      you: { text: "", t: 0 },
    },
    fx: [],
    idleT: 5,
    tallyOrder: null,
    frozen: false,
  };
};

PR.startRound = function (g) {
  g.round++;
  g.market = Math.floor(g.rand() * 4);
  const fresh = PR.makeLot(g.rand, g.market);
  const rolled = g.carry.length;
  g.lot = g.carry.concat(fresh).slice(0, PR.LOT_CAP);
  g.carry = [];
  g.carryNote = rolled > 0 ? "termasuk " + rolled + " kartu gulungan dari seri" : "";
  g.playerBid = Math.min(g.players[0].coins, PR.lotValue(g.lot, g.market));
  g.bids = null;
  g.winner = null;
  g.phaseT = 0;
  g.flipPlayed = false;
  g.settleDone = false;
  g.mode = "bid";
  g.idleT = 4 + g.rand() * 4;
};

PR.lockBids = function (g) {
  const you = g.players[0];
  g.bids = {
    you: Math.max(0, Math.min(you.coins, g.playerBid | 0)),
    karim: PR.aiBid("karim", g.lot, g.market, g.players[1].rack, g.players[1].coins, g.rand),
    lie: PR.aiBid("lie", g.lot, g.market, g.players[2].rack, g.players[2].coins, g.rand),
  };
  const max = Math.max(g.bids.you, g.bids.karim, g.bids.lie);
  const tops = ["you", "karim", "lie"].filter((k) => g.bids[k] === max);
  g.winner = max <= 0 || tops.length > 1 ? "tie" : tops[0];
  g.mode = "reveal";
  g.phaseT = 0;
  g.flipPlayed = false;
  g.settleDone = false;
  const say = (who, kind) => {
    g.quips[who] = { text: PR.pickQuip(g.rand, PR.QUIPS[who][kind]), t: 3.4 };
  };
  if (g.winner === "karim") { say("karim", "win"); if (g.rand() < 0.6) say("lie", "lose"); }
  else if (g.winner === "lie") { say("lie", "win"); if (g.rand() < 0.6) say("karim", "lose"); }
  else if (g.winner === "you") { if (g.rand() < 0.7) say("karim", "lose"); if (g.rand() < 0.5) say("lie", "lose"); }
  else if (g.rand() < 0.5) say("karim", "idle");
  if (g.winner !== "tie") {
    const wp = PR.POS.plaques[g.winner];
    PR.burst(g, wp[0], wp[1] - 12, "#ffd964", 12);
    PR.audio.gavel();
  }
};

PR.settle = function (g) {
  if (g.winner && g.winner !== "tie") {
    const idx = { you: 0, karim: 1, lie: 2 }[g.winner];
    const p = g.players[idx];
    p.coins -= g.bids[g.winner];
    for (const t of g.lot) {
      p.rack.push({ t, v: PR.cardValue(t, g.market), stamped: t === g.market });
    }
    g.carry = [];
    if (g.winner === "you") PR.audio.coin();
  } else {
    // A tied lot rolls into the next round — except after the last one.
    g.carry = g.round >= PR.ROUNDS ? [] : g.lot.slice();
  }
  if (g.round >= PR.ROUNDS) {
    g.mode = "tally";
    g.tallyOrder = [0, 1, 2].slice().sort((a, b) => PR.wealth(g.players[b]) - PR.wealth(g.players[a]));
    if (g.tallyOrder[0] === 0) PR.audio.win(); else PR.audio.lose();
  } else {
    PR.startRound(g);
    PR.audio.bell();
  }
};

PR.burst = function (g, px, py, color, n) {
  for (let i = 0; i < n; i++) {
    const a = g.rand() * 6.28, sp = 30 + g.rand() * 90;
    g.fx.push({
      x: px, y: py,
      vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40,
      life: 0.9, maxLife: 0.9,
      color, size: 2 + g.rand() * 2.5,
    });
  }
};

// ---------- input ----------
function inRect(p, r) {
  return r && p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
}

PR.handleClick = function (g, p) {
  if (g.frozen) return;
  if (g.mode === "title") { g.mode = "intro"; PR.audio.bell(); return; }
  if (g.mode === "intro") { PR.startRound(g); PR.audio.bell(); return; }
  if (g.mode === "tally") { PR.resetToTitle(g); return; }
  if (g.mode !== "bid" || !PR.ui) return;
  const you = g.players[0];
  for (const chip of PR.ui.chips || []) {
    const d = Math.hypot(p.x - chip.x, p.y - chip.y);
    if (d <= chip.r) {
      g.playerBid = Math.min(you.coins, g.playerBid + chip.amt);
      PR.audio.coin();
      return;
    }
  }
  if (inRect(p, PR.ui.minus)) { g.playerBid = Math.max(0, g.playerBid - 1); PR.audio.flip(); return; }
  if (inRect(p, PR.ui.plus)) { g.playerBid = Math.min(you.coins, g.playerBid + 1); PR.audio.flip(); return; }
  if (inRect(p, PR.ui.bidBtn)) { PR.lockBids(g); }
};

PR.resetToTitle = function (g) {
  const fresh = PR.newGame((Math.random() * 1e9) | 0);
  for (const k of Object.keys(fresh)) g[k] = fresh[k];
  g.mode = "title";
};

PR.handleKeys = function (g) {
  if (PR.input.consume("KeyM")) PR.audio.toggleMute();
  if (g.frozen) return;
  if (g.mode === "title" && PR.input.consume("Enter")) { g.mode = "intro"; return; }
  if (g.mode === "intro" && PR.input.consume("Enter")) { PR.startRound(g); return; }
  if (g.mode === "tally" && (PR.input.consume("KeyR") || PR.input.consume("Enter"))) { PR.resetToTitle(g); return; }
  if (g.mode !== "bid") return;
  const you = g.players[0];
  if (PR.input.consume("ArrowUp")) g.playerBid = Math.min(you.coins, g.playerBid + 1);
  if (PR.input.consume("ArrowDown")) g.playerBid = Math.max(0, g.playerBid - 1);
  if (PR.input.consume("Enter")) PR.lockBids(g);
};

PR.update = function (g, dt) {
  for (const p of PR.input.drainClicks()) PR.handleClick(g, p);
  PR.handleKeys(g);
  if (g.frozen) return;
  g.time += dt;
  for (let i = g.fx.length - 1; i >= 0; i--) {
    const p = g.fx[i];
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 60 * dt;
    if (p.life <= 0) g.fx.splice(i, 1);
  }
  for (const k of ["karim", "lie", "you"]) if (g.quips[k].t > 0) g.quips[k].t -= dt;
  if (g.mode === "bid") {
    g.idleT -= dt;
    if (g.idleT <= 0) {
      const who = g.rand() < 0.5 ? "karim" : "lie";
      g.quips[who] = { text: PR.pickQuip(g.rand, PR.QUIPS[who].idle), t: 2.6 };
      g.idleT = 6 + g.rand() * 5;
    }
  }
  if (g.mode === "reveal") {
    g.phaseT += dt;
    if (g.phaseT > 0.45 && !g.flipPlayed) { g.flipPlayed = true; PR.audio.flip(); }
    if (g.phaseT >= 2.6 && !g.settleDone) { g.settleDone = true; PR.settle(g); }
  }
};

// ---------- staged scenes for screenshots ----------
PR.stage = function (shot) {
  const g = PR.newGame(7);
  g.frozen = true;
  const card = (t, v, stamped) => ({ t, v, stamped: !!stamped });
  if (shot === "title") {
    g.frozen = false;
    g.mode = "title";
    return g;
  }
  if (shot === "bid") {
    g.round = 4; g.market = 0; g.lot = [0, 1, 2, 3];
    g.players[0].rack = [card(1, 4), card(2, 3)];
    g.players[1].coins = 24; g.players[1].rack = [card(3, 2)];
    g.players[2].coins = 26; g.players[2].rack = [card(0, 5), card(2, 3)];
    g.playerBid = 14;
    g.mode = "bid";
    g.quips.karim = { text: "Rempah bagus tak menunggu.", t: 99 };
    return g;
  }
  if (shot === "tally") {
    g.round = 9; g.market = 1; g.lot = [0, 1, 2];
    g.players[0].coins = 14;
    g.players[0].rack = [card(0, 10, 1), card(1, 4), card(2, 3), card(3, 2), card(0, 5), card(1, 8, 1), card(2, 3), card(0, 5), card(1, 4), card(2, 6, 1), card(0, 5), card(1, 4), card(1, 4)];
    g.players[1].coins = 9;
    g.players[1].rack = [card(0, 10, 1), card(1, 8, 1), card(1, 4), card(2, 3), card(3, 2), card(1, 4), card(2, 3)];
    g.players[2].coins = 16;
    g.players[2].rack = [card(1, 4), card(2, 3), card(3, 2), card(0, 5)];
    g.mode = "tally";
    g.tallyOrder = [0, 1, 2];
    return g;
  }
  // cover: round 7 — a rolled-over lot of six cards, and YOU take it for 24.
  g.round = 7; g.market = 0; g.lot = [0, 1, 2, 3, 2, 0];
  g.carryNote = "termasuk 3 kartu gulungan dari seri";
  g.players[0].coins = 22;
  g.players[0].rack = [card(0, 10, 1), card(1, 4), card(2, 3), card(3, 2), card(0, 5), card(1, 8, 1), card(2, 6, 1)];
  g.players[1].coins = 26;
  g.players[1].rack = [card(0, 5), card(1, 4), card(2, 3), card(3, 2), card(0, 10, 1), card(1, 4)];
  g.players[2].coins = 15;
  g.players[2].rack = [card(1, 4), card(2, 3), card(3, 2), card(0, 5), card(1, 4), card(2, 3)];
  g.bids = { you: 24, karim: 19, lie: 21 };
  g.winner = "you";
  g.mode = "reveal";
  g.phaseT = 1.2;
  g.quips.karim = { text: "Hmph. Ambil saja.", t: 99 };
  g.quips.lie = { text: "Belum rezekiku.", t: 99 };
  // a frozen arc of gold coins flying from your plaque to the lot you won
  for (let i = 0; i <= 11; i++) {
    const t = i / 11;
    const px = 150 + (478 - 150) * t, py = 486 + (440 - 486) * t - Math.sin(t * 3.14159) * 90;
    g.fx.push({ x: px, y: py, vx: 0, vy: 0, life: 99, maxLife: 99, color: "#ffd964", size: 3 + (i % 3) });
  }
  // sparkles over the two stamped nutmeg cards
  for (const sp of [[301, 372], [537, 548]]) {
    for (let i = 0; i < 6; i++) {
      g.fx.push({ x: sp[0] + (g.rand() - 0.5) * 80, y: sp[1] + (g.rand() - 0.5) * 110, vx: 0, vy: 0, life: 99, maxLife: 99, color: "#ffe98a", size: 2 + g.rand() * 2.5 });
    }
  }
  return g;
};

// ---------- boot ----------
(function boot() {
  const canvas = document.getElementById("cv");
  const ctx = canvas.getContext("2d");
  PR.input.attach(canvas);
  const q = new URLSearchParams(location.search);
  let G;
  if (q.get("shot")) {
    document.body.classList.add("shot");
    G = PR.stage(q.get("shot"));
  } else {
    G = PR.newGame((Math.random() * 1e9) | 0);
  }
  window.__game = G;
  let last = performance.now(), acc = 0;
  function frame(now) {
    acc += Math.min(0.1, (now - last) / 1000);
    last = now;
    while (acc >= PR.STEP) { PR.update(G, PR.STEP); acc -= PR.STEP; }
    PR.render(ctx, G);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  // Hooks for the scripted playthrough: fixed-step time and state as text.
  window.advanceTime = function (ms) {
    const steps = Math.round(ms / 1000 / PR.STEP);
    for (let i = 0; i < steps; i++) PR.update(G, PR.STEP);
    PR.render(ctx, G);
  };
  window.render_game_to_text = function () {
    return JSON.stringify({
      mode: G.mode, round: G.round, market: PR.SPICES[G.market].id,
      lot: G.lot.map((t) => PR.SPICES[t].id), lotValue: PR.lotValue(G.lot, G.market),
      bids: G.bids, winner: G.winner,
      players: G.players.map((p) => ({ name: p.name, coins: p.coins, goods: PR.goodsValue(p.rack), sets: PR.setsIn(p.rack), wealth: PR.wealth(p) })),
    });
  };
  window.__shotReady = true;
})();
