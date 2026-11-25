"use strict";
// All drawing. The scene is a harbour market stall at dusk: a big wooden
// table, a woven mat where the lots lie, sacks and piles of spice, hanging
// lanterns, and the three merchants around the table. Everything is drawn
// from game state, so staged scenes (?shot=) are real frames of the game.

// Anchor points shared with game.js (plaque positions feed the sparkle fx).
PR.POS = {
  karim: [120, 196],
  lie: [836, 196],
  you: [120, 560],
  plaques: { karim: [120, 330], lie: [836, 330], you: [120, 486] },
  racks: { karim: [24, 368], lie: [756, 392], you: [36, 648] },
};

PR.lotPos = function (n) {
  const pos = [];
  if (n <= 4) {
    for (let i = 0; i < n; i++) pos.push([478 - (n - 1) * 59 + i * 118, 432]);
  } else {
    for (let i = 0; i < 4; i++) pos.push([478 - 3 * 59 + i * 118, 372]);
    for (let i = 4; i < n; i++) pos.push([478 - (n - 5) * 59 + (i - 4) * 118, 548]);
  }
  return pos;
};

// ---------- small helpers ----------
function rr(x, px, py, w, h, r) { x.beginPath(); x.roundRect(px, py, w, h, r); }
function rrect(x, px, py, w, h, r, c) { x.fillStyle = c; rr(x, px, py, w, h, r); x.fill(); }
function strokeR(x, px, py, w, h, r, c, w2) { x.strokeStyle = c; x.lineWidth = w2; rr(x, px, py, w, h, r); x.stroke(); }
function circ(x, px, py, r, c) { x.fillStyle = c; x.beginPath(); x.arc(px, py, r, 0, 7); x.fill(); }
function line(x, x1, y1, x2, y2, c, w) { x.strokeStyle = c; x.lineWidth = w; x.beginPath(); x.moveTo(x1, y1); x.lineTo(x2, y2); x.stroke(); }
function txt(x, t, px, py, size, c, align, weight, font) {
  x.fillStyle = c;
  x.font = (weight || "bold") + " " + size + "px " + (font || "Georgia,serif");
  x.textAlign = align || "left";
  x.textBaseline = "middle";
  x.fillText(t, px, py);
}
function glow(x, px, py, r, c0) {
  const gr = x.createRadialGradient(px, py, 8, px, py, r);
  gr.addColorStop(0, c0); gr.addColorStop(1, "rgba(0,0,0,0)");
  x.fillStyle = gr; x.beginPath(); x.arc(px, py, r, 0, 7); x.fill();
}

