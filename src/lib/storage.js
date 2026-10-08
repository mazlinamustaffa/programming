import { topics, parts } from '../data/curriculum'

export const STORAGE_KEY = 'programming-fundamentals-hub:v1'
export const activityId = (topicId, partId) => `${topicId}:${partId}`

export function initialState() {
  return {
    name: 'Learner',
    activities: {},
    code: {},
    plannedDays: [0, 1, 3],
  }
}

export function readState() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (!raw || typeof raw !== 'object') return initialState()
    const validIds = new Set(
      topics.flatMap((t) => parts.map((p) => activityId(t.id, p.id))),
    )
    const activities = Object.fromEntries(
      Object.entries(raw.activities || {}).filter(
        ([id, value]) =>
          validIds.has(id) &&
          value &&
          ['completed', 'in-progress'].includes(value.status) &&
          (value.score === undefined ||
            (Number.isFinite(value.score) &&
              value.score >= 0 &&
              value.score <= 100)),
      ),
    )
    const code = Object.fromEntries(
      Object.entries(raw.code || {}).filter(
        ([id, value]) => validIds.has(id) && typeof value === 'string',
      ),
    )
    return {
      name:
        typeof raw.name === 'string' && raw.name.trim()
          ? raw.name.slice(0, 30)
          : 'Aina',
      activities,
      code,
      plannedDays: Array.isArray(raw.plannedDays)
        ? raw.plannedDays.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6)
        : [0, 1, 3],
    }
  } catch {
    return initialState()
  }
}

export function getRows(state) {
  return topics.flatMap((topic) =>
    parts.map((part) => {
      const entry = state.activities[activityId(topic.id, part.id)] || {}
      return {
        id: activityId(topic.id, part.id),
        topic,
        part,
        status: entry.status || 'not-started',
        score: entry.score,
      }
    }),
  )
}

export function topicProgress(state, topicId) {
  return Math.round(
    (parts.filter(
      (p) =>
        state.activities[activityId(topicId, p.id)]?.status === 'completed',
    ).length /
      parts.length) *
      100,
  )
}

export function downloadFile(name, content, type = 'text/plain;charset=utf-8') {
  const link = document.createElement('a')
  const url = URL.createObjectURL(new Blob([content], { type }))
  link.href = url
  link.download = name
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function exportRows(rows) {
  const cell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`
  const headers = ['Topic', 'Activity', 'Status', 'Score (%)']
  const body = rows.map((row) => [
    row.topic.title,
    row.part.label,
    row.status,
    row.score ?? '',
  ])
  downloadFile(
    'programming-progress.csv',
    [headers, ...body].map((row) => row.map(cell).join(',')).join('\r\n'),
    'text/csv;charset=utf-8',
  )
}
