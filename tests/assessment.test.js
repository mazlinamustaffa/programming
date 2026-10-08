import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateQuizResult, completeAttempt, createAttempt, expireQuizAttempts, formatTimer, practicalMarks, remainingSeconds } from '../src/lib/assessment.js'

const questions = [
  { id: 'q1', options: ['A', 'B', 'C', 'D'], answer: 1, bloom: 'C1' },
  { id: 'q2', options: ['A', 'B', 'C', 'D'], answer: 3, bloom: 'C2' },
  { id: 'q3', options: ['A', 'B', 'C', 'D'], answer: 0, bloom: 'C3' },
  { id: 'q4', options: ['A', 'B', 'C', 'D'], answer: 2, bloom: 'C4' },
]

test('scores correct, incorrect and unanswered responses independently with Bloom feedback', () => {
  const result = calculateQuizResult(questions, { q1: 1, q2: 0, q4: 2 }, 1000, 91000)
  assert.equal(result.score, 2)
  assert.equal(result.total, 4)
  assert.equal(result.percentage, 50)
  assert.equal(result.correct, 2)
  assert.equal(result.incorrect, 1)
  assert.equal(result.unanswered, 1)
  assert.equal(result.timeUsedSeconds, 90)
  assert.deepEqual(result.bloomBreakdown.C1, { correct: 1, total: 1 })
  assert.deepEqual(result.bloomBreakdown.C4, { correct: 1, total: 1 })
  assert.equal(result.review[2].selected, null)
})

test('zero correct answers score zero, including missing and invalid options', () => {
  const result = calculateQuizResult(questions, { q1: '1', q2: -1, q3: 4 }, 1000, 5000)
  assert.equal(result.score, 0)
  assert.equal(result.incorrect, 0)
  assert.equal(result.unanswered, 4)
  assert.equal(result.percentage, 0)
})

test('all correct answers score 100%, and time used cannot exceed the timer duration', () => {
  const result = calculateQuizResult(questions, { q1: 1, q2: 3, q3: 0, q4: 2 }, 1000, 2000000)
  assert.equal(result.score, 4)
  assert.equal(result.percentage, 100)
  assert.equal(result.timeUsedSeconds, 900)
})

test('absolute deadline restores remaining time after a reload or suspended browser', () => {
  const quiz = { id: 'topic-1-quiz', durationSeconds: 900, questions }
  const saved = JSON.parse(JSON.stringify(createAttempt(quiz, 10000)))
  assert.equal(remainingSeconds(saved.deadline, 10000), 900)
  assert.equal(remainingSeconds(saved.deadline, 310000), 600)
  assert.equal(remainingSeconds(saved.deadline, 909999), 1)
  assert.equal(remainingSeconds(saved.deadline, 910000), 0)
  assert.equal(remainingSeconds(saved.deadline, 1000000), 0)
  assert.equal(formatTimer(900), '15:00')
  assert.equal(formatTimer(3600), '60:00')
  assert.equal(formatTimer(0), '00:00')
})

test('an expired restored attempt auto-scores saved answers and uses its actual deadline', () => {
  const attempt = createAttempt({ id: 'quiz', durationSeconds: 900, questions }, 10000)
  attempt.answers = { q1: 1, q2: 3 }
  const restored = JSON.parse(JSON.stringify(attempt))
  const submitted = completeAttempt(restored, restored.questionsSnapshot, 2000000)
  assert.equal(submitted.submittedAt, 910000)
  assert.equal(submitted.result.score, 2)
  assert.equal(submitted.result.unanswered, 2)
  assert.equal(submitted.result.timeUsedSeconds, 900)
  assert.equal(completeAttempt(submitted, questions, 3000000), submitted)
})

test('early submission preserves exact answers and elapsed time', () => {
  const attempt = createAttempt({ id: 'quiz', questions }, 10000)
  attempt.answers = { q3: 0 }
  const submitted = completeAttempt(attempt, questions, 40000)
  assert.equal(submitted.result.timeUsedSeconds, 30)
  assert.equal(submitted.result.score, 1)
  assert.equal(submitted.result.unanswered, 3)
  assert.equal(attempt.submittedAt, undefined)
})

test('app-level expiry submits an overdue quiz while keeping another active quiz unchanged', () => {
  const expired = createAttempt({ id: 'quiz', questions }, 10000)
  expired.answers = { q1: 1 }
  const active = createAttempt({ id: 'quiz-2', questions }, 1000000)
  const attempts = { intro: expired, variables: active }
  const reconciled = expireQuizAttempts(attempts, 1000001)
  assert.equal(reconciled.intro.result.score, 1)
  assert.equal(reconciled.intro.result.unanswered, 3)
  assert.equal(reconciled.variables, active)
  assert.equal(attempts.intro.submittedAt, undefined)
  assert.equal(expireQuizAttempts(reconciled, 1000002), reconciled)
})

test('practical rubric totals are bounded by each criterion and never use MCQ scores', () => {
  const rubric = [{ id: 'algorithm', marks: 15 }, { id: 'syntax', marks: 20 }, { id: 'logic', marks: 25 }, { id: 'implementation', marks: 20 }, { id: 'testing', marks: 10 }, { id: 'output', marks: 10 }]
  assert.equal(practicalMarks(rubric, { algorithm: 15, syntax: 20, logic: 25, implementation: 20, testing: 10, output: 10 }), 100)
  assert.equal(practicalMarks(rubric, { algorithm: 99, syntax: -5, logic: 10 }), 25)
  assert.equal(practicalMarks(rubric, {}), 0)
})

test('empty question banks and invalid timer inputs remain safe', () => {
  const result = calculateQuizResult([], {}, 2000, 1000)
  assert.equal(result.percentage, 0)
  assert.equal(result.timeUsedSeconds, 0)
  assert.equal(remainingSeconds(undefined, 10), 0)
  assert.equal(remainingSeconds(1000, NaN), 0)
})
