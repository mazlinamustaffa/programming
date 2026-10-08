import { useState } from 'react'
import {
  Code2,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  Archive,
} from 'lucide-react'
import { topics } from '../data/topics'
import { practiceTasks } from '../data/practice'
import { topics as earlierTopics } from '../data/curriculum'
import { CodeWorkspace } from '../components/Learning'
export default function PracticeLab({
  topicId,
  hub,
  updateHub,
  notify,
  navigate,
}) {
  const [filter, setFilter] = useState(topicId || 'all'),
    [level, setLevel] = useState('all'),
    [taskId, setTaskId] = useState(null),
    [answer, setAnswer] = useState(null),
    [checked, setChecked] = useState(false),
    [reveal, setReveal] = useState(false)
  const task = practiceTasks.find((t) => t.id === taskId)
  const complete = () =>
    updateHub((p) => ({
      ...p,
      practice: {
        ...p.practice,
        [task.id]: {
          topicId: task.topicId,
          completed: true,
          completedAt: Date.now(),
        },
      },
    }))
  const open = (id) => {
    setTaskId(id)
    setAnswer(null)
    setChecked(false)
    setReveal(false)
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">THINK • TRACE • TEST</span>
          <h1>Practice Lab</h1>
          <p>
            Build confidence with 15 syllabus-focused challenges. Advanced means
            deeper thinking within beginner C++ concepts.
          </p>
        </div>
        <Code2 size={32} />
      </div>
      <div className="notice">
        <strong>Your browser can run supported beginner C++.</strong> The
        existing interpreter is retained. Use your own IDE for full compilation
        and formal practical submissions. AI-assisted examples require lecturer
        verification.
      </div>
      {task ? (
        <>
          <button className="text-button" onClick={() => setTaskId(null)}>
            ← All challenges
          </button>
          <div className="practice-meta">
            <span className="chip">{task.level}</span>
            <span className="chip">{task.kind}</span>
            <span>
              Topic {topics.find((t) => t.id === task.topicId)?.number}
            </span>
          </div>
          {task.options ? (
            <section className="panel practice-question">
              <h2>{task.title}</h2>
              <p className="preserve-lines">{task.prompt}</p>
              <fieldset>
                <legend>Select your prediction</legend>
                {task.options.map((o, i) => (
                  <label
                    className={`practice-option ${answer === i ? 'selected' : ''}`}
                    key={o}
                  >
                    <input
                      type="radio"
                      name="practice-answer"
                      checked={answer === i}
                      onChange={() => {
                        setAnswer(i)
                        setChecked(false)
                      }}
                    />
                    {o}
                  </label>
                ))}
              </fieldset>
              <button
                className="button primary"
                disabled={answer === null}
                onClick={() => {
                  setChecked(true)
                  if (answer === task.answer) {
                    complete()
                    notify('Practice completed on this device.')
                  }
                }}
              >
                Check answer
                <CheckCircle2 size={16} />
              </button>
              {checked && (
                <div className="notice" role="status">
                  <strong>
                    {answer === task.answer ? 'Correct.' : 'Try another trace.'}
                  </strong>
                  {answer === task.answer && <p>{task.explanation}</p>}
                </div>
              )}
              <button
                className="text-button"
                onClick={() => setReveal(!reveal)}
              >
                <Lightbulb size={16} />
                {reveal ? 'Hide explanation' : 'Reveal explanation'}
              </button>
              {reveal && (
                <p className="notice">
                  {task.explanation} Answer: {task.options[task.answer]}.
                  Revealing alone does not mark completion.
                </p>
              )}
            </section>
          ) : (
            <CodeWorkspace
              key={task.id}
              data={task}
              code={hub.code[task.id] ?? task.starter}
              onCode={(code) =>
                updateHub((p) => ({
                  ...p,
                  code: { ...p.code, [task.id]: code },
                }))
              }
              completed={hub.practice[task.id]?.completed}
              onComplete={complete}
              notify={notify}
            />
          )}
        </>
      ) : (
        <>
          <div className="filter-row">
            <label>
              Topic
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All topics</option>
                {topics.map((t) => (
                  <option value={t.id} key={t.id}>
                    Topic {t.number}: {t.shortTitle}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Difficulty
              <select value={level} onChange={(e) => setLevel(e.target.value)}>
                <option value="all">All levels</option>
                {['Beginner', 'Intermediate', 'Advanced'].map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="resource-grid">
            {practiceTasks
              .filter(
                (t) =>
                  (filter === 'all' || filter === t.topicId) &&
                  (level === 'all' || level === t.level),
              )
              .map((t) => (
                <article
                  className={`panel resource-card ${topics.find((x) => x.id === t.topicId)?.color}`}
                  key={t.id}
                >
                  <div className="resource-symbol">
                    <Code2 />
                  </div>
                  <span className="eyebrow">
                    {t.level} · Topic{' '}
                    {topics.find((x) => x.id === t.topicId)?.number}
                  </span>
                  <h3>{t.title}</h3>
                  <p>{t.kind}</p>
                  <button
                    className="button secondary"
                    onClick={() => open(t.id)}
                  >
                    {hub.practice[t.id]?.completed
                      ? 'Practice again'
                      : 'Open challenge'}
                    <ArrowRight size={15} />
                  </button>
                </article>
              ))}
          </div>
          <section className="panel earlier-workspace">
            <h2>
              <Archive size={20} /> Your earlier workspace
            </h2>
            <p>
              All original notes, exercises, practical activities, quizzes,
              tests and saved code remain available. Earlier assessments use
              their original format and are separate from the new 10-question
              quizzes.
            </p>
            <div className="button-row">
              {earlierTopics.map((t) => (
                <button
                  className="button secondary"
                  key={t.id}
                  onClick={() => navigate(`legacy/${t.id}/exercise`)}
                >
                  {t.shortTitle}
                </button>
              ))}
            </div>
            <button className="text-button" onClick={() => navigate('legacy')}>
              View retained activity records
              <ArrowRight size={16} />
            </button>
          </section>
        </>
      )}
    </>
  )
}
