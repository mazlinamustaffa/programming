export const QUIZ_SECONDS = 15 * 60
export const PRACTICAL_SECONDS = 60 * 60
export const BLOOM_LEVELS = ['C1', 'C2', 'C3', 'C4']

/** Absolute deadlines keep timers accurate after reloads and suspended tabs. */
export function remainingSeconds(deadline, now = Date.now()) {
  if (!Number.isFinite(deadline) || !Number.isFinite(now)) return 0
  return Math.max(0, Math.ceil((deadline - now) / 1000))
}

export function formatTimer(seconds) {
  const safeSeconds = Math.max(0, Math.floor(Number(seconds) || 0))
  return `${String(Math.floor(safeSeconds / 60)).padStart(2, '0')}:${String(safeSeconds % 60).padStart(2, '0')}`
}

export function createAttempt(quiz, now = Date.now()) {
  const durationSeconds = quiz.durationSeconds || QUIZ_SECONDS
  return {
    quizId: quiz.id,
    startedAt: now,
    deadline: now + durationSeconds * 1000,
    answers: {},
    // Preserve the exact questions being assessed if a content update is deployed.
    questionsSnapshot: quiz.questions,
  }
}

/** Invalid or missing options count as unanswered, never as a correct answer. */
export function calculateQuizResult(questions, answers = {}, startedAt, endedAt, durationSeconds = QUIZ_SECONDS) {
  const bloomBreakdown = Object.fromEntries(BLOOM_LEVELS.map((level) => [level, { correct: 0, total: 0 }]))
  let correct = 0
  let incorrect = 0
  let unanswered = 0
  const review = questions.map((question) => {
    const selected = answers[question.id]
    const isAnswered = Number.isInteger(selected) && selected >= 0 && selected < question.options.length
    const isCorrect = isAnswered && selected === question.answer
    if (isCorrect) correct += 1
    else if (isAnswered) incorrect += 1
    else unanswered += 1
    if (bloomBreakdown[question.bloom]) {
      bloomBreakdown[question.bloom].total += 1
      if (isCorrect) bloomBreakdown[question.bloom].correct += 1
    }
    return { questionId: question.id, selected: isAnswered ? selected : null, correct: isCorrect }
  })
  const elapsed = Number.isFinite(startedAt) && Number.isFinite(endedAt)
    ? Math.max(0, Math.floor((endedAt - startedAt) / 1000))
    : 0
  return {
    score: correct,
    total: questions.length,
    percentage: questions.length ? Math.round(correct / questions.length * 100) : 0,
    correct,
    incorrect,
    unanswered,
    timeUsedSeconds: Math.min(durationSeconds, elapsed),
    bloomBreakdown,
    review,
  }
}

export function completeAttempt(attempt, questions, now = Date.now()) {
  if (Number.isFinite(attempt.submittedAt)) return attempt
  const submittedAt = Math.max(attempt.startedAt, Math.min(now, attempt.deadline))
  const durationSeconds = Math.max(0, (attempt.deadline - attempt.startedAt) / 1000)
  return {
    ...attempt,
    submittedAt,
    result: calculateQuizResult(questions, attempt.answers, attempt.startedAt, submittedAt, durationSeconds),
  }
}

/** App-level reconciliation also submits expired quizzes away from the quiz page. */
export function expireQuizAttempts(attempts, now = Date.now()) {
  let next = attempts
  for (const [topicId, attempt] of Object.entries(attempts || {})) {
    if (!attempt || Number.isFinite(attempt.submittedAt) || !Number.isFinite(attempt.deadline)) continue
    if (remainingSeconds(attempt.deadline, now) > 0 || !Array.isArray(attempt.questionsSnapshot)) continue
    if (next === attempts) next = { ...attempts }
    next[topicId] = completeAttempt(attempt, attempt.questionsSnapshot, now)
  }
  return next
}

export function practicalMarks(rubric, criteria = {}) {
  return rubric.reduce((sum, criterion) => {
    const mark = Number(criteria[criterion.id])
    return sum + (Number.isFinite(mark) ? Math.min(criterion.marks, Math.max(0, mark)) : 0)
  }, 0)
}
