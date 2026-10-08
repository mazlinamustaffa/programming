import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, ListChecks, Play, RotateCcw, Trophy } from 'lucide-react'
import { quizzes } from '../data/quizzes.js'
import { topics } from '../data/topics.js'
import { BLOOM_LEVELS, completeAttempt, createAttempt, formatTimer, remainingSeconds } from '../lib/assessment.js'

const bloomNames = { C1: 'Remember', C2: 'Understand', C3: 'Apply', C4: 'Analyze' }

function QuizExperience({ quiz, topic, hub, updateHub, notify, onBack }) {
  const [questionIndex, setQuestionIndex] = useState(0)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const attempt = hub.quizAttempts?.[topic.id]
  const questions = useMemo(() => attempt?.questionsSnapshot?.length === 10 ? attempt.questionsSnapshot : quiz.questions, [attempt?.questionsSnapshot, quiz.questions])
  const seconds = attempt ? remainingSeconds(attempt.deadline, now) : quiz.durationSeconds
  const result = attempt?.result
  const answered = questions.filter((question) => Number.isInteger(attempt?.answers?.[question.id])).length
  const currentQuestion = questions[Math.min(questionIndex, questions.length - 1)]

  const submit = useCallback((submissionTime) => {
    updateHub((previous) => {
      const latest = previous.quizAttempts?.[topic.id]
      if (!latest || latest.submittedAt) return previous
      return {
        ...previous,
        quizAttempts: {
          ...previous.quizAttempts,
          [topic.id]: completeAttempt(latest, latest.questionsSnapshot || quiz.questions, submissionTime),
        },
      }
    })
  }, [quiz.questions, topic.id, updateHub])

  useEffect(() => {
    if (!attempt || attempt.submittedAt) return undefined
    // Check immediately: a quiz can have expired while the browser was closed.
    if (remainingSeconds(attempt.deadline, Date.now()) === 0) submit(Date.now())
    const timer = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(timer)
  }, [attempt?.deadline, attempt?.submittedAt, attempt, submit])

  useEffect(() => {
    if (attempt && !attempt.submittedAt && seconds === 0) submit(now)
  }, [attempt, seconds, submit, now])

  function start() {
    const timestamp = Date.now()
    updateHub((previous) => {
      return {
        ...previous,
        quizAttempts: { ...previous.quizAttempts, [topic.id]: createAttempt(quiz, timestamp) },
      }
    })
    setNow(timestamp)
    setQuestionIndex(0)
    setReviewOpen(false)
    notify?.('Quiz started. Your answers and timer are saved on this device.')
  }

  function selectAnswer(optionIndex, timestamp) {
    updateHub((previous) => {
      const latest = previous.quizAttempts?.[topic.id]
      if (!latest || latest.submittedAt) return previous
      if (remainingSeconds(latest.deadline, timestamp) === 0) {
        return { ...previous, quizAttempts: { ...previous.quizAttempts, [topic.id]: completeAttempt(latest, questions, timestamp) } }
      }
      return {
        ...previous,
        quizAttempts: { ...previous.quizAttempts, [topic.id]: { ...latest, answers: { ...latest.answers, [currentQuestion.id]: optionIndex } } },
      }
    })
  }

  return (
    <div className="qz-page">
      {onBack && <button className="text-button qz-back" onClick={onBack}><ArrowLeft size={16} /> All topic quizzes</button>}
      <div className="page-heading">
        <div><span className="eyebrow">Topic {topic.number} · Interactive theory quiz</span><h1>{topic.title}</h1><p>Think it through. Apply your C++ knowledge. Learn from every answer.</p></div>
        <span className="badge"><ListChecks size={15} /> 10 questions · 10 marks</span>
      </div>
      <div className="qz-device-note"><span className="qz-status-dot" /> Device-specific progress · Saved in this browser · No central student monitoring</div>

      {!attempt && (
        <section className={`panel qz-start-card theme-${topic.color || 'purple'}`}>
          <div className="qz-start-icon"><Trophy size={38} /></div>
          <span className="eyebrow">Ready for a new challenge?</span>
          <h2>Your 15-minute knowledge check</h2>
          <p>Answer exactly 10 multiple-choice questions. Each correct answer earns one mark. Incorrect and unanswered questions earn zero marks. The quiz submits automatically when time expires.</p>
          <div className="qz-facts"><span><Clock3 size={18} /> 15 minutes</span><span><CheckCircle2 size={18} /> 1 mark per correct answer</span><span><ListChecks size={18} /> Four Bloom levels</span></div>
          <div className="qz-bloom-plan">{BLOOM_LEVELS.map((level, index) => <span key={level}><b>{level}</b> {bloomNames[level]} · {[2, 3, 3, 2][index]} questions</span>)}</div>
          <button className="button primary" onClick={start}><Play size={17} /> Start quiz</button>
        </section>
      )}

      {attempt && !result && (
        <div className="qz-active-layout">
          <aside className="panel qz-navigation">
            <div className={`qz-timer ${seconds <= 120 ? 'urgent' : ''}`} role="timer" aria-label="Quiz time remaining"><Clock3 size={20} /><strong>{formatTimer(seconds)}</strong><span>Time remaining</span></div>
            <div className="qz-nav-heading"><h2>Question navigator</h2><span>{answered}/10 answered</span></div>
            <div className="qz-question-grid">{questions.map((question, index) => <button key={question.id} aria-label={`Question ${index + 1}${Number.isInteger(attempt.answers?.[question.id]) ? ', answered' : ', unanswered'}`} aria-current={index === questionIndex ? 'step' : undefined} className={`qz-question-dot ${index === questionIndex ? 'current' : ''} ${Number.isInteger(attempt.answers?.[question.id]) ? 'answered' : ''}`} onClick={() => setQuestionIndex(index)}>{index + 1}</button>)}</div>
            <div className="qz-progress" role="progressbar" aria-label="Questions answered" aria-valuenow={answered} aria-valuemin={0} aria-valuemax={10}><span style={{ width: `${answered * 10}%` }} /></div>
            <p className="muted">You can move between questions and change your answers before submission.</p>
            <p className="qz-submit-note">{10 - answered} unanswered · These receive zero marks.</p>
            <button className="button primary qz-submit" onClick={() => submit(Date.now())}><CheckCircle2 size={17} /> Submit quiz</button>
          </aside>
          <section className="panel qz-question-card" key={currentQuestion.id}>
            <div className="qz-question-meta"><span className="eyebrow">Question {questionIndex + 1} of 10</span><span className={`badge bloom-${currentQuestion.bloom}`}>{currentQuestion.bloom} · {bloomNames[currentQuestion.bloom]}</span></div>
            <fieldset className="qz-options-fieldset"><legend>{currentQuestion.question}</legend><div className="qz-options">{currentQuestion.options.map((option, index) => <label key={index} className={`qz-option ${attempt.answers?.[currentQuestion.id] === index ? 'selected' : ''}`}><input type="radio" name={`answer-${currentQuestion.id}`} value={index} checked={attempt.answers?.[currentQuestion.id] === index} onChange={() => selectAnswer(index, Date.now())} /><span className="qz-option-letter">{'ABCD'[index]}</span><span>{option}</span>{attempt.answers?.[currentQuestion.id] === index && <CheckCircle2 size={19} aria-hidden="true" />}</label>)}</div></fieldset>
            <div className="qz-question-actions"><button className="button secondary" disabled={questionIndex === 0} onClick={() => setQuestionIndex((value) => value - 1)}><ArrowLeft size={16} /> Previous</button><span className="muted">Answers save automatically</span><button className="button primary" disabled={questionIndex === questions.length - 1} onClick={() => setQuestionIndex((value) => value + 1)}>Next <ArrowRight size={16} /></button></div>
          </section>
        </div>
      )}

      {result && (
        <>
          <section className="panel qz-result-card">
            <div className="qz-score-orb"><Trophy size={27} /><strong>{result.score}<small>/10</small></strong><span>{result.percentage}%</span></div>
            <div className="qz-result-main"><span className="eyebrow">Knowledge check complete</span><h2>{result.score >= 8 ? 'Brilliant progress!' : result.score >= 5 ? 'Keep building your confidence.' : 'A fresh opportunity to learn.'}</h2><p>Review the explanations, revisit the topic notes, and try again when you are ready.</p><div className="qz-result-facts"><span><b>{result.correct}</b> correct</span><span><b>{result.incorrect}</b> incorrect</span><span><b>{result.unanswered}</b> unanswered</span><span><b>{formatTimer(result.timeUsedSeconds)}</b> time used</span></div><div className="qz-result-actions"><button className="button primary" onClick={() => setReviewOpen((value) => !value)}><ListChecks size={17} /> {reviewOpen ? 'Hide review' : 'Review answers'}</button><button className="button secondary" onClick={start}><RotateCcw size={17} /> Retry quiz (new attempt)</button></div></div>
          </section>
          <section className="panel qz-bloom-results"><div className="section-heading"><div><span className="eyebrow">Your thinking skills</span><h2>Bloom’s performance breakdown</h2><p>Use this guide to choose your next learning focus.</p></div></div><div className="qz-bloom-grid">{BLOOM_LEVELS.map((level) => { const performance = result.bloomBreakdown[level]; return <div key={level} className={`qz-bloom-card bloom-${level}`}><span>{level} · {bloomNames[level]}</span><strong>{performance.correct}<small>/{performance.total}</small></strong><div className="qz-progress" role="progressbar" aria-label={`${bloomNames[level]} correct answers`} aria-valuenow={performance.correct} aria-valuemin={0} aria-valuemax={performance.total}><span style={{ width: `${performance.total ? performance.correct / performance.total * 100 : 0}%` }} /></div></div> })}</div></section>
          {reviewOpen && <section className="qz-review"><h2>Review your answers</h2>{questions.map((question, index) => { const review = result.review.find((entry) => entry.questionId === question.id); return <article className={`panel qz-review-card ${review?.correct ? 'correct' : 'incorrect'}`} key={question.id}><div className="qz-question-meta"><span className="eyebrow">Question {index + 1} · {question.bloom} {bloomNames[question.bloom]}</span><span className="badge">{review?.correct ? 'Correct · 1 mark' : review?.selected === null ? 'Unanswered · 0 marks' : 'Incorrect · 0 marks'}</span></div><h3>{question.question}</h3><p><b>Your answer:</b> {review?.selected === null ? 'Not answered' : `${'ABCD'[review?.selected]}. ${question.options[review?.selected]}`}</p><p className="qz-correct-answer"><b>Correct answer:</b> {'ABCD'[question.answer]}. {question.options[question.answer]}</p><div className="qz-explanation"><b>The reasoning</b><p>{question.explanation}</p></div></article> })}</section>}
        </>
      )}
    </div>
  )
}

