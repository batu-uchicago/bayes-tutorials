# Tutorial Site Hosting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the tutorial site on `batu-uchicago` GitHub Pages with a four-step Tutorial 0 that proves publishing, web access and the magic-word unlock work.

**Architecture:** The existing static site in `Tutorials/docs/` is served by GitHub Pages from the public repo `batu-uchicago/bayes-tutorials` (branch `main`, folder `/docs`).
`Tutorials/private/` is a separate nested git repo pushed to the private repo `batu-uchicago/bayes-tutorials-private`.
Both repos push as `batu-uchicago` through a repo-local credential helper, so the active `gh` account (`batu-ludwig`) never changes.

**Tech Stack:** Plain HTML, CSS and JavaScript (no build step), Node 18+ for `tools/build_lock.mjs`, git, GitHub CLI `gh` 2.93, GitHub Pages (legacy branch deploy with `.nojekyll`).

**Spec:** `Tutorials/planning/2026-09-25-hosting-design.md`

## Global Constraints

- Paths: `T=/Users/batuhangundogdu/Desktop/Bayes/Tutorials`, `S=/private/tmp/claude-501/-Users-batuhangundogdu-Desktop-Bayes/716971ec-d3ab-4804-a0a6-838da86528c4/scratchpad`.
- Public repo `batu-uchicago/bayes-tutorials`; private repo `batu-uchicago/bayes-tutorials-private`.
- Site URL `https://batu-uchicago.github.io/bayes-tutorials/`; Tutorial 0 at `https://batu-uchicago.github.io/bayes-tutorials/t0/`.
- Commit identity in both repos, set locally: `Batuhan Gundogdu <gundogdu@uchicago.edu>`. Never change the global git identity.
- Never run `gh auth switch`. Pass `GH_TOKEN="$(gh auth token --hostname github.com --user batu-uchicago)"` per command instead. Never print a token.
- Commit messages carry no `Co-Authored-By` line and no agent attribution (Batu's global instruction).
- Nothing under `private/` is ever committed to the public repo. `private/roster.csv` is never committed anywhere.
- No changes to `docs/assets/engine.js`, `docs/assets/widgets.js`, `docs/assets/style.css` or `tools/build_lock.mjs`.
- No em dashes in any file or message. In Markdown prose, one sentence per line.
- Local checks run over `http://localhost:8765`, because the page's encryption needs a secure context (localhost or https).

## Review Focus

- A student types their CNetID with capitals, the email suffix or stray spaces (`TEST@uchicago.edu `): they get the same word as `test`. Pinned in Task 2, Step 7.
- A student mistypes their CNetID (`nobody`): they see the "We don't have a magic word" warning before starting and again at the end, not a crash. Pinned in Task 2, Step 7.
- A student answers wrong first: the question comes back at the end, and the word still unlocks after the retry. Pinned in Task 2, Step 7.
- A student types the numeric answer as a fraction (`7/2`): it is accepted as 3.50. Pinned in Task 2, Step 7.
- A student opens the tutorial on a phone: every step fits and every button is reachable. Pinned in Task 3, Step 9.

---

### Task 1: Local repositories, identity and credentials

**Files:**
- Create: `$T/.git` (via `git init`)
- Create: `$T/private/.git` (via `git init`)
- Create: `$T/private/.gitignore`

**Interfaces:**
- Consumes: the `batu-uchicago` login already stored in `gh` (verified 2026-09-25).
- Produces: two local repos on branch `main`, each with a first commit by `Batuhan Gundogdu <gundogdu@uchicago.edu>`, and a repo-local `credential.helper` that answers `get` for github.com with `username=batu-uchicago` and that account's token.
  Later tasks push with plain `git push` and rely on this helper.

- [ ] **Step 1: Initialize both repos and set the local identity**

```bash
T=/Users/batuhangundogdu/Desktop/Bayes/Tutorials
git -C "$T" init -b main
git -C "$T/private" init -b main
for R in "$T" "$T/private"; do
  git -C "$R" config --local user.name "Batuhan Gundogdu"
  git -C "$R" config --local user.email "gundogdu@uchicago.edu"
done
```

- [ ] **Step 2: Add the repo-local credential helper to both repos**

The empty value resets the helper list, which drops the system `osxkeychain` helper for these repos.

```bash
T=/Users/batuhangundogdu/Desktop/Bayes/Tutorials
for R in "$T" "$T/private"; do
  git -C "$R" config --local credential.helper ""
  git -C "$R" config --local --add credential.helper '!f() { test "$1" = get || exit 0; echo username=batu-uchicago; echo "password=$(gh auth token --hostname github.com --user batu-uchicago)"; }; f'
done
```

- [ ] **Step 3: Verify the helper answers as `batu-uchicago` in both repos**

```bash
T=/Users/batuhangundogdu/Desktop/Bayes/Tutorials
for R in "$T" "$T/private"; do
  printf 'protocol=https\nhost=github.com\n\n' | GIT_TERMINAL_PROMPT=0 git -C "$R" credential fill | sed -n 's/^username=//p'
  printf 'protocol=https\nhost=github.com\n\n' | GIT_TERMINAL_PROMPT=0 git -C "$R" credential fill | grep -c '^password=gh'
done
```

Expected: `batu-uchicago` then `1`, twice.
GitHub tokens from `gh` start with `gho_` or `ghp_`, so the count proves a token came back without printing it.

- [ ] **Step 4: Keep the raw roster out of the private repo**

Create `$T/private/.gitignore`:

```gitignore
# A full Canvas gradebook export holds names, student ID numbers and grades.
roster.csv
.DS_Store
```

- [ ] **Step 5: Check what each repo would commit**

```bash
T=/Users/batuhangundogdu/Desktop/Bayes/Tutorials
git -C "$T" add -A
git -C "$T" ls-files | grep -E '^private/|\.DS_Store' || echo "public: clean"
git -C "$T" status --porcelain --ignored | grep '^!! private/'
git -C "$T/private" add -A
git -C "$T/private" ls-files
```

Expected: `public: clean`, then `!! private/`, then the private list: `.gitignore`, `answers/t1.json`, `magic_words/t1.csv`, `state/t1.json`, and no `roster.csv`.

- [ ] **Step 6: Commit both repos**

```bash
T=/Users/batuhangundogdu/Desktop/Bayes/Tutorials
git -C "$T" commit -m "Add tutorial prototype and hosting plan"
git -C "$T/private" commit -m "Add Tutorial 1 answer key, salt and word list"
git -C "$T" log -1 --format='%an <%ae>'
git -C "$T/private" log -1 --format='%an <%ae>'
```

Expected: `Batuhan Gundogdu <gundogdu@uchicago.edu>` twice.

---

### Task 2: Tutorial 0 and local check

**Files:**
- Move: `$T/docs/t1/` to `$T/drafts/t1/`
- Create: `$T/docs/t0/index.html`
- Create: `$T/docs/t0/lesson.js`
- Create: `$T/private/answers/t0.json`
- Generate: `$T/docs/t0/lock.js`, `$T/private/state/t0.json`, `$T/private/magic_words/t0.csv` (by `tools/build_lock.mjs`)
- Create: `$T/docs/.nojekyll` (empty)
- Modify: `$T/docs/index.html` (the `<ol class="weeks">` block)
- Modify: `/Users/batuhangundogdu/Desktop/Bayes/.claude/launch.json` (the `tutorials` server's directory)

**Interfaces:**
- Consumes: the engine's lesson format in `docs/assets/engine.js` (`window.LESSON` with `id`, `kicker`, `title`, `lede`, `finishLine`, `submitLine`, `units`, `steps`; step types `read`, `mcq`, `numeric`; `read` steps accept `button` and `visual`) and the `die` widget in `docs/assets/widgets.js`, which keeps Next disabled until `props.need` rolls.
- Produces: `docs/t0/` with a working lock for CNetIDs `demo` (word `practice-only`) and `test` (a random word stored in `private/magic_words/t0.csv`).

- [ ] **Step 1: Point the local preview at a synced copy of `docs/`**

The desktop app's preview server serves from the scratchpad, as the previous session's config did, so sync `docs/` there before every local check.
In `/Users/batuhangundogdu/Desktop/Bayes/.claude/launch.json`, change the `D=` path inside `runtimeArgs` of the `tutorials` configuration to:

```
/private/tmp/claude-501/-Users-batuhangundogdu-Desktop-Bayes/716971ec-d3ab-4804-a0a6-838da86528c4/scratchpad/site
```

Then stop any running `tutorials` preview server (`preview_list`, `preview_stop`), sync, and start it:

```bash
T=/Users/batuhangundogdu/Desktop/Bayes/Tutorials
S=/private/tmp/claude-501/-Users-batuhangundogdu-Desktop-Bayes/716971ec-d3ab-4804-a0a6-838da86528c4/scratchpad
mkdir -p "$S/site" && rsync -a --delete "$T/docs/" "$S/site/"
```

Then `preview_start` with name `tutorials`.

- [ ] **Step 2: Confirm Tutorial 0 does not exist yet**

```bash
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8765/t0/
```

Expected: `404`.

- [ ] **Step 3: Move Tutorial 1 out of the published folder and add `.nojekyll`**

```bash
T=/Users/batuhangundogdu/Desktop/Bayes/Tutorials
mkdir -p "$T/drafts"
git -C "$T" mv docs/t1 drafts/t1
touch "$T/docs/.nojekyll"
```

- [ ] **Step 4: Write Tutorial 0**

Create `$T/docs/t0/index.html`:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Tutorial 0: Test run | Bayesian Machine Learning</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,400;0,600;0,700;1,400&family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&display=swap">
  <link rel="stylesheet" href="../assets/katex/katex.min.css">
  <link rel="stylesheet" href="../assets/style.css">
</head>
<body>
  <div id="app"><noscript><main class="intro"><h1>Turn on JavaScript</h1><p class="lede">This tutorial is interactive and needs JavaScript.</p></main></noscript></div>
  <script defer src="../assets/katex/katex.min.js"></script>
  <script defer src="../assets/katex/auto-render.min.js"></script>
  <script defer src="../assets/widgets.js"></script>
  <script defer src="lesson.js"></script>
  <script defer src="lock.js"></script>
  <script defer src="../assets/engine.js"></script>
</body>
</html>
```

Create `$T/docs/t0/lesson.js`:

```js
/* Tutorial 0: a four-step test of the site mechanics.
   Throwaway content: one step of each kind the course uses.
   Correct answers are NOT in this file; they live in private/answers/t0.json
   and reach the page only as salted hashes inside lock.js. */
(() => {
  const r = String.raw;

  window.LESSON = {
    id: "t0",
    kicker: "Tutorial 0, a test run",
    title: "Test run",
    lede: "Four quick steps that check the tutorial site works. Answer both questions correctly, on the first try or the second, to see your magic word.",
    finishLine: "All four kinds of step worked.",
    submitLine: "This is a test run. There is no Canvas quiz for Tutorial 0.",
    units: [
      { id: "read", title: "Read, then Next" },
      { id: "play", title: "Play, then Next" },
      { id: "choose", title: "Multiple choice" },
      { id: "enter", title: "Enter a value" },
    ],
    steps: [
      {
        type: "read", unit: "read", title: "Read this, then press Next", button: "Next",
        html: "<p>This step has only text. Press <b>Next</b> to go on.</p>",
      },
      {
        type: "read", unit: "play", title: "Roll the die, then press Next", button: "Next",
        visual: { widget: "die", props: { need: 30 } },
        html: "<p>Roll at least 30 times and watch the share of 4s settle down. <b>Next</b> unlocks after 30 rolls.</p>",
      },
      {
        type: "mcq", id: "q_rolls", unit: "choose", title: "Pick one",
        prompt: "You roll a fair die 6,000 times. About how many 4s do you expect?",
        options: [
          { id: "a", html: "600" }, { id: "b", html: "1,000" }, { id: "c", html: "1,500" }, { id: "d", html: "Exactly 4" },
        ],
        explain: r`Each face has probability $\frac{1}{6}$, and $6000 \times \frac{1}{6} = 1000$.`,
      },
      {
        type: "numeric", id: "q_expect", unit: "enter", title: "Type a number",
        prompt: "What is $E[X]$ for one roll of a fair die?",
        hint: "A fraction like 3/8 or a decimal rounded to two places, like 2.75.",
        explain: r`$E[X] = (1+2+3+4+5+6) \cdot \frac{1}{6} = \frac{21}{6} = 3.5$.`,
      },
    ],
  };
})();
```

Create `$T/private/answers/t0.json`:

```json
{
  "q_rolls": "b",
  "q_expect": "3.50"
}
```

- [ ] **Step 5: List only Tutorial 0 on the landing page**

In `$T/docs/index.html`, replace the whole `<ol class="weeks">` block (the two `<li>` entries for Tutorials 1 and 2) with:

```html
    <ol class="weeks">
      <li><a href="t0/"><span class="n">0</span><span><b>Test run</b><span class="d">Four quick steps that check the site works</span></span></a></li>
    </ol>
```

- [ ] **Step 6: Build the Tutorial 0 lock and serve it locally**

```bash
T=/Users/batuhangundogdu/Desktop/Bayes/Tutorials
S=/private/tmp/claude-501/-Users-batuhangundogdu-Desktop-Bayes/716971ec-d3ab-4804-a0a6-838da86528c4/scratchpad
cd "$T" && node tools/build_lock.mjs t0 --roster private/roster.csv
cat "$T/private/magic_words/t0.csv"
rsync -a --delete "$T/docs/" "$S/site/"
for p in / /t0/ /t0/lock.js /t1/; do printf '%s ' "$p"; curl -s -o /dev/null -w '%{http_code}\n' "http://localhost:8765$p"; done
```

Expected build output:

```
t0: 2 questions, 1 students (1 new), plus "demo" -> "practice-only"
wrote docs/t0/lock.js and private/magic_words/t0.csv
```

Expected: the CSV shows `cnetid,word` and one `test,<adjective>-<animal>` row; then `/ 200`, `/t0/ 200`, `/t0/lock.js 200`, `/t1/ 404`.
The build's self-test has already decrypted both entries, or it would have exited with an error.

- [ ] **Step 7: Walk through Tutorial 0 in the local preview**

Use the preview tools on `http://localhost:8765/t0/`.
Selectors: CNetID box `#cnetid`, start button `form.signin button[type=submit]`, footer button `footer .btn`, roll-100 button `.controls button:nth-child(3)`, answer tiles `.tile[data-id="a"]` to `.tile[data-id="d"]`, number box `.num-input`, word `.magic .word`.

Run A, unknown CNetID:
1. Run `localStorage.clear(); location.reload()` with `preview_eval`.
2. Fill `#cnetid` with `nobody` and press start. Expected: a warning containing `We don't have a magic word for "nobody" yet`.

Run B, the full path as `test`:
1. Run `localStorage.clear(); location.reload()`.
2. Fill `#cnetid` with `TEST@uchicago.edu ` (capitals, suffix, trailing space) and press start.
3. Step 1: the footer button reads `Next`. Click it.
4. Step 2: the footer button reads `Roll at least 30 times` and is disabled. Click roll-100, then the footer button, which now reads `Next`.
5. Step 3: click tile `a`, click `Check`. Expected: `Not quite` and `You'll see this question again at the end.` Click `Continue`.
6. Step 4: fill `.num-input` with `7/2`, click `Check`. Expected: a praise line such as `Correct!`. Click `Continue`.
7. Reload the page. Expected: the start button reads `Continue where I left off`. Click it.
8. Step 3 returns with `Second try`. Click tile `b`, `Check`, `Continue`.
9. Expected finish screen: `Tutorial complete`, and `.magic .word` equals the `test` word from `private/magic_words/t0.csv`, with the label `Magic word for test`.

Run C, `demo`:
1. Run `localStorage.clear(); location.reload()`.
2. Enter `demo` and answer everything correctly the first time. Expected: `.magic .word` is `practice-only` and the stat reads `2/2`.

Then `preview_console_logs` with level `error`. Expected: `No console logs.`

- [ ] **Step 8: Commit both repos**

```bash
T=/Users/batuhangundogdu/Desktop/Bayes/Tutorials
git -C "$T" add -A
git -C "$T" ls-files | grep -E '^private/' || echo "public: clean"
git -C "$T" commit -m "Add Tutorial 0 mechanics test and move Tutorial 1 to drafts"
git -C "$T/private" add -A
git -C "$T/private" commit -m "Add Tutorial 0 answer key, salt and word list"
```

Expected: `public: clean` and two commits.

---

### Task 3: Publish and verify on the web

**Files:**
- Modify: `$T/README.md` (the "What is where" table, "Before each tutorial goes live" step 4, "Publishing on GitHub Pages", "Adding next week's tutorial" step 1 and "Testing locally")

**Interfaces:**
- Consumes: the two local repos and credential helper from Task 1 and the Tutorial 0 commit from Task 2.
- Produces: the public repo with Pages live at `https://batu-uchicago.github.io/bayes-tutorials/`, and the private backup repo.

- [ ] **Step 1: Update the README**

Replace the "What is where" table with:

```markdown
| Path | Where it lives | Purpose |
|---|---|---|
| `docs/` | Public repo, served on GitHub Pages | The website: landing page, shared engine, one folder per tutorial |
| `docs/assets/engine.js` | Served | Step flow, answer checking, retry queue, XP, saved progress, unlocking the word |
| `docs/assets/widgets.js` | Served | Interactive pieces: die roller, icon arrays, email grid, Monty Hall doors, Bayes net |
| `docs/t0/` | Served | Tutorial 0, a four-step test of the site mechanics |
| `docs/<t>/lesson.js` | Served | A tutorial's content. It contains no answers. |
| `docs/<t>/lock.js` | Served | Generated. Salted answer hashes and encrypted magic words. |
| `drafts/` | Public repo, not served | Tutorials still being written, such as the first draft of Tutorial 1 |
| `planning/` | Public repo, not served | Design notes and implementation plans |
| `tools/build_lock.mjs` | Public repo, not served | Builds `lock.js` from the private answer key and the roster |
| `private/` | **Its own private repo**, never in the public one | Answer keys, salts and magic-word lists |
```

In "Before each tutorial goes live", replace step 4 with:

```markdown
4. Commit and push both repositories (see "Publishing on GitHub Pages").
```

Replace the whole "Publishing on GitHub Pages" section with:

```markdown
## Publishing on GitHub Pages

The site is published from the public repository `batu-uchicago/bayes-tutorials`, branch `main`, folder `/docs`.
It appears at `https://batu-uchicago.github.io/bayes-tutorials/`.
Pushing to `main` republishes it within a few minutes.

`private/` is its own git repository, pushed to the private repository `batu-uchicago/bayes-tutorials-private`.
The public repository ignores it.
`private/roster.csv` is ignored in both, because a gradebook export holds names, student ID numbers and grades.
Commit and push `private/` after every build, so the salts and word lists are backed up.

Both repositories push as `batu-uchicago`, whichever account `gh` has active.
A repository-local credential helper asks `gh auth token --user batu-uchicago` for the token.
Commits use the repository-local identity `Batuhan Gundogdu <gundogdu@uchicago.edu>`.
```

In "Adding next week's tutorial", replace step 1 with:

```markdown
1. Copy an existing tutorial folder, such as `docs/t0/`, to `docs/t2/` and rewrite `lesson.js`. Keep question ids unique within the lesson.
```

In "Testing locally", replace `http://localhost:8765/t1/` with `http://localhost:8765/t0/`.

- [ ] **Step 2: Commit the README**

```bash
T=/Users/batuhangundogdu/Desktop/Bayes/Tutorials
git -C "$T" add README.md
git -C "$T" commit -m "Document the batu-uchicago hosting setup"
```

- [ ] **Step 3: Create both GitHub repos**

```bash
GH_TOKEN="$(gh auth token --hostname github.com --user batu-uchicago)" gh repo create batu-uchicago/bayes-tutorials --public --description "Weekly interactive tutorials for ADSP 32014, Bayesian Machine Learning"
GH_TOKEN="$(gh auth token --hostname github.com --user batu-uchicago)" gh repo create batu-uchicago/bayes-tutorials-private --private --description "Answer keys, salts and magic-word lists for bayes-tutorials"
```

Expected: two `Created repository` lines.

- [ ] **Step 4: Push both repos**

```bash
T=/Users/batuhangundogdu/Desktop/Bayes/Tutorials
git -C "$T" remote add origin https://github.com/batu-uchicago/bayes-tutorials.git
git -C "$T" push -u origin main
git -C "$T/private" remote add origin https://github.com/batu-uchicago/bayes-tutorials-private.git
git -C "$T/private" push -u origin main
```

Expected: both pushes succeed without a password prompt.

- [ ] **Step 5: Turn on Pages and wait for the first build**

```bash
GH_TOKEN="$(gh auth token --hostname github.com --user batu-uchicago)" gh api -X POST repos/batu-uchicago/bayes-tutorials/pages -f 'source[branch]=main' -f 'source[path]=/docs' --jq .html_url
```

Expected: `https://batu-uchicago.github.io/bayes-tutorials/`.
Then run this loop with `run_in_background` and wait for its completion notification:

```bash
for i in $(seq 1 60); do
  s=$(GH_TOKEN="$(gh auth token --hostname github.com --user batu-uchicago)" gh api repos/batu-uchicago/bayes-tutorials/pages/builds/latest --jq .status 2>/dev/null)
  echo "$i $s"
  [ "$s" = built ] && exit 0
  [ "$s" = errored ] && exit 1
  sleep 10
done
exit 1
```

Expected: the loop ends on `built`.

- [ ] **Step 6: Verify repo visibility, attribution and that nothing private leaked**

```bash
T=/Users/batuhangundogdu/Desktop/Bayes/Tutorials
S=/private/tmp/claude-501/-Users-batuhangundogdu-Desktop-Bayes/716971ec-d3ab-4804-a0a6-838da86528c4/scratchpad
export GH_TOKEN="$(gh auth token --hostname github.com --user batu-uchicago)"
gh repo view batu-uchicago/bayes-tutorials --json visibility --jq .visibility
gh repo view batu-uchicago/bayes-tutorials-private --json visibility --jq .visibility
gh api repos/batu-uchicago/bayes-tutorials/commits/main --jq .author.login
gh api repos/batu-uchicago/bayes-tutorials-private/commits/main --jq .author.login
unset GH_TOKEN
git -C "$T" ls-files | grep -E '^private/|roster' || echo "no private files"
tail -q -n +2 "$T"/private/magic_words/*.csv | cut -d, -f2 | sed '/^$/d' > "$S/words.txt"
wc -l < "$S/words.txt"
git -C "$T" grep -n -w -F -f "$S/words.txt" origin/main -- . || echo "no words found"
```

Expected, in order: `PUBLIC`, `PRIVATE`, `batu-uchicago`, `batu-uchicago`, `no private files`, `2`, `no words found`.

- [ ] **Step 7: Verify the live site is byte-identical to the commit**

```bash
T=/Users/batuhangundogdu/Desktop/Bayes/Tutorials
base=https://batu-uchicago.github.io/bayes-tutorials
fail=0; n=0
for f in $(git -C "$T" ls-files docs | grep -v '/\.nojekyll$'); do
  rel=${f#docs/}; n=$((n+1))
  want=$(shasum -a 256 "$T/$f" | cut -d' ' -f1)
  got=$(curl -fsS "$base/$rel" | shasum -a 256 | cut -d' ' -f1)
  [ "$want" = "$got" ] || { echo "MISMATCH $rel"; fail=1; }
done
echo "checked $n files, fail=$fail"
curl -s -o /dev/null -w 't1: %{http_code}\n' "$base/t1/"
```

Expected: `checked <n> files, fail=0` with no `MISMATCH` lines, then `t1: 404`.
If a file mismatches right after the first build, wait two minutes for the CDN and rerun.

- [ ] **Step 8: Walk through Tutorial 0 on the live site at desktop width**

In the preview tab, run `window.location.href = "https://batu-uchicago.github.io/bayes-tutorials/"` with `preview_eval`.
Check with `preview_snapshot` that the landing page lists `Test run`, then click `a[href="t0/"]`.
Repeat Run B from Task 2, Step 7 as `test`, including the wrong first answer and the `7/2` entry.
Expected: the finish screen shows the `test` word from `private/magic_words/t0.csv`, and `preview_console_logs` with level `error` shows none.
Take a `preview_screenshot` of the finish screen for Batu.

- [ ] **Step 9: Walk through Tutorial 0 on the live site at phone width**

Run `preview_resize` with preset `mobile`, then `localStorage.clear(); location.reload()`.
Enter `test` and answer everything correctly the first time.
Expected: every step fits the screen, the footer button is visible on every step, and the word is the `test` word from `private/magic_words/t0.csv`.
Take a `preview_screenshot` of the die step and of the finish screen, then run `preview_resize` with preset `desktop`.

- [ ] **Step 10: Confirm the active `gh` account never changed**

```bash
gh auth status 2>&1 | grep -B1 "Active account: true" | head -1
git -C /Users/batuhangundogdu/Desktop/Bayes/Tutorials status --short
git -C /Users/batuhangundogdu/Desktop/Bayes/Tutorials/private status --short
```

Expected: `Logged in to github.com account batu-ludwig`, and both status commands print nothing.