// ---------- the table and its dressing ----------
function drawTable(x, decor) {
  const g = x.createLinearGradient(0, 0, 0, 800);
  g.addColorStop(0, "#2a1408"); g.addColorStop(0.55, "#3a1d0c"); g.addColorStop(1, "#241205");
  x.fillStyle = g; x.fillRect(0, 0, PR.FIELD_W, 800);
  for (let i = 0; i < 20; i++) { const px = i * 50 + ((i % 2) ? 6 : -4); line(x, px, 0, px, 800, "rgba(0,0,0,0.16)", 2); }
  // pennant garland
  const flagCols = ["#d93a2b", "#f2a71b", "#1f9e8a", "#e8e3d5", "#c2185b"];
  for (let row = 0; row < 2; row++) {
    const yb = 62 + row * 30;
    x.strokeStyle = "rgba(240,220,180,0.5)"; x.lineWidth = 2; x.beginPath(); x.moveTo(0, yb);
    for (let px = 0; px <= PR.FIELD_W; px += 32) x.lineTo(px, yb + Math.sin(px / 210 + row) * 11);
    x.stroke();
    for (let i = 0; i < 29; i++) {
      const px = 16 + i * 32, py = yb + Math.sin(px / 210 + row) * 11 + 2;
      x.fillStyle = flagCols[(i + row * 2) % 5];
      x.beginPath(); x.moveTo(px - 9, py); x.lineTo(px + 9, py); x.lineTo(px, py + 15); x.closePath(); x.fill();
    }
  }
  // the table itself
  rrect(x, 28, 96, 872, 676, 18, "#6d4423"); strokeR(x, 28, 96, 872, 676, 18, "#3c2410", 5);
  rrect(x, 40, 108, 848, 652, 12, "#7d5027");
  for (let i = 0; i < 15; i++) {
    const py = 126 + i * 44;
    line(x, 44, py, 896, py, "rgba(46,26,8,0.35)", 2);
    for (let j = 0; j < 90; j++) { const gx = 50 + decor() * 850, gy = py + (decor() - 0.5) * 14; line(x, gx, gy, gx + 6 + decor() * 20, gy, "rgba(46,26,8,0.20)", 1); }
  }
  glow(x, 150, 150, 210, "rgba(255,176,66,0.30)");
  glow(x, 800, 150, 210, "rgba(255,176,66,0.30)");
  glow(x, 474, 470, 330, "rgba(255,190,80,0.13)");
  // woven mat
  const MX = 252, MY = 238, MW = 452, MH = 430;
  rrect(x, MX - 10, MY - 10, MW + 20, MH + 20, 10, "#8c2f22");
  for (let i = 0; i < 23; i++) for (let j = 0; j < 22; j++) {
    const px = MX + i * 20, py = MY + j * 20;
    x.fillStyle = ((i + j) % 2) ? "#c9b458" : "#7a8c3f";
    x.fillRect(px, py, 20, 20);
    x.fillStyle = "rgba(0,0,0,0.10)";
    if ((i + j) % 2) x.fillRect(px, py, 20, 3); else x.fillRect(px, py, 3, 20);
  }
  strokeR(x, MX - 10, MY - 10, MW + 20, MH + 20, 10, "#5e1f16", 3);
  for (let i = 0; i < 45; i++) { const px = MX - 4 + i * 10.4; line(x, px, MY + MH + 12, px + (decor() - 0.5) * 4, MY + MH + 26, "#d8c690", 2); }
  // loose spice dressing
  pile(x, decor, 196, 436, 25, "#7a4a21", 46);
  pile(x, decor, 664, 636, 18, "#3a2a1a", 40);
  for (let i = 0; i < 9; i++) { const px = 730 + decor() * 70, py = 250 + decor() * 40; x.strokeStyle = "#b3311f"; x.lineWidth = 3; x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + 7, py + 3, px + 15, py - 3); x.stroke(); }
  for (let i = 0; i < 7; i++) { const px = 176 + decor() * 60, py = 472 + decor() * 40; circ(x, px, py, 3, "#8a5a2a"); line(x, px, py, px + 6, py - 5, "#8a5a2a", 2); }
  for (let i = 0; i < 3; i++) { const py = 592 + i * 14; x.fillStyle = "#a5662c"; x.fillRect(606, py, 56, 9); x.fillStyle = "#7d4a1c"; x.fillRect(606, py, 20, 9); }
  x.fillStyle = "#caa64a"; x.beginPath(); x.ellipse(664, 470, 30, 11, 0, 0, 7); x.fill();
  x.fillStyle = "#8a6a1f"; x.beginPath(); x.ellipse(664, 467, 30, 10, 0, 0, 7); x.fill();
  for (let i = 0; i < 7; i++) circ(x, 646 + decor() * 36, 462 + decor() * 7, 4.6, "#e8b93b");
  // the auction ledger, open at the latest page, with coins spilled beside it
  x.save(); x.translate(652, 540); x.rotate(-0.06);
  x.fillStyle = "#6d4520"; x.fillRect(-46, -31, 92, 62);
  x.fillStyle = "#efe3c2"; x.fillRect(-42, -27, 40, 54); x.fillRect(2, -27, 40, 54);
  for (let i = 0; i < 5; i++) { line(x, -37, -16 + i * 9, -7, -16 + i * 9, "rgba(90,60,30,0.5)", 1); line(x, 7, -16 + i * 9, 37, -16 + i * 9, "rgba(90,60,30,0.5)", 1); }
  line(x, 0, -27, 0, 27, "#c9b586", 2);
  txt(x, "19", -22, 14, 13, "#7a2d1d", "center");
  txt(x, "24", 22, 14, 13, "#7a2d1d", "center");
  circ(x, 31, 17, 6, "#b3311f");
  strokeR(x, -46, -31, 92, 62, 4, "#54331a", 2);
  x.restore();
  for (const cp of [[702, 584], [710, 612], [690, 646], [700, 508]]) { circ(x, cp[0], cp[1], 6, "#e8b93b"); circ(x, cp[0], cp[1], 3.4, "#caa64a"); }
  bigSack(x, 252, 726, 38, "#b3311f", "LADA");
  bigSack(x, 338, 734, 32, "#1f7a6d", "PALA");
  bigSack(x, 856, 560, 36, "#c9862b", "KAYU");
  lantern(x, 66, 128); lantern(x, 890, 128);
  tuft(x, decor, 66, 742, 1.15, true);
  tuft(x, decor, 884, 742, 1.3, false);
  tuft(x, decor, 884, 470, 0.95, true);
}

