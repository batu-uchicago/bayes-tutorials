#!/usr/bin/env node
/* Build docs/<tutorial>/lock.js from the private answer key and the roster.
 *
 *   node tools/build_lock.mjs t1 --roster private/roster.csv
 *
 * Inputs (private, never published):
 *   private/answers/<t>.json      correct answers, keyed by question id
 *   private/roster.csv            Canvas gradebook export or any CSV with a CNetID column
 *                                 ("SIS Login ID", "Login ID", "cnetid" or "CNetID")
 *   private/state/<t>.json        created on first run: the tutorial's salt
 *   private/magic_words/<t>.csv   created on first run: cnetid,word  (give this file to the TA)
 *
 * Output (public):
 *   docs/<t>/lock.js              answer hashes + each student's word, encrypted with a key
 *                                 derived from their CNetID and all correct answers
 *
 * Re-running keeps every existing student's word and only adds words for new students.
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { webcrypto as crypto } from "node:crypto";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const ITER = 200000;
const DEMO_ID = "demo";
const DEMO_WORD = "practice-only";
const enc = new TextEncoder();

const ADJ = ("amber brave breezy bright bubbly calm cheerful chilly clever cobalt cosmic crimson crisp curious dapper daring dazzling dusky eager electric emerald fancy fearless fluffy frosty fuzzy gentle giddy gleaming golden grand happy hazel honest humble icy indigo jolly jazzy keen kind lavender lively lucky lunar magnetic mellow merry mighty minty misty modest nimble noble olive peppy playful plucky polar proud quick quiet radiant rapid rosy royal rusty sandy scarlet sleepy snappy snowy solar sparkly speedy spicy sturdy sunny swift teal thrifty tidy tiny toasty topaz tranquil velvet vivid wandering whimsical windy witty zesty zippy").split(" ");
const ANIMAL = ("albatross alpaca armadillo axolotl badger beaver bison bobcat capybara caribou cheetah chinchilla condor cormorant coyote crane dingo dolphin dormouse eagle egret falcon ferret finch flamingo fox gazelle gecko gibbon giraffe gopher hedgehog heron hippo ibex iguana impala jackal jaguar kestrel kiwi koala lemur leopard llama lynx macaw manatee marmot meerkat mongoose moose narwhal newt ocelot octopus okapi orca osprey otter owl panda pangolin panther parrot pelican penguin puffin quail quokka rabbit raccoon raven reindeer robin salamander seal shark sloth sparrow squirrel stork swan tapir tiger toucan turtle viper vulture walrus weasel wombat yak zebra").split(" ");

// ------------------------------------------------------------ helpers
const hex = (buf) => Buffer.from(buf).toString("hex");
const sha256 = async (s) => hex(await crypto.subtle.digest("SHA-256", enc.encode(s)));
function loadCore() {
  const file = path.join(ROOT, "docs", "assets", "core.js");
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: file });
  return context.window.CORE;
}
const CORE = loadCore();
const die = (msg) => { console.error(`error: ${msg}`); process.exit(1); };

function parseCsv(text) {
  const rows = [];
  let row = [], field = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') q = false;
      else field += ch;
    } else if (ch === '"') q = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field); rows.push(row); row = []; field = "";
    } else field += ch;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}
const { normalizeId } = CORE;

function readRoster(file) {
  if (!fs.existsSync(file)) die(`roster not found at ${file}\n  Export it from Canvas (Grades > Export > Export Entire Gradebook), save it there, and run this again.`);
  const rows = parseCsv(fs.readFileSync(file, "utf8").replace(/^﻿/, ""));
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const col = ["sis login id", "login id", "cnetid", "cnet id", "sis user id"].map((n) => header.indexOf(n)).find((i) => i >= 0);
  if (col === undefined) die(`roster needs a CNetID column (SIS Login ID, Login ID or cnetid). Found: ${rows[0].join(", ")}`);
  const ids = rows.slice(1).map((r) => normalizeId(r[col])).filter((id) => /^[a-z0-9._-]{2,}$/.test(id));
  return [...new Set(ids)];
}

function loadLesson(t) {
  const file = path.join(ROOT, "docs", t, "lesson.js");
  const ctx = { window: { WIDGETS: { TERM: {}, TERM_TEXT: {}, C: {} } } };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(file, "utf8"), ctx, { filename: file });
  if (!ctx.window.LESSON) die(`${file} did not define window.LESSON`);
  return ctx.window.LESSON;
}

// ------------------------------------------------------------ main
const args = process.argv.slice(2);
const t = args[0];
if (!t) die("usage: node tools/build_lock.mjs <tutorial-id> [--roster private/roster.csv]");
const rosterArg = args.includes("--roster") ? args[args.indexOf("--roster") + 1] : null;

const lesson = loadLesson(t);
const answers = JSON.parse(fs.readFileSync(path.join(ROOT, "private", "answers", `${t}.json`), "utf8"));
const questions = lesson.steps.filter((s) => ["mcq", "numeric", "match"].includes(s.type));

// Validate the answer key against the lesson and build canonical answers.
const canonical = {};
for (const q of questions) {
  const a = answers[q.id];
  if (a === undefined) die(`no answer for ${q.id} in private/answers/${t}.json`);
  if (q.type === "mcq") {
    if (!q.options.some((o) => o.id === a)) die(`${q.id}: answer "${a}" is not one of the option ids`);
    canonical[q.id] = a;
  } else if (q.type === "numeric") {
    if (!Number.isFinite(Number(a))) die(`${q.id}: numeric answer "${a}" is not a number`);
    canonical[q.id] = CORE.canonNumber(Number(a));
  } else {
    const L = q.left.map((x) => x.id), R = new Set(q.right.map((x) => x.id));
    if (Object.keys(a).sort().join() !== [...L].sort().join()) die(`${q.id}: match keys must be exactly ${L.join(", ")}`);
    if (new Set(Object.values(a)).size !== L.length || Object.values(a).some((v) => !R.has(v))) die(`${q.id}: match values must be distinct right-hand ids`);
    canonical[q.id] = Object.keys(a).sort().map((k) => `${k}:${a[k]}`).join(",");
  }
}
const extra = Object.keys(answers).filter((k) => !questions.some((q) => q.id === k));
if (extra.length) die(`answers for unknown questions: ${extra.join(", ")}`);

// Salt: stable per tutorial.
const stateFile = path.join(ROOT, "private", "state", `${t}.json`);
fs.mkdirSync(path.dirname(stateFile), { recursive: true });
let state = fs.existsSync(stateFile) ? JSON.parse(fs.readFileSync(stateFile, "utf8")) : {};
if (!state.salt) { state.salt = hex(crypto.getRandomValues(new Uint8Array(16))); fs.writeFileSync(stateFile, JSON.stringify(state, null, 2)); }
const salt = state.salt;

// Words: keep existing ones, add new students.
const wordsFile = path.join(ROOT, "private", "magic_words", `${t}.csv`);
fs.mkdirSync(path.dirname(wordsFile), { recursive: true });
const words = new Map();
if (fs.existsSync(wordsFile)) for (const [id, w] of parseCsv(fs.readFileSync(wordsFile, "utf8")).slice(1)) words.set(normalizeId(id), w.trim());
const roster = rosterArg ? readRoster(path.resolve(rosterArg)) : [];
const used = new Set(words.values());
const newWord = () => {
  for (;;) {
    const r = crypto.getRandomValues(new Uint32Array(2));
    const w = `${ADJ[r[0] % ADJ.length]}-${ANIMAL[r[1] % ANIMAL.length]}`;
    if (!used.has(w)) { used.add(w); return w; }
  }
};
let added = 0;
for (const id of roster) if (!words.has(id)) { words.set(id, newWord()); added++; }

// Hashes.
const answerHash = (qid, v) => sha256(`${salt}|${qid}|${v}`);
const lock = { v: 1, salt, iter: ITER, order: questions.map((q) => q.id), answers: {}, pairs: {}, table: {} };
for (const q of questions) {
  if (q.type === "match") lock.pairs[q.id] = await Promise.all(Object.entries(answers[q.id]).map(([l, r]) => answerHash(q.id, `${l}:${r}`)));
  else lock.answers[q.id] = await answerHash(q.id, canonical[q.id]);
}

async function keyFor(id) {
  const material = `${id}|` + lock.order.map((q) => `${q}=${canonical[q]}`).join("&");
  const base = await crypto.subtle.importKey("raw", enc.encode(material), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", hash: "SHA-256", salt: enc.encode(`${salt}|${id}`), iterations: ITER },
    base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}
const all = [[DEMO_ID, DEMO_WORD], ...[...words.entries()].filter(([id]) => id !== DEMO_ID)];
for (const [id, word] of all) {
  const key = await keyFor(id);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(word)));
  const blob = new Uint8Array(12 + ct.length); blob.set(iv); blob.set(ct, 12);
  lock.table[await sha256(`${salt}|id|${id}`)] = Buffer.from(blob).toString("base64");
}

// Self-test: every entry decrypts to the right word.
for (const [id, word] of all) {
  const raw = Buffer.from(lock.table[await sha256(`${salt}|id|${id}`)], "base64");
  const plain = new TextDecoder().decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv: raw.subarray(0, 12) }, await keyFor(id), raw.subarray(12)));
  if (plain !== word) die(`self-test failed for ${id}`);
}

const out = path.join(ROOT, "docs", t, "lock.js");
fs.writeFileSync(out, `/* Generated by tools/build_lock.mjs. Do not edit. */\nwindow.LOCK = ${JSON.stringify(lock)};\n`);
const rows = [...words.entries()].filter(([id]) => id !== DEMO_ID).sort(([a], [b]) => a.localeCompare(b));
fs.writeFileSync(wordsFile, "cnetid,word\n" + rows.map(([id, w]) => `${id},${w}`).join("\n") + (rows.length ? "\n" : ""));

console.log(`${t}: ${questions.length} questions, ${rows.length} students (${added} new), plus "${DEMO_ID}" -> "${DEMO_WORD}"`);
console.log(`wrote ${path.relative(ROOT, out)} and ${path.relative(ROOT, wordsFile)}`);
