/**
 * Prioritize reported impact, not tone, message length, or the current time.
 * High: outages, blocked core tasks, data/security incidents, or time-sensitive issues.
 * Medium: other actionable problems. Low: questions, suggestions, and feedback.
 * These rules are a first pass; unusual or ambiguous wording still needs review.
 */
const criticalImpact = [
  /\b(?:server|service|system|site|website|app|application|production|database|platform)\s+(?:(?:is|has gone|went|remains|still|completely|currently)\s+)*(?:down|offline|unavailable|unreachable)\b/,
  /\b(?:database\s+)?connection\s+(?:is\s+)?lost\b/,
  /\b(?:experiencing|having|reporting)\s+(?:a\s+|an\s+)?(?:\w+\s+)?outage\b/,
  /\b(?:can't|cannot|unable to)\s+(?:log\s*in|sign\s*in|access|pay|check\s*out|complete\s+(?:a\s+|the\s+|my\s+)?(?:payment|purchase|order))\b/,
  /\b(?:locked out|data loss|data breach|security breach|account (?:was |is |has been )?(?:hacked|compromised))\b/,
  /\b(?:lost|losing)\s+(?:(?:all|our|my|customer)\s+)*(?:data|records|files)\b/,
]

const actionableProblem = [
  /\b(?:error|bug|broken|failing|failed|failure|crash(?:ed|es|ing)?|slow|timeout|timed out|stuck)\b/,
  /\b(?:not working|doesn't work|won't (?:load|open|start)|isn't (?:loading|working)|keeps loading)\b/,
  /\b(?:charged (?:twice|incorrectly)|duplicate charge|overcharged|refund|missing (?:payment|order|data))\b/,
]

const timeSensitive = /\b(?:urgent|urgently|asap|immediately|deadline|today|within (?:an? |\d+ )?(?:hour|hours|minute|minutes))\b/
const widespreadImpact = /\b(?:all|every|multiple|many)\s+(?:our\s+)?(?:customers?|users?|accounts?|employees?)\b|\b(?:everyone|company-wide|business-critical|production)\b/

// Avoid treating a request about a possible incident as an active incident.
const hypothetical = /^\s*(?:what (?:if|happens)|in case|if|how (?:can|do|should|would) (?:i|we|you) (?:avoid|prevent|prepare)|could you add|i would like|feature request)\b/
const resolved = /\b(?:resolved|fixed|restored|back (?:up|online)|no longer|working (?:again|now))\b/
const negatedProblem = /\b(?:no|without)\s+(?:\w+\s+)?(?:errors?|bugs?|issues?|problems?|data loss|data breach|security breach)\b/

export function calculateUrgency(message) {
  const text = message.toLowerCase().replace(/[’‘]/g, "'")
  // Evaluate separate clauses so feedback cannot hide a second, ongoing problem.
  // Punctuation itself contributes no urgency.
  const clauses = text.split(/[.!?;\n]+|\b(?:but|however)\b/)
  let hasProblem = false

  for (const clause of clauses) {
    if (hypothetical.test(clause)) continue
    if (resolved.test(clause) && !/\b(?:still|can't|cannot|unable|not|isn't|hasn't)\b/.test(clause)) continue
    const report = clause.replace(new RegExp(negatedProblem.source, 'g'), '')

    if (criticalImpact.some(pattern => pattern.test(report))) return 'High'
    if (actionableProblem.some(pattern => pattern.test(report))) {
      if (timeSensitive.test(text) || widespreadImpact.test(text)) return 'High'
      hasProblem = true
    }
  }

  return hasProblem ? 'Medium' : 'Low'
}