function pile(x, decor, px, py, r, c, n) {
  for (let i = 0; i < n; i++) { const a = decor() * 6.28, d = decor() * r; circ(x, px + Math.cos(a) * d, py + Math.sin(a) * d * 0.55, 1.6 + decor() * 1.6, c); }
}

function bigSack(x, px, py, r, c, label) {
  x.fillStyle = c;
  x.beginPath();
  x.moveTo(px - r, py + r);
  x.quadraticCurveTo(px - r - 6, py - r * 0.5, px - r * 0.42, py - r * 0.85);
  x.lineTo(px + r * 0.42, py - r * 0.85);
  x.quadraticCurveTo(px + r + 6, py - r * 0.5, px + r, py + r);
  x.closePath(); x.fill();
  x.strokeStyle = "rgba(0,0,0,0.4)"; x.lineWidth = 2.5; x.stroke();
  line(x, px - r * 0.42, py - r * 0.85, px + r * 0.42, py - r * 0.85, "#efe3c2", 4);
  circ(x, px, py + r * 0.18, r * 0.34, "rgba(255,255,255,0.16)");
  if (label) txt(x, label, px, py + r * 0.2, 15, "#fff8ea", "center");
}

function lantern(x, px, py) {
  line(x, px, 42, px, py - 26, "rgba(0,0,0,0.5)", 3);
  glow(x, px, py, 86, "rgba(255,170,60,0.5)");
  rrect(x, px - 15, py - 26, 30, 10, 4, "#5e1f16");
  x.fillStyle = "#ffb84d"; x.beginPath(); x.ellipse(px, py, 17, 24, 0, 0, 7); x.fill();
  x.strokeStyle = "#a3541e"; x.lineWidth = 2; x.stroke();
  line(x, px - 17, py, px + 17, py, "#a3541e", 1.6);
  line(x, px, py - 24, px, py + 24, "#a3541e", 1.2);
  rrect(x, px - 11, py + 24, 22, 7, 3, "#5e1f16");
}

// A grass tuft drawn the way the reference teaches: blades fan from one base
// into a jagged silhouette, dark-to-light, a few flowers on thin stems.
function tuft(x, decor, px, py, scale, flowers) {
  x.save(); x.translate(px, py); x.scale(scale, scale);
  x.fillStyle = "#a8542c";
  x.beginPath(); x.moveTo(-20, 0); x.lineTo(20, 0); x.lineTo(15, 20); x.lineTo(-15, 20); x.closePath(); x.fill();
  x.fillStyle = "#7d3c1c"; x.fillRect(-22, -4, 44, 7);
  const cols = ["#2e6b22", "#3f8a2c", "#57a83a", "#79c94f"];
  for (let i = 0; i < 26; i++) {
    const bx = -17 + i * 1.36 + (decor() - 0.5) * 3, h = 20 + decor() * 24, lean = (decor() - 0.5) * 14;
    x.strokeStyle = cols[i % 4]; x.lineWidth = 2.4 + decor() * 1.2;
    x.beginPath(); x.moveTo(bx, 0); x.quadraticCurveTo(bx + lean * 0.4, -h * 0.6, bx + lean, -h); x.stroke();
  }
  for (let i = 0; i < 9; i++) {
    const bx = (decor() - 0.5) * 30;
    x.strokeStyle = "#8fe06a"; x.lineWidth = 1.8;
    x.beginPath(); x.moveTo(bx, 0); x.quadraticCurveTo(bx + 2, -16, bx + (decor() - 0.5) * 10, -(26 + decor() * 14)); x.stroke();
  }
  if (flowers) for (let i = 0; i < 3; i++) {
    const fx = (decor() - 0.5) * 26, fy = -(22 + decor() * 12);
    for (let p = 0; p < 5; p++) { const a = (p / 5) * 6.28; circ(x, fx + Math.cos(a) * 3.4, fy + Math.sin(a) * 3.4, 2.3, "#ffffff"); }
    circ(x, fx, fy, 1.8, "#f2c41b");
  }
  x.restore();
}

