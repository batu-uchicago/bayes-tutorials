/* dieBars: roll a die 1, 10 or 500 times and watch the observed share of each face settle
 * toward 1/6 (Donovan and Mickey, Chapter 1). Next unlocks after props.need rolls (default 500). */
(() => {
  "use strict";
  const D = window.DRAW;
  const { P } = D;
  const PIPS = {
    1: [[2, 2]], 2: [[1, 1], [3, 3]], 3: [[1, 1], [2, 2], [3, 3]], 4: [[1, 1], [3, 1], [1, 3], [3, 3]],
    5: [[1, 1], [3, 1], [2, 2], [1, 3], [3, 3]], 6: [[1, 1], [3, 1], [1, 2], [3, 2], [1, 3], [3, 3]],
  };

  function dieFace(v) {
    const s = D.svg("svg", { viewBox: "0 0 64 64", width: 60, height: 60, role: "img", "aria-label": `Die showing ${v}` });
    s.append(D.svg("rect", { x: 4, y: 4, width: 56, height: 56, rx: 12, fill: P.text, stroke: P.text, "stroke-width": 2 }));
    for (const [cx, cy] of PIPS[v]) s.append(D.svg("circle", { cx: cx * 16, cy: cy * 16, r: 5, fill: v === 4 ? P.orange : P.ground, stroke: P.ground, "stroke-width": 1 }));
    s.style.flex = "none";
    return s;
  }

  window.WIDGETS.dieBars = function dieBars(el, props, ctx) {
    const need = props.need || 500;
    const counts = [0, 0, 0, 0, 0, 0];
    let rolls = 0;
    const W = 320, H = 170, left = 36, base = 140, top = 16;
    const chart = D.frame(W, H, "Observed share of each face of the die");
    let face = dieFace(4);
    const readout = D.html("div", { class: "readout", "aria-live": "polite", style: "margin:0" }, "No rolls yet. A fair die gives each face a share of 1/6.");
    const head = D.html("div", { style: "display:flex;align-items:center;gap:14px" }, face, readout);
    const controls = D.html("div", { class: "controls" },
      [1, 10, 500].map((n) => D.button(n === 1 ? "Roll once" : `Roll ${n}`, () => roll(n), { "data-n": n })));
    el.append(D.card(head, chart, controls));
    ctx.setReady(false, `Roll at least ${need} times`);
    draw();

    function draw() {
      while (chart.firstChild) chart.firstChild.remove();
      const shares = counts.map((c) => (rolls ? c / rolls : 0));
      const ymax = Math.max(0.35, Math.ceil(Math.max(...shares) * 20) / 20);
      const y = (v) => base - (v / ymax) * (base - top);
      // Bars end at barsEnd; the 1/6 label sits in the free strip to their right, on the line.
      const barsEnd = W - 36;
      chart.append(D.svg("line", { x1: left, x2: barsEnd + 4, y1: base, y2: base, stroke: P.mist }));
      for (const v of [0, ymax]) chart.append(D.text(left - 6, y(v) + 4, D.fmt(v), { "text-anchor": "end", "font-size": 11, fill: P.muted }));
      const bw = 28, gap = (barsEnd - (left + 6) - 6 * bw) / 5;
      shares.forEach((s, i) => {
        const x = left + 6 + i * (bw + gap);
        chart.append(D.bar(x, base, bw, base - y(s), i === 3 ? P.orange : P.mist, { "data-face": i + 1 }));
        chart.append(D.text(x + bw / 2, base + 17, String(i + 1), { "text-anchor": "middle", fill: P.text }));
      });
      const r = y(1 / 6);
      chart.append(D.svg("line", { x1: left, x2: barsEnd + 4, y1: r, y2: r, stroke: P.accent, "stroke-width": 1.5, "stroke-dasharray": "5 4" }));
      chart.append(D.text(W - 4, r + 4, "1/6", { "text-anchor": "end", "font-size": 12, fill: P.accent, "font-style": "italic" }));
    }

    function roll(n) {
      let v = 1;
      for (let i = 0; i < n; i++) {
        v = 1 + Math.floor(Math.random() * 6);
        counts[v - 1] += 1;
        rolls += 1;
      }
      const next = dieFace(v);
      face.replaceWith(next);
      face = next;
      readout.innerHTML = `A <b>four</b> came up <b>${counts[3]}</b> times in <b>${rolls}</b> rolls: a share of <b>${D.fmt(counts[3] / rolls)}</b>.`;
      draw();
      if (rolls >= need) ctx.setReady(true);
    }
  };
})();
