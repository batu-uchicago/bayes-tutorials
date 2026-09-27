/* trickCoins: the two coins in Downey's trick-coin exercise (Think Bayes, Exercise 2-1), each
 * drawn front and back: a fair coin with heads and tails, and a trick coin with heads on both
 * sides. */
(() => {
  "use strict";
  const D = window.DRAW;
  const { P } = D;
  const COINS = [
    { name: "Fair coin", note: "heads and tails", faces: ["H", "T"] },
    { name: "Trick coin", note: "heads on both sides", faces: ["H", "H"] },
  ];

  window.WIDGETS.trickCoins = function trickCoins(el) {
    const s = D.frame(320, 132, "A fair coin with heads and tails, and a trick coin with heads on both sides");
    s.style.maxWidth = "420px";
    s.style.margin = "0 auto";
    COINS.forEach((c, k) => {
      const x0 = 18 + k * 150;
      c.faces.forEach((f, j) => {
        const cx = x0 + 32 + j * 60, cy = 42;
        s.append(D.svg("circle", { cx, cy, r: 26, fill: P.gold, stroke: P.text, "stroke-width": 1.2, "data-coin": k, "data-face": f }));
        s.append(D.svg("circle", { cx, cy, r: 20, fill: "none", stroke: P.ground, "stroke-width": 1, opacity: 0.5 }));
        s.append(D.text(cx, cy + 8, f, { "text-anchor": "middle", "font-size": 22, "font-weight": 500, fill: P.ground }));
      });
      s.append(D.text(x0 + 62, 96, c.name, { "text-anchor": "middle", "font-size": 14, "font-style": "italic", fill: P.text }));
      s.append(D.text(x0 + 62, 114, c.note, { "text-anchor": "middle", "font-size": 11.5, fill: P.muted }));
    });
    el.append(D.card(s));
  };
})();