// ---------- spice art, drawn to look like the real thing ----------
// Drawn inside the card's art field, centred on (0,0), roughly ±28 px.
function drawSpiceArt(x, type, decor) {
  if (type === 0) { // pala — nutmeg: wrinkled brown seed laced with red mace
    x.fillStyle = "#7a4a24"; x.beginPath(); x.ellipse(0, 0, 17, 23, 0, 0, 7); x.fill();
    x.strokeStyle = "#4e2e10"; x.lineWidth = 2; x.stroke();
    x.strokeStyle = "rgba(62,36,12,0.55)"; x.lineWidth = 1.4;
    for (let i = 0; i < 8; i++) { const wy = -17 + i * 4.6; x.beginPath(); x.moveTo(-11 + ((i % 2) * 4), wy); x.quadraticCurveTo(0, wy + 3.4, 11 - ((i % 2) * 4), wy); x.stroke(); }
    for (let i = 0; i < 7; i++) circ(x, (decor() - 0.5) * 22, (decor() - 0.5) * 32, 1.5, "#d8b25a");
    x.strokeStyle = "#c23b2a"; x.lineWidth = 2.6;
    for (let i = 0; i < 5; i++) { const a = (i / 5) * 6.28; x.beginPath(); x.moveTo(Math.cos(a) * 19, Math.sin(a) * 25); x.quadraticCurveTo(Math.cos(a + 0.5) * 25, Math.sin(a + 0.5) * 30, Math.cos(a + 1) * 19, Math.sin(a + 1) * 25); x.stroke(); }
  } else if (type === 1) { // cengkeh — cloves: stemmed buds with a cross on top
    for (let i = 0; i < 5; i++) {
      const bx = -16 + i * 8, tilt = (i - 2) * 1.6;
      x.strokeStyle = "#4e3423"; x.lineWidth = 3.4;
      x.beginPath(); x.moveTo(bx + tilt, 20); x.lineTo(bx, 2); x.stroke();
      x.fillStyle = "#6e4433"; x.beginPath(); x.ellipse(bx, -6, 5.6, 8, tilt * 0.04, 0, 7); x.fill();
      x.strokeStyle = "#3c2412"; x.lineWidth = 1.2; x.stroke();
      line(x, bx - 3.4, -12.5, bx + 3.4, -12.5, "#d8a05a", 1.6);
      line(x, bx, -15.8, bx, -9.2, "#d8a05a", 1.6);
    }
  } else if (type === 2) { // lada — a hanging bunch of black peppercorns
    x.strokeStyle = "#5e7a3a"; x.lineWidth = 2.4;
    x.beginPath(); x.moveTo(0, -24); x.quadraticCurveTo(3, -14, 0, -6); x.stroke();
    const berries = [[0, -8], [-7, -2], [7, -2], [-11, 5], [0, 4], [11, 5], [-7, 12], [7, 12], [0, 17]];
    for (const p of berries) {
      circ(x, p[0], p[1], 5.6, "#2e2e36");
      x.strokeStyle = "rgba(165,165,180,0.5)"; x.lineWidth = 1;
      x.beginPath(); x.arc(p[0], p[1], 3.4, 3.6, 5.6); x.stroke();
      circ(x, p[0] - 1.6, p[1] - 1.8, 1.4, "#9a9aa6");
    }
  } else { // kayu manis — cinnamon quills with the curl showing at the end
    for (let i = 0; i < 3; i++) {
      const qx = -19 + i * 15;
      x.fillStyle = "#b06f2e"; x.fillRect(qx, -22, 11, 46);
      x.fillStyle = "#8a5423"; x.fillRect(qx, -22, 3.4, 46);
      x.fillStyle = "rgba(255,235,200,0.35)"; x.fillRect(qx + 7.6, -22, 2, 46);
      x.strokeStyle = "#7d4a1c"; x.lineWidth = 1.6;
      x.beginPath(); x.ellipse(qx + 5.5, -22, 5, 3.4, 0, 0, 7); x.stroke();
      x.beginPath(); x.ellipse(qx + 5.5, -22, 2.6, 1.7, 0, 0, 7); x.stroke();
      circ(x, qx + 5.5, -22, 0.9, "#7d4a1c");
    }
  }
}

PR.drawCard = function (x, cx, cy, rot, type, market, scale, decor) {
  const s = scale || 1;
  x.save(); x.translate(cx, cy); x.rotate(rot); x.scale(s, s);
  rrect(x, -52, -74, 104, 148, 10, "#f6ecd2");
  x.strokeStyle = "#8a6a3a"; x.lineWidth = 2.5; rr(x, -52, -74, 104, 148, 10); x.stroke();
  rrect(x, -44, -66, 88, 84, 7, PR.SPICES[type].panel);
  x.save(); x.translate(0, -24); drawSpiceArt(x, type, decor); x.restore();
  const sp = PR.SPICES[type];
  txt(x, sp.name, 0, 34, sp.name.length > 7 ? 13.5 : 16, "#33241a", "center");
  txt(x, sp.price + " emas", 0, 56, 13, "#8a6a1f", "center", "bold", "Arial");
  if (type === market) {
    circ(x, 38, -58, 17, "#d4a020");
    x.strokeStyle = "#8a6a1f"; x.lineWidth = 2; x.beginPath(); x.arc(38, -58, 17, 0, 7); x.stroke();
    txt(x, "×2", 38, -57, 15, "#3a2a05", "center");
    txt(x, "PASAR", 38, 67, 8.5, "#a3541e", "center", "bold", "Arial");
  }
  x.restore();
};

