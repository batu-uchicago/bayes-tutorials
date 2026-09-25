/* introScene and finishScene: small drawn scenes for the start and finish screens, in the
 * style B palette with ink outlines. */
(() => {
  "use strict";
  const D = window.DRAW;
  const { P } = D;

  function paper(x, y, w, h, rot) {
    const g = D.svg("g", { transform: `rotate(${rot} ${x + w / 2} ${y + h / 2})` },
      D.svg("rect", { x, y, width: w, height: h, rx: 3, fill: P.card, stroke: P.ink, "stroke-width": 1.2 }));
    for (let i = 0; i < 4; i++) {
      g.append(D.svg("line", { x1: x + 7, x2: x + w - (i === 2 ? 14 : 7), y1: y + 11 + i * 8, y2: y + 11 + i * 8, stroke: P.line, "stroke-width": 1.6 }));
    }
    return g;
  }

  function die(x, y, s, rot) {
    const g = D.svg("g", { transform: `rotate(${rot} ${x + s / 2} ${y + s / 2})` },
      D.svg("rect", { x, y, width: s, height: s, rx: s * 0.22, fill: P.sand, stroke: P.ink, "stroke-width": 1.2 }));
    for (const [a, b] of [[0.28, 0.28], [0.72, 0.28], [0.28, 0.72], [0.72, 0.72]]) {
      g.append(D.svg("circle", { cx: x + a * s, cy: y + b * s, r: s * 0.085, fill: P.ink }));
    }
    return g;
  }

  function coin(cx, cy, r) {
    return D.svg("g", {},
      D.svg("circle", { cx, cy, r, fill: P.terra, stroke: P.ink, "stroke-width": 1.2 }),
      D.svg("circle", { cx, cy, r: r * 0.68, fill: "none", stroke: P.card, "stroke-width": 1.2 }));
  }

  window.WIDGETS.introScene = function introScene(el) {
    const s = D.frame(340, 110, "A stack of papers, a die, four people and a coin");
    s.style.maxWidth = "420px";
    s.append(paper(16, 34, 50, 62, -4), paper(26, 28, 50, 62, 3));
    s.append(die(98, 38, 40, -10));
    [P.plum, P.sage, P.terra, P.sand].forEach((c, i) => s.append(D.person(160 + i * 26, 42 + (i % 2) * 6, 20, c)));
    s.append(coin(290, 66, 22));
    s.append(D.svg("path", { d: "M18 104 q150 8 306 -4", fill: "none", stroke: P.line, "stroke-width": 1.2, "stroke-linecap": "round" }));
    el.append(s);
  };

  window.WIDGETS.finishScene = function finishScene(el) {
    const s = D.frame(150, 80, "A page, a die and a coin");
    s.style.maxWidth = "190px";
    s.style.display = "block";
    s.style.margin = "0 auto";
    s.append(paper(14, 30, 44, 42, 0), die(62, 14, 36, -10), coin(120, 50, 19));
    s.append(D.svg("path", { d: "M70 68 q10 6 22 0", fill: "none", stroke: P.sage, "stroke-width": 2, "stroke-linecap": "round" }));
    el.append(s);
  };
})();
