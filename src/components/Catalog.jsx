import {
  ArrowRight,
  BookOpen,
  Check,
  Terminal,
  ClipboardCheck,
  Download,
  FileText,
  Code2,
  Lightbulb,
  ExternalLink,
  CircleHelp,
} from 'lucide-react'
import { topics, parts } from '../data/curriculum'
import { activityId, downloadFile } from '../lib/storage'
import { TopicCards } from './Dashboard'
import { TopicIcon, Status, SectionHeading } from './ui'
import { partIcons } from './icons'

export default function Catalog({ view, state, openTopic, notify }) {
  if (view === 'resources') {
    const downloadNotes = () => {
      const content = topics
        .map(
          (t) =>
            `${t.number}. ${t.title}\n${'='.repeat(40)}\n${t.parts.notes.overview}\n\n${t.parts.notes.sections.map((s) => `${s.title}\n${s.body}\n${s.code || ''}`).join('\n\n')}\n\nKey takeaways\n${t.parts.notes.takeaways.map((s) => `- ${s}`).join('\n')}`,
        )
        .join('\n\n\n')
      downloadFile('cpp-fundamentals-notes.txt', content)
      notify('Your C++ study notes have been downloaded.')
    }
    return (
      <>
        <div className="page-heading">
          <div>
            <span className="eyebrow">YOUR TOOLKIT</span>
            <h1>
              A little help along the way<span>.</span>
            </h1>
            <p>Handy references to keep close as you learn and build.</p>
          </div>
        </div>
        <div className="resource-grid">
          <section className="resource-card">
            <span className="resource-icon orange">
              <FileText size={28} />
            </span>
            <span className="eyebrow">KEEP IT HANDY</span>
            <h2>C++ study notes</h2>
            <p>
              All five topic notes, code examples, and key takeaways in one
              downloadable study guide.
            </p>
            <span className="resource-meta">Plain text · Offline friendly</span>
            <button className="button primary" onClick={downloadNotes}>
              <Download size={16} />
              Download notes
            </button>
          </section>
          <section className="resource-card">
            <span className="resource-icon purple">
              <BookOpen size={28} />
            </span>
            <span className="eyebrow">SEE THE BIG PICTURE</span>
            <h2>Your course outline</h2>
            <p>
              A simple overview of the five topics and 25 activities that make
              up your learning path.
            </p>
            <span className="resource-meta">Plain text · 5 topics</span>
            <button
              className="button secondary"
              onClick={() => {
                downloadFile(
                  'cpp-course-outline.txt',
                  'PROGRAMMING FUNDAMENTALS HUB\nC++ Foundations\n\n' +
                    topics
                      .map(
                        (t) =>
                          `${t.number}. ${t.title}\n${t.description}\nEstimated study time: ${t.duration}\nActivities: ${parts.map((p) => p.label).join(', ')}\n`,
                      )
                      .join('\n'),
                )
                notify('Your course outline has been downloaded.')
              }}
            >
              <Download size={16} />
              Download outline
            </button>
          </section>
          <section className="resource-card">
            <span className="resource-icon blue">
              <Code2 size={28} />
            </span>
            <span className="eyebrow">GO A LITTLE DEEPER</span>
            <h2>C++ language reference</h2>
            <p>
              Explore language features and standard library documentation on
              cppreference.
            </p>
            <span className="resource-meta">
              External reference · Opens a new tab
            </span>
            <a
              className="button secondary"
              href="https://en.cppreference.com/w/cpp/language.html"
              target="_blank"
              rel="noreferrer"
            >
              Open reference
              <ExternalLink size={16} />
            </a>
          </section>
        </div>
        <div className="resource-tips panel">
          <SectionHeading
            title="A good routine beats a perfect plan"
            detail="Three ways to make your study time count."
          />
          <div className="tips-grid">
            <div>
              <Lightbulb size={23} />
              <h3>Understand before you memorize</h3>
              <p>Trace the code line by line. Ask what changes and why.</p>
            </div>
            <div>
              <Terminal size={23} />
              <h3>Make something small</h3>
              <p>Try the practical, change an input, and see what happens.</p>
            </div>
            <div>
              <CircleHelp size={23} />
              <h3>Use mistakes as feedback</h3>
              <p>Review every assessment explanation, then try again.</p>
            </div>
          </div>
        </div>
      </>
    )
  }
  if (view === 'learning')
    return (
      <>
        <div className="page-heading">
          <div>
            <span className="eyebrow">YOUR LEARNING PATH</span>
            <h1>
              Build a strong foundation<span>.</span>
            </h1>
            <p>
              Five essential topics, from your first algorithm to reusable
              functions.
            </p>
          </div>
          <span className="page-chip">
            <BookOpen size={16} />5 topics · 25 activities
          </span>
        </div>
        <div className="learning-intro">
          <div className="learning-intro-icon">
            <BookOpen size={28} />
          </div>
          <div>
            <h2>Learn it. Try it. Make it yours.</h2>
            <p>
              Start with the notes, practice with code, and finish with a quiz
              and test. Everything saves as you go.
            </p>
          </div>
        </div>
        <TopicCards state={state} openTopic={openTopic} compact />
        <section className="panel path-parts">
          <SectionHeading title="Five ways to make each concept stick" />
          <div className="parts-explainer">
            {parts.map((p) => {
              const Icon = partIcons[p.id]
              return (
                <div key={p.id}>
                  <Icon size={23} />
                  <h3>{p.label}</h3>
                  <p>
                    {
                      {
                        notes:
                          'Understand the ideas with clear explanations and examples.',
                        exercise:
                          'Solve a focused code challenge, one skill at a time.',
                        practical:
                          'Put the concepts together in a working C++ program.',
                        quiz: 'Check your understanding with instant feedback.',
                        test: 'Consolidate your knowledge and track your score.',
                      }[p.id]
                    }
                  </p>
                </div>
              )
            })}
          </div>
        </section>
      </>
    )
  if (view === 'lab')
    return (
      <>
        <div className="page-heading">
          <div>
            <span className="eyebrow">THE PRACTICE LAB</span>
            <h1>
              Less theory. More “I made that.”
              <span />
            </h1>
            <p>
              Write, run, and experiment with C++ — right here in your browser.
            </p>
          </div>
          <span className="page-chip">
            <Terminal size={16} />
            C++ beginner runtime
          </span>
        </div>
        <div className="info-callout lab-info">
          <Terminal size={21} />
          <span>
            Every challenge runs locally in a browser interpreter. Supports
            beginner C++ with iostream, variables, loops, functions, and arrays.
            Full C++ libraries require a native compiler.
          </span>
        </div>
        <div className="lab-grid">
          {topics.map((t) => (
            <section className="lab-card panel" key={t.id}>
              <div className="lab-card-top">
                <TopicIcon topic={t} />
                <span className="eyebrow">TOPIC 0{t.number}</span>
              </div>
              <h2>{t.title}</h2>
              <p>{t.description}</p>
              <div className="lab-activity-list">
                {['exercise', 'practical'].map((partId) => {
                  const data = t.parts[partId]
                  const entry = state.activities[activityId(t.id, partId)]
                  return (
                    <button
                      key={partId}
                      onClick={() => openTopic(t.id, partId, 'lab')}
                    >
                      <span className="lab-activity-icon">
                        {partId === 'exercise' ? (
                          <Code2 size={18} />
                        ) : (
                          <Terminal size={18} />
                        )}
                      </span>
                      <span>
                        <strong>{data.title}</strong>
                        <small>
                          {partId === 'exercise'
                            ? 'Exercise · Focused challenge'
                            : 'Practical · Guided project'}
                        </small>
                      </span>
                      {entry?.status === 'completed' ? (
                        <Check className="green-text" size={18} />
                      ) : (
                        <ArrowRight size={17} />
                      )}
                    </button>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </>
    )
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">CHECK YOUR UNDERSTANDING</span>
          <h1>
            Turn knowledge into confidence<span>.</span>
          </h1>
          <p>Quick check-ins and topic tests. Learn from every answer.</p>
        </div>
        <span className="page-chip">
          <ClipboardCheck size={16} />
          10 assessments
        </span>
      </div>
      <div className="assessment-note">
        <span className="resource-icon purple">
          <ClipboardCheck size={25} />
        </span>
        <div>
          <strong>Three questions. Immediate feedback.</strong>
          <p>
            Answer at least 2 of 3 questions correctly to complete an
            assessment. You can retry as often as you like.
          </p>
        </div>
      </div>
      <div className="assessment-grid">
        {topics.map((t) => (
          <section className="panel assessment-card" key={t.id}>
            <div className="assessment-card-heading">
              <TopicIcon topic={t} />
              <div>
                <span className="eyebrow">TOPIC 0{t.number}</span>
                <h2>{t.title}</h2>
              </div>
            </div>
            {['quiz', 'test'].map((partId) => {
              const record = state.activities[activityId(t.id, partId)] || {}
              return (
                <div className="assessment-row" key={partId}>
                  <div>
                    <h3>{partId === 'quiz' ? 'Quick quiz' : 'Topic test'}</h3>
                    <span>
                      3 questions
                      {record.score !== undefined &&
                        ` · Last score: ${record.score}%`}
                    </span>
                  </div>
                  <Status status={record.status || 'not-started'} />
                  <button
                    className="button secondary"
                    onClick={() => openTopic(t.id, partId, 'assessments')}
                  >
                    {record.status === 'completed' ? 'Retake' : 'Start'}
                    <ArrowRight size={15} />
                  </button>
                </div>
              )
            })}
          </section>
        ))}
      </div>
    </>
  )
}
