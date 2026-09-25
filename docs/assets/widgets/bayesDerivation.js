/* bayesDerivation: equation lines revealed one at a time (Donovan and Mickey, Figure 3.3).
 * props.lines are TeX strings shown as display math; props.check (HTML with TeX) appears with
 * the last line. Next unlocks once every line is showing. */
(() => {
  "use strict";
  const D = window.DRAW;

  window.WIDGETS.bayesDerivation = function bayesDerivation(el, props, ctx) {
    const lines = props.lines.map((tex, i) => D.html("div", { class: `eq-line${i ? " is-hidden" : ""}`, html: `$$${tex}$$` }));
    const check = props.check ? D.html("div", { class: "readout eq-line is-hidden", html: props.check }) : null;
    let shown = 1;
    const more = D.button("Show the next line", reveal, { "data-action": "reveal" });
    el.append(D.card(...lines, check, D.html("div", { class: "controls" }, more)));
    ctx.math(el);
    ctx.setReady(false, "Show every line");

    function reveal() {
      if (shown < lines.length) {
        lines[shown].classList.remove("is-hidden");
        shown += 1;
      }
      if (shown === lines.length) {
        if (check) check.classList.remove("is-hidden");
        more.disabled = true;
        ctx.setReady(true);
      }
    }
  };
})();
