/* peopleVenn: 100 people with two traits (Donovan and Mickey, Chapter 2), drawn as little
 * people inside a Venn diagram. A = left-eye dominant (70 people), B = Morton's toe (15),
 * both = 5, in the overlap; the 20 with neither stand outside both circles.
 * With props.zoom, two buttons condition on B or on A and everyone outside that circle fades;
 * Next unlocks once both zooms have been tried. */
(() => {
  "use strict";
  const D = window.DRAW;
  const { P } = D;
  const GROUPS = [
    { id: "both", n: 5, fill: P.gold, label: "both traits" },
    { id: "b", n: 10, fill: P.orange, label: "Morton's toe only" },
    { id: "a", n: 65, fill: P.blue, label: "left-eye dominant only" },
    { id: "n", n: 20, fill: P.mist, label: "neither" },
  ];
  const TEXT = {
    none: "Both traits: <b>5</b> of 100 people, so $P(AB) = 5/100 = 0.05$.",
    B: "Zoomed into the <b>15</b> people with Morton's toe: 5 are left-eye dominant, so $P(A \\mid B) = 5/15 = 0.33$.",
    A: "Zoomed into the <b>70</b> left-eye dominant people: 5 have Morton's toe, so $P(B \\mid A) = 5/70 = 0.07$.",
  };
  const KEEP = { B: new Set(["both", "b"]), A: new Set(["both", "a"]) };
  const W = 360, H = 300, SIZE = 13, MARGIN = 9;
  const A = { x: 140, y: 156, r: 118 }, B = { x: 255, y: 156, r: 66 };

  // Grid spots for the people, each sorted into the region it sits well inside of. Spots too
  // close to a circle's edge are dropped, so nobody straddles a line.
  function spots() {
    const out = { both: [], a: [], b: [], n: [] };
    for (let y = 36; y <= H - 30; y += 21) {
      for (let x = 12; x <= W - 25; x += 17) {
        const cx = x + SIZE / 2, cy = y + SIZE * 0.62;
        const dA = Math.hypot(cx - A.x, cy - A.y), dB = Math.hypot(cx - B.x, cy - B.y);
        const inA = dA < A.r - MARGIN, outA = dA > A.r + MARGIN, inB = dB < B.r - MARGIN, outB = dB > B.r + MARGIN;
        const region = inA && inB ? "both" : inA && outB ? "a" : inB && outA ? "b" : outA && outB ? "n" : null;
        if (region) out[region].push({ x, y, cx, cy });
      }
    }
    return out;
  }

  // The people in each circle cluster around its middle; the people with neither trait are
  // spread evenly around the outside.
  function place() {
    const s = spots();
    const near = (list, px, py, n) => list.sort((p, q) => Math.hypot(p.cx - px, p.cy - py) - Math.hypot(q.cx - px, q.cy - py)).slice(0, n);
    const lensX = (A.x + A.r + B.x - B.r) / 2;
    const around = s.n.sort((p, q) => Math.atan2(p.cy - A.y, p.cx - W / 2) - Math.atan2(q.cy - A.y, q.cx - W / 2));
    return {
      both: near(s.both, lensX, A.y, 5),
      b: near(s.b, B.x + 22, B.y, 10),
      a: near(s.a, A.x - 14, A.y, 65),
      n: Array.from({ length: 20 }, (_, i) => around[Math.floor((i + 0.5) * around.length / 20)]),
    };
  }

  window.WIDGETS.peopleVenn = function peopleVenn(el, props, ctx) {
    const s = D.frame(W, H, "A Venn diagram of 100 people: 65 left-eye dominant only, 10 with Morton's toe only, 5 with both traits in the overlap, and 20 with neither outside the circles");
    s.style.maxWidth = "440px";
    s.style.margin = "0 auto";
    s.append(D.svg("rect", { x: 2, y: 2, width: W - 4, height: H - 4, rx: 12, fill: "none", stroke: P.line }));
    const ring = (c, color, id) => D.svg("circle", { cx: c.x, cy: c.y, r: c.r, fill: color, "fill-opacity": 0.07, stroke: color, "stroke-width": 1.5, "data-circle": id });
    const ringA = ring(A, P.blue, "A"), ringB = ring(B, P.orange, "B");
    s.append(ringA, ringB);
    s.append(D.text(14, 24, "A: left-eye dominant", { fill: P.blue, "font-style": "italic", "font-size": 14 }));
    s.append(D.text(W - 14, 24, "B: Morton's toe", { fill: P.orange, "font-style": "italic", "font-size": 14, "text-anchor": "end" }));
    const people = [];
    const where = place();
    for (const g of GROUPS) {
      for (const spot of where[g.id]) {
        const p = D.person(spot.x, spot.y, SIZE, g.fill);
        p.setAttribute("data-kind", "person");
        p.setAttribute("data-group", g.id);
        p.style.transition = "opacity .25s";
        s.append(p);
        people.push(p);
      }
    }
    const legend = D.html("div", { class: "legend" }, GROUPS.map((g) => D.html("span", {}, D.html("i", { style: `background:${g.fill}` }), `${g.label} (${g.n})`)));
    const readout = D.html("div", { class: "readout", "aria-live": "polite" });
    const parts = [s, legend];
    const seen = new Set();
    let zoom = null;
    let buttons = [];
    if (props.zoom) {
      buttons = [["B", "Zoom into Morton's toe (B)"], ["A", "Zoom into left eye (A)"]].map(([z, label]) =>
        D.button(label, () => setZoom(zoom === z ? null : z), { "data-zoom": z, "aria-pressed": "false" }));
      parts.push(D.html("div", { class: "controls" }, buttons));
      ctx.setReady(false, "Try both zooms");
    }
    parts.push(readout);
    el.append(D.card(...parts));
    render();

    function setZoom(z) {
      zoom = z;
      if (z) seen.add(z);
      render();
      if (props.zoom && seen.size === 2) ctx.setReady(true);
    }

    function render() {
      people.forEach((p) => { p.style.opacity = !zoom || KEEP[zoom].has(p.getAttribute("data-group")) ? "1" : "0.15"; });
      ringA.setAttribute("stroke-width", zoom === "A" ? 3 : 1.5);
      ringB.setAttribute("stroke-width", zoom === "B" ? 3 : 1.5);
      buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.zoom === zoom)));
      readout.innerHTML = TEXT[zoom || "none"];
      ctx.math(readout);
    }
  };
})();
