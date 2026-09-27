/* Drawing helpers and palette shared by every widget ("Night stacks": light marks on a dark card).
 * Widgets register themselves as window.WIDGETS.<name> = (container, props, ctx) => void,
 * where ctx.setReady(flag, label) holds the Next button until the student has explored and
 * ctx.math(node) renders TeX inside node. */
window.WIDGETS = window.WIDGETS || {};
window.DRAW = (() => {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  // Mirrors the variables in style.css. Hypotheses and categories use UChicago's lighter
  // secondary tints (the light blue is lifted a little further to stay readable as text on a
  // dark card); mist is the neutral category. Shapes are outlined in the ground color, which
  // reads as a thin cut between neighboring marks.
  const P = Object.freeze({
    ground: "#350E20", raised: "#43152A", track: "#5A2A3F", line: "#6B2E48",
    text: "#F7EEE3", text2: "#F1E5D6", muted: "#E0CFC3", accent: "#FFB547",
    orange: "#D49464", blue: "#6FA0B8", gold: "#FFB547", green: "#ADB17D", mist: "#A0898B",
  });
  const FONT = "Fraunces, Georgia, serif";

  function svg(tag, attrs = {}, ...kids) {
    const n = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) if (v != null) n.setAttribute(k, String(v));
    for (const kid of kids.flat()) if (kid != null) n.append(kid);
    return n;
  }

  function text(x, y, str, attrs = {}) {
    const t = svg("text", { x, y, "font-family": FONT, "font-size": 13, fill: P.text2, ...attrs });
    t.textContent = str;
    return t;
  }

  function html(tag, attrs = {}, ...kids) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === "class") n.className = v;
      else if (k === "html") n.innerHTML = v;
      else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? "" : String(v));
    }
    for (const kid of kids.flat()) if (kid != null) n.append(kid.nodeType ? kid : document.createTextNode(kid));
    return n;
  }

  function frame(w, h, label) {
    return svg("svg", { viewBox: `0 0 ${w} ${h}`, width: "100%", role: "img", "aria-label": label });
  }

  function button(label, onclick, attrs = {}) {
    return html("button", { type: "button", class: "wbtn", onclick, ...attrs }, label);
  }

  // A little person about s wide and 1.25 s tall, with its top-left corner at (x, y).
  function person(x, y, s, fill) {
    return svg("g", { transform: `translate(${x},${y}) scale(${s / 16})` },
      svg("circle", { cx: 8, cy: 4.4, r: 3.8, fill, stroke: P.ground, "stroke-width": 0.9 }),
      svg("path", { d: "M1.4 19.5c0-5 3-8.3 6.6-8.3s6.6 3.3 6.6 8.3z", fill, stroke: P.ground, "stroke-width": 0.9 }));
  }

  function card(...kids) {
    return html("div", { class: "card" }, ...kids);
  }

  const fmt = (x, d = 2) => Number(x).toFixed(d);

  // A bar with a thin outline in the ground color, growing up from the baseline y0.
  function bar(x, y0, w, h, fill, attrs = {}) {
    const hh = Math.max(h, 0);
    return svg("rect", { x, y: y0 - hh, width: w, height: hh, rx: 2, fill, stroke: P.ground, "stroke-width": 0.75, ...attrs });
  }

  return Object.freeze({ NS, P, FONT, svg, text, html, frame, button, person, card, fmt, bar });
})();
