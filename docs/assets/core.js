/* Shared answer handling, probability helpers and the plain reading of formulas.
 *
 * Loaded by the engine in the browser and, through Node's vm module, by
 * tools/build_lock.mjs and tools/test/core.test.mjs, so the site and the
 * build always read and canonicalize answers the same way.
 */
(() => {
  "use strict";

  function normalizeId(s) {
    return String(s == null ? "" : s).trim().toLowerCase().replace(/@uchicago\.edu$/, "").replace(/\s+/g, "");
  }

  // Reads what a student types: decimals, fractions (7/2), percentages (50%), spaces and
  // thousands separators. A comma is a decimal point ("3,5", "0,125") unless exactly three
  // digits follow it after a non-zero integer part ("1,000"). Full-width digits, fraction
  // characters (the one-half sign, fraction slashes), dash-like minus signs and the ideographic full stop are folded first.
  function parseNumber(raw) {
    let s = String(raw == null ? "" : raw).normalize("NFKC").trim().replace(/\s+/g, "")
      .replace(/[\u2212\u2012\u2013\u2014]/g, "-").replace(/[\u2044\u2215]/g, "/").replace(/\u3002/g, ".");
    if (!s) return null;
    let pct = false;
    if (s.endsWith("%")) { pct = true; s = s.slice(0, -1); }
    if (/^[-+]?0,\d+$/.test(s)) s = s.replace(",", ".");
    s = s.replace(/(\d),(?=\d{3}(?!\d))/g, "$1").replace(/,/g, ".");
    let v;
    if (s.includes("/")) {
      const parts = s.split("/");
      if (parts.length !== 2 || parts[0] === "" || parts[1] === "") return null;
      v = Number(parts[0]) / Number(parts[1]);
    } else {
      v = s === "" ? NaN : Number(s);
    }
    if (!Number.isFinite(v)) return null;
    return pct ? v / 100 : v;
  }

  // Two decimals: the precision every numeric answer key uses.
  function canonNumber(v) {
    return (Math.round((Number(v) + Number.EPSILON) * 100) / 100).toFixed(2);
  }

  const sum = (xs) => xs.reduce((a, b) => a + b, 0);

  function normalize(ws) {
    const z = sum(ws);
    if (!(z > 0)) throw new Error("weights must have a positive sum");
    return ws.map((w) => w / z);
  }

  function posterior(prior, likelihood) {
    if (prior.length !== likelihood.length) throw new Error("prior and likelihood differ in length");
    return normalize(prior.map((p, i) => p * likelihood[i]));
  }

  function expectation(values, probs) {
    if (values.length !== probs.length) throw new Error("values and probabilities differ in length");
    return values.reduce((a, x, i) => a + x * probs[i], 0);
  }

  // Reads a TeX formula as plain text for a screen-reader announcement, the way it would be
  // typed in a sentence: P(\text{vanilla} \mid \text{Bowl 1}) becomes "P(vanilla | Bowl 1)".
  // A command missing from TEX_WORDS keeps its backslash, so the site tests catch a reason that uses one.
  const TEX_WORDS = { mid: "|", times: "\u00d7", cdot: "\u00d7", approx: "\u2248", cap: "\u2229", neg: "not", sum: "\u2211", Pr: "Pr" };
  function texToText(tex) {
    const part = (x) => (/^[\w.]+$/.test(x.trim()) ? x.trim() : `(${x.trim()})`);
    return String(tex)
      .replace(/\\text\{([^{}]*)\}/g, "$1")
      .replace(/\{,\}/g, ",")
      .replace(/\\d?frac\{([^{}]*)\}\{([^{}]*)\}/g, (_, a, b) => `${part(a)}/${part(b)}`)
      .replace(/\\[,;: ]/g, " ")
      .replace(/\\([A-Za-z]+)/g, (m, w) => (Object.hasOwn(TEX_WORDS, w) ? TEX_WORDS[w] : m))
      .replace(/[{}]/g, "")
      .replace(/\s+/g, " ").trim();
  }

  window.CORE = Object.freeze({ normalizeId, parseNumber, canonNumber, sum, normalize, posterior, expectation, texToText });
})();
