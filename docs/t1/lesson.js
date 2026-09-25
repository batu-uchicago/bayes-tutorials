/* Tutorial 1: the probability that Session 1 builds on (distributions, expectation, joint,
   marginal and conditional probability, independence, Bayes' rule) and a first taste of
   Bayesian inference, with examples from Donovan and Mickey, "Bayesian Statistics for
   Beginners", Chapters 1-8. Correct answers are NOT in this file; they live in
   private/answers/t1.json and reach the page only as salted hashes inside lock.js. */
(() => {
  const r = String.raw;
  const usd = (amount) => `<span class="nomath">$${amount}</span>`;
  const src = (text) => `<p class="source">${text}</p>`;

  window.LESSON = {
    id: "t1",
    kicker: "Tutorial 1 · before Session 1",
    title: "Thinking in probabilities",
    lede: "About 15 minutes. Roll a million-dollar die, count toes, unmask a Founding Father and predict a coin. Answer every question correctly, on the first try or a later one, to earn your magic word for Canvas.",
    finishLine: "In class: three puzzles we'll solve together.",
    submitLine: "Enter this word in the <b>Tutorial 1</b> quiz on Canvas before class on <b>Friday, Oct 2 at 1:30 PM</b>.",
    introVisual: { widget: "introScene" },
    finishVisual: { widget: "finishScene" },
    units: [
      { id: "chance", title: "Chance, counted" },
      { id: "traits", title: "Two traits at once" },
      { id: "turn", title: "Turning it around" },
      { id: "author", title: "Who wrote Federalist No. 54?" },
      { id: "many", title: "Many hypotheses, one prediction" },
    ],
    steps: [
      // ---------------------------------------------------------------- Unit 1
      {
        type: "read", unit: "chance", title: "The million-dollar die", button: "Next",
        visual: { widget: "dieBars", props: { need: 500 } },
        html: r`<p>A gamemaster offers you a bet on one roll of a die. Roll a four and you win ${usd("1,000,000")}; roll anything else and you lose ${usd("10,000")}.</p><p>How likely is a four? Roll the die and watch the share of each face settle down as the rolls pile up. That long-run share is what we mean by a probability.</p>${src("Donovan and Mickey, Chapter 1 · Lecture 1, slide 23")}`,
      },
      {
        type: "numeric", id: "t1_die_share", unit: "chance", title: "Estimate from data",
        prompt: r`Donovan and Mickey rolled a die 500 times and got 41 fours. What is their estimate of $P(\text{four})$?`,
        explain: r`$41/500 = 0.082$. That is well below the $1/6 \approx 0.17$ of a fair die, so after 500 rolls you might start to doubt this die.`,
      },
      {
        type: "read", unit: "chance", title: "A distribution lists every outcome",
        visual: { widget: "pmfToggle" },
        html: r`<p>A <b>probability distribution</b> gives the probability of every outcome, $p_X(x) = P(X = x)$. No probability is negative, and together they add up to 1: $\sum_x p_X(x) = 1$.</p><p>Switch between a fair die and a loaded die that favors fours.</p>${src("Donovan and Mickey, Chapter 1 · Lecture 1, slide 24")}`,
      },
      {
        type: "mcq", id: "t1_gamble", unit: "chance", title: "Is the gamble worth it?",
        prompt: r`The <b>expectation</b> of $X$ is the probability-weighted average of its values: $E[X] = \sum_x x\, p_X(x)$. With a fair die, what are your expected net winnings from the bet?`,
        options: [
          { id: "a", html: `About −${usd("10,000")}` },
          { id: "b", html: `About +${usd("394,000")}` },
          { id: "c", html: `About +${usd("158,000")}` },
          { id: "d", html: `About +${usd("1,000,000")}` },
        ],
        explain: r`You win $1{,}000{,}000$ with probability $\tfrac{1}{6}$ and lose $10{,}000$ with probability $\tfrac{5}{6}$: $E[X] = \tfrac{1}{6}(1{,}000{,}000) - \tfrac{5}{6}(10{,}000) \approx 158{,}333$. The +${usd("394,000")} option is the loaded die, where a four has probability 0.40.`,
      },
      // ---------------------------------------------------------------- Unit 2
      {
        type: "read", unit: "traits", title: "100 people, two traits",
        visual: { widget: "peopleGrid" },
        html: r`<p>Donovan and Mickey describe 100 people and two traits. <b>A</b>: left-eye dominant, 70 people. <b>B</b>: Morton's toe, a second toe longer than the big toe, 15 people. Five people have both.</p><p>The <b>joint probability</b> of both traits is $P(AB) = 5/100 = 0.05$. The book writes it $\Pr(A \cap B)$; in class we write $P(AB)$.</p>${src("Donovan and Mickey, Chapter 2 · Lecture 1, slide 25")}`,
      },
      {
        type: "numeric", id: "t1_missing_cell", unit: "traits", title: "Fill the missing cell",
        visual: { widget: "jointTable", props: { rows: [
          ["", r`$A$: left eye`, r`$\neg A$: right eye`, "Sum"],
          [r`$B$: Morton's toe`, "0.05", "?", "0.15"],
          [r`$\neg B$: no Morton's toe`, "", "", ""],
          ["Sum", "0.70", "", "1.00"],
        ] } },
        prompt: r`Every row and column of a joint table adds up to its marginal. Using $P(A) = 0.70$, $P(B) = 0.15$ and $P(AB) = 0.05$, find $P(\neg A\, B)$: right-eye dominant with Morton's toe.`,
        explain: r`The $B$ row adds up to $P(B)$: $P(AB) + P(\neg A\, B) = 0.15$, so $P(\neg A\, B) = 0.15 - 0.05 = 0.10$. Adding up a joint over one variable to get the other's probability is called <b>marginalization</b>.`,
      },
      {
        type: "read", unit: "traits", title: "Conditioning is zooming in", button: "Next",
        visual: { widget: "peopleGrid", props: { zoom: true } },
        html: r`<p>A <b>conditional probability</b> shrinks the world to the people with one trait, then asks about the other: $P(A \mid B) = \dfrac{P(AB)}{P(B)}$.</p><p>Zoom into each trait, and notice that $P(A \mid B)$ and $P(B \mid A)$ are not the same.</p>${src("Donovan and Mickey, Chapter 2 · Lecture 1, slide 30")}`,
      },
      {
        type: "mcq", id: "t1_independent", unit: "traits", title: "Independent or not?",
        prompt: r`Two events are <b>independent</b> exactly when $P(AB) = P(A)\,P(B)$: learning one tells you nothing about the other. Are left-eye dominance and Morton's toe independent?`,
        options: [
          { id: "a", html: r`No: $P(A)\,P(B) = 0.105$, but $P(AB) = 0.05$` },
          { id: "b", html: "Yes, because some people have both traits" },
          { id: "c", html: "Only if no one had both traits" },
        ],
        explain: r`$P(A)\,P(B) = 0.70 \times 0.15 = 0.105$, but $P(AB) = 0.05$, so the traits are dependent. If no one had both, they would be <i>mutually exclusive</i>, which is the opposite of independent: then $P(AB) = 0$ while $P(A)\,P(B) > 0$.`,
      },
      // ---------------------------------------------------------------- Unit 3
      {
        type: "read", unit: "turn", title: "Bayes' rule from one table", button: "Next",
        visual: { widget: "bayesDerivation", props: {
          lines: [r`P(AB) = P(A \mid B)\,P(B)`, r`P(AB) = P(B \mid A)\,P(A)`, r`P(A \mid B) = \dfrac{P(B \mid A)\,P(A)}{P(B)}`],
          check: r`Check it on the toe table: $\dfrac{(5/70) \times 0.70}{0.15} = 0.33$, the same $P(A \mid B)$ you found by zooming in.`,
        } },
        html: r`<p>The joint probability can be written two ways. Set them equal, divide by $P(B)$, and you have <b>Bayes' rule</b>.</p>${src("Donovan and Mickey, Chapter 3 · Lecture 1, slide 36")}`,
      },
      {
        type: "match", id: "t1_parts", unit: "turn", title: "Name the parts",
        prompt: r`In Bayesian inference, $A$ becomes a hypothesis $H$ and $B$ becomes the data: $P(H \mid \text{data}) = \dfrac{P(\text{data} \mid H)\,P(H)}{P(\text{data})}$. Match each name to its meaning.`,
        left: [
          { id: "prior", html: "Prior" },
          { id: "likelihood", html: "Likelihood" },
          { id: "evidence", html: "Evidence" },
          { id: "posterior", html: "Posterior" },
        ],
        right: [
          { id: "r_prior", html: r`$P(H)$: your belief before the data` },
          { id: "r_lik", html: r`$P(\text{data} \mid H)$: how well $H$ predicts the data` },
          { id: "r_evid", html: r`$P(\text{data})$: prior × likelihood, added up over all hypotheses` },
          { id: "r_post", html: r`$P(H \mid \text{data})$: your belief after the data` },
        ],
        explain: "The evidence is the same for every hypothesis, so it only rescales: the posterior is proportional to prior × likelihood.",
      },
      {
        type: "read", unit: "turn", title: "Marginalize with a tree",
        visual: { widget: "probTree" },
        html: r`<p>The evidence is found by <b>marginalizing</b>, also called the law of total probability:</p>$$P(B) = P(B \mid A)\,P(A) + P(B \mid \neg A)\,P(\neg A)$$<p>Follow every branch that ends in $B$, multiply along it, and add up the branches.</p>${src("Donovan and Mickey, Chapter 4 · Lecture 1, slide 34")}`,
      },
      {
        type: "numeric", id: "t1_total", unit: "turn", title: "Evidence by total probability",
        prompt: r`Among left-eye dominant people, 5 of 70 have Morton's toe; among right-eye dominant people, 10 of 30 do. With $P(A) = 0.70$, what is $P(B)$?`,
        explain: r`$P(B) = \tfrac{5}{70}(0.70) + \tfrac{10}{30}(0.30) = 0.05 + 0.10 = 0.15$: the 15 of 100 people with Morton's toe, recovered from the conditionals.`,
      },
      // ---------------------------------------------------------------- Unit 4
      {
        type: "read", unit: "author", title: "The Author Problem",
        visual: { widget: "uponHistogram" },
        html: r`<p>Federalist Paper No. 54 was written by Alexander Hamilton or James Madison. Its 2,008 words use "upon" twice: 0.996 times per 1,000 words.</p><p>The chart counts how often each man used "upon" in papers we know he wrote.</p>${src("Donovan and Mickey, Chapter 5")}`,
      },
      {
        type: "numeric", id: "t1_upon_lik", unit: "author", title: "Read a likelihood off the chart",
        visual: { widget: "uponHistogram" },
        prompt: r`Madison's <b>likelihood</b> is the share of his papers that use "upon" as rarely as paper 54: more than 0 and at most 1 time per 1,000 words. What is it?`,
        explain: r`7 of Madison's 50 papers fall in that bin: $7/50 = 0.14$. For Hamilton it is $1/48 \approx 0.021$. Likelihoods don't have to add up to 1: each one says how well an author explains the data.`,
      },
      {
        type: "read", unit: "author", title: "The Bayes box", button: "Next",
        visual: { widget: "bayesBox" },
        html: r`<p>Multiply each author's prior by his likelihood, then rescale the products so they add up to 1. The result is the <b>posterior</b>.</p><p>Move the prior. Hamilton signed 43 known papers and Madison 14, which suggests a prior near 0.75 for Hamilton.</p>${src("Donovan and Mickey, Chapter 5")}`,
      },
      {
        type: "numeric", id: "t1_post_hamilton", unit: "author", title: "Posterior for Hamilton",
        prompt: r`With a 50/50 prior and likelihoods 0.021 for Hamilton and 0.140 for Madison, what is $P(\text{Hamilton} \mid \text{data})$?`,
        explain: r`The products are $0.5 \times 0.021 = 0.0105$ and $0.5 \times 0.140 = 0.070$. Rescaled: $0.0105 / (0.0105 + 0.070) \approx 0.13$. Even with the 0.75 prior it only rises to about 0.31: the word "upon" points to Madison.`,
        explainWrong: r`The products are $0.5 \times 0.021 = 0.0105$ for Hamilton and $0.5 \times 0.140 = 0.070$ for Madison. Hamilton's posterior is his share of the total: $0.0105 / 0.0805 \approx 0.13$. (0.87 is Madison's.)`,
      },
      // ---------------------------------------------------------------- Unit 5
      {
        type: "read", unit: "many", title: "Which month was Mary born?", button: "Next",
        visual: { widget: "monthsPrior" },
        html: r`<p>Mary was born in one of 12 months: 12 hypotheses. The data is her name, and the likelihood for each month is the share of girls born that month who were named Mary.</p><p>Compare the flat prior with the book's prior, drag a few prior bars, then reveal her birthday.</p>${src("Donovan and Mickey, Chapter 6")}`,
      },
      {
        type: "mcq", id: "t1_top_month", unit: "many", title: "Flat prior, top month?",
        prompt: "With a flat prior, 1/12 for every month, which month has the highest posterior?",
        options: [
          { id: "a", html: "January" },
          { id: "b", html: "October" },
          { id: "c", html: "November" },
          { id: "d", html: "December" },
        ],
        explain: "With a flat prior the posterior is just the likelihood rescaled, so December leads at about 0.23. The book's prior, which favors February and May, lifts May from about 0.05 to 0.14. Priors matter.",
      },
      {
        type: "read", unit: "many", title: "Fair coin or weighted coin?", button: "Next",
        visual: { widget: "coinUpdate" },
        html: r`<p>A coin is either fair, with a $p = 0.5$ chance of heads, or weighted, with $p = 0.4$. You start at 50/50. Flip it three times and watch the posterior update after each flip: today's posterior is tomorrow's prior.</p>${src("Donovan and Mickey, Chapter 8 · Lecture 1, slide 41")}`,
      },
      {
        type: "numeric", id: "t1_next_flip", unit: "many", title: "Predict the next flip",
        prompt: r`The chance that the next flip lands heads averages $p$ over the posterior: $P(\text{heads next} \mid \text{data}) = E[p \mid \text{data}]$. With posteriors 0.566 for $p = 0.5$ and 0.434 for $p = 0.4$, what is it?`,
        explain: r`$E[p \mid \text{data}] = 0.5 \times 0.566 + 0.4 \times 0.434 \approx 0.457$. That is a <b>conditional expectation</b>, and averaging a prediction over the posterior is how a Bayesian predicts.`,
      },
    ],
  };
})();
