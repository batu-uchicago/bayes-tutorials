/* Text contrast for the palette in docs/assets/style.css, against WCAG 2.1 AA (4.5:1 for text).
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

test("body, muted, accent and feedback text pairs reach 4.5:1", () => {
  const pairs = [
    ["ink", "paper"], ["ink-2", "paper"], ["muted", "paper"], ["accent", "paper"], ["plum", "card"],
    ["terra-ink", "terra-tint"], ["sage-ink", "sage-tint"], ["paper", "ink"], ["paper", "sage-ink"], ["paper", "terra-ink"],
  ];
  for (const [fg, bg] of pairs) {
    const c = contrast(vars[fg], vars[bg]);
    assert.ok(c >= 4.5, `--${fg} on --${bg} is ${c.toFixed(2)}:1`);
  }
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
