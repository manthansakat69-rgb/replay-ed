/**
 * Bayesian Knowledge Tracing (BKT) - Pure probabilistic update logic.
 *
 * Models student latent knowledge as a binary state (known vs unknown)
 * and updates the probability of mastery p(L_t) after observing each response
 * (correct or incorrect) using Bayes' Rule, taking into account:
 * - pSlip: Probability student knows the concept but slips (makes a careless error).
 * - pGuess: Probability student does not know the concept but guesses correctly.
 * - pLearn: Probability of transitioning from unmastered to mastered state after practice.
 */

export const DEFAULT_BKT_PARAMS = {
  pInit: 0.3,   // Initial probability student already knows the concept
  pLearn: 0.15, // Transition probability: learning happens during practice
  pSlip: 0.1,   // Chance of making an error despite knowing the concept
  pGuess: 0.2,  // Chance of correct answer despite not knowing (e.g. 1 in 4 or 5)
};

/**
 * Computes posterior probability of knowledge given observation (Bayes' Theorem).
 *
 * @param {number} pKnown - Prior probability of mastery (0.0 to 1.0)
 * @param {boolean} correct - Whether the attempt was correct
 * @param {object} params - BKT parameters { pLearn, pSlip, pGuess }
 * @returns {number} Posterior probability p(L_t | obs)
 */
export function computePosterior(pKnown, correct, params = DEFAULT_BKT_PARAMS) {
  const pK = Math.min(Math.max(pKnown, 0.0001), 0.9999);
  const pSlip = params.pSlip ?? DEFAULT_BKT_PARAMS.pSlip;
  const pGuess = params.pGuess ?? DEFAULT_BKT_PARAMS.pGuess;

  if (correct) {
    // P(L|Correct) = [P(L)*(1 - pSlip)] / [P(L)*(1 - pSlip) + (1 - P(L))*pGuess]
    const numerator = pK * (1 - pSlip);
    const denominator = numerator + (1 - pK) * pGuess;
    return numerator / denominator;
  } else {
    // P(L|Incorrect) = [P(L)*pSlip] / [P(L)*pSlip + (1 - P(L))*(1 - pGuess)]
    const numerator = pK * pSlip;
    const denominator = numerator + (1 - pK) * (1 - pGuess);
    return numerator / denominator;
  }
}

/**
 * Updates knowledge state with learning transition:
 * p(L_{t+1}) = Posterior + (1 - Posterior) * pLearn
 *
 * @param {number} pKnown - Current probability of mastery (0.0 to 1.0)
 * @param {boolean} correct - Whether the attempt was correct
 * @param {object} params - BKT parameters { pInit, pLearn, pSlip, pGuess }
 * @returns {number} Updated mastery probability pKnown in range [0, 1] rounded to 4 decimals
 */
export function update(pKnown = DEFAULT_BKT_PARAMS.pInit, correct, params = DEFAULT_BKT_PARAMS) {
  const posterior = computePosterior(pKnown, correct, params);
  const pLearn = params.pLearn ?? DEFAULT_BKT_PARAMS.pLearn;
  const nextP = posterior + (1 - posterior) * pLearn;

  // Clamp within bounds [0.001, 0.999] and round for numerical stability
  const clamped = Math.min(Math.max(nextP, 0.001), 0.999);
  return Number(clamped.toFixed(4));
}

/**
 * Convenience alias for update() adhering to STEP 2 naming specification.
 *
 * @param {number} currentMastery
 * @param {boolean} isCorrect
 * @param {object} [params]
 * @returns {number}
 */
export function updateMastery(currentMastery, isCorrect, params = DEFAULT_BKT_PARAMS) {
  return update(currentMastery, isCorrect, params);
}
