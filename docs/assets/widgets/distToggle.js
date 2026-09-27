/* distToggle: a discrete and a continuous distribution side by side, one tab each.
 * Discrete: a fair die's probability mass function, six bars of 1/6 (Donovan and Mickey,
 * Chapter 1). Continuous: the lifespan of a bacterium, normal with mean 5 hours and standard
 * deviation 0.5 (Chapter 9); the curve is a density, and the shaded area between 4.5 and 5.5
 * hours is a probability, about 0.68. */
(() => {
  "use strict";
  const D = window.DRAW;
  const { P } = D;
  const MU = 5, SD = 0.5, LO = 4.5, HI = 5.5;
  const density = (x) => Math.exp(-((x - MU) ** 2) / (2 * SD * SD)) / (SD * Math.sqrt(2 * Math.PI));
  // Area under the density from LO to HI, by the trapezoid rule.
  const AREA = (() => {
    let a = 0;
    const n = 400, h = (HI - LO) / n;
    for (let i = 0; i < n; i++) a += ((density(LO + i * h) + density(LO + (i + 1) * h)) / 2) * h;
    return a;
  })();
  const TEXT = {
    discrete: "A die roll is <b>discrete</b>: each bar is a probability, $p_X(4) = P(X = 4) = 1/6$, and the six bars add up to 1.",
    continuous: `A lifespan is <b>continuous</b>: the curve is a density $f_X(x)$, and probability is area under it. The shaded area is $P(4.5 < X < 5.5) \\approx ${AREA.toFixed(2)}$, the whole area is 1, and any single exact value, such as exactly 5 hours, has probability 0.`,
  };

  window.WIDGETS.distToggle = function distToggle(el, props, ctx) {
    const W = 320, H = 180, left = 36, base = 146, top = 16;
    const chart = D.frame(W, H, "");
    const readout = D.html("div", { class: "readout", "aria-live": "polite" });
    const buttons = [["discrete", "Discrete"], ["continuous", "Continuous"]].map(([k, label]) => D.button(label, () => show(k), { "data-mode": k, "aria-pressed": "false" }));
    el.append(D.card(D.html("div", { class: "controls", style: "margin:0 0 6px" }, buttons), chart, readout));
    show("discrete");

    function axis(ticks, y, fmt) {
      chart.append(D.svg("line", { x1: left, x2: W - 6, y1: base, y2: base, stroke: P.mist }));
      for (const v of ticks) chart.append(D.text(left - 6, y(v) + 4, fmt(v), { "text-anchor": "end", "font-size": 11, fill: P.muted }));
    }

    function discrete() {
      const ymax = 0.25, y = (v) => base - (v / ymax) * (base - top);
      chart.setAttribute("aria-label", "A fair die's distribution: six bars, each with probability 1/6");
      axis([0, 0.25], y, (v) => D.fmt(v));
      const bw = 30, gap = (W - left - 10 - 6 * bw) / 6;
      for (let i = 0; i < 6; i++) {
        const x = left + 6 + i * (bw + gap);
        chart.append(D.bar(x, base, bw, base - y(1 / 6), P.blue, { "data-face": i + 1 }));
        chart.append(D.text(x + bw / 2, y(1 / 6) - 5, "1/6", { "text-anchor": "middle", "font-size": 12, fill: P.text, "data-kind": "value" }));
        chart.append(D.text(x + bw / 2, base + 17, String(i + 1), { "text-anchor": "middle", fill: P.text }));
      }
      chart.append(D.text(left + (W - left) / 2, base + 32, "face of the die", { "text-anchor": "middle", "font-size": 12, fill: P.muted, "font-style": "italic" }));
    }

    function continuous() {
      const x0 = 3.5, x1 = 6.5, ymax = 0.9;
      const px = (v) => left + ((v - x0) / (x1 - x0)) * (W - 6 - left);
      const y = (v) => base - (v / ymax) * (base - top);
      chart.setAttribute("aria-label", `The density of a bacterium's lifespan: a bell curve centered on 5 hours; the area between 4.5 and 5.5 hours is shaded, about ${AREA.toFixed(2)}`);
      axis([0, 0.8], y, (v) => v.toFixed(1));
      const pts = (a, b, n) => Array.from({ length: n + 1 }, (_, i) => a + ((b - a) * i) / n);
      const band = pts(LO, HI, 60).map((v) => `${px(v).toFixed(1)},${y(density(v)).toFixed(1)}`);
      chart.append(D.svg("polygon", { points: `${px(LO)},${base} ${band.join(" ")} ${px(HI)},${base}`, fill: P.gold, "fill-opacity": 0.55, "data-kind": "area", "data-value": AREA.toFixed(4) }));
      const curve = pts(x0, x1, 120).map((v, i) => `${i ? "L" : "M"}${px(v).toFixed(1)} ${y(density(v)).toFixed(1)}`).join(" ");
      chart.append(D.svg("path", { d: curve, fill: "none", stroke: P.text, "stroke-width": 1.8, "data-kind": "density" }));
      for (const v of [4, 4.5, 5, 5.5, 6]) {
        chart.append(D.svg("line", { x1: px(v), x2: px(v), y1: base, y2: base + 4, stroke: P.mist }));
        chart.append(D.text(px(v), base + 17, String(v), { "text-anchor": "middle", "font-size": 12, fill: P.text }));
      }
      chart.append(D.text(left + (W - left) / 2, base + 32, "lifespan of a bacterium (hours)", { "text-anchor": "middle", "font-size": 12, fill: P.muted, "font-style": "italic" }));
    }

    function show(mode) {
      buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === mode)));
      while (chart.firstChild) chart.firstChild.remove();
      if (mode === "discrete") discrete(); else continuous();
      readout.innerHTML = TEXT[mode];
      ctx.math(readout);
    }
  };
})();
