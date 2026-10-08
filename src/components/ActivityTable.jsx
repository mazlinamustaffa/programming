import { useMemo, useState } from 'react'
import {
  Search,
  SlidersHorizontal,
  Download,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ListFilter,
} from 'lucide-react'
import { topics } from '../data/topics'
import { learningParts as parts, hubRows } from '../lib/hub'
import { exportRows } from '../lib/storage'
import { Status } from './ui'
import { partIcons } from './icons'

const PAGE_SIZE = 5

export default function ActivityTable({
  state,
  openTopic,
  notify,
  rows: providedRows,
  legacy = false,
}) {
  const filterTopics =
    legacy && providedRows
      ? [...new Map(providedRows.map((r) => [r.topic.id, r.topic])).values()]
      : topics
  const filterParts =
    legacy && providedRows
      ? [...new Map(providedRows.map((r) => [r.part.id, r.part])).values()]
      : parts
  const [search, setSearch] = useState('')
  const [topic, setTopic] = useState('all')
  const [part, setPart] = useState('all')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const rows = useMemo(
    () =>
      (providedRows || hubRows(state)).filter(
        (row) =>
          (topic === 'all' || topic === row.topic.id) &&
          (part === 'all' || part === row.part.id) &&
          (status === 'all' || status === row.status) &&
          `${row.topic.title} ${row.part.label} ${row.status.replace('-', ' ')}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      ),
    [state, providedRows, search, topic, part, status],
  )
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount - 1)
  const shown = rows.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE,
  )
  function change(setter, value) {
    setter(value)
    setPage(0)
  }
  return (
    <section className="panel activity-table">
      <div className="panel-header">
        <div>
          <h2>
            {legacy ? 'Earlier workspace activities' : 'Learning activities'}
            <span className="count-badge">25</span>
          </h2>
          <p>
            Device-specific activity records. Practical completion means
            evidence prepared; marks require lecturer review.
          </p>
        </div>
        <button
          className="button secondary export-button"
          onClick={() => {
            exportRows(rows)
            notify(`${rows.length} filtered activities exported as CSV.`)
          }}
        >
          <Download size={15} />
          Export CSV
        </button>
      </div>
      <div className="table-toolbar">
        <div
          className="filter-tabs"
          role="group"
          aria-label="Activity status filter"
        >
          {[
            ['all', 'All activities'],
            ['in-progress', 'In progress'],
            ['completed', 'Completed'],
          ].map(([id, label]) => (
            <button
              key={id}
              className={status === id ? 'active' : ''}
              aria-pressed={status === id}
              onClick={() => change(setStatus, id)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="table-search-controls">
          <label className="search-field">
            <Search size={16} />
            <input
              aria-label="Search activities"
              placeholder="Search activities..."
              value={search}
              onChange={(e) => change(setSearch, e.target.value)}
            />
          </label>
          <button
            className={`button secondary filter-button ${showFilters ? 'selected' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
            aria-expanded={showFilters}
            aria-controls="advanced-filters"
          >
            <SlidersHorizontal size={15} />
            Filters
            {(topic !== 'all' || part !== 'all') && (
              <i className="filter-dot" />
            )}
          </button>
        </div>
      </div>
      {showFilters && (
        <div className="advanced-filters" id="advanced-filters">
          <label>
            Topic
            <select
              aria-label="Filter by topic"
              value={topic}
              onChange={(e) => change(setTopic, e.target.value)}
            >
              <option value="all">All topics</option>
              {filterTopics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Activity type
            <select
              aria-label="Filter by activity type"
              value={part}
              onChange={(e) => change(setPart, e.target.value)}
            >
              <option value="all">All types</option>
              {filterParts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
          <button
            className="text-button"
            onClick={() => {
              setTopic('all')
              setPart('all')
              setStatus('all')
              setSearch('')
              setPage(0)
            }}
          >
            Clear filters
          </button>
        </div>
      )}
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>ACTIVITY</th>
              <th>TOPIC</th>
              <th>TYPE</th>
              <th>STATUS</th>
              <th>SCORE</th>
              <th>
                <span className="sr-only">Open activity</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {shown.map((row) => {
              const Icon = partIcons[row.part.id]
              return (
                <tr key={row.id}>
                  <td>
                    <div className="table-activity">
                      <span className={`activity-icon ${row.topic.color}`}>
                        <Icon size={17} />
                      </span>
                      <div>
                        <strong>
                          {row.part.label}: {row.topic.shortTitle}
                        </strong>
                        <small>
                          Topic 0{row.topic.number} · C++ fundamentals
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="table-topic">{row.topic.title}</span>
                  </td>
                  <td>
                    <span className="type-badge">{row.part.label}</span>
                  </td>
                  <td>
                    <Status status={row.status} />
                  </td>
                  <td>
                    <span className="score-cell">
                      {row.score !== undefined ? `${row.score}%` : '—'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="row-action"
                      aria-label={`Open ${row.part.label} for ${row.topic.title}`}
                      onClick={() => openTopic(row.topic.id, row.part.id)}
                    >
                      <ArrowRight size={16} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="empty-state">
            <ListFilter size={28} />
            <h3>No matching activities</h3>
            <p>Try another search or clear your filters.</p>
            <button
              className="text-button"
              onClick={() => {
                setSearch('')
                setTopic('all')
                setPart('all')
                setStatus('all')
                setPage(0)
              }}
            >
              Clear all filters
              <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>
      <div className="table-pagination">
        <span>
          {rows.length
            ? `Showing ${currentPage * PAGE_SIZE + 1}–${Math.min((currentPage + 1) * PAGE_SIZE, rows.length)} of ${rows.length} activities`
            : '0 activities'}
        </span>
        <div>
          <button
            aria-label="Previous page"
            disabled={currentPage === 0}
            onClick={() => setPage(currentPage - 1)}
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={currentPage === i ? 'active' : ''}
              aria-label={`Page ${i + 1}`}
              aria-current={currentPage === i ? 'page' : undefined}
            >
              {i + 1}
            </button>
          ))}
          <button
            aria-label="Next page"
            disabled={currentPage >= pageCount - 1}
            onClick={() => setPage(currentPage + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  )
}
