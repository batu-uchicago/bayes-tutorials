/* monthsPrior: which month was Mary born? (Donovan and Mickey, Chapter 6).
 * Twelve hypotheses; each month's likelihood is the share of girls born that month who were
 * named Mary (Table 6.1). Presets give a flat prior or the book's prior (Feb and May 0.20,
 * other months 0.06). Dragging on the prior panel sets that month's prior and rescales the
 * others so the total stays 1; the posterior updates live. Next unlocks after the reveal. */
(() => {
  "use strict";
  const D = window.DRAW;
  const { P } = D;
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const BIRTHS = [1180, 963, 899, 1190, 862, 976, 1148, 906, 1147, 945, 907, 917];
  const MARYS = [57, 14, 22, 20, 20, 28, 11, 10, 8, 80, 95, 100];
  const LIK = MARYS.map((m, i) => m / BIRTHS[i]);
  const PRESETS = { flat: MONTHS.map(() => 1), book: MONTHS.map((_, i) => (i === 1 || i === 4 ? 0.2 : 0.06)) };

  window.WIDGETS.monthsPrior = function monthsPrior(el, props, ctx) {
    const { normalize, posterior } = window.CORE;
    let prior = normalize(PRESETS.flat);
    let revealed = false;
    let keyboard = false;
    let keyMonth = 0;
    const W = 330, left = 8, slot = (W - left * 2) / 12, bw = slot - 6;
    // Two panels in their own SVGs, so only the prior panel captures touch drags and the
    // rest of the card still scrolls the page. Both use top 30 and base 118 or 122.
    const pH = 140, pTop = 30, pBase = 118, pMax = 0.25;
    const qH = 146, qTop = 30, qBase = 122, qMax = 0.3;
    const priorSvg = D.frame(W, pH, "Prior probability of each birth month. Drag a bar, or use the left and right arrow keys to pick a month and the up and down arrow keys to change it.");
    priorSvg.setAttribute("data-panel", "prior");
    priorSvg.setAttribute("tabindex", "0");
    priorSvg.style.touchAction = "none";
    const announce = D.html("div", { class: "sr-only", "aria-live": "polite", "data-role": "announce" });
    const postSvg = D.frame(W, qH, "Posterior probability of each birth month");
    postSvg.setAttribute("data-panel", "post");
    const presets = [["flat", "Flat prior"], ["book", "The book's prior"]].map(([k, label]) =>
      D.button(label, () => { prior = normalize(PRESETS[k]); mark(k); draw(); }, { "data-preset": k, "aria-pressed": String(k === "flat") }));
    const reveal = D.button("Reveal Mary's birthday", () => { revealed = true; reveal.disabled = true; draw(); ctx.setReady(true); }, { "data-action": "reveal" });
    const readout = D.html("div", { class: "readout", "aria-live": "polite" });
    el.append(D.card(
      D.html("div", { class: "controls", style: "margin:0 0 4px" }, presets),
      priorSvg,
      postSvg,
      D.html("div", { class: "caption" }, "Drag a prior bar up or down to change your belief about that month."),
      D.html("div", { class: "controls" }, reveal),
      readout,
      announce));
    ctx.setReady(false, "Reveal Mary's birthday");
    draw();

    function mark(k) {
      presets.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.preset === k)));
    }

    function draw() {
      const post = posterior(prior, LIK);
      for (const svg of [priorSvg, postSvg]) while (svg.firstChild) svg.firstChild.remove();
      priorSvg.append(D.text(left, pTop - 12, "Prior", { "font-style": "italic", fill: P.muted }));
      postSvg.append(D.text(left, qTop - 12, "Posterior", { "font-style": "italic", fill: P.muted }));
      priorSvg.append(D.svg("line", { x1: left, x2: W - left, y1: pBase, y2: pBase, stroke: P.mist }));
      postSvg.append(D.svg("line", { x1: left, x2: W - left, y1: qBase, y2: qBase, stroke: P.mist }));
      MONTHS.forEach((m, i) => {
        const x = left + i * slot + 3;
        const ph = Math.min((prior[i] / pMax) * (pBase - pTop), pBase - pTop);
        const qh = Math.min((post[i] / qMax) * (qBase - qTop), qBase - qTop);
        const hot = revealed && i === 4;
        const picked = keyboard && i === keyMonth;
        priorSvg.append(D.bar(x, pBase, bw, ph, P.mist, { "data-kind": "prior", "data-month": i, "data-value": prior[i].toFixed(4), stroke: picked ? P.accent : P.ground, "stroke-width": picked ? 2.2 : 0.75 }));
        priorSvg.append(D.text(x + bw / 2, pBase + 14, m[0], { "text-anchor": "middle", "font-size": 11, fill: P.text2 }));
        postSvg.append(D.bar(x, qBase, bw, qh, hot ? P.gold : P.blue, { "data-kind": "post", "data-month": i, "data-value": post[i].toFixed(4) }));
        if (post[i] >= 0.1) postSvg.append(D.text(x + bw / 2, qBase - qh - 4, D.fmt(post[i]), { "text-anchor": "middle", "font-size": 11, fill: P.text }));
        postSvg.append(D.text(x + bw / 2, qBase + 14, m[0], { "text-anchor": "middle", "font-size": 11, fill: hot ? P.gold : P.text2 }));
      });
      readout.innerHTML = revealed ? "Mary was born on <b>May 8</b>. A flat prior gives May only about 0.05; a prior that favors May lifts it to about 0.14." : "";
    }

    // The month is chosen when the finger goes down and kept for the whole drag, so a sideways
    // drift never jumps to a neighboring month. The finger's height sets that month's prior and
    // the other months are rescaled so the total stays 1.
    let dragMonth = null;
    function toSvg(ev) {
      const r = priorSvg.getBoundingClientRect();
      return [(ev.clientX - r.left) * (W / r.width), (ev.clientY - r.top) * (pH / r.height)];
    }
    function setMonth(i, value) {
      const v = Math.max(0.005, Math.min(pMax, value));
      const rest = 1 - prior[i];
      prior = prior.map((p, j) => (j === i ? v : rest > 0 ? (p / rest) * (1 - v) : (1 - v) / 11));
      mark(null);
      draw();
    }
    function setFromPointer(ev) {
      const [, y] = toSvg(ev);
      setMonth(dragMonth, ((pBase - y) / (pBase - pTop)) * pMax);
    }
    priorSvg.addEventListener("pointerdown", (ev) => {
      const [x, y] = toSvg(ev);
      if (y < pTop - 10 || y > pBase + 4) return;
      dragMonth = Math.min(11, Math.max(0, Math.floor((x - left) / slot)));
      try { priorSvg.setPointerCapture(ev.pointerId); } catch { /* synthetic or already released pointer */ }
      setFromPointer(ev);
    });
    priorSvg.addEventListener("pointermove", (ev) => { if (dragMonth !== null) setFromPointer(ev); });
    priorSvg.addEventListener("pointerup", () => { dragMonth = null; });
    priorSvg.addEventListener("pointercancel", () => { dragMonth = null; });

    // Keyboard: left and right arrows pick a month (outlined while the panel has focus), up and
    // down arrows change its prior by 0.01; each change is announced to screen readers.
    priorSvg.addEventListener("focus", () => { keyboard = true; draw(); });
    priorSvg.addEventListener("blur", () => { keyboard = false; draw(); });
    priorSvg.addEventListener("keydown", (ev) => {
      if (ev.key === "ArrowLeft" || ev.key === "ArrowRight") {
        keyMonth = (keyMonth + (ev.key === "ArrowRight" ? 1 : 11)) % 12;
        draw();
      } else if (ev.key === "ArrowUp" || ev.key === "ArrowDown") {
        setMonth(keyMonth, prior[keyMonth] + (ev.key === "ArrowUp" ? 0.01 : -0.01));
      } else {
        return;
      }
      ev.preventDefault();
      announce.textContent = `${MONTHS[keyMonth]}: prior ${D.fmt(prior[keyMonth])}`;
    });
  };
})();
