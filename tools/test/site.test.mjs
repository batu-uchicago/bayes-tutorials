/* Structural checks for the published site in docs/. Run: node --test "tools/test/*.test.mjs"
 * Every page's local scripts and stylesheets exist, fonts are self-hosted, and every widget
 * a lesson uses is registered by a script that its page loads. */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "..");
const DOCS = path.join(ROOT, "docs");

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? walk(p) : [p];
  });
}
const files = walk(DOCS);
const pages = files.filter((f) => f.endsWith("index.html"));
const refs = (html) => [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((m) => m[1]);
const scriptsOf = (html) => [...html.matchAll(/<script[^>]*src="([^"]+)"/g)].map((m) => m[1]);

test("every local script, stylesheet and link on every page exists", () => {
  for (const page of pages) {
    for (const ref of refs(fs.readFileSync(page, "utf8"))) {
      if (/^(https?:|mailto:|#)/.test(ref)) continue;
      const target = path.resolve(path.dirname(page), ref);
      const ok = ref.endsWith("/") ? fs.existsSync(path.join(target, "index.html")) : fs.existsSync(target);
      assert.ok(ok, `${path.relative(ROOT, page)} links to missing ${ref}`);
    }
  }
});

test("fonts are self-hosted: no page or asset calls Google Fonts", () => {
  for (const f of files.filter((f) => /\.(html|css|js)$/.test(f))) {
    assert.doesNotMatch(fs.readFileSync(f, "utf8"), /fonts\.(googleapis|gstatic)\.com/, `${path.relative(ROOT, f)} loads Google Fonts`);
  }
  const css = fs.readFileSync(path.join(DOCS, "assets", "style.css"), "utf8");
  const urls = [...css.matchAll(/url\("?([^")]+)"?\)/g)].map((m) => m[1]);
  assert.ok(urls.length >= 2, "style.css declares the Fraunces font files");
  for (const u of urls) assert.ok(fs.existsSync(path.join(DOCS, "assets", u)), `style.css points to missing ${u}`);
});

test("the landing page and every tutorial it links to have QR codes", () => {
  const landing = fs.readFileSync(path.join(DOCS, "index.html"), "utf8");
  const folders = ["", ...[...landing.matchAll(/<a href="(t\d+)\/"/g)].map((m) => m[1])];
  assert.ok(folders.length > 1, "the landing page links to at least one tutorial");
  for (const folder of folders) {
    for (const file of ["qr.png", "qr.svg"]) {
      const p = path.join(DOCS, folder, file);
      assert.ok(fs.existsSync(p), `missing docs/${folder ? folder + "/" : ""}${file}; run python3 tools/make_qr.py ${folder || "index"}`);
    }
    const png = fs.readFileSync(path.join(DOCS, folder, "qr.png"));
    assert.equal(png.subarray(1, 4).toString(), "PNG", `docs/${folder}/qr.png is not a PNG`);
    const svg = fs.readFileSync(path.join(DOCS, folder, "qr.svg"), "utf8");
    const url = `https://batu-uchicago.github.io/bayes-tutorials/${folder ? folder + "/" : ""}`;
    assert.ok(svg.includes(url.replace("https://", "")), `docs/${folder}/qr.svg should print its link, ${url}`);
  }
});

test("bold text uses a weight the self-hosted font has", () => {
  const css = fs.readFileSync(path.join(DOCS, "assets", "style.css"), "utf8");
  const maxWeight = Math.max(...[...css.matchAll(/font-weight:\s*\d+\s+(\d+);/g)].map((m) => Number(m[1])));
  const rule = css.match(/(?:^|\n)\s*b,\s*strong\s*{([^}]*)}/);
  assert.ok(rule, "style.css sets a weight for b and strong");
  const w = Number((rule[1].match(/font-weight:\s*(\d+)/) || [])[1]);
  assert.ok(w > 400 && w <= maxWeight, `b and strong use weight ${w}, but the font only goes up to ${maxWeight}`);
});

test("every widget a lesson uses is registered by a script its page loads", () => {
  const registry = {};
  for (const f of files.filter((f) => f.includes(`${path.sep}widgets${path.sep}`) && f.endsWith(".js"))) {
    for (const m of fs.readFileSync(f, "utf8").matchAll(/window\.WIDGETS\.(\w+)\s*=/g)) registry[m[1]] = path.relative(DOCS, f);
  }
  for (const lessonFile of files.filter((f) => f.endsWith("lesson.js"))) {
    const context = { window: { WIDGETS: {} } };
    vm.createContext(context);
    vm.runInContext(fs.readFileSync(lessonFile, "utf8"), context, { filename: lessonFile });
    const L = context.window.LESSON;
    const used = [L.introVisual, L.finishVisual, ...L.steps.map((s) => s.visual)].filter(Boolean).map((v) => v.widget);
    const page = fs.readFileSync(path.join(path.dirname(lessonFile), "index.html"), "utf8");
    const loaded = new Set(scriptsOf(page).map((s) => path.relative(DOCS, path.resolve(path.dirname(lessonFile), s))));
    for (const w of new Set(used)) {
      assert.ok(registry[w], `${path.relative(ROOT, lessonFile)} uses widget ${w}, which no file registers`);
      assert.ok(loaded.has(registry[w]), `${path.relative(ROOT, lessonFile)} uses ${w} but its page does not load ${registry[w]}`);
      assert.ok(loaded.has(path.join("assets", "draw.js")), `${path.relative(ROOT, lessonFile)}'s page must load assets/draw.js`);
    }
    assert.ok(loaded.has(path.join("assets", "core.js")), `${path.relative(ROOT, lessonFile)}'s page must load assets/core.js`);
  }
});

test("tutorials on the landing page ask no typed-number questions, and every option reason is text", () => {
  const landing = fs.readFileSync(path.join(DOCS, "index.html"), "utf8");
  for (const folder of [...landing.matchAll(/<a href="(t\d+)\/"/g)].map((m) => m[1])) {
    const file = path.join(DOCS, folder, "lesson.js");
    const context = { window: { WIDGETS: {} } };
    vm.createContext(context);
    vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: file });
    for (const s of context.window.LESSON.steps) {
      assert.notEqual(s.type, "numeric", `${folder}: "${s.title}" asks for a typed number; make it multiple choice`);
      if (s.type !== "mcq") continue;
      for (const o of s.options) {
        if (o.why !== undefined) assert.ok(typeof o.why === "string" && o.why.trim(), `${folder}: "${s.title}" option ${o.id} has an empty reason`);
      }
    }
  }
});