// ---------- merchants ----------
function drawMerchant(x, px, py, who) {
  const conf = {
    karim: { skin: "#8a5a34", cloth: "#7a1f1f", hair: "#20222a", kind: "peci" },
    lie: { skin: "#e8b98d", cloth: "#14524a", hair: "#2a1a12", kind: "longhair" },
    you: { skin: "#a06a3a", cloth: "#274b8f", hair: "#101014", kind: "peci" },
  }[who];
  if (conf.kind === "longhair") rrect(x, px - 26, py - 38, 52, 80, 22, conf.hair);
  x.fillStyle = conf.cloth;
  x.beginPath();
  x.moveTo(px - 34, py + 44);
  x.quadraticCurveTo(px - 36, py + 2, px - 16, py - 2);
  x.lineTo(px + 16, py - 2);
  x.quadraticCurveTo(px + 36, py + 2, px + 34, py + 44);
  x.closePath(); x.fill();
  x.strokeStyle = "rgba(0,0,0,0.35)"; x.lineWidth = 2; x.stroke();
  circ(x, px, py - 16, 17, conf.skin);
  x.fillStyle = conf.hair; x.beginPath(); x.arc(px, py - 19, 17.5, Math.PI, 0); x.fill();
  if (conf.kind === "peci") {
    x.fillStyle = "#22242a"; x.fillRect(px - 13, py - 38, 26, 12);
    x.fillStyle = "#3a3d46"; x.fillRect(px - 13, py - 29, 26, 3);
  }
  if (conf.kind === "longhair") {
    rrect(x, px - 28, py - 26, 11, 62, 5, conf.hair);
    rrect(x, px + 17, py - 26, 11, 62, 5, conf.hair);
    line(x, px - 12, py - 28, px + 12, py - 28, "#e8b93b", 2.5);
    circ(x, px - 17, py - 9, 2.6, "#e8b93b"); circ(x, px + 17, py - 9, 2.6, "#e8b93b");
  }
  circ(x, px - 6, py - 16, 2.2, "#1c1410"); circ(x, px + 6, py - 16, 2.2, "#1c1410");
  x.strokeStyle = "#1c1410"; x.lineWidth = 1.6;
  x.beginPath(); x.arc(px, py - 11, 6, 0.3, 2.8); x.stroke();
}

function nameTag(x, px, py, name, sub, c) {
  rrect(x, px - 64, py, 128, 34, 8, "rgba(16,10,6,0.82)");
  strokeR(x, px - 64, py, 128, 34, 8, c, 2);
  txt(x, name, px, py + 11, 14, "#ffe9b0", "center");
  txt(x, sub, px, py + 25, 9.5, "#d8cdb4", "center", "bold", "Arial");
}

function coinStack(x, px, py, n) {
  for (let i = 0; i < n; i++) {
    x.fillStyle = "#e8b93b"; x.beginPath(); x.ellipse(px, py - i * 5, 13, 5, 0, 0, 7); x.fill();
    x.strokeStyle = "#9a7414"; x.lineWidth = 1; x.stroke();
  }
}

function drawRack(x, px, py, rack) {
  rrect(x, px, py, 88, 78, 6, "#4a2c12");
  strokeR(x, px, py, 88, 78, 6, "#2c1908", 2);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
    const idx = j * 3 + i, cx = px + 8 + i * 26, cy = py + 8 + j * 34;
    const card = rack[idx];
    if (card) {
      rrect(x, cx, cy, 20, 28, 3, PR.SPICES[card.t].panel);
      x.fillStyle = card.stamped ? "#ffd964" : "rgba(255,255,255,0.75)";
      x.fillRect(cx + 4, cy + 5, 12, 3);
    } else {
      rrect(x, cx, cy, 20, 28, 3, "rgba(255,255,255,0.06)");
    }
  }
  if (rack.length > 6) txt(x, "+" + (rack.length - 6), px + 80, py + 70, 10, "#ffe9b0", "right", "bold", "Arial");
}

function drawPlaque(x, px, py, shown, label, c, flip) {
  x.save(); x.translate(px, py); x.scale(Math.max(0.08, Math.abs(flip)), 1);
  rrect(x, -42, -24, 84, 48, 8, "#2c1c0e");
  strokeR(x, -42, -24, 84, 48, 8, c, 2.5);
  txt(x, shown, 0, -4, 24, "#ffe9b0", "center");
  txt(x, label, 0, 15, 9, "#d8cdb4", "center", "bold", "Arial");
  x.restore();
}

