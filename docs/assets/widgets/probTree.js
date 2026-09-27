/* probTree: a two-level probability tree. props.first holds the two first-level outcomes and
 * props.second the two outcomes that follow each of them; every item is { name, p, fill? },
 * where p is the branch probability as text and fill names a color in the palette (DRAW.P).
 * The two paths that end in outcome props.hot (default 0) of the second level are highlighted,
 * so the tree shows which products add up to that outcome's total probability. The drawing's
 * label spells out every branch for screen readers. props.caption (HTML with TeX) goes
 * underneath. */
(() => {
  "use strict";
  const D = window.DRAW;
  const { P } = D;

  window.WIDGETS.probTree = function probTree(el, props, ctx) {
    const hot = props.hot || 0;
    const spoken = props.first.map((f, i) => `${f.name}, ${f.p}: ${props.second[i].map((g) => `${g.name} ${g.p}`).join(", ")}`).join("; ");
    const s = D.frame(360, 210, `Probability tree. ${spoken}.`);
    s.style.maxWidth = "460px";
    const root = [14, 105];
    const mid = [[140, 55], [140, 155]];
    const leaf = [[[270, 25], [270, 85]], [[270, 125], [270, 185]]];
    const edge = (a, b, on) => D.svg("line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: on ? P.accent : P.mist, "stroke-width": on ? 2 : 1.4, "data-hot": on ? "true" : null });
    const label = (x, y, str, extra = {}) => D.text(x, y, str, { "text-anchor": "middle", "font-size": 15.5, fill: P.text, ...extra });
    const node = (xy, fill, r = 6) => D.svg("circle", { cx: xy[0], cy: xy[1], r, fill, stroke: P.ground, "stroke-width": 1 });
    props.first.forEach((f, i) => {
      s.append(edge(root, mid[i], true));
      s.append(label(76, i ? 150 : 70, f.p, { "data-branch": `${i}` }));
      props.second[i].forEach((g, j) => {
        const on = j === hot;
        s.append(edge(mid[i], leaf[i][j], on));
        s.append(label(205, [[30, 88], [132, 190]][i][j], g.p, { fill: on ? P.text : P.muted, "data-branch": `${i}${j}` }));
      });
    });
    s.append(node(root, P.text, 4));
    props.first.forEach((f, i) => {
      s.append(node(mid[i], P[f.fill] || (i ? P.mist : P.blue)));
      s.append(D.text(mid[i][0] - 10, mid[i][1] + (i ? 23 : -13), f.name, { "text-anchor": "middle", "font-size": 14.5, fill: P.text, "font-style": "italic" }));
      props.second[i].forEach((g, j) => {
        s.append(node(leaf[i][j], P[g.fill] || (j === hot ? P.orange : P.mist)));
        s.append(D.text(leaf[i][j][0] + 11, leaf[i][j][1] + 5, g.name, { "font-size": 14.5, fill: j === hot ? P.text : P.muted, "data-leaf": `${i}${j}` }));
      });
    });
    const parts = [s];
    if (props.caption) parts.push(D.html("div", { class: "caption", html: props.caption }));
    el.append(D.card(...parts));
    ctx.math(el);
  };
})();
