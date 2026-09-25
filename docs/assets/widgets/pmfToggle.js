/* pmfToggle: a die's probability distribution as bars, fair or loaded (Donovan and Mickey,
 * Chapter 1: the loaded die gives four 0.40 and every other face 0.12). */
(() => {
  "use strict";
  const D = window.DRAW;
  const { P } = D;
  const MODES = {
    fair: { label: "Fair die", p: [1, 2, 3, 4, 5, 6].map(() => 1 / 6) },
    loaded: { label: "Loaded die", p: [0.12, 0.12, 0.12, 0.40, 0.12, 0.12] },
  };

  window.WIDGETS.pmfToggle = function pmfToggle(el, props, ctx) {
    const W = 320, H = 170, left = 36, base = 140, top = 16, ymax = 0.5;
    const chart = D.frame(W, H, "Probability of each face of the die");
    const readout = D.html("div", { class: "readout", "aria-live": "polite" });
    const buttons = Object.entries(MODES).map(([k, m]) => D.button(m.label, () => show(k), { "data-mode": k, "aria-pressed": "false" }));
    el.append(D.card(D.html("div", { class: "controls", style: "margin:0 0 6px" }, buttons), chart, readout));
    show("fair");

    function show(mode) {
      buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === mode)));
      const p = MODES[mode].p;
      while (chart.firstChild) chart.firstChild.remove();
      const y = (v) => base - (v / ymax) * (base - top);
      chart.append(D.svg("line", { x1: left, x2: W - 6, y1: base, y2: base, stroke: P.line }));
      for (const v of [0, 0.25, 0.5]) chart.append(D.text(left - 6, y(v) + 4, D.fmt(v), { "text-anchor": "end", "font-size": 11, fill: P.muted }));
      const bw = 30, gap = (W - left - 10 - 6 * bw) / 6;
      p.forEach((v, i) => {
        const x = left + 6 + i * (bw + gap);
        chart.append(D.bar(x, base, bw, base - y(v), i === 3 ? P.terra : P.sand));
        chart.append(D.text(x + bw / 2, y(v) - 5, D.fmt(v), { "text-anchor": "middle", "font-size": 12, fill: P.ink, "data-kind": "value" }));
        chart.append(D.text(x + bw / 2, base + 17, String(i + 1), { "text-anchor": "middle", fill: P.ink }));
      });
      readout.innerHTML = `$p_X(4) = ${D.fmt(p[3])}$, and the six bars add up to <b>${D.fmt(window.CORE.sum(p))}</b>.`;
      ctx.math(readout);
    }
  };
})();
