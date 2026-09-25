/* Interactive and illustrative widgets. Each widget is (container, props, ctx) => void.
   ctx.setReady(flag, label) gates the Continue button for exploration widgets. */
window.WIDGETS = (() => {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  const C = {
    maroon: "#800000", gold: "#e3a21a", sky: "#2f8fd0", pink: "#df4f94",
    violet: "#7b4fc9", mist: "#c9cad6", ink: "#1e1b33", muted: "#5f5b78", line: "#dcdde8", good: "#11875a",
  };
  // Colors of the four Bayes terms, used consistently across all tutorials.
  const TERM = { prior: C.gold, likelihood: C.sky, evidence: C.violet, posterior: C.maroon };
  // Darker versions of the same hues for text (WCAG AA contrast on light backgrounds).
  const TERM_TEXT = { prior: "#8a5d00", likelihood: "#1b6aa3", evidence: "#6639b5", posterior: C.maroon };

  const svg = (tag, attrs = {}) => {
    const n = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    return n;
  };
  const div = (cls, html) => { const d = document.createElement("div"); if (cls) d.className = cls; if (html != null) d.innerHTML = html; return d; };
  const btn = (label, cls, onclick) => { const b = document.createElement("button"); b.className = cls; b.type = "button"; b.textContent = label; b.onclick = onclick; return b; };
  const fmt = (x, d = 2) => Number(x).toFixed(d);
  const pct = (x) => `${Math.round(x * 100)}%`;

  // ------------------------------------------------------------ icon array (people)
  function person(g, x, y, s, color, faded) {
    const grp = svg("g", { transform: `translate(${x},${y}) scale(${s / 16})`, opacity: faded ? 0.22 : 1 });
    grp.append(svg("circle", { cx: 8, cy: 4.2, r: 3.6, fill: color }));
    grp.append(svg("path", { d: "M1.6 17c0-4.3 2.9-7.3 6.4-7.3s6.4 3 6.4 7.3z", fill: color }));
    g.append(grp);
  }
  function peopleArray(el, props) {
    const groups = props.groups;
    const n = groups.reduce((a, g) => a + g.n, 0);
    const cols = props.cols || Math.min(n, 12);
    const rows = Math.ceil(n / cols);
    const cell = 22;
    const s = svg("svg", { viewBox: `0 0 ${cols * cell} ${rows * (cell + 4)}`, width: "100%", role: "img", "aria-label": props.alt || "Icon array" });
    s.style.maxWidth = `${cols * 44}px`;
    let k = 0;
    const hl = props.highlight ? new Set(props.highlight) : null;
    for (const g of groups) {
      for (let i = 0; i < g.n; i++, k++) {
        person(s, (k % cols) * cell + 2, Math.floor(k / cols) * (cell + 4) + 2, 18, g.color, hl && !hl.has(g.id));
      }
    }
    const card = div("card");
    card.append(s);
    const leg = div("legend");
    for (const g of groups) leg.append(div(null, `<i style="background:${g.color};opacity:${hl && !hl.has(g.id) ? 0.3 : 1}"></i>${g.label} (${g.n})`));
    card.append(leg);
    if (props.table) card.append(tableEl(props.table));
    if (props.caption) card.append(div("readout", props.caption));
    el.append(card);
  }
  function tableEl(t) {
    const tbl = document.createElement("table");
    tbl.className = "tbl";
    tbl.innerHTML = t.rows.map((r, i) => `<tr>${r.map((c, j) => {
      const tag = i === 0 || j === 0 ? "th" : "td";
      const hl = t.highlight && t.highlight.some(([a, b]) => a === i && b === j) ? ' class="hl"' : "";
      return `<${tag}${hl}>${c}</${tag}>`;
    }).join("")}</tr>`).join("");
    return tbl;
  }

  // ------------------------------------------------------------ Bayes' rule hero
  function bayesHero(el) {
    const card = div("card hero-formula");
    card.style.padding = "22px 18px";
    card.append(div("", String.raw`$$\textcolor{${TERM_TEXT.posterior}}{P(H \mid E)} \;=\; \frac{\textcolor{${TERM_TEXT.likelihood}}{P(E \mid H)}\;\textcolor{${TERM_TEXT.prior}}{P(H)}}{\textcolor{${TERM_TEXT.evidence}}{P(E)}}$$`));
    const leg = div("legend");
    leg.style.justifyContent = "center";
    [["posterior", "Posterior"], ["likelihood", "Likelihood"], ["prior", "Prior"], ["evidence", "Evidence"]]
      .forEach(([k, label]) => leg.append(div(null, `<i style="background:${TERM[k]}"></i>${label}`)));
    card.append(leg);
    el.append(card);
  }

  // ------------------------------------------------------------ die roller
  const PIPS = { 1: [[2, 2]], 2: [[1, 1], [3, 3]], 3: [[1, 1], [2, 2], [3, 3]], 4: [[1, 1], [3, 1], [1, 3], [3, 3]], 5: [[1, 1], [3, 1], [2, 2], [1, 3], [3, 3]], 6: [[1, 1], [3, 1], [1, 2], [3, 2], [1, 3], [3, 3]] };
  function dieFace(v) {
    const s = svg("svg", { viewBox: "0 0 64 64", width: 76, height: 76, class: "die", role: "img", "aria-label": `Die showing ${v}` });
    s.append(svg("rect", { x: 3, y: 3, width: 58, height: 58, rx: 13, fill: "#fff", stroke: C.ink, "stroke-width": 3 }));
    for (const [cx, cy] of PIPS[v]) s.append(svg("circle", { cx: cx * 16, cy: cy * 16, r: 5.2, fill: v === 4 ? C.maroon : C.ink }));
    return s;
  }
  function die(el, props, ctx) {
    const need = props.need || 100;
    let rolls = 0, fours = 0;
    const series = [];
    const card = div("card");
    const top = div("die-wrap");
    let face = dieFace(4);
    const text = div("readout", "Roll the die and watch how often a <b>4</b> comes up.");
    top.append(face, text);
    const W = 600, H = 190, pad = 34;
    const chart = svg("svg", { viewBox: `0 0 ${W} ${H}`, width: "100%", role: "img", "aria-label": "Share of rolls that came up 4, over time" });
    const yTo = (p) => H - pad - (p / 0.5) * (H - pad * 1.6);
    chart.append(svg("line", { x1: pad, x2: W - 8, y1: H - pad, y2: H - pad, stroke: C.line, "stroke-width": 2 }));
    [0, 0.25, 0.5].forEach((p) => {
      const t = svg("text", { x: pad - 6, y: yTo(p) + 4, "text-anchor": "end", "font-size": 12, fill: C.muted });
      t.textContent = p.toFixed(2); chart.append(t);
    });
    const ref = svg("line", { x1: pad, x2: W - 8, y1: yTo(1 / 6), y2: yTo(1 / 6), stroke: C.gold, "stroke-width": 2.5, "stroke-dasharray": "7 6" });
    const refLabel = svg("text", { x: W - 10, y: yTo(1 / 6) - 8, "text-anchor": "end", "font-size": 13, fill: TERM_TEXT.prior, "font-weight": 700 });
    refLabel.textContent = "1/6 ≈ 0.17";
    const path = svg("path", { fill: "none", stroke: C.maroon, "stroke-width": 2.5, "stroke-linejoin": "round" });
    const xLabel = svg("text", { x: W - 10, y: H - 10, "text-anchor": "end", "font-size": 12, fill: C.muted });
    chart.append(ref, refLabel, path, xLabel);
    const controls = div("controls");
    [1, 10, 100].forEach((n) => controls.append(btn(n === 1 ? "Roll once" : `Roll ${n}`, "btn ghost small", () => roll(n))));
    card.append(top, chart, controls);
    el.append(card);
    ctx.setReady(false, `Roll at least ${need} times`);

    function roll(n) {
      let v = 1;
      for (let i = 0; i < n; i++) {
        v = 1 + Math.floor(Math.random() * 6);
        rolls++; if (v === 4) fours++;
        series.push(fours / rolls);
      }
      const nf = dieFace(v);
      nf.classList.add("tumble");
      face.replaceWith(nf); face = nf;
      text.innerHTML = `A <b>4</b> came up <b>${fours}</b> times in <b>${rolls}</b> rolls: a share of <b>${fmt(fours / rolls)}</b>.`;
      const N = series.length;
      const xTo = (i) => pad + (i / Math.max(N - 1, 1)) * (W - 8 - pad);
      const step = Math.max(1, Math.floor(N / 400));
      let d = "";
      for (let i = 0; i < N; i += step) d += `${i ? "L" : "M"}${xTo(i).toFixed(1)},${yTo(Math.min(series[i], 0.5)).toFixed(1)}`;
      path.setAttribute("d", d);
      xLabel.textContent = `${rolls} rolls`;
      if (rolls >= need) ctx.setReady(true);
    }
  }

  // ------------------------------------------------------------ distribution bars
  function pmf(el, props) {
    const vals = props.values || [1, 2, 3, 4, 5, 6];
    const probs = props.probs || vals.map(() => 1 / vals.length);
    const W = 600, H = 200, pad = 30, bw = (W - pad * 2) / vals.length;
    const s = svg("svg", { viewBox: `0 0 ${W} ${H}`, width: "100%", role: "img", "aria-label": "Probability of each face of a fair die" });
    const max = Math.max(...probs) * 1.4;
    vals.forEach((v, i) => {
      const h = (probs[i] / max) * (H - pad * 2);
      const x = pad + i * bw + bw * 0.18, y = H - pad - h;
      s.append(svg("rect", { x, y, width: bw * 0.64, height: h, rx: 7, fill: v === props.highlight ? C.maroon : C.gold }));
      const lab = svg("text", { x: x + bw * 0.32, y: H - 8, "text-anchor": "middle", "font-size": 15, fill: C.ink, "font-weight": 700 });
      lab.textContent = v; s.append(lab);
      const pl = svg("text", { x: x + bw * 0.32, y: y - 8, "text-anchor": "middle", "font-size": 13, fill: C.muted });
      pl.textContent = props.labels ? props.labels[i] : "1/6"; s.append(pl);
    });
    s.append(svg("line", { x1: pad - 6, x2: W - pad + 6, y1: H - pad, y2: H - pad, stroke: C.line, "stroke-width": 2 }));
    const card = div("card");
    card.append(s);
    if (props.caption) card.append(div("readout", props.caption));
    el.append(card);
  }

  // ------------------------------------------------------------ emails (spam filter)
  function emails(el, props, ctx) {
    const n = props.n || 100;
    const sens = props.sens ?? 0.6, fpr = props.fpr ?? 0.05;
    let p = props.p ?? 0.2;
    const card = div("card");
    const cols = n <= 100 ? 20 : 50;
    const cell = n <= 100 ? 14 : 8;
    const rows = Math.ceil(n / cols);
    const s = svg("svg", { viewBox: `0 0 ${cols * cell} ${rows * cell}`, width: "100%", role: "img", "aria-label": `${n} emails, colored by spam and by whether they contain the word FREE` });
    card.append(s);
    const leg = div("legend");
    leg.innerHTML = `<span><i style="background:${C.gold}"></i>Spam that says FREE</span><span><i style="background:${C.gold};opacity:.28"></i>Spam, no FREE</span><span><i style="background:${C.sky}"></i>Normal email that says FREE</span><span><i style="background:${C.sky};opacity:.28"></i>Normal, no FREE</span>`;
    card.append(leg);
    const out = div("readout");
    card.append(out);
    let slider;
    if (props.interactive) {
      const lab = div("readout", "");
      lab.style.marginTop = "14px";
      slider = document.createElement("input");
      slider.type = "range"; slider.min = 1; slider.max = 90; slider.value = Math.round(p * 100);
      slider.setAttribute("aria-label", "Share of email that is spam (the prior)");
      slider.oninput = () => { p = slider.value / 100; draw(); ctx.setReady(true); };
      lab.style.marginTop = "0";
      out.style.marginBottom = "12px";
      card.prepend(lab, slider, out);
      ctx.setReady(false, "Move the slider to explore");
      lab.innerHTML = `Drag to change the <b style="color:${TERM_TEXT.prior}">prior</b>: the share of all email that is spam.`;
    }
    el.append(card);
    draw();

    function draw() {
      while (s.firstChild) s.firstChild.remove();
      const spam = Math.round(n * p);
      const spamFree = Math.round(spam * sens);
      const ham = n - spam;
      const hamFree = Math.round(ham * fpr);
      const kinds = [
        ...Array(spamFree).fill([C.gold, 1]), ...Array(spam - spamFree).fill([C.gold, 0.28]),
        ...Array(hamFree).fill([C.sky, 1]), ...Array(ham - hamFree).fill([C.sky, 0.28]),
      ];
      kinds.forEach(([color, op], k) => {
        const x = (k % cols) * cell, y = Math.floor(k / cols) * cell;
        if (n <= 100) {
          const g = svg("g", { opacity: op });
          g.append(svg("rect", { x: x + 1.5, y: y + 3, width: cell - 3, height: cell - 6, rx: 2, fill: color }));
          g.append(svg("path", { d: `M${x + 2} ${y + 4} L${x + cell / 2} ${y + cell / 2} L${x + cell - 2} ${y + 4}`, stroke: "#fff", "stroke-width": 1.2, fill: "none" }));
          s.append(g);
        } else {
          s.append(svg("circle", { cx: x + cell / 2, cy: y + cell / 2, r: cell / 2 - 1, fill: color, opacity: op }));
        }
      });
      const post = (p * sens) / (p * sens + (1 - p) * fpr);
      if (props.interactive) {
        out.innerHTML = `Prior: <b>${pct(p)}</b> of email is spam. Out of ${n} emails, <b>${spamFree}</b> spam and <b>${hamFree}</b> normal emails say FREE.<br>Posterior: an email that says FREE is spam with probability <b style="color:${C.maroon}">${fmt(post)}</b>.`;
      } else {
        out.innerHTML = props.caption || `Out of ${n} emails: <b>${spam}</b> are spam and <b>${spamFree}</b> of those say FREE. <b>${ham}</b> are normal and <b>${hamFree}</b> of those say FREE.`;
      }
    }
  }

  // ------------------------------------------------------------ Monty Hall game
  function monty(el, props, ctx) {
    const need = props.need || 3;
    const tally = { stay: { n: 0, w: 0 }, switch: { n: 0, w: 0 } };
    let manual = 0;
    const card = div("card");
    const msg = div("readout");
    msg.style.marginTop = "0";
    msg.style.marginBottom = "12px";
    const doorsEl = div("doors");
    const tags = div("doors");
    const actions = div("controls");
    const board = div("tally");
    card.append(msg, doorsEl, tags, actions, board);
    el.append(card);
    ctx.setReady(false, `Play at least ${need} rounds`);
    let car, pick, opened, phase;
    const doors = [0, 1, 2].map((i) => {
      const d = document.createElement("button");
      d.className = "door"; d.type = "button";
      d.setAttribute("aria-label", `Door ${i + 1}`);
      d.innerHTML = `<div class="prize" aria-hidden="true"></div><div class="panel">${i + 1}</div>`;
      d.onclick = () => choose(i);
      doorsEl.append(d);
      const t = div("door-tag");
      tags.append(t);
      return { d, t };
    });
    newRound();
    drawTally();

    function newRound() {
      car = Math.floor(Math.random() * 3);
      pick = opened = null;
      phase = "pick";
      doors.forEach(({ d, t }, i) => {
        d.classList.remove("is-open", "is-picked");
        d.disabled = false;
        d.querySelector(".prize").textContent = i === car ? "🚗" : "🐐";
        t.textContent = "";
      });
      msg.innerHTML = "Pick a door. A car is behind one of them, goats behind the other two.";
      actions.innerHTML = "";
      if (manual >= need) actions.append(btn("Simulate 1,000 more rounds", "btn ghost small", simulate));
    }
    function choose(i) {
      if (phase !== "pick") return;
      pick = i; phase = "decide";
      const goats = [0, 1, 2].filter((k) => k !== pick && k !== car);
      opened = goats[Math.floor(Math.random() * goats.length)];
      doors[pick].d.classList.add("is-picked");
      doors[pick].t.textContent = "Your pick";
      doors[opened].d.classList.add("is-open");
      doors[opened].t.textContent = "Host opened";
      doors.forEach(({ d }) => { d.disabled = true; });
      const other = [0, 1, 2].find((k) => k !== pick && k !== opened);
      msg.innerHTML = `The host, who knows where the car is, opens door ${opened + 1}: a goat. Stay with door ${pick + 1}, or switch to door ${other + 1}?`;
      actions.innerHTML = "";
      actions.append(btn(`Stay with door ${pick + 1}`, "btn small", () => decide(false)), btn(`Switch to door ${other + 1}`, "btn small", () => decide(true)));
    }
    function decide(sw) {
      const other = [0, 1, 2].find((k) => k !== pick && k !== opened);
      const final = sw ? other : pick;
      const won = final === car;
      const key = sw ? "switch" : "stay";
      tally[key].n++; if (won) tally[key].w++;
      manual++;
      doors.forEach(({ d }) => d.classList.add("is-open"));
      msg.innerHTML = won ? `🎉 You ${sw ? "switched" : "stayed"} and won the car.` : `You ${sw ? "switched" : "stayed"} and got a goat. The car was behind door ${car + 1}.`;
      actions.innerHTML = "";
      actions.append(btn("Play again", "btn small", newRound));
      if (manual >= need) actions.append(btn("Simulate 1,000 more rounds", "btn ghost small", simulate));
      drawTally();
      if (manual >= need) ctx.setReady(true);
    }
    function simulate() {
      for (let r = 0; r < 1000; r++) {
        const c = Math.floor(Math.random() * 3), p0 = Math.floor(Math.random() * 3);
        const sw = r % 2 === 1;
        const won = sw ? c !== p0 : c === p0;
        const key = sw ? "switch" : "stay";
        tally[key].n++; if (won) tally[key].w++;
      }
      drawTally();
    }
    function drawTally() {
      board.innerHTML = "";
      [["stay", "Stayed", C.gold], ["switch", "Switched", C.maroon]].forEach(([k, label, color]) => {
        const { n, w } = tally[k];
        const rate = n ? w / n : 0;
        board.append(div(null, `<b>${label}</b>`));
        const bar = div("bar", `<span style="width:${rate * 100}%;background:${color}"></span>`);
        board.append(bar);
        board.append(div(null, n ? `won ${w} of ${n} (${fmt(rate)})` : "not played yet"));
      });
    }
  }

  function montyStatic(el) {
    const card = div("card");
    const doorsEl = div("doors");
    const tags = div("doors");
    ["Your pick", "", "Host opened: goat"].forEach((tag, i) => {
      const d = document.createElement("div");
      d.className = "door" + (i === 2 ? " is-open" : "") + (i === 0 ? " is-picked" : "");
      d.innerHTML = `<div class="prize" aria-hidden="true">${i === 2 ? "🐐" : ""}</div><div class="panel">${i + 1}</div>`;
      d.setAttribute("aria-label", `Door ${i + 1}${tag ? ": " + tag : ""}`);
      doorsEl.append(d);
      tags.append(div("door-tag", tag));
    });
    card.append(doorsEl, tags);
    el.append(card);
  }

  // ------------------------------------------------------------ Bayes net (two nodes)
  function bayesNet(el, props) {
    const card = div("card bn");
    const s = svg("svg", { viewBox: "0 0 420 120", width: "100%", role: "img", "aria-label": `${props.a} causes ${props.b}` });
    s.style.maxWidth = "440px";
    const node = (x, label, color) => {
      s.append(svg("rect", { x: x - 70, y: 30, width: 140, height: 56, rx: 28, fill: "#fff", stroke: color, "stroke-width": 3 }));
      const t = svg("text", { x, y: 64, "text-anchor": "middle", "font-size": 18, "font-weight": 700, fill: C.ink });
      t.textContent = label; s.append(t);
    };
    const defs = svg("defs");
    const m = svg("marker", { id: "arrow", viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: "auto-start-reverse" });
    m.append(svg("path", { d: "M0 0L10 5L0 10z", fill: C.ink }));
    defs.append(m); s.append(defs);
    node(90, props.a, C.sky);
    node(330, props.b, C.violet);
    s.append(svg("line", { x1: 162, y1: 58, x2: 256, y2: 58, stroke: C.ink, "stroke-width": 3, "marker-end": "url(#arrow)" }));
    card.append(s);
    const cpts = div("cpts");
    cpts.append(tableEl({ rows: props.cptA }), tableEl({ rows: props.cptB }));
    card.append(cpts);
    el.append(card);
  }

  return { peopleArray, bayesHero, die, pmf, emails, monty, montyStatic, bayesNet, TERM, TERM_TEXT, C };
})();
