import { topics } from '../data/topics.js'

export const HUB_KEY = 'programming-fundamentals-hub:v2'
export const learningParts = [
  { id: 'notes', label: 'Notes' },
  { id: 'exercise', label: 'Practice' },
  { id: 'practical', label: 'Practical' },
  { id: 'quiz', label: 'Quiz' },
  { id: 'reflection', label: 'Reflection' },
]
export function emptyHub() {
  return {
    version: 2,
    name: 'Learner',
    notes: {},
    practice: {},
    reflections: {},
    quizAttempts: {},
    quizHistory: [],
    practicals: {},
    code: {},
    visitedTopics: {},
    history: [],
    plannedDays: [],
    preferences: { textSize: 'standard', reducedMotion: false },
  }
}
function retainEarlierPreferences() {
  const state = emptyHub()
  try {
    const earlier = JSON.parse(
      localStorage.getItem('programming-fundamentals-hub:v1'),
    )
    if (typeof earlier?.name === 'string' && earlier.name.trim())
      state.name = earlier.name.slice(0, 30)
    if (Array.isArray(earlier?.plannedDays))
      state.plannedDays = earlier.plannedDays.filter(
        (d) => Number.isInteger(d) && d >= 0 && d < 7,
      )
  } catch {
    /* The original value remains untouched. */
  }
  return state
}
export function readHub() {
  try {
    const raw = JSON.parse(localStorage.getItem(HUB_KEY))
    if (!raw || raw.version !== 2) return retainEarlierPreferences()
    const state = { ...emptyHub(), ...raw }
    for (const key of [
      'notes',
      'practice',
      'reflections',
      'quizAttempts',
      'practicals',
      'code',
      'visitedTopics',
    ])
      if (
        !state[key] ||
        typeof state[key] !== 'object' ||
        Array.isArray(state[key])
      )
        state[key] = {}
    state.history = Array.isArray(raw.history)
      ? raw.history.filter(
          (e) => e && Number.isFinite(e.time) && typeof e.type === 'string',
        )
      : []
    state.quizHistory = Array.isArray(raw.quizHistory) ? raw.quizHistory : []
    state.plannedDays = Array.isArray(raw.plannedDays)
      ? raw.plannedDays.filter((d) => Number.isInteger(d) && d >= 0 && d < 7)
      : []
    state.preferences = { ...emptyHub().preferences, ...raw.preferences }
    state.name =
      typeof raw.name === 'string' && raw.name.trim()
        ? raw.name.slice(0, 30)
        : 'Learner'
    return state
  } catch {
    return emptyHub()
  }
}
export function hubRows(hub) {
  return topics.flatMap((topic) =>
    learningParts.map((part) => {
      let status = 'not-started',
        score
      if (part.id === 'notes' && hub.notes[topic.id]) status = 'completed'
      if (
        part.id === 'exercise' &&
        Object.values(hub.practice).some(
          (p) => p.topicId === topic.id && p.completed,
        )
      )
        status = 'completed'
      const practical = hub.practicals[topic.id]
      if (part.id === 'practical' && practical) {
        status = ['evidence-ready', 'assessed'].includes(practical.status)
          ? 'completed'
          : 'in-progress'
        if (practical.status === 'assessed' && Number.isFinite(practical.marks))
          score = practical.marks
      }
      const quiz = hub.quizAttempts[topic.id]
      if (part.id === 'quiz' && quiz) {
        status = quiz.submittedAt ? 'completed' : 'in-progress'
        if (quiz.submittedAt && quiz.result) score = quiz.result.percentage
      }
      if (part.id === 'reflection' && hub.reflections[topic.id]?.text?.trim())
        status = 'completed'
      return { id: `${topic.id}:${part.id}`, topic, part, status, score }
    }),
  )
}
export function hubProgress(hub, topicId) {
  const rows = hubRows(hub).filter((r) => !topicId || r.topic.id === topicId)
  return Math.round(
    (rows.filter((r) => r.status === 'completed').length / rows.length) * 100,
  )
}
export function recordChanges(previous, next) {
  const events = []
  for (const topic of topics) {
    for (const [key, type] of [
      ['notes', 'notes'],
      ['reflections', 'reflection'],
    ]) {
      if (!previous[key][topic.id] && next[key][topic.id])
        events.push({ topicId: topic.id, type })
    }
    const before = previous.quizAttempts[topic.id],
      after = next.quizAttempts[topic.id]
    if (after?.submittedAt && after.submittedAt !== before?.submittedAt)
      events.push({ topicId: topic.id, type: 'quiz' })
    const a = previous.practicals[topic.id],
      b = next.practicals[topic.id]
    if (
      b &&
      !['evidence-ready', 'assessed'].includes(a?.status) &&
      ['evidence-ready', 'assessed'].includes(b.status)
    )
      events.push({ topicId: topic.id, type: 'practical' })
  }
  for (const [id, p] of Object.entries(next.practice))
    if (p.completed && !previous.practice[id]?.completed)
      events.push({ topicId: p.topicId, type: 'practice' })
  const archived = []
  for (const [id, a] of Object.entries(previous.quizAttempts))
    if (a.submittedAt && a.submittedAt !== next.quizAttempts[id]?.submittedAt)
      archived.push({ ...a, topicId: id })
  return {
    ...next,
    quizHistory: [...next.quizHistory, ...archived].slice(-250),
    history: [
      ...previous.history,
      ...events.map((e, i) => ({
        ...e,
        id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
        time: Date.now(),
      })),
    ].slice(-2000),
  }
}
export function weeklyActivity(
  history,
  previousWeek = false,
  now = new Date(),
) {
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  start.setDate(
    start.getDate() - ((start.getDay() + 6) % 7) - (previousWeek ? 7 : 0),
  )
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
    const date = new Date(start)
    date.setDate(date.getDate() + i)
    const end = new Date(date)
    end.setDate(end.getDate() + 1)
    return {
      day,
      activities: history.filter(
        (e) => e.time >= date.getTime() && e.time < end.getTime(),
      ).length,
    }
  })
}
