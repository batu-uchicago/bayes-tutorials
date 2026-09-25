# Weekly tutorials for ADSP 32014

Short, Duolingo-style tutorials students finish before each class.
Each one ends with a personal magic word that the student enters in a Canvas quiz.
The TA grades the quiz by comparing each submitted word with a private list.

## What is where

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

## How the magic word works

- The student enters their CNetID on the first screen.
- Answers are checked against salted hashes, so the correct answers are not stored in plain text on the page.
- Each student's word is encrypted with a key derived from their CNetID and the correct answers to every question.
  It only unlocks after every question has been answered correctly, on the first try or on a retry.
- Wrong answers show the worked solution, and the question comes back at the end.
- A word is useless to anyone else: the TA checks it against the submitting student's own word.

This makes casual sharing pointless and stops "skip to the last slide" tricks.
It does not stop a student from getting answers from a friend or an AI tool, so grade tutorials as completion credit.

## Before each tutorial goes live

1. Export the roster from Canvas: Grades, then Export, then "Export Entire Gradebook".
   Save it as `private/roster.csv`. The script reads the "SIS Login ID" column, which holds CNetIDs.
2. Build the lock:
   ```bash
   node tools/build_lock.mjs t1 --roster private/roster.csv
   ```
   This writes `docs/t1/lock.js` and `private/magic_words/t1.csv`.
   Rerunning keeps every existing student's word and only adds new students.
3. Give `private/magic_words/t1.csv` to the TA. Do not post it anywhere.
4. Commit and push both repositories (see "Publishing on GitHub Pages").
5. In Canvas, create a quiz named "Tutorial 1" with one fill-in-the-blank or essay question: "Enter your magic word."
   Due Friday at 1:30 PM. Put the tutorial link in the quiz description.

The CNetID `demo` always works and unlocks the word `practice-only`, so you and the TA can try a tutorial without a roster entry.

## Grading (TA)

1. In the Canvas quiz, download the student answers report as a CSV.
2. Compare each student's answer with their row in `private/magic_words/t1.csv`, ignoring case and spaces.
3. Upload the scores through Grades, then Import, or enter them in SpeedGrader.

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

## Adding next week's tutorial

1. Copy an existing tutorial folder, such as `docs/t0/`, to `docs/t2/` and rewrite `lesson.js`. Keep question ids unique within the lesson.
2. Write the answer key in `private/answers/t2.json`: an option id for multiple choice, a number for numeric questions, a mapping for matching questions.
3. Run `node tools/build_lock.mjs t2 --roster private/roster.csv`. The script refuses to build if the key and the lesson disagree.
4. Add the tutorial to `docs/index.html`.

## Testing locally

Serve `docs/` with any static server, for example `python3 -m http.server 8765 --directory docs`, and open `http://localhost:8765/t0/`.
The page needs `http://localhost` or `https`, because browsers only allow the encryption features on secure addresses.
