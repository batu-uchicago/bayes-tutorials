# Weekly tutorials for ADSP 32014

Short, Duolingo-style tutorials students finish before each class.
Each one ends with a personal magic word that the student enters in a Canvas quiz.
The TA checks each submitted word against a private list to see who finished.
Tutorials are optional and ungraded, so the quiz only records completion.

## What is where

| Path | Where it lives | Purpose |
|---|---|---|
| `docs/` | Public repo, served on GitHub Pages | The website: landing page, shared engine, one folder per tutorial |
| `docs/assets/engine.js` | Served | Step flow, answer checking, retry queue, saved progress, unlocking the word |
| `docs/assets/core.js` | Served, and loaded by the build and the tests | Reading typed answers, canonical answers, posterior and expectation helpers |
| `docs/assets/draw.js` | Served | Palette and drawing helpers shared by the widgets |
| `docs/assets/widgets/` | Served | One file per interactive picture; a tutorial page loads the ones it uses |
| `docs/assets/fonts/` | Served | Fraunces, self-hosted (SIL Open Font License in `OFL.txt`) |
| `docs/t1/` | Served | Tutorial 1; `docs/t0/` is an unlinked four-step test of the mechanics |
| `docs/<t>/lesson.js` | Served | A tutorial's content. The answer key is not in it, though worked explanations state the answers. |
| `docs/<t>/lock.js` | Served | Generated. Salted answer hashes and encrypted magic words. |
| `planning/` | Public repo, not served | Design notes and plans that contain no answers |
| `tools/build_lock.mjs` | Public repo, not served | Builds `lock.js` from the private answer key and the roster |
| `tools/test/` | Public repo, not served | Node tests: `node --test "tools/test/*.test.mjs"` |
| `private/` | **Its own private repo**, never in the public one | Answer keys, salts, word lists, answer-bearing plans, the widget gallery and the walkthrough |

## How the magic word works

- The student enters their CNetID on the first screen.
- Answers are checked against salted hashes, so the correct answers are not stored in plain text on the page.
- Each student's word is encrypted with a key derived from their CNetID and the correct answers to every question.
  It only unlocks after every question has been answered correctly, on the first try or on a retry.
- Wrong answers show the worked solution, and the question comes back at the end.
- A word is useless to anyone else: the TA checks it against the submitting student's own word.

This makes casual sharing pointless and stops "skip to the last slide" tricks.
It does not stop a student from getting answers from a friend or an AI tool, which is fine because tutorials only record completion.

## Before each tutorial goes live

1. Export the roster from Canvas: Grades, then Export, then "Export Entire Gradebook".
   Save it as `private/roster.csv`.
   The script reads the "SIS Login ID" column, which holds CNetIDs.
   Before the first build with the real roster, delete the `test` rows from `private/magic_words/*.csv` and leave `private/state/` alone, so the TA's lists hold only real students.
2. Build the lock:
   ```bash
   node tools/build_lock.mjs t1 --roster private/roster.csv
   ```
   This writes `docs/t1/lock.js` and `private/magic_words/t1.csv`.
   Rerunning keeps every existing student's word and only adds new students.
3. Give `private/magic_words/t1.csv` to the TA. Do not post it anywhere.
4. Commit and push both repositories (see "Publishing on GitHub Pages").
5. In Canvas, create a quiz named "Tutorial 1", worth 0 points or set as an ungraded survey, with one fill-in-the-blank or essay question: "Enter your magic word."
   Make it due before the session, Friday at 1:30 PM.
   Put the tutorial link in the quiz description.

The CNetID `demo` always works and unlocks the word `practice-only`, so you and the TA can try a tutorial without a roster entry.

## Tracking completion (TA)

1. In the Canvas quiz, download the student answers report as a CSV.
2. Compare each student's answer with their row in `private/magic_words/<t>.csv`, ignoring case and spaces.

A match means the student finished the tutorial.
Nothing goes into the gradebook.

## Publishing on GitHub Pages

The site is published from the public repository `batu-uchicago/bayes-tutorials`, branch `main`, folder `/docs`.
It appears at `https://batu-uchicago.github.io/bayes-tutorials/`.
Pushing to `main` republishes it within a few minutes.

`private/` is its own git repository, pushed to the private repository `batu-uchicago/bayes-tutorials-private`.
The public repository ignores it.
Every CSV except the word lists is ignored in both, because Canvas exports hold names, student ID numbers and grades, whatever they are named.
Commit and push `private/` after every build, so the salts and word lists are backed up.

Both repositories push as `batu-uchicago`, whichever account `gh` has active.
A repository-local credential helper, scoped to github.com, asks `/opt/homebrew/bin/gh auth token --user batu-uchicago` for the token.
Commits use the repository-local identity `Batuhan Gundogdu <gundogdu@uchicago.edu>`.

## Adding next week's tutorial

1. Copy an existing tutorial folder, such as `docs/t0/`, to `docs/t2/` and rewrite `lesson.js`.
   Keep question ids unique within the lesson.
2. Write the answer key in `private/answers/t2.json`: an option id for multiple choice, a number for numeric questions, a mapping for matching questions.
3. Run `node tools/build_lock.mjs t2 --roster private/roster.csv`.
   The script refuses to build if the key and the lesson disagree.
4. Add the tutorial to `docs/index.html`.

## Testing locally

Run the Node tests with `node --test "tools/test/*.test.mjs"`.
They check answer parsing, the posterior helpers, and that every page's scripts and widgets exist.

For the browser, copy the site and the private test pages into a folder and serve it over `http://localhost`, because browsers only allow the encryption features on secure addresses:

```bash
PREVIEW_SITE=/tmp/tutorial-preview private/tools/sync-preview.sh
python3 -m http.server 8765 --directory /tmp/tutorial-preview
```

Then open `http://localhost:8765/t1/` for the tutorial, `http://localhost:8765/__gallery__/` for every widget, and run `await runChecks()` in the gallery's console to check each widget's behaviour.

## Changing a published tutorial

- GitHub Pages caches files for up to 10 minutes, so push changes well before announcing them.
  During that window a browser can mix an old `lesson.js` with a new `lock.js`.
- Students' saved progress is keyed on the tutorial's salt, which survives rebuilds.
  Adding, removing or reordering steps or questions in a tutorial that students have started breaks their saved progress, so limit changes to a live tutorial to wording.

## Setting up on another computer

1. Clone `batu-uchicago/bayes-tutorials`, then clone `batu-uchicago/bayes-tutorials-private` into its `private/` folder.
2. In both repositories, set the commit identity and the credential helper:
   ```bash
   git config --local user.name "Batuhan Gundogdu"
   git config --local user.email "gundogdu@uchicago.edu"
   git config --local credential.https://github.com.helper ""
   git config --local --add credential.https://github.com.helper '!f() { test "$1" = get || exit 0; echo username=batu-uchicago; echo "password=$(gh auth token --hostname github.com --user batu-uchicago)"; }; f'
   ```
3. Log in once with `gh auth login` as `batu-uchicago`.
