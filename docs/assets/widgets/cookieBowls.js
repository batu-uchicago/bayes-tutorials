/* cookieBowls: Downey's Cookie Problem (Think Bayes, Chapter 2). Bowl 1 holds 30 vanilla and
 * 10 chocolate cookies, Bowl 2 holds 20 of each. Every cookie is pictured, so a student can also
 * answer by counting: 50 vanilla cookies in all, 30 of them in Bowl 1. */
(() => {
  "use strict";
  const D = window.DRAW;
  const { P } = D;
  const BOWLS = [{ name: "Bowl 1", vanilla: 30 }, { name: "Bowl 2", vanilla: 20 }];

  window.WIDGETS.cookieBowls = function cookieBowls(el) {
    const s = D.frame(300, 120, "Bowl 1 holds 30 vanilla and 10 chocolate cookies; Bowl 2 holds 20 vanilla and 20 chocolate cookies");
    s.style.maxWidth = "440px";
    s.style.margin = "0 auto";
    BOWLS.forEach((b, k) => {
      const x0 = 22 + k * 136;
      s.append(D.svg("rect", { x: x0, y: 8, width: 120, height: 72, rx: 12, fill: P.ground, stroke: P.line }));
      for (let i = 0; i < 40; i++) {
        const vanilla = i < b.vanilla;
        s.append(D.svg("circle", {
          cx: x0 + 11 + (i % 8) * 14, cy: 20 + Math.floor(i / 8) * 12, r: 5,
          fill: vanilla ? P.text : P.orange, "data-kind": "cookie", "data-bowl": k + 1, "data-flavor": vanilla ? "vanilla" : "chocolate",
        }));
      }
      s.append(D.text(x0 + 60, 97, b.name, { "text-anchor": "middle", "font-size": 13, "font-style": "italic", fill: P.text }));
      s.append(D.text(x0 + 60, 113, `${b.vanilla} vanilla, ${40 - b.vanilla} chocolate`, { "text-anchor": "middle", "font-size": 11.5, fill: P.muted }));
    });
    const legend = D.html("div", { class: "legend", style: "justify-content:center" },
      D.html("span", {}, D.html("i", { style: `background:${P.text}` }), "vanilla"),
      D.html("span", {}, D.html("i", { style: `background:${P.orange}` }), "chocolate"));
    el.append(D.card(s, legend));
  };
})();
