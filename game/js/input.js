"use strict";
// Mouse + keyboard. Clicks are queued with canvas coordinates; the game
// drains the queue once per fixed step so scripted play sees the same path.
PR.input = (function () {
  const clicks = [];
  const keys = new Set();
  let mouse = { x: 0, y: 0 };

  function toCanvas(evt, canvas) {
    const r = canvas.getBoundingClientRect();
    return {
      x: ((evt.clientX - r.left) / r.width) * canvas.width,
      y: ((evt.clientY - r.top) / r.height) * canvas.height,
    };
  }

  return {
    attach(canvas) {
      canvas.addEventListener("pointerdown", (evt) => {
        PR.audio.unlock();
        const p = toCanvas(evt, canvas);
        clicks.push(p);
        mouse = p;
      });
      canvas.addEventListener("pointermove", (evt) => { mouse = toCanvas(evt, canvas); });
      window.addEventListener("keydown", (evt) => {
        PR.audio.unlock();
        keys.add(evt.code);
        if (["ArrowUp", "ArrowDown", "Space"].includes(evt.code)) evt.preventDefault();
      });
      window.addEventListener("keyup", (evt) => keys.delete(evt.code));
    },
    drainClicks() { return clicks.splice(0, clicks.length); },
    pressed(code) { return keys.has(code); },
    consume(code) { const had = keys.has(code); keys.delete(code); return had; },
    mouse() { return mouse; },
  };
})();
