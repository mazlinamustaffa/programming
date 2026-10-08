import { useState } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CheckCheck,
  Target,
  Layers,
  TrendingUp,
  ChevronRight,
  CalendarDays,
  Code2,
  Sparkles,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts'
import { topics } from '../data/topics'
import {
  hubRows as getRows,
  hubProgress as topicProgress,
  weeklyActivity,
} from '../lib/hub'
import { TopicIcon, ProgressBar, SectionHeading } from './ui'
import ActivityTable from './ActivityTable'

function HeroArtwork() {
  return (
    <div className="hero-art" aria-hidden="true">
      <div className="art-orbit orbit-one" />
      <div className="art-orbit orbit-two" />
      <div className="art-dots">
        {Array.from({ length: 20 }, (_, i) => (
          <i key={i} />
        ))}
      </div>
      <div className="floating-label">
        <span>
          <CheckCheck size={14} />
        </span>
        Keep going. You’ve got this!
      </div>
      <div className="art-code">
        <div className="art-code-top">
          <span />
          <span />
          <span />
          <small>hello_world.cpp</small>
        </div>
        <div className="art-code-body">
          <div>
            <span className="code-number">01</span>
            <span className="code-lilac">#include</span>{' '}
            <span className="code-yellow">&lt;iostream&gt;</span>
          </div>
          <div>
            <span className="code-number">02</span>
            <span className="code-lilac">int</span> main() {'{'}
          </div>
          <div>
            <span className="code-number">03</span> std::cout &lt;&lt;
          </div>
          <div>
            <span className="code-number">04</span>{' '}
            <span className="code-yellow">“Hello, future!”</span>;
          </div>
          <div>
            <span className="code-number">05</span>{' '}
            <span className="code-lilac">return</span>{' '}
            <span className="code-green">0</span>;
          </div>
          <div>
            <span className="code-number">06</span>
            {'}'}
          </div>
        </div>
      </div>
      <div className="art-cpp">
        C<span>++</span>
      </div>
      <div className="art-spark spark-one">✦</div>
      <div className="art-spark spark-two">✦</div>
    </div>
  )
}

export function TopicCards({ state, openTopic, compact = false }) {
  return (
    <div className={`topic-grid ${compact ? 'catalog-grid' : ''}`}>
      {topics.map((topic) => {
        const progress = topicProgress(state, topic.id)
        return (
          <button
            className={`topic-card ${topic.color}`}
            key={topic.id}
            onClick={() => openTopic(topic.id)}
            aria-label={`Open ${topic.title}`}
          >
            <div className="topic-card-top">
              <TopicIcon topic={topic} />
              <span>TOPIC 0{topic.number}</span>
              <ArrowUpRight size={15} />
            </div>
            <h3>{topic.title}</h3>
            {compact && <p>{topic.description}</p>}
            <span className="topic-duration">
              <BookOpen size={13} />5 activities<span>·</span>
              {topic.duration}
            </span>
            <div className="topic-progress-label">
              <span>
                {progress === 100
                  ? 'Nicely done!'
                  : progress
                    ? 'Keep the momentum'
                    : 'Ready when you are'}
              </span>
              <strong>{progress}%</strong>
            </div>
            <ProgressBar value={progress} color={topic.color} />
          </button>
        )
      })}
    </div>
  )
}

