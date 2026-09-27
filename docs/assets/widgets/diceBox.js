/* diceBox: Downey's Dice Problem (Think Bayes, Chapters 2 and 3). A box holds a 6-, an 8- and
 * a 12-sided die; one is picked at random and rolled again and again. Each roll multiplies a
 * die's posterior by 1/sides, or by 0 if that die cannot show the roll, so the posterior is
 * computed exactly with integers. Every row shows its share over one common denominator
 * (4/9, 3/9, 2/9 after a first roll of 1) while that denominator stays small.
 * Next unlocks once the student has rolled three times and revealed the die.
 * props.secret (6, 8 or 12) and props.rolls (a list) fix the die and the first rolls, for tests. */
(() => {
  "use strict";
  const D = window.DRAW;
  const { P } = D;
  const DICE = [{ sides: 6, fill: P.orange }, { sides: 8, fill: P.blue }, { sides: 12, fill: P.gold }];
  const LCM = 24n;
  const MIN_ROLLS = 3, MAX_ROLLS = 40;

  const frac = (n, d) => `<span class="sr-only">${n}/${d}</span><span class="frac" aria-hidden="true"><span>${n}</span><span>${d}</span></span>`;
  const small = (total) => total <= 999n;
  const rounded = (x, total, places) => {
    const k = 10n ** BigInt(places);
    return (Number((x * k * 2n + total) / (total * 2n)) / Number(k)).toFixed(places);
  };
  const show = (x, total) => (x === total ? "1" : small(total) ? frac(x, total) : `≈ ${rounded(x, total, 3)}`);
  const words = (x, total) => (x === total ? "1" : small(total) ? `${x}/${total}` : `about ${rounded(x, total, 3)}`);
  const a = (n) => (n === 8 || n === 11 || n === 18 ? "an" : "a");

  window.WIDGETS.diceBox = function diceBox(el, props, ctx) {
    let secret, rolls, script, revealed;
    const rows = DICE.map((d) => {
      const bar = D.html("div", { class: "bar", style: `background:${d.fill}` });
      const value = D.html("div", { class: "value", "data-role": "value" });
      const name = D.html("div", { class: "name" }, `${d.sides}-sided`);
      const row = D.html("div", { class: "dice-row", "data-die": d.sides }, name, D.html("div", { class: "track" }, bar), value);
      return { d, row, bar, value, name };
    });
    const log = D.html("div", { class: "dice-log", role: "group", "aria-label": "Rolls so far" });
    const readout = D.html("div", { class: "readout", "aria-live": "polite" });
    const rollBtn = D.button("Roll", roll, { "data-action": "roll" });
    const revealBtn = D.button("Reveal the die", reveal, { "data-action": "reveal" });
    el.append(D.card(D.html("div", { class: "dice-rows" }, rows.map((r) => r.row)), log, D.html("div", { class: "controls" }, rollBtn, revealBtn), readout));
    ctx.setReady(false, `Roll ${MIN_ROLLS} times, then reveal the die`);
    start(true);

    function start(first) {
      secret = first && props.secret ? props.secret : DICE[Math.floor(Math.random() * DICE.length)].sides;
      script = first && props.rolls ? [...props.rolls] : [];
      rolls = [];
      revealed = false;
      revealBtn.textContent = "Reveal the die";
      readout.textContent = "No rolls yet: each die starts at 1/3.";
      draw();
    }

    // Unnormalized posterior of each die: (LCM / sides)^k if every roll fits on it, else 0.
    function weights() {
      const k = BigInt(rolls.length), top = Math.max(0, ...rolls);
      const w = DICE.map((d) => (top > d.sides ? 0n : (LCM / BigInt(d.sides)) ** k));
      return { w, total: w.reduce((x, y) => x + y, 0n) };
    }

    function draw() {
      const { w, total } = weights();
      rows.forEach((r, i) => {
        const out = w[i] === 0n;
        r.row.classList.toggle("is-out", out);
        r.row.setAttribute("data-post", (Number((w[i] * 1000000n) / total) / 1000000).toFixed(6));
        r.bar.style.width = `${Number((w[i] * 1000n) / total) / 10}%`;
        r.value.innerHTML = out ? '<span class="ruled">ruled out</span>' : show(w[i], total);
      });
      log.innerHTML = rolls.map((v, i) => `<span class="chip${i === rolls.length - 1 ? " is-last" : ""}">${v}</span>`).join("");
      rollBtn.disabled = revealed || rolls.length >= MAX_ROLLS;
      revealBtn.disabled = !revealed && rolls.length < MIN_ROLLS;
    }

    function roll() {
      const v = script.length ? script.shift() : 1 + Math.floor(Math.random() * secret);
      const before = weights().w;
      rolls.push(v);
      const { w, total } = weights();
      const gone = DICE.filter((d, i) => before[i] > 0n && w[i] === 0n).map((d) => `${d.sides}-sided`);
      let say = `You rolled ${a(v)} <b>${v}</b>.`;
      if (gone.length === 1) say += ` The ${gone[0]} die can't roll ${a(v)} ${v}, so it's ruled out.`;
      if (gone.length === 2) say += ` The ${gone[0]} and ${gone[1]} dice can't roll ${a(v)} ${v}, so they're ruled out.`;
      if (rolls.length >= MAX_ROLLS) say += ` That's ${MAX_ROLLS} rolls: reveal the die.`;
      const posts = DICE.map((d, i) => `${d.sides}-sided ${w[i] === 0n ? "ruled out" : words(w[i], total)}`).join(", ");
      readout.innerHTML = `${say}<span class="sr-only"> Posterior: ${posts}.</span>`;
      draw();
      if (rollBtn.disabled) revealBtn.focus();
    }

    function reveal() {
      if (revealed) {
        start(false);
        rollBtn.focus();
        return;
      }
      revealed = true;
      const { w, total } = weights();
      const i = DICE.findIndex((d) => d.sides === secret);
      const gave = w[i] === total ? "all of it: the other dice are ruled out"
        : small(total) ? `${frac(w[i], total)}, about ${rounded(w[i] * 100n, total, 0)}%`
          : `about ${rounded(w[i] * 100n, total, 0)}%`;
      readout.innerHTML = `It was the <b>${secret}-sided</b> die. After ${rolls.length} rolls your posterior gave it ${gave}.`;
      revealBtn.textContent = "Try a new die";
      draw();
      revealBtn.focus();
      ctx.setReady(true);
    }
  };
})();
