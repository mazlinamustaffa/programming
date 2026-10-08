import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { Trophy, Target, Download, Archive } from 'lucide-react'
import { topics } from '../data/topics'
import { hubRows, hubProgress } from '../lib/hub'
import { exportRows } from '../lib/storage'
import {
  TopicCards,
  ProgressCharts,
  TopicProgressChart,
} from '../components/Dashboard'
import ActivityTable from '../components/ActivityTable'
export default function ProgressPage({ hub, openTopic, navigate, notify }) {
  const rows = hubRows(hub),
    attempts = Object.entries(hub.quizAttempts).filter(
      ([, a]) => a.submittedAt && a.result,
    )
  const bloom = ['C1', 'C2', 'C3', 'C4'].map((level, i) => {
    let correct = 0,
      total = 0
    for (const [, a] of attempts) {
      correct += a.result.bloomBreakdown?.[level]?.correct || 0
      total += a.result.bloomBreakdown?.[level]?.total || 0
    }
    return {
      level: `${level} ${['Remember', 'Understand', 'Apply', 'Analyze'][i]}`,
      correct,
      total,
      percentage: total ? Math.round((correct / total) * 100) : 0,
    }
  })
  const completed = rows.filter((r) => r.status === 'completed').length
  const improvements = attempts.filter(([, a]) => a.result.percentage < 70)
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR EFFORT, MADE VISIBLE</span>
          <h1>Learning Progress</h1>
          <p>
            Real activity data from this browser. This is a personal learning
            record, not a central lecturer gradebook.
          </p>
        </div>
        <button
          className="button secondary"
          onClick={() => {
            exportRows(rows)
            notify('Device-specific progress exported.')
          }}
        >
          <Download size={16} />
          Export progress CSV
        </button>
      </div>
      <section className="progress-summary">
        <div className="panel">
          <Trophy />
          <strong>{hubProgress(hub)}%</strong>
          <span>Overall learning completion</span>
        </div>
        <div className="panel">
          <Target />
          <strong>{attempts.length} / 5</strong>
          <span>Quizzes completed</span>
        </div>
        <div className="panel">
          <Trophy />
          <strong>
            {
              Object.values(hub.practicals).filter(
                (p) => p.status === 'assessed',
              ).length
            }{' '}
            / 5
          </strong>
          <span>Practicals marked locally</span>
        </div>
      </section>
      <TopicCards state={hub} openTopic={openTopic} />
      <ProgressCharts rows={rows} state={hub} />
      <TopicProgressChart state={hub} />
      <section className="panel bloom-chart">
        <div className="panel-header">
          <div>
            <h2>Bloom’s performance breakdown</h2>
            <p>
              Latest completed quiz per topic. Unanswered questions count as
              zero.
            </p>
          </div>
        </div>
        {attempts.length ? (
          <>
            <div
              className="bar-chart"
              role="img"
              aria-label={bloom
                .map((b) => `${b.level}: ${b.correct}/${b.total}`)
                .join(', ')}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bloom}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="level" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} unit="%" />
                  <Tooltip formatter={(v) => [`${v}%`, 'Correct']} />
                  <Bar
                    dataKey="percentage"
                    fill="#7c3aed"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bloom-counts">
              {bloom.map((b) => (
                <span key={b.level}>
                  {b.level}: {b.correct} / {b.total}
                </span>
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <Target size={30} />
            <h3>Your first quiz creates this chart</h3>
            <p>No quiz results are available yet.</p>
            <button className="button primary" onClick={() => navigate('quiz')}>
              Choose a quiz
            </button>
          </div>
        )}
      </section>
      <div className="topic-overview-grid">
        <section className="panel">
          <h2>Achievement indicators</h2>
          <div className="achievement-list">
            {[
              ['First steps', completed > 0, 'Complete your first activity.'],
              [
                'Quiz explorer',
                attempts.length === 5,
                'Complete all five topic quizzes.',
              ],
              [
                'Reflective learner',
                Object.keys(hub.reflections).length === 5,
                'Save one reflection for every topic.',
              ],
              [
                'Foundation builder',
                completed === 25,
                'Complete all 25 learning activities.',
              ],
            ].map(([label, earned, detail]) => (
              <div className={earned ? 'earned' : ''} key={label}>
                <Trophy size={20} />
                <div>
                  <strong>{label}</strong>
                  <p>{earned ? 'Earned on this device' : detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="panel">
          <h2>Focus your next practice</h2>
          {improvements.length ? (
            improvements.map(([id, a]) => (
              <p className="improvement-item" key={id}>
                <strong>
                  {topics.find((t) => t.id === id)?.shortTitle} ·{' '}
                  {a.result.percentage}%
                </strong>
                <button
                  className="text-button"
                  onClick={() => navigate(`lab/${id}`)}
                >
                  Practise this topic →
                </button>
              </p>
            ))
          ) : (
            <p>
              {attempts.length
                ? 'Review your explanations and practise applying the concepts in a new situation.'
                : 'Complete a quiz to identify areas requiring improvement. No performance is assumed.'}
            </p>
          )}
          <p className="small-muted">
            Quiz attempts are formative practice; practical marks are entered by
            a lecturer on this device.
          </p>
        </section>
      </div>
      <ActivityTable state={hub} openTopic={openTopic} notify={notify} />
      <section className="panel earlier-workspace">
        <h2>
          <Archive size={20} />
          Preserved earlier records
        </h2>
        <p>
          Your original activity history and saved code remain available in the
          earlier workspace. Original quizzes keep their original scoring and
          are not silently converted into the new assessments.
        </p>
        <button className="button secondary" onClick={() => navigate('legacy')}>
          Open earlier records
        </button>
      </section>
    </>
  )
}
