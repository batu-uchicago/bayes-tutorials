/* Text contrast for the palette in docs/assets/style.css, against WCAG 2.1.
 * The site is set in Fraunces Light on a dark ground, and thin strokes lose legibility first,
 * so text on the page and on cards must reach 7:1 (AAA); feedback sheets and buttons 4.5:1 (AA).
 * Run: node --test "tools/test/*.test.mjs" */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "..");
const css = fs.readFileSync(path.join(ROOT, "docs", "assets", "style.css"), "utf8");
const vars = Object.fromEntries([...css.match(/:root\s*{([^}]*)}/)[1].matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]]));

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
function rule(selector) {
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = css.match(new RegExp(`(?:^|\\n)\\s*${esc}\\s*{([^}]*)}`));
  assert.ok(m, `style.css has no rule for ${selector}`);
  return m[1];
}
function color(body, name) {
  const m = body.match(new RegExp(`(?:^|[;\\s])${name}:\\s*var\\(--([\\w-]+)\\)`));
  return m && vars[m[1]];
}
function expectPairs(pairs, min) {
  for (const [fg, bg] of pairs) {
    assert.ok(vars[fg] && vars[bg], `style.css defines --${fg} and --${bg}`);
    const c = contrast(vars[fg], vars[bg]);
    assert.ok(c >= min, `--${fg} on --${bg} is ${c.toFixed(2)}:1, below ${min}:1`);
  }
}

test("the site is dark: the ground is darker than the text", () => {
  assert.ok(luminance(vars.ground) < 0.05, "--ground is a dark color");
  assert.ok(luminance(vars.text) > 0.7, "--text is a light color");
  assert.match(css, /color-scheme:\s*dark/, "style.css declares color-scheme: dark so form controls match");
});

test("body, muted and accent text reach 7:1 on the ground and on cards", () => {
  const pairs = [];
  for (const fg of ["text", "text-2", "muted", "accent"]) for (const bg of ["ground", "raised"]) pairs.push([fg, bg]);
  expectPairs(pairs, 7);
});

test("feedback sheets and buttons reach 4.5:1", () => {
  expectPairs([
    ["good-text", "good-bg"], ["good", "good-bg"], ["bad-text", "bad-bg"], ["bad", "bad-bg"],
    ["on-gold", "gold"], ["on-gold", "good"], ["on-gold", "bad"], ["on-gold", "accent"],
  ], 4.5);
});

test("the locked Next button's instruction text reaches 4.5:1", () => {
  const body = rule(".btn:disabled");
  const c = contrast(color(body, "color"), color(body, "background"));
  assert.ok(c >= 4.5, `.btn:disabled text is ${c.toFixed(2)}:1`);
});

test("the tick on a finished unit reaches 4.5:1", () => {
  const body = rule(".path li.is-done .dot");
  const c = contrast(color(body, "color"), color(body, "background"));
  assert.ok(c >= 4.5, `the finished-unit tick is ${c.toFixed(2)}:1`);
});