function drawBubble(x, px, py, text) {
  const w = 30 + text.length * 7.4;
  rrect(x, px, py, w, 30, 10, "#fff8ea");
  x.fillStyle = "#fff8ea";
  x.beginPath(); x.moveTo(px + 16, py + 30); x.lineTo(px + 30, py + 30); x.lineTo(px + 20, py + 40); x.closePath(); x.fill();
  txt(x, text, px + w / 2, py + 16, 13.5, "#33241a", "center", "bold", "Georgia");
}

// ---------- bid controls ----------
PR.drawBidControls = function (x, g) {
  const y = 700, h = 46;
  PR.ui = { chips: [] };
  const btn = (bx, label, main) => {
    rrect(x, bx, y, 44, h, 9, main ? "#8c2f22" : "#2c1c0e");
    strokeR(x, bx, y, 44, h, 9, "#c9a44a", 2);
    txt(x, label, bx + 22, y + h / 2 + 1, 20, "#ffe9b0", "center");
    return { x: bx, y, w: 44, h };
  };
  PR.ui.minus = btn(418, "−", false);
  txt(x, String(g.playerBid), 493, y + h / 2 + 1, 24, "#ffd964", "center", "bold", "Arial");
  txt(x, "TAWARANMU", 493, y - 12, 9.5, "#d8cdb4", "center", "bold", "Arial");
  PR.ui.plus = btn(524, "+", false);
  rrect(x, 584, y, 92, h, 10, "#b3311f");
  strokeR(x, 584, y, 92, h, 10, "#ffd964", 2);
  txt(x, "TAWAR!", 630, y + h / 2 + 1, 16, "#fff6e0", "center");
  PR.ui.bidBtn = { x: 584, y, w: 92, h };
  const amts = [1, 5, 10];
  amts.forEach((amt, i) => {
    const cx = 716 + i * 52, cy = y + h / 2;
    circ(x, cx, cy, 21, "#e8b93b");
    x.strokeStyle = "#9a7414"; x.lineWidth = 2.5; x.beginPath(); x.arc(cx, cy, 21, 0, 7); x.stroke();
    x.lineWidth = 1.2; x.beginPath(); x.arc(cx, cy, 14.5, 0, 7); x.stroke();
    txt(x, "+" + amt, cx, cy + 1, 13.5, "#5e4513", "center", "bold", "Arial");
    PR.ui.chips.push({ x: cx, y: cy, r: 23, amt });
  });
};

