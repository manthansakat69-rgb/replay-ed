import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load default concepts from /server/data/concepts.json
let defaultConcepts = [];
try {
  const conceptsRaw = fs.readFileSync(path.join(__dirname, 'data', 'concepts.json'), 'utf-8');
  defaultConcepts = JSON.parse(conceptsRaw);
} catch (e) {
  defaultConcepts = [];
}

/**
 * Maps probability of knowledge pKnown to question difficulty level (1-3).
 *
 * @param {number} pKnown
 * @returns {number} 1, 2, or 3
 */
export function getDifficultyForMastery(pKnown) {
  if (pKnown < 0.4) return 1;
  if (pKnown < 0.7) return 2;
  return 3;
}

/**
 * Traverses ancestors in the prerequisite DAG using BFS to avoid recursion cycles.
 *
 * @param {string} conceptId - Target concept ID
 * @param {Map<string, object>} conceptMap - Map of conceptId -> Concept document
 * @returns {Array<object>} Array of prerequisite concept objects
 */
export function getTransitivePrerequisites(conceptId, conceptMap) {
  const visited = new Set();
  const queue = [conceptId];
  const prereqs = [];

  while (queue.length > 0) {
    const currentId = queue.shift();
    const concept = conceptMap.get(currentId);
    if (!concept || !concept.prerequisites) continue;

    for (const prereqId of concept.prerequisites) {
      if (!visited.has(prereqId)) {
        visited.add(prereqId);
        const prereqConcept = conceptMap.get(prereqId);
        if (prereqConcept) {
          prereqs.push(prereqConcept);
          queue.push(prereqId);
        }
      }
    }
  }

  return prereqs;
}

/**
 * Chooses the next adaptive question based on mastery and prerequisite model.
 *
 * @param {Record<string, number>} mastery - Map of conceptId to pKnown
 * @param {string} [target] - Target conceptId
 * @param {object} [context] - Optional override context { questions, concepts, solvedIds }
 * @returns {Promise<{
 *   questionId: string,
 *   conceptId: string,
 *   type: "mcq" | "code",
 *   prompt: string,
 *   options?: string[],
 *   starterCode?: string,
 *   reason: string
 * }>}
 */
export async function chooseNext(mastery = {}, target = null, context = {}) {
  const concepts = context.concepts || defaultConcepts;
  const questions = context.questions || [];
  const solvedIds = context.solvedIds ? new Set(context.solvedIds) : new Set();

  if (!concepts || concepts.length === 0) {
    throw new Error('No concepts loaded for adaptive selection.');
  }

  const conceptMap = new Map(concepts.map((c) => [c.id, c]));

  // 1. Determine target concept
  let targetConcept = target ? conceptMap.get(target) : null;
  if (!targetConcept) {
    targetConcept =
      concepts.find((c) => {
        const prereqs = c.prerequisites || [];
        return prereqs.every((p) => (mastery[p] ?? 0.3) >= 0.6);
      }) || concepts[0];
  }

  let selectedConcept = targetConcept;
  let reason = '';

  // 2. Walk prerequisite graph of target concept
  const transitivePrereqs = getTransitivePrerequisites(targetConcept.id, conceptMap);
  const weakPrereqs = transitivePrereqs
    .map((p) => ({ concept: p, pKnown: mastery[p.id] ?? 0.3 }))
    .filter((item) => item.pKnown < 0.6);

  if (weakPrereqs.length > 0) {
    weakPrereqs.sort((a, b) => a.pKnown - b.pKnown);
    const weakest = weakPrereqs[0];
    selectedConcept = weakest.concept;
    const masteryPct = Math.round(weakest.pKnown * 100);
    reason = `You are weak in ${weakest.concept.name} (mastery: ${masteryPct}%), which ${targetConcept.name} builds on. Strengthening prerequisites first.`;
  } else {
    const pKnown = mastery[selectedConcept.id] ?? 0.3;
    const masteryPct = Math.round(pKnown * 100);
    const diff = getDifficultyForMastery(pKnown);
    if (diff === 1) {
      reason = `Building foundational understanding in ${selectedConcept.name} (current mastery: ${masteryPct}%).`;
    } else if (diff === 2) {
      reason = `Advancing to intermediate concepts in ${selectedConcept.name} (current mastery: ${masteryPct}%).`;
    } else {
      reason = `Testing mastery with advanced challenges in ${selectedConcept.name} (current mastery: ${masteryPct}%).`;
    }
  }

  // 3. Determine ideal difficulty for selected concept
  const selectedConceptMastery = mastery[selectedConcept.id] ?? 0.3;
  const targetDifficulty = getDifficultyForMastery(selectedConceptMastery);

  // 4. Filter questions for selected concept
  const conceptQuestions = questions.filter((q) => q.conceptId === selectedConcept.id);
  const unanswered = conceptQuestions.filter((q) => !solvedIds.has(q.id));

  let chosenQuestion = null;
  if (unanswered.length > 0) {
    const exactMatch = unanswered.filter((q) => q.difficulty === targetDifficulty);
    if (exactMatch.length > 0) {
      chosenQuestion = exactMatch[Math.floor(Math.random() * exactMatch.length)];
    } else {
      unanswered.sort(
        (a, b) => Math.abs(a.difficulty - targetDifficulty) - Math.abs(b.difficulty - targetDifficulty)
      );
      chosenQuestion = unanswered[0];
    }
  } else if (conceptQuestions.length > 0) {
    chosenQuestion = conceptQuestions[Math.floor(Math.random() * conceptQuestions.length)];
    reason += ' (Reviewing concept material)';
  } else {
    // If no questions specific to this concept, fallback to any available question
    chosenQuestion = questions[0] || {
      id: 'fallback_q1',
      conceptId: selectedConcept.id,
      type: 'mcq',
      prompt: `Review concept: ${selectedConcept.name}`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
    };
  }

  const payload = {
    questionId: chosenQuestion.id,
    conceptId: chosenQuestion.conceptId,
    type: chosenQuestion.type,
    prompt: chosenQuestion.prompt,
    reason,
  };

  if (chosenQuestion.type === 'mcq' && chosenQuestion.options) {
    payload.options = chosenQuestion.options;
  }

  if (chosenQuestion.type === 'code' && chosenQuestion.starterCode) {
    payload.starterCode = chosenQuestion.starterCode;
  }

  return payload;
}
