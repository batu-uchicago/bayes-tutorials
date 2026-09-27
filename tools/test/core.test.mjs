/* Unit tests for docs/assets/core.js. Run: node --test "tools/test/*.test.mjs" */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "..");

function loadCore() {
  const file = path.join(ROOT, "docs", "assets", "core.js");
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: file });
  return context.window.CORE;
}

const CORE = loadCore();
const near = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `${a} is not within ${tol} of ${b}`);

test("normalizeId lowercases, trims and drops the uchicago.edu suffix", () => {
  assert.equal(CORE.normalizeId("  JDoe@uchicago.edu "), "jdoe");
  assert.equal(CORE.normalizeId("TEST@uchicago.edu "), "test");
  assert.equal(CORE.normalizeId("j doe"), "jdoe");
  assert.equal(CORE.normalizeId(undefined), "");
});

test("parseNumber reads decimals, fractions and percentages", () => {
  assert.equal(CORE.parseNumber("0.25"), 0.25);
  assert.equal(CORE.parseNumber(" 7/2 "), 3.5);
  assert.equal(CORE.parseNumber("50%"), 0.5);
  assert.equal(CORE.parseNumber(".5"), 0.5);
  assert.equal(CORE.parseNumber("−0.5"), -0.5);
});

test("parseNumber treats a comma as a decimal point, except before exactly three digits", () => {
  assert.equal(CORE.parseNumber("3,5"), 3.5);
  assert.equal(CORE.parseNumber("0,25"), 0.25);
  assert.equal(CORE.parseNumber("0,125"), 0.125);
  assert.equal(CORE.parseNumber("12,5%"), 0.125);
  assert.equal(CORE.parseNumber("1,000"), 1000);
  assert.equal(CORE.parseNumber("1,000,000"), 1000000);
  assert.equal(CORE.parseNumber("2 008"), 2008);
});

test("parseNumber accepts full-width digits, fraction characters and other minus signs", () => {
  assert.equal(CORE.parseNumber("\u00BD"), 0.5);
  assert.equal(CORE.parseNumber("\uFF10.\uFF15"), 0.5);
  assert.equal(CORE.parseNumber("\u20130.5"), -0.5);
  assert.equal(CORE.parseNumber("0\u30025"), 0.5);
  assert.equal(CORE.parseNumber("3\u20448"), 0.375);
});

test("parseNumber rejects what is not a number", () => {
  for (const bad of ["", "   ", "abc", "%", "3/", "/4", "1/0", "1/2/3", "0.5.", null, undefined]) {
    assert.equal(CORE.parseNumber(bad), null, `expected null for ${JSON.stringify(bad)}`);
  }
});

test("canonNumber rounds to two decimals, the answer-key precision", () => {
  assert.equal(CORE.canonNumber(1 / 3), "0.33");
  assert.equal(CORE.canonNumber(2 / 3), "0.67");
  assert.equal(CORE.canonNumber(3.5), "3.50");
  assert.equal(CORE.canonNumber("0.2"), "0.20");
  assert.equal(CORE.canonNumber(CORE.parseNumber("0,375")), "0.38");
});

test("posterior multiplies prior by likelihood and rescales", () => {
  const post = CORE.posterior([0.5, 0.5], [0.2, 0.6]);
  near(post[0], 0.25);
  near(post[1], 0.75);
  near(CORE.posterior([1, 1, 1], [1, 2, 1])[1], 0.5);
  assert.throws(() => CORE.posterior([1], [1, 2]));
  assert.throws(() => CORE.normalize([0, 0]));
});

test("sequential updating equals one batch update", () => {
  let p = [0.5, 0.5];
  for (const lik of [[0.9, 0.3], [0.9, 0.3], [0.1, 0.7]]) p = CORE.posterior(p, lik);
  const batch = CORE.posterior([0.5, 0.5], [0.9 * 0.9 * 0.1, 0.3 * 0.3 * 0.7]);
  near(p[0], batch[0], 1e-12);
});

test("expectation is the probability-weighted average", () => {
  near(CORE.expectation([1, 2, 3, 4, 5, 6], Array(6).fill(1 / 6)), 3.5, 1e-12);
  near(CORE.expectation([10, 20], [0.25, 0.75]), 17.5);
});

test("texToText reads a formula as plain text for the result announcement", () => {
  const r = String.raw;
  assert.equal(CORE.texToText(r`P(\text{vanilla} \mid \text{Bowl 1})`), "P(vanilla | Bowl 1)");
  assert.equal(CORE.texToText(r`P(AB) = P(A)\,P(B)`), "P(AB) = P(A) P(B)");
  assert.equal(CORE.texToText(r`1/2 \times 3/4 \approx 0.38`), "1/2 × 3/4 ≈ 0.38");
  assert.equal(CORE.texToText(r`\dfrac{3/8}{5/8} = \frac{3}{5}`), "(3/8)/(5/8) = 3/5");
  assert.equal(CORE.texToText(r`P(\neg A\, B) = 10{,}000`), "P(not A B) = 10,000");
});

test("texToText keeps the backslash of a command it does not know", () => {
  assert.equal(CORE.texToText(String.raw`p \propto q`), String.raw`p \propto q`);
  assert.equal(CORE.texToText(String.raw`\constructor`), String.raw`\constructor`);
});

test("the engine and the build use core.js instead of their own copies", () => {
  const engine = fs.readFileSync(path.join(ROOT, "docs", "assets", "engine.js"), "utf8");
  const build = fs.readFileSync(path.join(ROOT, "tools", "build_lock.mjs"), "utf8");
  for (const [name, src] of [["engine.js", engine], ["build_lock.mjs", build]]) {
    assert.match(src, /CORE/, `${name} should use CORE`);
    assert.doesNotMatch(src, /function (normalizeId|parseNumber)\b|const (canonNumber|normalizeId) =/, `${name} defines its own copy`);
  }
});