// ---------- screens ----------
PR.render = function (x, g) {
  const decor = PR.rng(99); // fixed seed: the dressing never flickers
  if (g.mode === "title") { drawTitle(x, g, decor); PR.drawPanel(x, g); return; }
  drawTable(x, decor);
  // merchants and their furniture
  drawMerchant(x, 120, 196, "karim");
  drawMerchant(x, 836, 196, "lie");
  drawMerchant(x, 120, 560, "you");
  nameTag(x, 120, 246, "HAJI KARIM", "agresif • suka gertak", "#e8b93b");
  nameTag(x, 836, 246, "NYONYA LIE", "sabar • pengumpul set", "#39d0ba");
  nameTag(x, 120, 610, "KAMU", "pedagang muda", "#7fb2ff");
  coinStack(x, 176, 232, Math.min(8, Math.ceil(g.players[1].coins / 6)));
  coinStack(x, 782, 232, Math.min(8, Math.ceil(g.players[2].coins / 6)));
  coinStack(x, 66, 596, Math.min(8, Math.ceil(g.players[0].coins / 6)));
  drawRack(x, PR.POS.racks.karim[0], PR.POS.racks.karim[1], g.players[1].rack);
  drawRack(x, PR.POS.racks.lie[0], PR.POS.racks.lie[1], g.players[2].rack);
  drawRack(x, PR.POS.racks.you[0], PR.POS.racks.you[1], g.players[0].rack);
  // the lot on the mat
  const pos = PR.lotPos(g.lot.length);
  g.lot.forEach((t, i) => {
    const rot = (i % 2 ? -1 : 1) * (0.03 + (i % 3) * 0.02);
    PR.drawCard(x, pos[i][0], pos[i][1], rot, t, g.market, 1, decor);
  });
  // sparkles on the stamped card
  const stampIdx = g.lot.indexOf(g.market);
  if (stampIdx >= 0 && (g.mode === "bid" || g.mode === "reveal")) {
    for (let i = 0; i < 6; i++) {
      const px = pos[stampIdx][0] - 26 + decor() * 52, py = pos[stampIdx][1] - 66 + decor() * 30;
      line(x, px - 5, py, px + 5, py, "#ffe98a", 2); line(x, px, py - 5, px, py + 5, "#ffe98a", 2);
    }
  }
  // plaques
  const flip = g.mode === "reveal" ? Math.sin(Math.min(1, g.phaseT / 0.45) * Math.PI * 0.5) : 1;
  if (g.mode === "bid") {
    drawPlaque(x, 120, 330, "?", "KARIM", "#e8b93b", 1);
    drawPlaque(x, 836, 330, "?", "LIE", "#39d0ba", 1);
    drawPlaque(x, 120, 486, String(g.playerBid), "KAMU", "#7fb2ff", 1);
    PR.drawBidControls(x, g);
  } else if (g.mode === "reveal" && g.bids) {
    const winCol = { you: "#7fb2ff", karim: "#e8b93b", lie: "#39d0ba" };
    drawPlaque(x, 120, 330, String(g.bids.karim), g.winner === "karim" ? "KARIM MENANG" : "KARIM", "#e8b93b", flip);
    drawPlaque(x, 836, 330, String(g.bids.lie), g.winner === "lie" ? "LIE MENANG" : "LIE", "#39d0ba", flip);
    drawPlaque(x, 120, 486, String(g.bids.you), g.winner === "you" ? "KAMU MENANG" : "KAMU", "#7fb2ff", flip);
    if (g.winner && g.winner !== "tie" && g.phaseT > 0.5) {
      const wp = PR.POS.plaques[g.winner];
      x.save(); x.translate(wp[0] + 52, wp[1] - 30); x.rotate(0.7);
      rrect(x, -6, -34, 12, 44, 5, "#8a5a2a"); rrect(x, -15, -44, 30, 15, 6, "#5e3a16");
      x.restore();
      x.strokeStyle = "rgba(255,233,176,0.8)"; x.lineWidth = 2.5;
      x.beginPath(); x.arc(wp[0] + 58, wp[1] - 34, 26, 4.4, 5.6); x.stroke();
      if (g.winner === "you") txt(x, "LOT INI MILIKMU — " + g.bids.you + " emas", 478, 268, 17, "#ffd964", "center");
      if (g.winner === "tie") { /* handled below */ }
    }
    if (g.winner === "tie") {
      rrect(x, 318, 250, 320, 44, 10, "rgba(16,10,6,0.88)");
      strokeR(x, 318, 250, 320, 44, 10, "#ffd964", 2);
      txt(x, g.bids.karim === 0 && g.bids.lie === 0 && g.bids.you === 0 ? "SEMUA PASS — LOT MENGGELINDING" : "SERI — LOT MENGGELINDING", 478, 273, 16.5, "#ffd964", "center");
    }
  }
  // speech bubbles
  if (g.quips.karim.t > 0) drawBubble(x, 176, 118, g.quips.karim.text);
  if (g.quips.lie.t > 0) { const w = 30 + g.quips.lie.text.length * 7.4; drawBubble(x, 836 - w - 56, 118, g.quips.lie.text); }
  if (g.quips.you && g.quips.you.t > 0) drawBubble(x, 176, 452, g.quips.you.text);
  // particles
  for (const p of g.fx) {
    x.globalAlpha = Math.max(0, p.life / p.maxLife);
    circ(x, p.x, p.y, p.size, p.color);
  }
  x.globalAlpha = 1;
  if (g.mode === "intro") drawIntro(x, g);
  if (g.mode === "tally") drawTally(x, g);
  PR.drawPanel(x, g);
};

function drawTitle(x, g, decor) {
  drawTable(x, decor);
  x.fillStyle = "rgba(12,7,3,0.62)"; x.fillRect(0, 0, PR.FIELD_W, 800);
  txt(x, "PASAR REMPAH", 464, 150, 64, "#ffd964", "center", "bold", "Georgia");
  txt(x, "Lelang rempah pelabuhan melawan dua saudagar licik", 464, 196, 17, "#fff3d0", "center", "normal", "Georgia");
  const types = [0, 1, 2, 3];
  types.forEach((t, i) => PR.drawCard(x, 290 + i * 116, 356, (i - 1.5) * 0.09, t, 0, 1.06, decor));
  txt(x, "Tawar diam-diam • Seri membuat lot menggelinding • Set lengkap +12", 464, 492, 15, "#ffe9b0", "center", "bold", "Georgia");
  txt(x, "HAJI KARIM menggertak harga naik — NYONYA LIE menunggu set-nya lengkap", 464, 522, 13.5, "#d8cdb4", "center", "normal", "Arial");
  const pulse = 0.72 + 0.28 * Math.sin(g.time * 3);
  x.globalAlpha = pulse;
  rrect(x, 314, 576, 300, 54, 12, "#b3311f");
  strokeR(x, 314, 576, 300, 54, 12, "#ffd964", 2.5);
  txt(x, "MULAI LELANG", 464, 604, 20, "#fff6e0", "center");
  x.globalAlpha = 1;
  txt(x, "Klik atau tekan Enter • 9 ronde • modal 30 emas", 464, 664, 13, "#bfe3d8", "center", "normal", "Arial");
}

