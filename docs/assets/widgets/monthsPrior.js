/* monthsPrior: which month was Mary born? (Donovan and Mickey, Chapter 6).
 * Twelve hypotheses; each month's likelihood is the share of girls born that month who were
 * named Mary (Table 6.1). Presets give a flat prior or the book's prior (Feb and May 0.20,
 * other months 0.06). Dragging on the prior panel sets that month's prior and rescales the
 * others so the total stays 1; the posterior updates live. Next unlocks after the reveal. */
(() => {
  "use strict";
  const D = window.DRAW;
  const { P } = D;
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const BIRTHS = [1180, 963, 899, 1190, 862, 976, 1148, 906, 1147, 945, 907, 917];
  const MARYS = [57, 14, 22, 20, 20, 28, 11, 10, 8, 80, 95, 100];
  const LIK = MARYS.map((m, i) => m / BIRTHS[i]);
  const PRESETS = { flat: MONTHS.map(() => 1), book: MONTHS.map((_, i) => (i === 1 || i === 4 ? 0.2 : 0.06)) };

  window.WIDGETS.monthsPrior = function monthsPrior(el, props, ctx) {
    const { normalize, posterior } = window.CORE;
    let prior = normalize(PRESETS.flat);
    let revealed = false;
    const W = 330, H = 290, left = 8, slot = (W - left * 2) / 12, bw = slot - 6;
    const pTop = 30, pBase = 118, qTop = 170, qBase = 262, pMax = 0.25, qMax = 0.3;
    const s = D.frame(W, H, "Prior and posterior probability of each birth month");
    s.style.touchAction = "none";
    const presets = [["flat", "Flat prior"], ["book", "The book's prior"]].map(([k, label]) =>
      D.button(label, () => { prior = normalize(PRESETS[k]); mark(k); draw(); }, { "data-preset": k, "aria-pressed": String(k === "flat") }));
    const reveal = D.button("Reveal Mary's birthday", () => { revealed = true; reveal.disabled = true; draw(); ctx.setReady(true); }, { "data-action": "reveal" });
    const readout = D.html("div", { class: "readout", "aria-live": "polite" });
    el.append(D.card(
      D.html("div", { class: "controls", style: "margin:0 0 4px" }, presets),
      s,
      D.html("div", { class: "caption" }, "Drag a prior bar up or down to change your belief about that month."),
      D.html("div", { class: "controls" }, reveal),
      readout));
    ctx.setReady(false, "Reveal Mary's birthday");
    draw();

    function mark(k) {
      presets.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.preset === k)));
    }

    function draw() {
      const post = posterior(prior, LIK);
      while (s.firstChild) s.firstChild.remove();
      s.append(D.text(left, pTop - 12, "Prior", { "font-style": "italic", fill: P.muted }));
      s.append(D.text(left, qTop - 12, "Posterior", { "font-style": "italic", fill: P.muted }));
      for (const b of [pBase, qBase]) s.append(D.svg("line", { x1: left, x2: W - left, y1: b, y2: b, stroke: P.line }));
      MONTHS.forEach((m, i) => {
        const x = left + i * slot + 3;
        const ph = Math.min((prior[i] / pMax) * (pBase - pTop), pBase - pTop);
        const qh = Math.min((post[i] / qMax) * (qBase - qTop), qBase - qTop);
        const hot = revealed && i === 4;
        s.append(D.bar(x, pBase, bw, ph, P.sand, { "data-kind": "prior", "data-month": i, "data-value": prior[i].toFixed(4) }));
        s.append(D.bar(x, qBase, bw, qh, hot ? P.plum : P.sage, { "data-kind": "post", "data-month": i, "data-value": post[i].toFixed(4) }));
        if (post[i] >= 0.1) s.append(D.text(x + bw / 2, qBase - qh - 4, D.fmt(post[i]), { "text-anchor": "middle", "font-size": 11, fill: P.ink }));
        s.append(D.text(x + bw / 2, pBase + 14, m[0], { "text-anchor": "middle", "font-size": 11, fill: P.ink2 }));
        s.append(D.text(x + bw / 2, qBase + 14, m[0], { "text-anchor": "middle", "font-size": 11, fill: hot ? P.plum : P.ink2 }));
      });
      readout.innerHTML = revealed ? "Mary was born on <b>May 8</b>. A flat prior ranks May near the bottom; a prior that favors May lifts it." : "";
    }

    // The pointer's height on the prior panel sets that month's prior; the others are rescaled.
    let dragging = false;
    function dragAt(ev) {
      const r = s.getBoundingClientRect();
      const x = (ev.clientX - r.left) * (W / r.width);
      const y = (ev.clientY - r.top) * (H / r.height);
      if (y < pTop - 10 || y > pBase + 4) return;
      const i = Math.min(11, Math.max(0, Math.floor((x - left) / slot)));
      const v = Math.max(0.005, Math.min(pMax, ((pBase - y) / (pBase - pTop)) * pMax));
      const rest = 1 - prior[i];
      prior = prior.map((p, j) => (j === i ? v : rest > 0 ? (p / rest) * (1 - v) : (1 - v) / 11));
      mark(null);
      draw();
    }
    s.addEventListener("pointerdown", (ev) => {
      dragging = true;
      try { s.setPointerCapture(ev.pointerId); } catch { /* synthetic or already released pointer */ }
      dragAt(ev);
    });
    s.addEventListener("pointermove", (ev) => { if (dragging) dragAt(ev); });
    s.addEventListener("pointerup", () => { dragging = false; });
    s.addEventListener("pointercancel", () => { dragging = false; });
  };
})();
