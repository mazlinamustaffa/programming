import { useState } from 'react'
import {
  BookOpen,
  Code2,
  Image,
  MessageSquare,
  CircleHelp,
  Terminal,
  Gamepad2,
  Check,
  ArrowRight,
  FileText,
  Sparkles,
} from 'lucide-react'
import { topics } from '../data/topics'
import { hubProgress } from '../lib/hub'
import { TopicIcon, ProgressBar } from '../components/ui'
export default function TopicPage({
  topicId,
  hub,
  updateHub,
  navigate,
  catalog,
  notify,
}) {
  const topic = topics.find((t) => t.id === topicId) || topics[0]
  const [bm, setBm] = useState(false),
    [reflection, setReflection] = useState(
      hub.reflections[topic.id]?.text || '',
    )
  const cards = [
    [
      'infographics',
      'Infographic Notes',
      Image,
      'Visual notes published by your lecturer.',
    ],
    [
      'comics',
      'Comic Notes',
      MessageSquare,
      'Learn through lecturer-created visual stories.',
    ],
    [
      'quiz',
      'Interactive Quiz',
      CircleHelp,
      '10 questions · 15 minutes · instant feedback.',
    ],
    [
      'practical',
      'Practical Assessment',
      Terminal,
      'A hands-on task · 60 minutes · lecturer marking.',
    ],
    ['lab', 'Practice Lab', Code2, 'Predict, trace, debug and build.'],
    [
      'games',
      'Quiz & Game Zone',
      Gamepad2,
      'Published educational links open in a new tab.',
    ],
  ]
  const resources = (catalog.published?.resources || []).filter(
    (r) => Number(r.topicId) === topic.number,
  )
  return (
    <>
      <div className="learning-breadcrumb">
        <button className="text-button" onClick={() => navigate('learning')}>
          ← My Learning
        </button>
        <span>Topic {topic.number} · C++ Foundations</span>
      </div>
      <section className={`topic-banner ${topic.color}`}>
        <div className="topic-banner-orbit" aria-hidden="true" />
        <TopicIcon topic={topic} size={32} />
        <div>
          <span className="eyebrow">
            TOPIC {topic.number} · LEARN WITH PURPOSE
          </span>
          <h1>{topic.title}</h1>
          <p>{topic.description}</p>
        </div>
        <div className="detail-progress">
          <strong>{hubProgress(hub, topic.id)}% complete</strong>
          <ProgressBar value={hubProgress(hub, topic.id)} color={topic.color} />
        </div>
      </section>
      <section className="topic-overview-grid">
        <article className="panel">
          <span className="eyebrow">YOUR STARTING POINT</span>
          <h2>Topic overview</h2>
          <p>{topic.overview}</p>
          <p className="small-muted">{topic.verificationNote}</p>
        </article>
        <article className="panel objectives">
          <h2>
            <Sparkles size={20} /> Learning objectives
          </h2>
          <ol>
            {topic.objectives.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ol>
        </article>
      </section>
      <section
        className="resource-grid topic-resource-grid"
        aria-label="Topic learning resources"
      >
        {cards.map(([route, title, Icon, description]) => (
          <article className="panel resource-card" key={route}>
            <span className={`resource-symbol ${topic.color}`}>
              <Icon size={23} />
            </span>
            <h3>{title}</h3>
            <p>{description}</p>
            <button
              className="text-button"
              onClick={() => navigate(`${route}/${topic.id}`)}
            >
              Open resource
              <ArrowRight size={16} />
            </button>
          </article>
        ))}
      </section>
      <section className="panel notes-hub" id="quick-notes">
        <div className="panel-header">
          <div>
            <span className="eyebrow">MAKE THE CONCEPTS CLICK</span>
            <h2>Quick Notes</h2>
            <p>
              Read, connect and apply. Code examples are AI-assisted drafts for
              lecturer verification.
            </p>
          </div>
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={bm}
              onChange={(e) => setBm(e.target.checked)}
            />
            Bahasa Melayu support
          </label>
        </div>
        <div className="note-list">
          {topic.notes.map((note, i) => (
            <article className="note-item" key={note.id}>
              <span className={`note-index ${topic.color}`}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3>{note.title}</h3>
                <p className="preserve-lines">{note.body}</p>
                {bm && note.bm && (
                  <p className="bm-note" lang="ms">
                    {note.bm}
                  </p>
                )}
                {note.code && (
                  <pre className="code-block">
                    <code>{note.code}</code>
                  </pre>
                )}
              </div>
            </article>
          ))}
        </div>
        <button
          className="button primary"
          disabled={Boolean(hub.notes[topic.id])}
          onClick={() => {
            updateHub((p) => ({
              ...p,
              notes: { ...p.notes, [topic.id]: { completedAt: Date.now() } },
            }))
            notify('Notes marked complete on this device.')
          }}
        >
          <Check size={17} />
          {hub.notes[topic.id] ? 'Notes completed' : 'Mark notes as completed'}
        </button>
      </section>
      <section className="panel takeaway-panel">
        <BookOpen size={25} />
        <div>
          <h2>Remember these ideas</h2>
          <ul>
            {topic.takeaways.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </section>
      <section className="panel published-topic-notes">
        <h2>
          <FileText size={20} /> Lecturer materials
        </h2>
        <p>
          {resources.length
            ? `${resources.length} published resources are available for this topic.`
            : 'Your lecturer has not published materials for this topic yet. Infographic and comic slots are ready for real uploads.'}
        </p>
        <div className="button-row">
          <button
            className="button secondary"
            onClick={() => navigate(`infographics/${topic.id}`)}
          >
            View infographic notes
          </button>
          <button
            className="button secondary"
            onClick={() => navigate(`comics/${topic.id}`)}
          >
            View comic notes
          </button>
          <button
            className="button secondary"
            onClick={() => navigate(`pdf/${topic.id}`)}
          >
            View PDF notes
          </button>
        </div>
      </section>
      <section className="panel reflection-panel">
        <span className="eyebrow">PAUSE • REFLECT • GROW</span>
        <h2>Learning reflection</h2>
        <p>
          Describe one concept you can explain, one mistake you corrected, and
          your next learning step. Save your own words.
        </p>
        <label className="field-label" htmlFor="topic-reflection">
          My reflection
        </label>
        <textarea
          id="topic-reflection"
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          rows={5}
          maxLength={3000}
          placeholder="Today I learned… I still need to practise…"
        />
        <button
          className="button primary"
          disabled={!reflection.trim()}
          onClick={() => {
            updateHub((p) => ({
              ...p,
              reflections: {
                ...p.reflections,
                [topic.id]: { text: reflection.trim(), savedAt: Date.now() },
              },
            }))
            notify('Reflection saved locally on this device.')
          }}
        >
          Save reflection
          <Check size={16} />
        </button>
        <p className="small-muted">
          Saved only in this browser. Reflections are not sent to a lecturer or
          AI service.
        </p>
      </section>
    </>
  )
}
