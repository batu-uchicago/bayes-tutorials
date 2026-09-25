/* Tutorial 1: Session 1 content (probability, distributions, expectation,
   joint/marginal/conditional probability, independence, Bayes' rule).
   Correct answers are NOT in this file; they live in private/answers/t1.json
   and reach the page only as salted hashes inside lock.js. */
(() => {
  const r = String.raw;
  const T = window.WIDGETS.TERM_TEXT;
  const C = window.WIDGETS.C;
  const term = (k, label) => `<b style="color:${T[k]}">${label}</b>`;

  const movies = {
    groups: [
      { id: "both", n: 2, color: C.violet, label: "Watched both" },
      { id: "avatar", n: 3, color: C.sky, label: "Avatar only" },
      { id: "barbie", n: 5, color: C.pink, label: "Barbie only" },
      { id: "neither", n: 2, color: C.mist, label: "Neither" },
    ],
    cols: 12,
    alt: "Twelve friends: 2 watched both movies, 3 only Avatar, 5 only Barbie, 2 neither",
    table: {
      rows: [
        ["", "Watched Barbie", "Didn't watch Barbie", "Total"],
        ["Watched Avatar", "2", "3", "5"],
        ["Didn't watch Avatar", "5", "2", "7"],
        ["Total", "7", "5", "12"],
      ],
    },
  };
  const net = {
    a: "Rain", b: "Wet ground",
    cptA: [["$R$", "$P(R)$"], ["rain", "0.2"], ["no rain", "0.8"]],
    cptB: [["$R$", r`$P(\text{wet} \mid R)$`], ["rain", "0.9"], ["no rain", "0.1"]],
  };

  window.LESSON = {
    id: "t1",
    kicker: "Tutorial 1, due before Session 1 on Friday, Oct 2",
    title: "Thinking in probabilities",
    lede: "About 15 minutes. Roll dice, count movie fans, catch spam and play Monty Hall. Answer every question correctly, on the first try or the second, to earn your magic word for Canvas.",
    finishLine: "You just used every idea from Session 1. See you on Friday.",
    submitLine: "Enter this word in the <b>Tutorial 1</b> quiz on Canvas before class on <b>Friday, Oct 2 at 1:30 PM</b>.",
    introVisual: { widget: "bayesHero" },
    units: [
      { id: "chance", title: "Chance, counted" },
      { id: "movies", title: "Movie night" },
      { id: "bayes", title: "Bayes' rule" },
      { id: "spam", title: "A spam filter" },
      { id: "monty", title: "Monty Hall" },
      { id: "net", title: "Sneak peek: Bayes nets" },
    ],
    steps: [
      // ---------------------------------------------------------------- chance
      {
        type: "read", unit: "chance", title: "How likely is a 4?",
        visual: { widget: "die", props: { need: 100 } },
        html: "<p>Jacob Bernoulli's answer, three centuries ago: roll many times and count. The share of 4s wobbles at first, then settles down as the rolls pile up. That long-run share is what we mean by the probability of rolling a 4.</p>",
      },
      {
        type: "mcq", id: "q_rolls", unit: "chance", title: "Quick check",
        prompt: "You roll a fair die 6,000 times. About how many 4s do you expect?",
        options: [
          { id: "a", html: "600" }, { id: "b", html: "1,000" }, { id: "c", html: "1,500" }, { id: "d", html: "Exactly 4" },
        ],
        explain: r`Each face has probability $\frac{1}{6}$, and $6000 \times \frac{1}{6} = 1000$. You won't get exactly 1,000, but you'll land close, just as your chart settled near $\frac{1}{6}$.`,
      },
      {
        type: "read", unit: "chance", title: "A distribution lists every outcome and its probability",
        visual: { widget: "pmf", props: { caption: r`A fair die: each face has probability $\frac{1}{6}$.` } },
        html: r`<p>The probabilities of all outcomes add up to 1: $\sum_x p_X(x) = 1$.</p><p>The <b>expectation</b> is the probability-weighted average of the outcomes:</p>$$E[X] = \sum_x x \, p_X(x)$$`,
      },
      {
        type: "numeric", id: "q_expect", unit: "chance", title: "Expected value of a die roll",
        prompt: "What is $E[X]$ for one roll of a fair die?",
        hint: "A decimal rounded to two places, like 2.75.",
        explain: r`$E[X] = (1+2+3+4+5+6) \cdot \frac{1}{6} = \frac{21}{6} = 3.5$. You can never roll a 3.5: an expectation is a long-run average, not a prediction for one roll.`,
      },
      // ---------------------------------------------------------------- movies
      {
        type: "read", unit: "movies", title: "Twelve friends, two movies",
        visual: { widget: "peopleArray", props: movies },
        html: "<p>Each friend is one equally likely outcome, so every probability here is a count divided by 12. Write $A$ for “watched Avatar” and $B$ for “watched Barbie”.</p>",
      },
      {
        type: "numeric", id: "q_joint", unit: "movies", title: "Joint probability",
        visual: { widget: "peopleArray", props: movies },
        prompt: "What is $P(A, B)$, the probability that a randomly chosen friend watched both movies?",
        explain: r`Two of the twelve watched both: $P(A, B) = \frac{2}{12} \approx 0.17$. A joint probability asks for both things at once.`,
      },
      {
        type: "numeric", id: "q_marginal", unit: "movies", title: "Marginal probability",
        visual: { widget: "peopleArray", props: movies },
        prompt: "What is $P(B)$, the probability that a friend watched Barbie?",
        explain: r`Add up everyone who watched Barbie, whatever they did about Avatar: $P(B) = P(A, B) + P(\neg A, B) = \frac{2}{12} + \frac{5}{12} = \frac{7}{12} \approx 0.58$. That's <b>marginalization</b>: summing the joint over the variable you don't care about, $p_X(x) = \sum_y p_{XY}(x, y)$.`,
      },
      {
        type: "numeric", id: "q_conditional", unit: "movies", title: "Conditional probability",
        visual: { widget: "peopleArray", props: { ...movies, table: null, highlight: ["both", "barbie"], caption: "Only the Barbie watchers are highlighted." } },
        prompt: r`Among the friends who watched Barbie, what fraction also watched Avatar? That's $P(A \mid B)$.`,
        explain: r`Conditioning shrinks the world to the 7 Barbie watchers, and 2 of them watched Avatar. In symbols: $P(A \mid B) = \frac{P(A, B)}{P(B)} = \frac{2/12}{7/12} = \frac{2}{7} \approx 0.29$.`,
      },
      {
        type: "mcq", id: "q_indep", unit: "movies", title: "Independent or not?",
        prompt: r`Two events are independent when $P(A, B) = P(A)\,P(B)$. Here $P(A) = \frac{5}{12}$ and $P(B) = \frac{7}{12}$. Are watching Avatar and watching Barbie independent?`,
        options: [
          { id: "a", html: "Yes, because some friends watched both" },
          { id: "b", html: r`No, because $P(A)\,P(B) \approx 0.24$ but $P(A, B) \approx 0.17$` },
          { id: "c", html: "No, because the two movies are different genres" },
          { id: "d", html: r`Yes, because $P(A) + P(B) = 1$` },
        ],
        explain: r`$P(A)\,P(B) = \frac{5}{12} \cdot \frac{7}{12} = \frac{35}{144} \approx 0.24$, which is not $P(A, B) = \frac{2}{12} \approx 0.17$. So they're dependent: learning that someone watched Barbie changes the chance they watched Avatar, from $\frac{5}{12} \approx 0.42$ to $\frac{2}{7} \approx 0.29$.`,
      },
      // ---------------------------------------------------------------- Bayes' rule
      {
        type: "read", unit: "bayes", title: "Turning probabilities around",
        visual: { widget: "bayesHero" },
        html: r`<p>Bayes' rule updates your belief in a hypothesis $H$ after you see evidence $E$. It comes from writing the joint probability two ways:</p>$$P(H, E) = P(E \mid H)\,P(H) = P(H \mid E)\,P(E)$$<p>Divide by $P(E)$ and you get the rule above. You start from a ${term("prior", "prior")}, weigh the evidence with a ${term("likelihood", "likelihood")}, normalize by the ${term("evidence", "evidence")} and end with a ${term("posterior", "posterior")}.</p>`,
      },
      {
        type: "match", id: "q_vocab", unit: "bayes", title: "Name the parts",
        prompt: "Tap a term, then tap what it means.",
        left: [
          { id: "prior", html: term("prior", "Prior") },
          { id: "likelihood", html: term("likelihood", "Likelihood") },
          { id: "evidence", html: term("evidence", "Evidence") },
          { id: "posterior", html: term("posterior", "Posterior") },
        ],
        right: [
          { id: "r_before", html: "What you believe about $H$ before seeing the evidence" },
          { id: "r_ifH", html: "How probable the evidence is if $H$ were true" },
          { id: "r_overall", html: "How probable the evidence is overall, across all hypotheses" },
          { id: "r_after", html: "What you believe about $H$ after seeing the evidence" },
        ],
        explain: r`${term("prior", "Prior")} $P(H)$, ${term("likelihood", "likelihood")} $P(E \mid H)$, ${term("evidence", "evidence")} $P(E)$, ${term("posterior", "posterior")} $P(H \mid E)$. You'll use these four words all quarter.`,
      },
      // ---------------------------------------------------------------- spam
      {
        type: "read", unit: "spam", title: "Is this email spam?",
        visual: { widget: "emails", props: { n: 100, p: 0.2 } },
        html: "<p>Of all the email you get, 20% is spam. The word FREE appears in 60% of spam and in 5% of normal email. An email arrives with FREE in the subject line. Here are 100 typical emails.</p>",
      },
      {
        type: "numeric", id: "q_evidence", unit: "spam", title: "The evidence",
        visual: { widget: "emails", props: { n: 100, p: 0.2 } },
        prompt: r`What is $P(\text{FREE})$, the probability that an email says FREE?`,
        explain: r`Count the bright envelopes: 12 spam plus 4 normal, so 16 out of 100. In symbols, marginalize over spam or not: $P(\text{FREE}) = 0.6 \times 0.2 + 0.05 \times 0.8 = 0.12 + 0.04 = 0.16$.`,
      },
      {
        type: "numeric", id: "q_posterior", unit: "spam", title: "The posterior",
        visual: { widget: "emails", props: { n: 100, p: 0.2 } },
        prompt: r`What is $P(\text{spam} \mid \text{FREE})$?`,
        explain: r`Of the 16 emails that say FREE, 12 are spam: $\frac{12}{16} = 0.75$. With Bayes' rule: $\frac{0.6 \times 0.2}{0.16} = 0.75$.`,
      },
      {
        type: "read", unit: "spam", title: "Now change the prior",
        visual: { widget: "emails", props: { n: 1000, p: 0.2, interactive: true } },
        html: "<p>What if spam were rare, or everywhere? The likelihoods stay fixed: FREE appears in 60% of spam and 5% of normal email. Watch what happens to the posterior.</p>",
      },
      {
        type: "mcq", id: "q_baserate", unit: "spam", title: "Base rates matter",
        prompt: "Suppose only 1% of email were spam. An email says FREE. About how likely is it to be spam?",
        options: [{ id: "a", html: "0.75" }, { id: "b", html: "0.60" }, { id: "c", html: "0.11" }, { id: "d", html: "0.01" }],
        explain: r`$\frac{0.6 \times 0.01}{0.6 \times 0.01 + 0.05 \times 0.99} = \frac{0.006}{0.0555} \approx 0.11$. Same evidence, much weaker conclusion: when the prior is small, most FREE emails come from the huge pile of normal email. Keep this in mind for class.`,
      },
      // ---------------------------------------------------------------- Monty Hall
      {
        type: "read", unit: "monty", title: "Let's make a deal",
        visual: { widget: "monty", props: { need: 3 } },
        html: "<p>Play a few rounds, staying sometimes and switching sometimes. After three rounds you can simulate a thousand more.</p>",
      },
      {
        type: "mcq", id: "q_monty_play", unit: "monty", title: "What did you find?",
        prompt: "Which strategy wins the car more often?",
        options: [
          { id: "a", html: r`Staying: it wins about $\frac{2}{3}$ of the time` },
          { id: "b", html: r`Switching: it wins about $\frac{2}{3}$ of the time` },
          { id: "c", html: r`Neither: both win about $\frac{1}{2}$ of the time` },
          { id: "d", html: r`Neither: both win about $\frac{1}{3}$ of the time` },
        ],
        explain: "Switching wins about two times out of three. Most people's intuition says 50/50, including many mathematicians when the puzzle went viral in 1990. Next, Bayes' rule shows why.",
      },
      {
        type: "read", unit: "monty", title: "Monty Hall, the Bayesian way",
        visual: { widget: "montyStatic" },
        html: r`<p>You picked door 1 and the host opened door 3. Let $C_i$ mean “the car is behind door $i$” and $O_3$ mean “the host opens door 3”.</p><p>${term("prior", "Prior")}: before anything happens, $P(C_1) = P(C_2) = P(C_3) = \frac{1}{3}$.</p><p>The key fact: the host never opens your door and never reveals the car. That's what makes his choice informative.</p>`,
      },
      {
        type: "mcq", id: "q_monty_lik", unit: "monty", title: "The likelihood",
        visual: { widget: "montyStatic" },
        prompt: r`If the car is behind door 2, what is the probability that the host opens door 3? That's $P(O_3 \mid C_2)$.`,
        options: [{ id: "a", html: "0" }, { id: "b", html: r`$\frac{1}{3}$` }, { id: "c", html: r`$\frac{1}{2}$` }, { id: "d", html: "1" }],
        explain: r`The host can't open door 1 (your pick) or door 2 (the car), so he must open door 3: $P(O_3 \mid C_2) = 1$. If the car were behind door 1, he'd pick door 2 or 3 at random: $P(O_3 \mid C_1) = \frac{1}{2}$. And $P(O_3 \mid C_3) = 0$.`,
      },
      {
        type: "numeric", id: "q_monty_post", unit: "monty", title: "The posterior",
        prompt: r`The ${term("evidence", "evidence")} is $P(O_3) = \frac{1}{3} \cdot \frac{1}{2} + \frac{1}{3} \cdot 1 + \frac{1}{3} \cdot 0 = \frac{1}{2}$. What is $P(C_2 \mid O_3)$, the probability that the car is behind door 2?`,
        explain: r`$P(C_2 \mid O_3) = \frac{P(O_3 \mid C_2)\,P(C_2)}{P(O_3)} = \frac{1 \cdot \frac{1}{3}}{\frac{1}{2}} = \frac{2}{3} \approx 0.67$. The same calculation gives $P(C_1 \mid O_3) = \frac{1}{3}$. Switch.`,
      },
      // ---------------------------------------------------------------- Bayes nets
      {
        type: "read", unit: "net", title: "An arrow means “directly influences”",
        visual: { widget: "bayesNet", props: net },
        html: "<p>Next week we draw probability models as graphs. Here, rain influences whether the ground is wet. Each node stores its probabilities given its parents: rain has no parents, so it only has a prior. Wet ground has one probability for each value of rain.</p>",
      },
      {
        type: "numeric", id: "q_net_wet", unit: "net", title: "Is the ground wet?",
        visual: { widget: "bayesNet", props: net },
        prompt: r`What is $P(\text{wet})$?`,
        explain: r`Marginalize over rain: $P(\text{wet}) = 0.9 \times 0.2 + 0.1 \times 0.8 = 0.18 + 0.08 = 0.26$.`,
      },
      {
        type: "numeric", id: "q_net_rain", unit: "net", title: "Reasoning backwards",
        visual: { widget: "bayesNet", props: net },
        prompt: r`You see wet ground. What is $P(\text{rain} \mid \text{wet})$?`,
        explain: r`Bayes' rule again: $\frac{0.9 \times 0.2}{0.26} = \frac{0.18}{0.26} \approx 0.69$. The arrow points from rain to wet ground, but evidence flows both ways. That's next week's big idea.`,
      },
    ],
  };
})();
