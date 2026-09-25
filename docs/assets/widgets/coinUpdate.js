/* coinUpdate: fair coin (p = 0.5) or weighted coin (p = 0.4)? (Donovan and Mickey, Chapter 8).
 * Flips H, H, T are revealed one at a time and the posterior updates after each: today's
 * posterior is tomorrow's prior. After the last flip a dashed marker shows E[p | data] on the
 * p axis, unlabeled so the next question still asks for the number. Next unlocks after all
 * three flips. */
(() => {
  "use strict";
  const D = window.DRAW;
  const { P } = D;
  const HYP = [
    { id: "fair", p: 0.5, label: "Fair, p = 0.5", fill: P.sage },
    { id: "weighted", p: 0.4, label: "Weighted, p = 0.4", fill: P.terra },
  ];
  const FLIPS = ["H", "H", "T"];

  window.WIDGETS.coinUpdate = function coinUpdate(el, props, ctx) {
    const { posterior, expectation } = window.CORE;
    let n = 0;
    let post = [0.5, 0.5];
    const W = 320, H = 200;
    const s = D.frame(W, H, "Posterior probability of each coin after each flip");
    const flipBtn = D.button("Flip the coin", flip, { "data-action": "flip" });
    const readout = D.html("div", { class: "readout", "aria-live": "polite" }, "Before any flips: 50/50.");
    el.append(D.card(s, D.html("div", { class: "controls" }, flipBtn), readout));
    ctx.setReady(false, "Flip all three times");
    draw();

    function flip() {
      const f = FLIPS[n];
      post = posterior(post, HYP.map((h) => (f === "H" ? h.p : 1 - h.p)));
      n += 1;
      readout.innerHTML = `Flip ${n}: <b>${f === "H" ? "heads" : "tails"}</b>. The posterior becomes the prior for the next flip.`;
      if (n === FLIPS.length) {
        flipBtn.disabled = true;
        readout.innerHTML += " The dashed line marks the posterior average of $p$.";
        ctx.math(readout);
        ctx.setReady(true);
      }
      draw();
    }

    function draw() {
      while (s.firstChild) s.firstChild.remove();
      FLIPS.forEach((f, i) => {
        const cx = 40 + i * 44, cy = 26, shown = i < n;
        s.append(D.svg("circle", { cx, cy, r: 16, fill: shown ? P.card : P.paper, stroke: shown ? P.ink : P.line, "stroke-width": 1.2, "stroke-dasharray": shown ? null : "3 3" }));
        if (shown) s.append(D.text(cx, cy + 5, f, { "text-anchor": "middle", "font-size": 15, fill: P.ink }));
      });
      const base = 128, top = 62, bw = 56;
      HYP.forEach((h, i) => {
        const x = 40 + i * 96, hgt = (post[i] / 0.7) * (base - top);
        s.append(D.bar(x, base, bw, hgt, h.fill));
        s.append(D.text(x + bw / 2, base - hgt - 5, D.fmt(post[i]), { "text-anchor": "middle", "font-size": 13, fill: P.ink, "data-kind": "post", "data-h": h.id }));
        s.append(D.text(x + bw / 2, base + 16, h.label, { "text-anchor": "middle", "font-size": 12, fill: P.ink2 }));
      });
      const ax0 = 40, ax1 = 290, ay = 176, pv = (p) => ax0 + ((p - 0.35) / 0.2) * (ax1 - ax0);
      s.append(D.svg("line", { x1: ax0, x2: ax1, y1: ay, y2: ay, stroke: P.line }));
      for (const t of [0.4, 0.45, 0.5]) {
        s.append(D.svg("line", { x1: pv(t), x2: pv(t), y1: ay - 4, y2: ay + 4, stroke: P.muted }));
        s.append(D.text(pv(t), ay + 17, D.fmt(t), { "text-anchor": "middle", "font-size": 11, fill: P.muted }));
      }
      s.append(D.text(ax1 + 8, ay + 4, "p", { "font-style": "italic", fill: P.muted }));
      if (n === FLIPS.length) {
        const m = expectation(HYP.map((h) => h.p), post);
        s.append(D.svg("line", { x1: pv(m), x2: pv(m), y1: ay - 22, y2: ay, stroke: P.plum, "stroke-width": 2, "stroke-dasharray": "4 3", "data-kind": "mean" }));
      }
    }
  };
})();
