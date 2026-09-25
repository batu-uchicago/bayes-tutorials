/* bayesBox: Donovan and Mickey's Bayes box for the Author Problem (Tables 5.3-5.4).
 * A slider sets the prior on Hamilton. Each row prints prior, likelihood and their product;
 * the posterior column draws bars only (the products rescaled to sum to 1), so the next
 * question still asks for the number. Next unlocks once the slider has moved. */
(() => {
  "use strict";
  const D = window.DRAW;
  const { P } = D;
  const LIK = [0.021, 0.140];

  window.WIDGETS.bayesBox = function bayesBox(el, props, ctx) {
    const slider = D.html("input", { type: "range", min: "0.05", max: "0.95", step: "0.05", value: "0.50", "data-role": "prior", "aria-label": "Prior probability that Hamilton wrote paper 54" });
    const out = D.html("output", {}, "0.50");
    const cell = (k) => D.html("div", { "data-cell": k });
    const c = { ph: cell("prior-h"), pm: cell("prior-m"), lh: cell("lik-h"), lm: cell("lik-m"), xh: cell("prod-h"), xm: cell("prod-m") };
    const barH = D.html("div", { class: "bar", "data-post": "h", style: `background:${P.terra}` });
    const barM = D.html("div", { class: "bar", "data-post": "m", style: `background:${P.sage}` });
    const head = (t) => D.html("div", { class: "h" }, t);
    const grid = D.html("div", { class: "box" },
      head(""), head("Prior"), head("Likelihood"), head("Prior × likelihood"), head("Posterior"),
      D.html("div", { style: `color:${P.terraInk}` }, "Hamilton"), c.ph, c.lh, c.xh, D.html("div", { class: "track" }, barH),
      D.html("div", { style: `color:${P.sageInk}` }, "Madison"), c.pm, c.lm, c.xm, D.html("div", { class: "track" }, barM));
    el.append(D.card(
      D.html("label", { class: "slider-row" }, D.html("span", { style: "flex:none" }, "Prior on Hamilton"), slider, out),
      grid,
      D.html("div", { class: "caption" }, "The posterior bars are the products rescaled so the two add up to 1.")));
    ctx.setReady(false, "Move the prior slider");
    slider.addEventListener("input", () => { draw(); ctx.setReady(true); });
    draw();

    function draw() {
      const ph = Number(slider.value);
      const prior = [ph, 1 - ph];
      const post = window.CORE.posterior(prior, LIK);
      out.textContent = D.fmt(ph);
      c.ph.textContent = D.fmt(prior[0]);
      c.pm.textContent = D.fmt(prior[1]);
      c.lh.textContent = D.fmt(LIK[0], 3);
      c.lm.textContent = D.fmt(LIK[1], 3);
      c.xh.textContent = D.fmt(prior[0] * LIK[0], 4);
      c.xm.textContent = D.fmt(prior[1] * LIK[1], 4);
      barH.style.width = `${(post[0] * 100).toFixed(1)}%`;
      barM.style.width = `${(post[1] * 100).toFixed(1)}%`;
    }
  };
})();
