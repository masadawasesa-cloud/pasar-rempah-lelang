"use strict";
// All sound is synthesised with WebAudio — no audio files, fully offline.
PR.audio = (function () {
  let ctx = null;
  let muted = false;

  function ac() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function tone(freq, t0, dur, type, gain, slideTo) {
    const a = ac();
    if (!a || muted) return;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type || "sine";
    o.frequency.setValueAtTime(freq, a.currentTime + t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, a.currentTime + t0 + dur);
    g.gain.setValueAtTime(0.0001, a.currentTime + t0);
    g.gain.exponentialRampToValueAtTime(gain || 0.12, a.currentTime + t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + t0 + dur);
    o.connect(g).connect(a.destination);
    o.start(a.currentTime + t0);
    o.stop(a.currentTime + t0 + dur + 0.05);
  }

  return {
    unlock() { ac(); },
    toggleMute() { muted = !muted; return muted; },
    isMuted() { return muted; },
    bell() { tone(1568, 0, 0.35, "triangle", 0.1); tone(2093, 0.02, 0.3, "sine", 0.06); },
    flip() { tone(520, 0, 0.07, "square", 0.05, 880); },
    coin() { tone(1975, 0, 0.09, "square", 0.06); tone(2637, 0.07, 0.16, "square", 0.05); },
    gavel() { tone(180, 0, 0.09, "square", 0.16, 90); tone(140, 0.13, 0.09, "square", 0.13, 80); },
    stamp() { tone(320, 0, 0.08, "triangle", 0.14, 160); tone(1244, 0.03, 0.12, "sine", 0.05); },
    win() { [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.11, 0.22, "triangle", 0.1)); },
    lose() { [392, 330, 262].forEach((f, i) => tone(f, i * 0.13, 0.24, "triangle", 0.09)); },
  };
})();
