/* probTree: a two-level probability tree, A or not A and then B or not B. The two branches
 * that end in B are highlighted and their products written beside them. Labels are symbolic,
 * so the next question still needs the numbers. */
(() => {
  "use strict";
  const D = window.DRAW;
  const { P } = D;

  window.WIDGETS.probTree = function probTree(el, props, ctx) {
    const s = D.frame(380, 210, "Probability tree: A or not A, then B or not B");
    s.style.maxWidth = "460px";
    const root = [22, 105];
    const mid = { A: [140, 55], nA: [140, 155] };
    const leaf = { AB: [270, 25], AnB: [270, 85], nAB: [270, 125], nAnB: [270, 185] };
    const edge = (a, b, hot) => D.svg("line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: hot ? P.accent : P.mist, "stroke-width": hot ? 2 : 1.4 });
    s.append(edge(root, mid.A, true), edge(root, mid.nA, true));
    s.append(edge(mid.A, leaf.AB, true), edge(mid.A, leaf.AnB, false), edge(mid.nA, leaf.nAB, true), edge(mid.nA, leaf.nAnB, false));
    const label = (x, y, str, extra = {}) => D.text(x, y, str, { "text-anchor": "middle", "font-style": "italic", "font-size": 13, ...extra });
    s.append(label(76, 70, "P(A)"), label(76, 150, "P(¬A)"));
    s.append(label(205, 30, "P(B|A)"), label(205, 88, "P(¬B|A)", { fill: P.muted }));
    s.append(label(205, 132, "P(B|¬A)"), label(205, 190, "P(¬B|¬A)", { fill: P.muted }));
    const node = (xy, fill, r = 6) => D.svg("circle", { cx: xy[0], cy: xy[1], r, fill, stroke: P.ground, "stroke-width": 1 });
    s.append(node(root, P.text, 4), node(mid.A, P.blue), node(mid.nA, P.mist));
    s.append(node(leaf.AB, P.orange), node(leaf.AnB, P.mist), node(leaf.nAB, P.orange), node(leaf.nAnB, P.mist));
    s.append(D.text(mid.A[0] - 12, mid.A[1] - 10, "A", { "text-anchor": "middle", fill: P.text }), D.text(mid.nA[0] - 12, mid.nA[1] + 20, "¬A", { "text-anchor": "middle", fill: P.text }));
    s.append(D.text(leaf.AB[0] + 12, leaf.AB[1] + 4, "B", { fill: P.text }), D.text(leaf.AnB[0] + 12, leaf.AnB[1] + 4, "¬B", { fill: P.muted }));
    s.append(D.text(leaf.nAB[0] + 12, leaf.nAB[1] + 4, "B", { fill: P.text }), D.text(leaf.nAnB[0] + 12, leaf.nAnB[1] + 4, "¬B", { fill: P.muted }));
    s.append(D.text(300, leaf.AB[1] + 4, "P(B|A)P(A)", { "font-size": 12, fill: P.accent, "font-style": "italic" }));
    s.append(D.text(300, leaf.nAB[1] + 4, "P(B|¬A)P(¬A)", { "font-size": 12, fill: P.accent, "font-style": "italic" }));
    const caption = D.html("div", { class: "caption", html: "$P(B)$ is the sum of the two highlighted paths." });
    el.append(D.card(s, caption));
    ctx.math(caption);
  };
})();