function drawIntro(x, g) {
  x.fillStyle = "rgba(12,7,3,0.45)"; x.fillRect(0, 0, PR.FIELD_W, 800);
  rrect(x, 164, 208, 600, 384, 14, "#f6ecd2");
  strokeR(x, 164, 208, 600, 384, 14, "#8a6a3a", 3);
  txt(x, "PAGI DI PELABUHAN", 464, 252, 24, "#7a1f1f", "center", "bold", "Georgia");
  const lines = [
    "Kapal dari Banda baru sandar. Sembilan lot rempah",
    "akan dilelang sebelum siang — dan dua saudagar tua",
    "sudah mengincar lot yang sama denganmu.",
    "",
    "Setiap ronde, satu jenis rempah jadi primadona pasar",
    "dan bernilai GANDA bagi pemenang lot ronde itu.",
    "Tawarlah diam-diam: tertinggi menang dan membayar",
    "tawarannya sendiri. Seri? Lot menggelinding ke ronde",
    "berikutnya, makin besar, makin diperebutkan.",
    "",
    "Kumpulkan set lengkap empat rempah untuk bonus +12.",
    "Di akhir ronde 9, kekayaan terbesar jadi Raja Rempah.",
  ];
  lines.forEach((l, i) => txt(x, l, 464, 292 + i * 21, 14.5, "#33241a", "center", "normal", "Georgia"));
  rrect(x, 339, 528, 250, 42, 10, "#b3311f");
  txt(x, "MULAI — RONDE 1", 464, 550, 16, "#fff6e0", "center");
  PR.ui = { startBtn: { x: 339, y: 528, w: 250, h: 42 } };
}

function drawTally(x, g) {
  x.fillStyle = "rgba(12,7,3,0.55)"; x.fillRect(0, 0, PR.FIELD_W, 800);
  rrect(x, 144, 168, 640, 452, 14, "#123a34");
  strokeR(x, 144, 168, 640, 452, 14, "#c9a44a", 3);
  txt(x, "HASIL AKHIR — RONDE 9 SELESAI", 464, 208, 22, "#ffd964", "center", "bold", "Georgia");
  const order = g.tallyOrder || [0, 1, 2];
  const medals = ["JUARA", "KE-2", "KE-3"];
  order.forEach((pi, rank) => {
    const p = g.players[pi];
    const py = 262 + rank * 74;
    const isYou = pi === 0;
    rrect(x, 176, py - 28, 576, 60, 10, rank === 0 ? "rgba(255,217,100,0.16)" : "rgba(255,255,255,0.05)");
    txt(x, medals[rank], 196, py + 2, 13, rank === 0 ? "#ffd964" : "#bfe3d8", "left", "bold", "Arial");
    txt(x, p.name, 268, py + 2, 19, "#fff6e0", "left", "bold", "Georgia");
    txt(x, "koin " + p.coins + " + barang " + PR.goodsValue(p.rack) + " + set " + PR.setsIn(p.rack) + "×12", 470, py + 2, 13.5, "#bfe3d8", "left", "normal", "Arial");
    txt(x, String(PR.wealth(p)), 736, py + 2, 24, "#ffd964", "right", "bold", "Arial");
  });
  const winner = g.players[order[0]];
  const story = order[0] === 0
    ? "Kau pulang sebagai Raja Rempah Pelabuhan — Karim menunduk, Lie tersenyum kecut."
    : order[0] === 1
      ? "Haji Karim memborong pelabuhan. Gertakannya terbayar lunas kali ini."
      : "Nyonya Lie menang dengan sabar — set lengkapnya tak terkejar.";
  txt(x, story, 464, 502, 14.5, "#fff3d0", "center", "normal", "Georgia");
  txt(x, "Klik atau tekan R untuk main lagi", 464, 566, 14, "#ffe9b0", "center", "bold", "Arial");
}
