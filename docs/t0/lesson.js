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
    lede: "Four quick steps that check the tutorial site works. Answer both questions correctly, on the first try or a later one, to see your magic word.",
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
        visual: { widget: "dieBars", props: { need: 30 } },
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
