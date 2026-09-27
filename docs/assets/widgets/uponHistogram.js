/* uponHistogram: how often Madison (50 papers) and Hamilton (48 papers) used "upon", per
 * 1,000 words (Donovan and Mickey, Table 5.2), with paper 54's bin marked. Bars show counts,
 * so reading a likelihood off the chart still needs a division. */
(() => {
  "use strict";
  const D = window.DRAW;
  const { P } = D;
  const BINS = ["0", "0-1", "1-2", "2-3", "3-4", "4-5", "5-6", "6-7", "7-8"];
  const MADISON = [41, 7, 2, 0, 0, 0, 0, 0, 0];
  const HAMILTON = [0, 1, 10, 11, 11, 10, 3, 1, 1];

  window.WIDGETS.uponHistogram = function uponHistogram(el) {
    const W = 320, H = 222, left = 28, base = 172, top = 30, ymax = 45;
    const s = D.frame(W, H, "Histogram of how often Madison and Hamilton used upon");
    const y = (v) => base - (v / ymax) * (base - top);
    const slot = (W - left - 6) / BINS.length, bw = 12;
    s.append(D.svg("rect", { x: left + slot, y: top - 16, width: slot, height: base - top + 16, fill: P.gold, opacity: 0.14 }));
    s.append(D.text(left + slot * 1.5, top - 20, "Paper 54", { "text-anchor": "middle", "font-size": 12, fill: P.gold, "font-style": "italic" }));
    s.append(D.svg("line", { x1: left, x2: W - 4, y1: base, y2: base, stroke: P.mist }));
    for (const v of [0, 20, 40]) s.append(D.text(left - 5, y(v) + 4, String(v), { "text-anchor": "end", "font-size": 11, fill: P.muted }));
    BINS.forEach((b, i) => {
      const x0 = left + i * slot + (slot - 2 * bw - 2) / 2;
      [[MADISON[i], P.blue, "madison"], [HAMILTON[i], P.orange, "hamilton"]].forEach(([c, fill, who], j) => {
        if (c === 0) return;
        const x = x0 + j * (bw + 2);
        s.append(D.bar(x, base, bw, base - y(c), fill, { "data-author": who, "data-bin": i, "data-count": c }));
        s.append(D.text(x + bw / 2, y(c) - 3, String(c), { "text-anchor": "middle", "font-size": 11, fill: P.text }));
      });
      s.append(D.text(left + i * slot + slot / 2, base + 15, b, { "text-anchor": "middle", "font-size": 11, fill: P.text2 }));
    });
    s.append(D.text(left + (W - left) / 2, base + 34, "uses of “upon” per 1,000 words", { "text-anchor": "middle", "font-size": 12, fill: P.muted, "font-style": "italic" }));
    const legend = D.html("div", { class: "legend" },
      D.html("span", {}, D.html("i", { style: `background:${P.blue}` }), "Madison (50 papers)"),
      D.html("span", {}, D.html("i", { style: `background:${P.orange}` }), "Hamilton (48 papers)"));
    el.append(D.card(s, legend));
  };
})();
