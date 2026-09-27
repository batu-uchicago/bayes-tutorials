/* Tutorial 1: the probability that Session 1 builds on (distributions, expectation, joint,
   marginal and conditional probability, independence, Bayes' rule) and a first taste of
   Bayesian inference, with examples from Donovan and Mickey, "Bayesian Statistics for
   Beginners", Chapters 1-8, and Downey, "Think Bayes", Chapters 2-3.
   Every question is multiple choice. Each wrong option carries a `why`, the mistake that
   leads to it, which a student who picks it sees above the worked explanation.
   The answer key lives in private/answers/t1.json and reaches the page only as salted hashes
   inside lock.js, but this file does not hide the answers: the worked explanations state
   them, and the one option in each question without a `why` is the correct one. */
(() => {
  const r = String.raw;
  const usd = (amount) => `<span class="nomath">$${amount}</span>`;
  const src = (text) => `<p class="source">${text}</p>`;
  const frac = (n, d) => `<span class="sr-only">${n}/${d}</span><span class="frac" aria-hidden="true"><span>${n}</span><span>${d}</span></span>`;

  window.LESSON = {
    id: "t1",
    kicker: "Tutorial 1 · before Session 1",
    title: "Thinking in probabilities",
    lede: "About 20 minutes. Roll a million-dollar die, count toes, raid two bowls of cookies, unmask a Founding Father and guess a mystery die. Answer every question correctly, on the first try or a later one, to earn your magic word for Canvas.",
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
        type: "mcq", id: "t1_die_share", unit: "chance", title: "Estimate from data", columns: 2,
        prompt: r`Donovan and Mickey rolled a die 500 times and got 41 fours. What is their estimate of $P(\text{four})$?`,
        options: [
          { id: "a", html: frac(41, 500) },
          { id: "b", html: frac(41, 459), why: r`41/459 compares the fours with the 459 rolls that weren't fours. That ratio is the <i>odds</i> of a four; a probability divides by all 500 rolls.` },
          { id: "c", html: frac(1, 6), why: r`1/6 is what a fair die would give. The question asks what these 500 rolls say, and fours came up less often than that.` },
          { id: "d", html: frac(459, 500), why: r`459/500 is the share of rolls that were <i>not</i> a four.` },
        ],
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
          { id: "a", html: `About −${usd("10,000")}`, why: `−${usd("10,000")} is what you lose on a roll that isn't a four. The expectation also counts the big win, weighted by its 1/6 chance.` },
          { id: "c", html: `About +${usd("158,000")}` },
          { id: "b", html: `About +${usd("394,000")}`, why: `+${usd("394,000")} is the expectation for the loaded die, where a four has probability 0.40.` },
          { id: "d", html: `About +${usd("1,000,000")}`, why: `${usd("1,000,000")} is the prize itself. You win it only 1 time in 6 and lose ${usd("10,000")} the other 5 times.` },
        ],
        explain: r`You win $1{,}000{,}000$ with probability $1/6$ and lose $10{,}000$ with probability $5/6$: $E[X] = (1/6)(1{,}000{,}000) - (5/6)(10{,}000) \approx 158{,}333$.`,
      },
      // ---------------------------------------------------------------- Unit 2
      {
        type: "read", unit: "traits", title: "100 people, two traits",
        visual: { widget: "peopleGrid" },
        html: r`<p>Donovan and Mickey describe 100 people and two traits. <b>A</b>: left-eye dominant, 70 people. <b>B</b>: Morton's toe, a second toe longer than the big toe, 15 people. Five people have both.</p><p>The <b>joint probability</b> of both traits is $P(AB) = 5/100 = 0.05$. The book writes it $\Pr(A \cap B)$; in class we write $P(AB)$.</p>${src("Donovan and Mickey, Chapter 2 · Lecture 1, slide 25")}`,
      },
      {
        type: "mcq", id: "t1_missing_cell", unit: "traits", title: "Fill the missing cell", columns: 2,
        visual: { widget: "jointTable", props: { rows: [
          ["", r`$A$: left eye`, r`$\neg A$: right eye`, "Sum"],
          [r`$B$: Morton's toe`, "0.05", "?", "0.15"],
          [r`$\neg B$: no Morton's toe`, "", "", ""],
          ["Sum", "0.70", "", "1.00"],
        ] } },
        prompt: r`Every row and column of a joint table adds up to its marginal. Using $P(A) = 0.70$, $P(B) = 0.15$ and $P(AB) = 0.05$, find $P(\neg A\, B)$: right-eye dominant with Morton's toe.`,
        options: [
          { id: "b", html: "0.10" },
          { id: "a", html: "0.15", why: r`0.15 is $P(B)$, the whole row. The missing cell is the part of the row outside $A$, so take away $P(AB)$.` },
          { id: "c", html: "0.20", why: r`0.20 adds $P(AB)$ to $P(B)$, $0.05 + 0.15$. The row has to add up to 0.15, so subtract instead.` },
          { id: "d", html: "0.65", why: r`0.65 is left-eye dominant without Morton's toe, $0.70 - 0.05$: the other cell in the $A$ column.` },
        ],
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
          { id: "b", html: "Yes, because some people have both traits", why: r`Sharing people isn't the test. Independence means the overlap is exactly as big as chance predicts, $P(AB) = P(A)\,P(B)$.` },
          { id: "c", html: "Only if no one had both traits", why: "If no one had both, the traits would be mutually exclusive: knowing one would tell you the other is absent. Mutually exclusive events that can happen are always dependent." },
          { id: "a", html: r`No: $P(A)\,P(B) = 0.105$, but $P(AB) = 0.05$` },
        ],
        explain: r`$P(A)\,P(B) = 0.70 \times 0.15 = 0.105$, but $P(AB) = 0.05$, so the traits are dependent. If no one had both, they would be <i>mutually exclusive</i>, and mutually exclusive events that can happen are always dependent: $P(AB) = 0$ while $P(A)\,P(B) > 0$.`,
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
        type: "read", unit: "turn", title: "The cookie problem",
        visual: { widget: "cookieBowls" },
        html: r`<p>Two bowls of cookies. You pick a bowl at random and, without looking, draw a cookie. It's vanilla. Which bowl did it come from?</p><p>The bowls tell you $P(\text{vanilla} \mid \text{bowl})$, but you want $P(\text{bowl} \mid \text{vanilla})$. Bayes' rule turns it around. Its denominator, the evidence, comes from the <b>law of total probability</b>, also called marginalizing over the bowls:</p>$$P(V) = P(V \mid B_1)\,P(B_1) + P(V \mid B_2)\,P(B_2)$$${src("Downey, Think Bayes, Chapter 2 · Lecture 1, slide 34")}`,
      },
      {
        type: "mcq", id: "t1_cookie_evidence", unit: "turn", title: "How likely is vanilla?", columns: 2,
        visual: { widget: "probTree", props: {
          label: "Probability tree: pick Bowl 1 or Bowl 2, then draw vanilla or chocolate",
          first: [{ name: "Bowl 1", p: "1/2" }, { name: "Bowl 2", p: "1/2" }],
          second: [[{ name: "vanilla", p: "3/4", fill: "text" }, { name: "chocolate", p: "1/4", fill: "orange" }], [{ name: "vanilla", p: "1/2", fill: "text" }, { name: "chocolate", p: "1/2", fill: "orange" }]],
          caption: "Multiply along each highlighted path, then add the paths.",
        } },
        prompt: r`Before you know which bowl you picked, what is $P(\text{vanilla})$?`,
        options: [
          { id: "d", html: frac(3, 8), why: r`3/8 is the Bowl 1 path alone, $1/2 \times 3/4$. Add the Bowl 2 path, $1/2 \times 1/2$, too.` },
          { id: "a", html: frac(1, 2), why: r`1/2 is $P(\text{vanilla} \mid \text{Bowl 2})$, one branch on its own. Multiply along both highlighted paths and add them.` },
          { id: "b", html: frac(5, 8) },
          { id: "c", html: frac(3, 4), why: r`3/4 is $P(\text{vanilla} \mid \text{Bowl 1})$, one branch on its own. Multiply along both highlighted paths and add them.` },
        ],
        explain: r`$P(V) = 1/2 \times 3/4 + 1/2 \times 1/2 = 3/8 + 1/4 = 5/8$. Counting agrees: every cookie is equally likely to be drawn, and 50 of the 80 cookies are vanilla.`,
      },
      {
        type: "mcq", id: "t1_cookie_post", unit: "turn", title: "It's vanilla", columns: 2,
        visual: { widget: "cookieBowls" },
        prompt: r`You drew a vanilla cookie. What is $P(\text{Bowl 1} \mid \text{vanilla})$?`,
        options: [
          { id: "a", html: frac(3, 8), why: r`3/8 is the joint, $P(\text{Bowl 1 and vanilla}) = 1/2 \times 3/4$. Divide it by $P(\text{vanilla}) = 5/8$ to get the conditional.` },
          { id: "b", html: frac(1, 2), why: r`1/2 is the prior. Bowl 1 is richer in vanilla, so a vanilla cookie should raise its probability.` },
          { id: "c", html: frac(3, 5) },
          { id: "d", html: frac(3, 4), why: r`3/4 is $P(\text{vanilla} \mid \text{Bowl 1})$, the question turned around. Mixing up $P(A \mid B)$ and $P(B \mid A)$ is the classic mistake.` },
        ],
        explain: r`Bayes' rule: $P(\text{Bowl 1} \mid V) = \dfrac{P(V \mid \text{Bowl 1})\,P(\text{Bowl 1})}{P(V)} = \dfrac{3/8}{5/8} = \dfrac35$. Or count: the bowls hold 50 vanilla cookies and 30 of them are in Bowl 1.`,
      },
      {
        type: "mcq", id: "t1_trick_coin", unit: "turn", title: "The trick coin", columns: 2,
        visual: { widget: "trickCoins" },
        prompt: r`A box holds a fair coin and a trick coin with heads on both sides. You pick one at random, flip it, and it lands heads. What is the probability that you picked the trick coin?`,
        options: [
          { id: "a", html: frac(1, 2), why: r`1/2 is the prior. The trick coin always lands heads and the fair coin only half the time, so heads is evidence for the trick coin.` },
          { id: "b", html: frac(2, 3) },
          { id: "c", html: frac(3, 4), why: r`3/4 is the evidence, $P(\text{heads}) = 1/2 \times 1 + 1/2 \times 1/2$. The trick coin's share of it is the posterior.` },
          { id: "d", html: '<span class="whole">1</span>', why: "The fair coin lands heads too, half the time, so a single heads can't rule it out." },
        ],
        explain: r`Prior × likelihood: trick coin $1/2 \times 1 = 1/2$, fair coin $1/2 \times 1/2 = 1/4$. Rescaled: $\dfrac{1/2}{1/2 + 1/4} = \dfrac23$. Most people's first guess is 1/2.`,
      },
      // ---------------------------------------------------------------- Unit 4
      {
        type: "read", unit: "author", title: "The Author Problem",
        visual: { widget: "uponHistogram" },
        html: r`<p>Federalist Paper No. 54 was written by Alexander Hamilton or James Madison. Its 2,008 words use "upon" twice: 0.996 times per 1,000 words.</p><p>The chart counts how often each man used "upon" in papers we know he wrote.</p>${src("Donovan and Mickey, Chapter 5")}`,
      },
      {
        type: "mcq", id: "t1_upon_lik", unit: "author", title: "Read a likelihood off the chart", columns: 2,
        visual: { widget: "uponHistogram" },
        prompt: r`Madison's <b>likelihood</b> is the share of his papers in the same bin as paper 54, which use "upon" more than 0 and at most 1 time per 1,000 words. What is it?`,
        options: [
          { id: "a", html: frac(1, 48), why: "1/48 is Hamilton's likelihood: 1 of his 48 papers falls in that bin." },
          { id: "b", html: frac(8, 98), why: "8/98 pools both authors. A likelihood assumes one hypothesis, here Madison, so divide by his 50 papers." },
          { id: "c", html: frac(7, 50) },
          { id: "d", html: frac(7, 8), why: "7/8 is the share of that bin's 8 papers that are Madison's, the question turned around. The likelihood asks how Madison's own papers spread out." },
        ],
        explain: r`7 of Madison's 50 papers fall in that bin: $7/50 = 0.14$. For Hamilton it is $1/48 \approx 0.021$. Likelihoods don't have to add up to 1: each one says how well an author explains the data.`,
      },
      {
        type: "read", unit: "author", title: "The Bayes box", button: "Next",
        visual: { widget: "bayesBox" },
        html: r`<p>Multiply each author's prior by his likelihood, then rescale the products so they add up to 1. The result is the <b>posterior</b>.</p><p>Move the prior. Hamilton signed 43 known papers and Madison 14, which suggests a prior near 0.75 for Hamilton.</p>${src("Donovan and Mickey, Chapter 5")}`,
      },
      {
        type: "mcq", id: "t1_post_hamilton", unit: "author", title: "Posterior for Hamilton", columns: 2,
        prompt: r`With a 50/50 prior and likelihoods 0.021 for Hamilton and 0.140 for Madison, what is $P(\text{Hamilton} \mid \text{data})$?`,
        options: [
          { id: "a", html: "0.021", why: r`0.021 is Hamilton's likelihood, $P(\text{data} \mid \text{Hamilton})$. The posterior turns it around.` },
          { id: "b", html: "About 0.13" },
          { id: "c", html: "0.50", why: `0.50 is the prior. How rarely paper 54 uses "upon" is data, and it moves the posterior.` },
          { id: "d", html: "About 0.87", why: "About 0.87 is Madison's posterior. Hamilton gets the rest." },
        ],
        explain: r`The products are $0.5 \times 0.021 = 0.0105$ and $0.5 \times 0.140 = 0.070$. Rescaled: $0.0105 / (0.0105 + 0.070) \approx 0.13$. Even with the 0.75 prior it only rises to about 0.31: the word "upon" points to Madison.`,
      },
      // ---------------------------------------------------------------- Unit 5
      {
        type: "read", unit: "many", title: "The mystery die", button: "Next",
        visual: { widget: "diceBox" },
        html: r`<p>A box holds a 6-, an 8- and a 12-sided die: three hypotheses. One was picked at random, so each starts at 1/3. The data are the rolls. A die with $n$ sides shows any given number with probability $1/n$, or 0 if it has no such face.</p><p>Roll the mystery die a few times and watch the posterior, then reveal which die it was.</p>${src("Downey, Think Bayes, Chapters 2 and 3")}`,
      },
      {
        type: "mcq", id: "t1_dice", unit: "many", title: "One more roll", columns: 2,
        prompt: r`Downey rolls a 1, which leaves posteriors 4/9 for the 6-sided die, 3/9 for the 8-sided and 2/9 for the 12-sided. He rolls the same die again and gets a 7. What is the posterior for the 8-sided die now?`,
        options: [
          { id: "a", html: frac(1, 3), why: r`1/3 is the 8-sided die's posterior after the first roll, $3/9$. The 7 is new data, so update again.` },
          { id: "b", html: frac(1, 2), why: r`Two dice are left, but they don't split evenly: the 8-sided die already led, 3/9 to 2/9, and it rolls a 7 more often, $1/8$ against $1/12$.` },
          { id: "c", html: frac(3, 5), why: r`3/5 rules out the 6-sided die and rescales $3/9$ and $2/9$, but skips the new likelihoods, $1/8$ and $1/12$.` },
          { id: "d", html: frac(9, 13) },
        ],
        explain: r`Today's posterior is tomorrow's prior. Multiply by the likelihood of a 7: 6-sided $4/9 \times 0 = 0$, 8-sided $3/9 \times 1/8 = 1/24$, 12-sided $2/9 \times 1/12 = 1/54$. Rescaled: $\dfrac{1/24}{1/24 + 1/54} = \dfrac{9}{13} \approx 0.69$. A single roll above 6 rules out the 6-sided die for good.`,
      },
      {
        type: "read", unit: "many", title: "Fair coin or weighted coin?", button: "Next",
        visual: { widget: "coinUpdate" },
        html: r`<p>A coin is either fair, with a $p = 0.5$ chance of heads, or weighted, with $p = 0.4$. You start at 50/50. Flip it three times and watch the posterior update after each flip.</p>${src("Donovan and Mickey, Chapter 8 · Lecture 1, slide 41")}`,
      },
      {
        type: "mcq", id: "t1_next_flip", unit: "many", title: "Predict the next flip", columns: 2,
        prompt: r`The chance that the next flip lands heads averages $p$ over the posterior: $P(\text{heads next} \mid \text{data}) = E[p \mid \text{data}]$. With posteriors 0.566 for $p = 0.5$ and 0.434 for $p = 0.4$, what is it?`,
        options: [
          { id: "a", html: "0.450", why: "0.450 is halfway between 0.5 and 0.4, which would be right only if the posterior were 50/50. It leans toward the fair coin, so the average sits a little higher." },
          { id: "b", html: "About 0.457" },
          { id: "c", html: "About 0.566", why: r`About 0.566 is $P(p = 0.5 \mid \text{data})$, the probability of a hypothesis. The question asks for the probability of heads.` },
          { id: "d", html: "2/3", why: r`2/3 is the share of heads in the three flips. Under this model $p$ is 0.5 or 0.4, so the chance of heads has to lie between them.` },
        ],
        explain: r`$E[p \mid \text{data}] = 0.5 \times 0.566 + 0.4 \times 0.434 \approx 0.457$. That is a <b>conditional expectation</b>, and averaging a prediction over the posterior is how a Bayesian predicts.`,
      },
    ],
  };
})();