export default function QuizPage(props) {
  const [selectedTopic, setSelectedTopic] = useState(null)
  const activeTopicId = props.topicId || selectedTopic
  const topic = topics.find((item) => String(item.id) === String(activeTopicId))
  const quiz = quizzes.find((item) => String(item.topicId) === String(activeTopicId))
  if (topic && quiz) return <QuizExperience key={topic.id} {...props} topic={topic} quiz={quiz} onBack={props.topicId ? undefined : () => setSelectedTopic(null)} />
  return (
    <div className="qz-page">
      <div className="page-heading"><div><span className="eyebrow">Challenge your understanding</span><h1>Interactive Quiz</h1><p>Five topics. Fifty purposeful questions. Build confidence one challenge at a time.</p></div><span className="badge"><Clock3 size={16} /> 15 minutes per quiz</span></div>
      <div className="qz-device-note"><span className="qz-status-dot" /> Your results stay on this device. They are not official lecturer-assigned grades.</div>
      <div className="qz-topic-grid">{topics.map((item) => { const saved = props.hub.quizAttempts?.[item.id]; return <article className={`panel qz-topic-card theme-${item.color || 'purple'}`} key={item.id}><div className="qz-topic-top"><span className="topic-icon"><ListChecks size={23} /></span><span className="badge">Topic {item.number}</span></div><h2>{item.title}</h2><p>10 questions · C1–C4 thinking skills · Instant feedback after submission</p><div className="qz-card-meta"><Clock3 size={16} /><span>15 minutes</span>{saved?.result && <strong>{saved.result.score}/10 last attempt</strong>}</div><button className="button primary" onClick={() => setSelectedTopic(item.id)}>{saved?.result ? 'View results' : saved ? 'Resume quiz' : 'Explore quiz'}<ArrowRight size={16} /></button></article> })}</div>
    </div>
  )
}
