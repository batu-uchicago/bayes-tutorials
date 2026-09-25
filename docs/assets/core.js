/* Shared answer handling and probability helpers.
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
  // digits follow it after a non-zero integer part ("1,000").
  function parseNumber(raw) {
    let s = String(raw == null ? "" : raw).trim().replace(/\s+/g, "").replace(/−/g, "-");
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

  window.CORE = Object.freeze({ normalizeId, parseNumber, canonNumber, sum, normalize, posterior, expectation });
})();
