/* peopleGrid: 100 people with two traits (Donovan and Mickey, Chapter 2).
 * A = left-eye dominant (70 people), B = Morton's toe (15), both = 5.
 * With props.zoom, two buttons condition on B or on A and people outside fade;
 * Next unlocks once both zooms have been tried. */
(() => {
  "use strict";
  const D = window.DRAW;
  const { P } = D;
  const GROUPS = [
    { id: "both", n: 5, fill: P.plum, label: "both traits" },
    { id: "b", n: 10, fill: P.terra, label: "Morton's toe only" },
    { id: "a", n: 65, fill: P.sage, label: "left-eye dominant only" },
    { id: "n", n: 20, fill: P.sand, label: "neither" },
  ];
  const TEXT = {
    none: "Both traits: <b>5</b> of 100 people, so $P(AB) = 5/100 = 0.05$.",
    B: "Zoomed into the <b>15</b> people with Morton's toe: 5 are left-eye dominant, so $P(A \\mid B) = 5/15 = 0.33$.",
    A: "Zoomed into the <b>70</b> left-eye dominant people: 5 have Morton's toe, so $P(B \\mid A) = 5/70 = 0.07$.",
  };
  const KEEP = { B: new Set(["both", "b"]), A: new Set(["both", "a"]) };

  window.WIDGETS.peopleGrid = function peopleGrid(el, props, ctx) {
    const cell = 30, rowH = 33;
    const s = D.frame(10 * cell, 10 * rowH, "A grid of 100 people colored by their two traits");
    s.style.maxWidth = "360px";
    s.style.margin = "0 auto";
    const people = [];
    let k = 0;
    for (const g of GROUPS) {
      for (let i = 0; i < g.n; i++, k++) {
        const p = D.person((k % 10) * cell + 5, Math.floor(k / 10) * rowH + 3, 20, g.fill);
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
      buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.zoom === zoom)));
      readout.innerHTML = TEXT[zoom || "none"];
      ctx.math(readout);
    }
  };
})();
