import test from 'node:test'
import assert from 'node:assert/strict'
import {
  emptyHub,
  hubProgress,
  hubRows,
  readHub,
  recordChanges,
  weeklyActivity,
} from '../src/lib/hub.js'

test('fresh progress has no fabricated scores or completed activities', () => {
  const hub = emptyHub(),
    rows = hubRows(hub)
  assert.equal(rows.length, 25)
  assert.equal(hubProgress(hub), 0)
  assert.ok(
    rows.every((r) => r.status === 'not-started' && r.score === undefined),
  )
})
test('progress uses actual eligible actions and distinguishes practical evidence from manual marks', () => {
  const hub = emptyHub()
  hub.notes.arrays = { completedAt: 1 }
  hub.practice.sum = { topicId: 'arrays', completed: true }
  hub.reflections.arrays = { text: 'Trace each index' }
  hub.practicals.arrays = { status: 'evidence-ready' }
  hub.quizAttempts.arrays = { submittedAt: 10, result: { percentage: 60 } }
  assert.equal(hubProgress(hub, 'arrays'), 100)
  assert.equal(hubProgress(hub), 20)
  assert.equal(
    hubRows(hub).find((r) => r.id === 'arrays:practical').score,
    undefined,
  )
  hub.practicals.arrays = { status: 'assessed', marks: 72 }
  assert.equal(hubRows(hub).find((r) => r.id === 'arrays:practical').score, 72)
})
test('momentum does not count a reflection edit or lecturer marking as a new student completion', () => {
  const before = emptyHub()
  before.reflections.intro = { text: 'Initial reflection' }
  before.practicals.intro = { status: 'evidence-ready' }
  const after = {
    ...before,
    reflections: { intro: { text: 'Edited reflection' } },
    practicals: { intro: { status: 'assessed', marks: 80 } },
  }
  assert.equal(recordChanges(before, after).history.length, 0)
  const next = recordChanges(after, {
    ...after,
    notes: { intro: { completedAt: 1 } },
  })
  assert.equal(next.history.length, 1)
  assert.equal(next.history[0].type, 'notes')
})
test('weekly chart bins recorded timestamps without inserting example history', () => {
  const now = new Date(2026, 9, 8, 12),
    mon = new Date(2026, 9, 5, 10).getTime(),
    last = new Date(2026, 8, 28, 10).getTime()
  const history = [{ time: mon }, { time: mon + 1000 }, { time: last }]
  assert.deepEqual(
    weeklyActivity(history, false, now).map((d) => d.activities),
    [2, 0, 0, 0, 0, 0, 0],
  )
  assert.deepEqual(
    weeklyActivity(history, true, now).map((d) => d.activities),
    [1, 0, 0, 0, 0, 0, 0],
  )
})
test('legacy name and study plan are retained without changing the raw records or promoting old marks', () => {
  const earlier = JSON.stringify({
      name: 'Student',
      plannedDays: [1, 4],
      activities: { 'intro:quiz': { status: 'completed', score: 100 } },
      code: { 'intro:exercise': 'retained code' },
    }),
    values = new Map([['programming-fundamentals-hub:v1', earlier]])
  const old = globalThis.localStorage
  globalThis.localStorage = { getItem: (k) => values.get(k) || null }
  try {
    const hub = readHub()
    assert.equal(hub.name, 'Student')
    assert.deepEqual(hub.plannedDays, [1, 4])
    assert.equal(hubProgress(hub), 0)
    assert.equal(values.get('programming-fundamentals-hub:v1'), earlier)
  } finally {
    if (old === undefined) delete globalThis.localStorage
    else globalThis.localStorage = old
  }
})