export function ProgressCharts({ rows, state }) {
  const [week, setWeek] = useState('this')
  const completed = rows.filter((r) => r.status === 'completed').length
  const inProgress = rows.filter((r) => r.status === 'in-progress').length
  const notStarted = rows.length - completed - inProgress
  const data = weeklyActivity(state.history, week === 'last')
  const values = data.map((d) => d.activities)
  const breakdown = [
    { name: 'Completed', value: completed, color: '#7c3aed' },
    { name: 'In progress', value: inProgress, color: '#06b6d4' },
    { name: 'Not started', value: notStarted, color: '#eef0f3' },
  ]
  return (
    <div className="charts-grid">
      <section className="panel activity-chart">
        <div className="panel-header">
          <div>
            <h2>
              Learning momentum
              <span className="tiny-spark">
                <TrendingUp size={16} />
              </span>
            </h2>
            <p>A little consistency makes a big difference.</p>
          </div>
          <label className="select-label">
            <span className="sr-only">Chart time range</span>
            <select value={week} onChange={(e) => setWeek(e.target.value)}>
              <option value="this">This week</option>
              <option value="last">Last week</option>
            </select>
          </label>
        </div>
        <div className="chart-subheading">
          <span>
            <i />
            Activities completed
          </span>
          <span>Recorded activity on this device</span>
        </div>
        <div
          className="area-chart"
          role="img"
          aria-label={`Recorded ${week === 'this' ? 'current' : 'last'} week activity: ${data.map((d) => `${d.day} ${d.activities}`).join(', ')}`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 12, bottom: 0, left: -24 }}
            >
              <defs>
                <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="#f0f0f2"
                strokeDasharray="4 4"
              />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#8c919d' }}
                dy={8}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#8c919d' }}
                domain={[0, Math.max(4, ...values)]}
              />
              <Tooltip
                contentStyle={{
                  border: '1px solid #eee',
                  borderRadius: 12,
                  fontSize: 12,
                }}
                formatter={(v) => [v, 'Activities']}
              />
              <Area
                type="monotone"
                dataKey="activities"
                stroke="#7c3aed"
                strokeWidth={2.5}
                fill="url(#activityFill)"
                activeDot={{ r: 5, stroke: '#fff', strokeWidth: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-footer">
          <span>
            <Sparkles size={14} />
            Progress is a habit, not a race.
          </span>
          <span>
            {week === 'this'
              ? 'Your completions update this week'
              : 'Your recorded history'}
          </span>
        </div>
      </section>
      <section className="panel progress-chart">
        <div className="panel-header">
          <div>
            <h2>Your progress</h2>
            <p>One step closer to a solid foundation.</p>
          </div>
          <span className="chart-pill">ALL TOPICS</span>
        </div>
        <div
          className="donut-wrap"
          role="img"
          aria-label={`${completed} completed, ${inProgress} in progress, ${notStarted} not started`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={breakdown}
                dataKey="value"
                innerRadius={66}
                outerRadius={82}
                paddingAngle={completed && inProgress ? 4 : 0}
                cornerRadius={5}
                stroke="none"
                startAngle={90}
                endAngle={-270}
              >
                {breakdown.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => [v, 'Activities']}
                contentStyle={{ borderRadius: 10, fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="donut-center">
            <strong>
              {Math.round((completed / 25) * 100)}
              <span>%</span>
            </strong>
            <span>overall completion</span>
          </div>
        </div>
        <div className="donut-legend">
          {breakdown.map((entry) => (
            <div key={entry.name}>
              <span>
                <i style={{ background: entry.color }} />
                {entry.name}
              </span>
              <strong>{entry.value.toString().padStart(2, '0')}</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export function TopicProgressChart({ state }) {
  const data = topics.map((t) => ({
    name: `Topic ${t.number}`,
    progress: topicProgress(state, t.id),
    color:
      {
        purple: '#7c3aed',
        orange: '#ea580c',
        blue: '#2563eb',
        green: '#059669',
        teal: '#059669',
        pink: '#db2777',
      }[t.color] || '#7c3aed',
  }))
  return (
    <section className="panel topic-bar-chart">
      <div className="panel-header">
        <div>
          <h2>Topic learning progress</h2>
          <p>
            Five activities per topic: notes, practice, practical evidence, quiz
            and reflection.
          </p>
        </div>
      </div>
      <div
        className="bar-chart"
        role="img"
        aria-label={data.map((d) => `${d.name} ${d.progress}%`).join(', ')}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid vertical={false} stroke="#ece8f5" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <YAxis
              domain={[0, 100]}
              unit="%"
              axisLine={false}
              tickLine={false}
            />
            <Tooltip formatter={(v) => [`${v}%`, 'Completion']} />
            <Bar dataKey="progress" radius={[10, 10, 0, 0]} maxBarSize={62}>
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

export default function Dashboard({
  state,
  openTopic,
  navigate,
  openPlan,
  next,
  notify,
}) {
  const rows = getRows(state)
  const completed = rows.filter((r) => r.status === 'completed').length
  const scores = rows.filter((r) => r.score !== undefined).map((r) => r.score)
  const average = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0
  const explored = topics.filter(
    (t) =>
      state.visitedTopics[t.id] ||
      rows.some((r) => r.topic.id === t.id && r.status !== 'not-started'),
  ).length
  const stats = [
    {
      label: 'Overall progress',
      value: `${Math.round((completed / 25) * 100)}%`,
      detail: 'Your foundations are taking shape',
      icon: TrendingUp,
      color: 'orange',
      tag: 'Keep it up',
    },
    {
      label: 'Activities completed',
      value: completed.toString().padStart(2, '0'),
      suffix: '/ 25',
      detail: 'Across all five learning topics',
      icon: CheckCheck,
      color: 'purple',
      tag: `${25 - completed} to explore`,
    },
    {
      label: 'Assessment average',
      value: scores.length ? `${average}%` : '—',
      detail: scores.length
        ? `${scores.length} assessment${scores.length === 1 ? '' : 's'} attempted`
        : 'Take your first quiz to begin',
      icon: Target,
      color: 'blue',
      tag: 'Quiz & marked practical',
    },
    {
      label: 'Topics explored',
      value: explored.toString().padStart(2, '0'),
      suffix: '/ 05',
      detail: 'Learn something new every day',
      icon: Layers,
      color: 'green',
      tag: 'C++ essentials',
    },
  ]
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="greeting">
            <span className="sun-mark">✳</span>Good to see you, {state.name}
          </div>
          <h1>
            Your future starts with code<span>.</span>
          </h1>
          <p>
            Semester 1 · Diploma in Information Technology · Your personal C++
            learning journey.
          </p>
        </div>
        <button className="date-button" onClick={openPlan}>
          <CalendarDays size={16} />
          <span>My study plan</span>
          <ChevronRight size={14} />
        </button>
      </div>
      <section className="hero">
        <div className="hero-copy">
          <span className="hero-eyebrow">
            <span />
            <span>LEARN • PRACTICE • CODE • ACHIEVE</span>
            <span className="demo-badge">C++ LEARNING HUB</span>
          </span>
          <h2>
            Build your skills.
            <br />
            <span>Shape your future.</span>
          </h2>
          <p>
            Guided by Ts. Mazlina Md Mustaffa. Explore five essential
            <br className="desktop-break" /> C++ topics through hands-on,
            bite-sized learning.
          </p>
          <button
            className="button primary"
            onClick={() => openTopic(next.topic.id, next.part.id)}
          >
            Continue learning
            <ArrowRight size={17} />
          </button>
          <span className="hero-next">
            Up next: {next.topic.shortTitle} · {next.part.label}
          </span>
        </div>
        <HeroArtwork />
      </section>
      <section className="stats-grid" aria-label="Learning summary">
        {stats.map((stat) => (
          <div className="stat-card" key={stat.label}>
            <div className="stat-top">
              <span>{stat.label}</span>
              <span className={`stat-icon ${stat.color}`}>
                <stat.icon size={18} strokeWidth={1.7} />
              </span>
            </div>
            <div className="stat-value">
              {stat.value}
              {stat.suffix && <span>{stat.suffix}</span>}
            </div>
            <div className="stat-bottom">
              <span>{stat.detail}</span>
              <span className={`stat-tag ${stat.color}`}>{stat.tag}</span>
            </div>
          </div>
        ))}
      </section>
      <section className="topics-section">
        <SectionHeading
          eyebrow="THE BUILDING BLOCKS"
          title="Your learning path"
          detail="Five topics. A world of possibilities."
          action="View all topics"
          onAction={() => navigate('learning')}
        />
        <TopicCards state={state} openTopic={openTopic} />
      </section>
      <ProgressCharts rows={rows} state={state} />
      <TopicProgressChart state={state} />
      <ActivityTable state={state} openTopic={openTopic} notify={notify} />
      <div className="bottom-nudge">
        <span className="nudge-icon">
          <Code2 size={22} />
        </span>
        <div>
          <strong>
            The best way to learn programming? Write a little code.
          </strong>
          <span>Your practice lab is ready whenever you are.</span>
        </div>
        <button className="text-button" onClick={() => navigate('lab')}>
          Let’s practice
          <ArrowUpRight size={17} />
        </button>
      </div>
    </>
  )
}
