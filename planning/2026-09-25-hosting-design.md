# Hosting the weekly tutorials on `batu-uchicago`

Date: 2026-09-25.
Status: approved in chat, including the Tutorial 0 mechanics test.

## Goal

Put the tutorial site online under Batu's UChicago GitHub account and prove that every mechanism works on the public web.
The first thing published is a throwaway four-step Tutorial 0, not Tutorial 1.
Its content and look do not matter, because both will change drastically; it only tests publishing, web access and the magic-word unlock.
Change as little as possible: this is a hosting step, not a redesign.

## Decisions

### Tutorials are tracked, not graded

Tutorials stay optional and ungraded, as the Autumn 2026 syllabus already says.
The syllabus is not edited.
A magic word in the Canvas quiz only records that a student finished the tutorial.

### The engine stays as it is

Students enter their CNetID.
Each tutorial has its own word list in `private/magic_words/<t>.csv`.
Each word is encrypted with a key derived from the student's CNetID and every correct answer, exactly as `tools/build_lock.mjs` does today.
No engine, widget or build-script code changes are part of this work.

### Tutorial 0: the mechanics test

Tutorial 0 lives in `docs/t0/` and has exactly four steps, one of each kind the course will use:

1. A plain reading step with a Next button (engine type `read`).
2. A play-then-continue step: the existing die widget, whose Next button stays disabled until the student has rolled 30 times (engine type `read` with `visual: { widget: "die", props: { need: 30 } }`).
3. A multiple-choice question (engine type `mcq`).
4. A numeric-entry question (engine type `numeric`).

Its answer key is `private/answers/t0.json`, and its lock is built from the current one-row test roster, so the CNetIDs `demo` and `test` both work.
There is no Canvas quiz for Tutorial 0.

### Tutorial 1 stays unpublished

The prototype's Tutorial 1 moves from `docs/t1/` to `drafts/t1/`, outside the published folder, so it is kept in git but not served.
The landing page `docs/index.html` lists only Tutorial 0.
Tutorial 1 returns to `docs/` after its content is rewritten.

### Public site repository

The site lives in a public repository, `batu-uchicago/bayes-tutorials`.
GitHub Pages serves it from branch `main`, folder `/docs`.
Students open `https://batu-uchicago.github.io/bayes-tutorials/`, and Tutorial 0 is at `https://batu-uchicago.github.io/bayes-tutorials/t0/`.

The repository is public because the free GitHub plan only publishes Pages sites from public repositories.
Being public exposes nothing new: the answers and words never enter this repository, and the site is public either way.

`docs/.nojekyll` is added so Pages serves every file exactly as it is, without a Jekyll build.
The README's publishing section is rewritten to describe this setup.

### Private backup repository

`Tutorials/private/` holds the answer keys, the per-tutorial salts, the roster and the word lists.
Losing it mid-quarter would make issued words impossible to check and would reset every student's saved progress, because the salt is part of the progress key.

`Tutorials/private/` becomes its own git repository, pushed to a private repository, `batu-uchicago/bayes-tutorials-private`.
The public repository already ignores `private/` through `.gitignore`, so the two never mix.

`private/roster.csv` is never committed to either repository, because a full Canvas gradebook export contains names, student ID numbers and grades.
The word lists already record every CNetID, so the roster is only an input to the build and can be exported again at any time.

### Commit identity and credentials

Both repositories set a local `user.name` of "Batuhan Gundogdu" and a local `user.email` of `gundogdu@uchicago.edu`, which is the email on the `batu-uchicago` account.
The global Gmail identity is left alone.

The active `gh` account stays `batu-ludwig`.
Both repositories get a local credential helper that clears the system keychain helper and asks `gh` for the `batu-uchicago` token.
Repository creation and Pages setup run with `batu-uchicago`'s token passed per command.
The active account therefore never changes, and a keychain entry for another account cannot be used by mistake.

### Canvas (from Tutorial 1 on)

Batu creates one Canvas quiz per tutorial, worth 0 points or set as an ungraded survey.
It has one question, "Enter your magic word", and the tutorial link in its description.
It is due before the matching session.
The TA compares submitted words with `private/magic_words/<t>.csv` to see who finished.

### Roster (from Tutorial 1 on)

The roster comes from the Canvas gradebook export (Grades, Export, Export Entire Gradebook), saved as `private/roster.csv`.
`build_lock.mjs` reads CNetIDs from the "SIS Login ID" column.
Before the first real build, the one-row test roster and its `test` words are removed, and each tutorial's salt is kept.
Students who enroll later are added by rerunning the build, and existing students keep their words.

## Security model (unchanged)

The published page holds only salted answer hashes and encrypted words.
A student's word can only be decrypted with their CNetID and every correct answer.
A shared word is useless, because the TA checks it against the submitting student's own row.
Nothing stops a student from getting the answers from a friend or an AI tool, which is acceptable for ungraded tutorials.

## Verification

Before publishing:

- Tutorial 0 runs locally from `Tutorials/docs/` with no console errors, and all four steps behave as described above.

After publishing:

- `git ls-files` in the public repository lists nothing under `private/`.
- No word from any `private/magic_words/*.csv` appears anywhere in the public repository.
- `gh repo view` reports `bayes-tutorials` as public and `bayes-tutorials-private` as private.
- The latest commits in both repositories are attributed to `batu-uchicago` on GitHub.
- The live landing page and `/t0/` load over https with no console errors.
- Every file under `docs/` served from the live URL is byte-identical to the committed copy.
  Together with the self-test that `build_lock.mjs` runs on every build, which decrypts every entry of the lock, this proves the published lock unlocks every word.
- Walking through Tutorial 0 on the live site with the CNetID `test` shows that same word, at desktop and phone widths.

## Rollback

Disable Pages or make `bayes-tutorials` private.
Nothing sensitive is in it, so no clean-up is needed beyond that.

## Out of scope

- Tutorial 1 content, publication and its Canvas quiz.
- A single N x M word sheet and a grading or completion-report script.
- Any change to the engine, widgets, visual style or build script.
- Syllabus changes.
