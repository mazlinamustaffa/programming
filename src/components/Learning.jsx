import { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Circle,
  Play,
  RotateCcw,
  Eye,
  Terminal,
  AlertCircle,
  Lightbulb,
  Clock3,
  Trophy,
  Copy,
  ChevronRight,
} from 'lucide-react'
import { parts } from '../data/curriculum'
import { activityId, topicProgress } from '../lib/storage'
import { runCpp } from '../lib/runner'
import { TopicIcon, ProgressBar, Status } from './ui'
import { partIcons } from './icons'

function Notes({ data, completed, onComplete, next }) {
  return (
    <div className="notes-layout">
      <article className="panel notes-panel">
        <span className="eyebrow">LET’S START WITH THE IDEAS</span>
        <h2>The essentials, explained.</h2>
        <p className="notes-overview">{data.overview}</p>
        {data.sections.map((section, i) => (
          <section className="note-section" key={section.title}>
            <div className="note-section-title">
              <span>{String(i + 1).padStart(2, '0')}</span>
              <h3>{section.title}</h3>
            </div>
            <p>{section.body}</p>
            {section.code && (
              <pre className="code-block">
                <code>{section.code}</code>
              </pre>
            )}
          </section>
        ))}
        <div className="notes-complete">
          <p>
            <CheckCircle2 size={19} />
            Finished reading? Make it a small win.
          </p>
          <div>
            <button
              className={`button ${completed ? 'success' : 'primary'}`}
              onClick={onComplete}
              disabled={completed}
            >
              {completed ? (
                <>
                  <Check size={17} />
                  Notes completed
                </>
              ) : (
                <>
                  Mark as complete
                  <Check size={17} />
                </>
              )}
            </button>
            <button className="button secondary" onClick={next}>
              Try the exercise
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </article>
      <aside className="notes-side">
        <section className="panel">
          <span className="side-panel-icon purple">
            <BookOpen size={22} />
          </span>
          <h3>What you’ll learn</h3>
          <ul>
            {data.objectives.map((objective) => (
              <li key={objective}>
                <CheckCircle2 size={15} />
                <span>{objective}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="takeaway-panel">
          <Lightbulb size={24} />
          <h3>Keep these in mind</h3>
          <ul>
            {data.takeaways.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
        </section>
        <div className="learning-small-note">
          <span>✦</span>You don’t have to know everything.
          <br />
          Just take the next step.
        </div>
      </aside>
    </div>
  )
}

function CodeWorkspace({ data, code, onCode, completed, onComplete, notify }) {
  const [output, setOutput] = useState(null)
  const [error, setError] = useState('')
  const [running, setRunning] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [input, setInput] = useState('')
  const expected = (data.expectedOutput || '').trim().replaceAll('\r\n', '\n')
  const matched =
    output &&
    output.exitCode === 0 &&
    output.output.trim().replaceAll('\r\n', '\n') === expected
  async function run() {
    setRunning(true)
    setOutput(null)
    setError('')
    try {
      const result = await runCpp(code, input)
      setOutput(result)
      if (
        result.exitCode === 0 &&
        result.output.trim().replaceAll('\r\n', '\n') === expected
      )
        onComplete()
    } catch (err) {
      setError(err.message)
    } finally {
      setRunning(false)
    }
  }
  return (
    <div className="code-workspace">
      <div className="challenge-heading panel">
        <div>
          <span className="eyebrow">A LITTLE HANDS-ON LEARNING</span>
          <h2>{data.title}</h2>
          <p>{data.prompt}</p>
        </div>
        {completed && <Status status="completed" />}
      </div>
      <div className="editor-layout">
        <section className="editor-panel">
          <div className="editor-topbar">
            <span>
              <span className="editor-dots">
                <i />
                <i />
                <i />
              </span>
              main.cpp
            </span>
            <span>C++ · Ctrl / ⌘ Enter to run</span>
          </div>
          <label className="sr-only" htmlFor="code-editor">
            Code editor
          </label>
          <textarea
            id="code-editor"
            value={code}
            onChange={(e) => onCode(e.target.value)}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            className="code-editor"
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault()
                if (!running) run()
              }
            }}
          />
          <div className="editor-toolbar">
            <span>
              <span className="live-dot" />
              {running ? 'Running your code...' : 'Saved on this device'}
            </span>
            <div>
              <button
                className="editor-reset"
                onClick={() => {
                  onCode(data.starter)
                  setOutput(null)
                  setError('')
                }}
                disabled={running}
              >
                <RotateCcw size={15} />
                Reset code
              </button>
              <button
                className="button primary"
                onClick={run}
                disabled={running}
              >
                <Play size={15} fill="currentColor" />
                {running ? 'Running...' : 'Run code'}
              </button>
            </div>
          </div>
        </section>
        <aside className="challenge-sidebar">
          <section className="panel expected-output">
            <h3>
              <Terminal size={17} />
              Your goal
            </h3>
            <p>Make your program print this output:</p>
            <pre>{data.expectedOutput}</pre>
            <div className="input-area">
              <label className="field-label" htmlFor="program-input">
                Program input <span>(optional)</span>
              </label>
              <textarea
                id="program-input"
                placeholder="Input for cin, if needed"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={2}
              />
            </div>
          </section>
          <div className="practice-tip">
            <Lightbulb size={21} />
            <p>
              Change one thing at a time. Run your code, read the output, and
              try again.
            </p>
          </div>
          <button
            className="button secondary full"
            aria-expanded={showSolution}
            onClick={() => setShowSolution(!showSolution)}
          >
            <Eye size={16} />
            {showSolution ? 'Hide solution' : 'Show solution'}
          </button>
        </aside>
      </div>
      <section
        className={`panel program-output ${error ? 'has-error' : matched ? 'matched' : ''}`}
        role="region"
        aria-label="Program output"
      >
        <div className="output-heading">
          <h3>
            <Terminal size={17} />
            Program output
          </h3>
          {output && <span>Exit code: {output.exitCode}</span>}
          {running && <span className="running-indicator">Running...</span>}
        </div>
        <div aria-live="polite">
          {error ? (
            <div className="runtime-error">
              <AlertCircle size={18} />
              <pre>{error}</pre>
            </div>
          ) : output ? (
            <pre>{output.output || '(No output)'}</pre>
          ) : (
            <p className="output-placeholder">
              {running
                ? 'Your program is running. Results will appear here.'
                : 'Your output will appear here. Write a little code and press Run code.'}
            </p>
          )}
          {matched && (
            <div className="result-feedback">
              <CheckCircle2 size={18} />
              <span>Output matches! This activity is complete.</span>
            </div>
          )}
          {output && !matched && (
            <div className="result-feedback try-again">
              <AlertCircle size={18} />
              <span>
                {output.exitCode !== 0
                  ? 'Your program returned a nonzero exit code. Return 0 to finish successfully.'
                  : 'Not quite yet. Compare your result with the expected output and try again.'}
              </span>
            </div>
          )}
        </div>
      </section>
      {showSolution && (
        <section className="panel solution-panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">ONE WAY TO SOLVE IT</span>
              <h3>Read it. Understand it. Try it.</h3>
            </div>
            <button
              className="button secondary"
              onClick={() => {
                onCode(data.solution)
                setOutput(null)
                setError('')
                notify('Model solution loaded into the editor.')
              }}
              disabled={running}
            >
              <Copy size={15} />
              Use solution
            </button>
          </div>
          <pre className="code-block">
            <code>{data.solution}</code>
          </pre>
          {data.explanation && <p>{data.explanation}</p>}
        </section>
      )}
      <p className="runtime-caption">
        <Clock3 size={14} />
        Beginner C++ interpreter · 5-second execution limit · 12,000-character
        output limit · No full STL or file access
      </p>
    </div>
  )
}

function Assessment({ questions, kind, previousScore, onComplete }) {
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [missing, setMissing] = useState(false)
  const correct = questions.filter((q) => answers[q.id] === q.answer).length
  const score = Math.round((correct / questions.length) * 100)
  function submit(e) {
    e.preventDefault()
    if (Object.keys(answers).length !== questions.length) {
      setMissing(true)
      return
    }
    setSubmitted(true)
    setMissing(false)
    onComplete(score)
  }
  return (
    <div className="assessment-workspace">
      <div className="assessment-intro panel">
        <div>
          <span className="eyebrow">
            {kind === 'quiz' ? 'A QUICK CHECK-IN' : 'PUT IT ALL TOGETHER'}
          </span>
          <h2>
            {kind === 'quiz'
              ? 'How well did it stick?'
              : 'Your topic knowledge check.'}
          </h2>
          <p>
            Choose one answer for each question. Get at least 2 of 3 correct to
            complete this {kind}.
          </p>
        </div>
        <div className="assessment-meta">
          <span>
            <Clock3 size={16} />
            About 5 minutes
          </span>
          <span>
            <BookOpen size={16} />
            {questions.length} questions
          </span>
          {previousScore !== undefined && (
            <span>
              <Trophy size={16} />
              Last score: {previousScore}%
            </span>
          )}
        </div>
      </div>
      <form onSubmit={submit}>
        {questions.map((q, index) => (
          <fieldset
            key={q.id}
            className={`question-card panel ${submitted ? (answers[q.id] === q.answer ? 'correct-question' : 'incorrect-question') : ''}`}
          >
            <legend>
              <span className="question-number">
                QUESTION {String(index + 1).padStart(2, '0')}
              </span>
              <span className="question-text">{q.question}</span>
            </legend>
            <div className="answer-options">
              {q.options.map((option, optionIndex) => (
                <label
                  key={optionIndex}
                  className={`answer-option ${answers[q.id] === optionIndex ? 'selected' : ''} ${submitted && optionIndex === q.answer ? 'correct' : ''} ${submitted && answers[q.id] === optionIndex && optionIndex !== q.answer ? 'incorrect' : ''}`}
                >
                  <input
                    type="radio"
                    name={q.id}
                    value={optionIndex}
                    checked={answers[q.id] === optionIndex}
                    disabled={submitted}
                    onChange={() =>
                      setAnswers((prev) => ({ ...prev, [q.id]: optionIndex }))
                    }
                  />
                  <span className="option-letter">
                    {String.fromCharCode(65 + optionIndex)}
                  </span>
                  <span>{option}</span>
                  {submitted && optionIndex === q.answer ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <Circle size={17} className="option-circle" />
                  )}
                </label>
              ))}
            </div>
            {submitted && (
              <div
                className={`answer-explanation ${answers[q.id] === q.answer ? 'correct' : 'incorrect'}`}
              >
                <span>
                  {answers[q.id] === q.answer ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <Lightbulb size={18} />
                  )}
                </span>
                <p>
                  <strong>
                    {answers[q.id] === q.answer
                      ? 'You got it. '
                      : 'A chance to learn. '}
                  </strong>
                  {q.explanation}
                </p>
              </div>
            )}
          </fieldset>
        ))}
        {missing && (
          <div className="assessment-validation" role="alert">
            <AlertCircle size={17} />
            Please answer all {questions.length} questions before submitting.
          </div>
        )}
        {!submitted ? (
          <div className="assessment-submit">
            <span>
              {Object.keys(answers).length} of {questions.length} answered
            </span>
            <button type="submit" className="button primary">
              Submit {kind}
              <ArrowRight size={17} />
            </button>
          </div>
        ) : (
          <section
            className={`assessment-result panel ${score >= 67 ? 'passed' : 'review'}`}
            aria-label="Assessment result"
            aria-live="polite"
          >
            <span className="result-trophy">
              <Trophy size={31} />
            </span>
            <div>
              <span className="eyebrow">
                {score >= 67
                  ? 'A SMALL WIN WORTH CELEBRATING'
                  : 'EVERY TRY TEACHES YOU SOMETHING'}
              </span>
              <h2>
                {score >= 67
                  ? 'Well done. You’ve got this!'
                  : 'Keep going. You’re getting there.'}
              </h2>
              <p>
                {correct} / {questions.length} correct · {score}%
                {score >= 67
                  ? ' · Activity completed'
                  : ' · Review the explanations and try again'}
              </p>
            </div>
            <button
              type="button"
              className="button secondary"
              onClick={() => {
                setAnswers({})
                setSubmitted(false)
                setMissing(false)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            >
              <RotateCcw size={16} />
              Try again
            </button>
          </section>
        )}
      </form>
    </div>
  )
}

export default function Learning({
  topic,
  partId,
  state,
  openTopic,
  complete,
  saveCode,
  notify,
  goBack,
}) {
  const data = topic.parts[partId]
  const record = state.activities[activityId(topic.id, partId)] || {}
  const progress = topicProgress(state, topic.id)
  return (
    <>
      <div className="learning-breadcrumb">
        <button className="text-button" onClick={goBack}>
          <ArrowLeft size={16} />
          Back to workspace
        </button>
        <span>
          Topic 0{topic.number}
          <ChevronRight size={14} />
          {parts.find((p) => p.id === partId).label}
        </span>
      </div>
      <div className="topic-detail-heading">
        <TopicIcon topic={topic} size={28} />
        <div>
          <span className="eyebrow">
            TOPIC 0{topic.number} · C++ FOUNDATIONS
          </span>
          <h1>{topic.title}</h1>
          <p>{topic.description}</p>
        </div>
        <div className="detail-progress">
          <span>{progress}% complete</span>
          <ProgressBar value={progress} color={topic.color} />
        </div>
      </div>
      <div
        className="learning-tabs"
        role="tablist"
        aria-label="Learning sections"
      >
        {parts.map((p) => {
          const Icon = partIcons[p.id]
          const done =
            state.activities[activityId(topic.id, p.id)]?.status === 'completed'
          return (
            <button
              role="tab"
              aria-selected={partId === p.id}
              aria-controls="learning-tabpanel"
              id={`tab-${p.id}`}
              key={p.id}
              className={partId === p.id ? 'active' : ''}
              onClick={() => openTopic(topic.id, p.id)}
            >
              <Icon size={17} />
              <span>{p.label}</span>
              {done && <Check size={14} className="tab-complete" />}
            </button>
          )
        })}
      </div>
      <div
        role="tabpanel"
        id="learning-tabpanel"
        aria-labelledby={`tab-${partId}`}
      >
        {partId === 'notes' ? (
          <Notes
            data={data}
            completed={record.status === 'completed'}
            onComplete={() => complete(topic.id, partId)}
            next={() => openTopic(topic.id, 'exercise')}
          />
        ) : ['exercise', 'practical'].includes(partId) ? (
          <CodeWorkspace
            data={data}
            code={state.code[activityId(topic.id, partId)] ?? data.starter}
            onCode={(code) => saveCode(activityId(topic.id, partId), code)}
            completed={record.status === 'completed'}
            onComplete={() => complete(topic.id, partId)}
            notify={notify}
          />
        ) : (
          <Assessment
            questions={data}
            kind={partId}
            previousScore={record.score}
            onComplete={(score) => complete(topic.id, partId, score)}
          />
        )}
      </div>
    </>
  )
}
