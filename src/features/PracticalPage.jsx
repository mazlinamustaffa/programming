import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, Code2, Download, FileText, Play, SquareTerminal, TriangleAlert } from 'lucide-react'
import { practicals } from '../data/practicals.js'
import { topics } from '../data/topics.js'
import { downloadFile } from '../lib/storage.js'
import { formatTimer, practicalMarks, remainingSeconds } from '../lib/assessment.js'

function asList(value) {
  if (Array.isArray(value)) return value
  return value ? [value] : []
}

function taskText(task, topic) {
  const section = (title, value) => `${title}\n${asList(value).map((item, index) => `${index + 1}. ${item}`).join('\n')}\n`
  return [
    'PROGRAMMING FUNDAMENTALS',
    'LEARN • PRACTICE • CODE • ACHIEVE',
    `Topic ${topic.number}: ${topic.title}`,
    task.title,
    'Duration: 60 minutes | Maximum rubric mark: 100',
    'Lecturer: Ts. Mazlina Md Mustaffa',
    '',
    'AI-assisted educational task: lecturer verification is required before formal assessment.',
    '',
    section('LEARNING OBJECTIVES', task.objectives),
    section('PROBLEM SCENARIO', task.scenario),
    section('PRACTICAL INSTRUCTIONS', task.instructions),
    section('INPUT REQUIREMENTS', task.inputRequirements),
    section('PROCESSING REQUIREMENTS', task.processingRequirements),
    section('OUTPUT REQUIREMENTS', task.outputRequirements),
    section('EXPECTED PROGRAM BEHAVIOUR', task.expectedBehaviour),
    task.sampleInput ? `SAMPLE INPUT\n${task.sampleInput}\n` : '',
    task.sampleOutput ? `SAMPLE OUTPUT\n${task.sampleOutput}\n` : '',
    task.starterCode ? `STARTER CODE\n${task.starterCode}\n` : '',
    section('SUBMISSION REQUIREMENTS', task.submissionRequirements),
    `ASSESSMENT RUBRIC\n${task.rubric.map((criterion) => `${criterion.label} (${criterion.marks} marks): ${criterion.descriptor}`).join('\n')}\nTotal: 100 marks. Lecturer marking is required.`,
    '',
    topic.number === 1 ? 'DRY-RUN AND VERIFICATION' : 'COMPILATION AND EXECUTION',
    topic.number === 1
      ? 'Trace your algorithm, pseudocode, and flowchart by hand using independently calculated test cases. Optional C++ implementation requires lecturer approval and is not part of this task’s required evidence.'
      : 'Use your own approved C++ IDE or local compiler. For example: g++ -std=c++17 -Wall -Wextra main.cpp -o practical',
    topic.number === 1 ? '' : 'Run ./practical on macOS/Linux, or practical.exe on Windows. Test normal, boundary and invalid inputs as appropriate.',
    'This website does not compile, run or automatically submit practical source files. Submit through the channel specified by your lecturer.',
    '',
    'Prepared by 3M@MazlinaMdMustaffa',
  ].filter(Boolean).join('\n\n')
}

function TaskSection({ title, values, numbered = false }) {
  const ListTag = numbered ? 'ol' : 'ul'
  const items = asList(values)
  if (!items.length) return null
  return <section className="pa-task-section"><h3>{title}</h3><ListTag>{items.map((item, index) => <li key={index}>{item}</li>)}</ListTag></section>
}

function PracticalExperience({ task, topic, hub, updateHub, notify, navigate, onBack }) {
  const [now, setNow] = useState(() => Date.now())
  const [worksheetOpen, setWorksheetOpen] = useState(false)
  const [markError, setMarkError] = useState('')
  const attempt = hub.practicals?.[topic.id]
  const endTime = attempt?.finishedAt || now
  const seconds = attempt?.deadline ? remainingSeconds(attempt.deadline, endTime) : 60 * 60
  const active = attempt?.status === 'in-progress'
  const expired = active && seconds === 0

  useEffect(() => {
    if (!attempt?.startedAt || attempt.status !== 'in-progress') return undefined
    const timer = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(timer)
  }, [attempt?.startedAt, attempt?.status, attempt])

  function start() {
    const timestamp = Date.now()
    updateHub((previous) => ({
      ...previous,
      practicals: { ...previous.practicals, [topic.id]: { startedAt: timestamp, deadline: timestamp + 60 * 60 * 1000, status: 'in-progress' } },
      // Keep previous records available instead of silently discarding lecturer marks.
      practicalHistory: {
        ...previous.practicalHistory,
        [topic.id]: previous.practicals?.[topic.id]
          ? [...(previous.practicalHistory?.[topic.id] || []), previous.practicals[topic.id]].slice(-20)
          : previous.practicalHistory?.[topic.id] || [],
      },
    }))
    setNow(timestamp)
    setWorksheetOpen(false)
    setMarkError('')
    notify?.('Practical timer started. Compile and test in your approved C++ environment.')
  }

  function markReady() {
    const timestamp = Date.now()
    updateHub((previous) => {
      const current = previous.practicals?.[topic.id]
      if (!current) return previous
      return { ...previous, practicals: { ...previous.practicals, [topic.id]: { ...current, status: 'evidence-ready', finishedAt: Math.min(timestamp, current.deadline) } } }
    })
    notify?.('Marked ready on this device. Submit your actual files using your lecturer’s chosen channel.')
  }

  function saveMarks(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const criteria = {}
    for (const criterion of task.rubric) {
      const raw = form.get(criterion.id)
      const value = Number(raw)
      if (raw === '' || !Number.isFinite(value) || value < 0 || value > criterion.marks) {
        setMarkError(`Enter a mark from 0 to ${criterion.marks} for ${criterion.label}.`)
        return
      }
      criteria[criterion.id] = value
    }
    const timestamp = Date.now()
    const total = practicalMarks(task.rubric, criteria)
    updateHub((previous) => ({
      ...previous,
      practicals: { ...previous.practicals, [topic.id]: { ...previous.practicals?.[topic.id], status: 'assessed', criteria, marks: total, assessedAt: timestamp, finishedAt: previous.practicals?.[topic.id]?.finishedAt || (previous.practicals?.[topic.id]?.deadline ? Math.min(timestamp, previous.practicals[topic.id].deadline) : undefined), markingNote: String(form.get('markingNote') || '').slice(0, 2000), markingSource: 'lecturer-entered-local' } },
    }))
    setMarkError('')
    notify?.(`Lecturer worksheet saved locally: ${total}/100. This is not an authenticated gradebook.`)
  }

  function downloadTask() {
    downloadFile(`programming-fundamentals-topic-${topic.number}-practical.txt`, taskText(task, topic))
    notify?.('The complete practical task and marking rubric have been downloaded.')
  }

  return (
    <div className="pa-page">
      {onBack && <button className="text-button pa-back" onClick={onBack}><ArrowLeft size={16} /> All practical assessments</button>}
      <div className="page-heading"><div><span className="eyebrow">Topic {topic.number} · Hands-on practical assessment</span><h1>{task.title}</h1><p>{topic.title} · Demonstrate practical skills through authentic evidence.</p></div><span className="badge"><Clock3 size={16} /> 60 minutes · 100 marks</span></div>
      <section className={`panel pa-hero theme-${topic.color || 'purple'}`}>
        <div className="pa-hero-copy"><span className="eyebrow">Plan. Construct. Test. Reflect.</span><h2>{topic.number === 1 ? 'Turn a real problem into a clear solution.' : 'Build something that works.'}</h2><p>Read the task and rubric before starting. Your practical work is assessed by your lecturer using observable evidence, not automatic MCQ scoring.</p><div className="pa-hero-actions"><a className="button secondary" href="#practical-task"><FileText size={17} /> Read task</a>{!active ? <button className="button primary" onClick={start}><Play size={17} /> {attempt ? 'Start a new 60-minute attempt' : 'Start practical'}</button> : <span className="badge">{expired ? 'Time finished' : 'Practical in progress'}</span>}<a className="button secondary" href="#practical-rubric">View rubric</a><button className="button secondary" onClick={downloadTask}><Download size={17} /> Download task</button></div></div>
        <div className={`pa-clock ${seconds <= 600 && active ? 'urgent' : ''}`} role="timer" aria-label="Practical time remaining"><Clock3 size={22} /><strong>{formatTimer(seconds)}</strong><span>{attempt ? 'Time remaining' : 'Practical duration'}</span></div>
      </section>
      {active && seconds <= 600 && seconds > 0 && <div className="pa-warning" role="status"><TriangleAlert size={20} /><div><b>10 minutes or less remain.</b><p>Finish testing, capture your output, and prepare the required evidence.</p></div></div>}
      {expired && <div className="pa-warning" role="status"><Clock3 size={20} /><div><b>Your 60-minute practical timer has finished.</b><p>Your source files have not been submitted automatically. Save your work and submit through the channel specified by your lecturer.</p></div></div>}
      <div className="pa-local-note"><CheckCircle2 size={17} /><span>Timer and status are saved on this device. Source files stay in your own development environment.</span>{attempt?.status === 'evidence-ready' && <span className="badge">Evidence ready</span>}{attempt?.status === 'assessed' && <span className="badge">Local lecturer record · {attempt.marks}/100</span>}</div>

      <div className="pa-content-layout" id="practical-task">
        <article className="panel pa-task-body">
          <span className="eyebrow">Practical question sheet</span><h2>Your mission</h2>
          <TaskSection title="Learning objectives" values={task.objectives} />
          <TaskSection title="Problem scenario" values={task.scenario} />
          <TaskSection title="Practical instructions" values={task.instructions} numbered />
          <div className="pa-ipo-grid"><TaskSection title="Input requirements" values={task.inputRequirements} /><TaskSection title="Processing requirements" values={task.processingRequirements} /><TaskSection title="Output requirements" values={task.outputRequirements} /></div>
          <TaskSection title="Expected program behaviour" values={task.expectedBehaviour} />
          {(task.sampleInput || task.sampleOutput) && <div className="pa-samples">{task.sampleInput && <section><h3>Sample input</h3><pre><code>{task.sampleInput}</code></pre></section>}{task.sampleOutput && <section><h3>Sample output</h3><pre><code>{task.sampleOutput}</code></pre></section>}</div>}
          {task.starterCode && <section className="pa-task-section"><h3>Starter scaffold</h3><p className="muted">Complete the scaffold yourself. This example has been prepared with AI assistance and needs human verification.</p><pre><code>{task.starterCode}</code></pre></section>}
          <TaskSection title="Submission requirements" values={task.submissionRequirements} />
          {attempt && attempt.status === 'in-progress' && <div className="pa-evidence-action"><button className="button primary" onClick={markReady}><CheckCircle2 size={17} /> Mark evidence ready on this device</button><p className="muted">This records your preparation status. It does not upload or submit your files.</p></div>}
        </article>
        <aside className="pa-side-stack">
          <section className="panel pa-compile-card"><span className="topic-icon"><SquareTerminal size={24} /></span>{topic.number === 1 ? <><h2>Trace your planned solution</h2><p>Check the IPO table, algorithm, flowchart, and pseudocode by hand. Use the same inputs in every representation and compare the results with your own calculations.</p><p className="muted">C++ implementation is optional only after lecturer approval. It is not required for this Topic 1 task.</p></> : <><h2>Use your real C++ environment</h2><p>Compile, execute, test, and debug using the IDE approved by your lecturer, such as Code::Blocks, Visual Studio, or a local GCC compiler.</p><pre><code>g++ -std=c++17 -Wall -Wextra main.cpp -o practical</code></pre><p>Run <code>./practical</code> on macOS/Linux or <code>practical.exe</code> on Windows.</p><p className="muted">This assessment page does not compile or execute code. The Practice Lab is a separate, limited learning sandbox.</p></>}<button className="button secondary" onClick={() => navigate?.('practice')}><Code2 size={17} /> Open Practice Lab</button></section>
          <section className="panel pa-checklist"><span className="eyebrow">Before submission</span><h2>Evidence checklist</h2><ul><li>Read the scenario and identify requirements.</li><li>Prepare your algorithm or pseudocode.</li><li>Test normal and boundary cases.</li><li>Capture your actual output.</li><li>Explain corrections and debugging.</li><li>Submit your own work and disclose AI support.</li></ul><p className="muted">Use your lecturer’s LMS, email, or other specified submission channel.</p></section>
        </aside>
      </div>

      <section className="panel pa-rubric" id="practical-rubric"><div className="section-heading"><div><span className="eyebrow">Observable, evidence-based assessment</span><h2>Practical marking rubric</h2><p>Maximum 100 marks. Lecturer marking is required.</p></div><span className="badge">{task.rubric.reduce((sum, item) => sum + item.marks, 0)} total marks</span></div><div className="pa-rubric-scroll"><table><caption className="sr-only">Assessment rubric for {task.title}</caption><thead><tr><th scope="col">Criterion</th><th scope="col">Marks</th><th scope="col">Observable evidence</th></tr></thead><tbody>{task.rubric.map((criterion) => <tr key={criterion.id}><th scope="row">{criterion.label}</th><td>{criterion.marks}</td><td>{criterion.descriptor}</td></tr>)}</tbody></table></div><div className="pa-worksheet-toggle"><button className="button secondary" onClick={() => setWorksheetOpen((value) => !value)}>{worksheetOpen ? 'Close lecturer worksheet' : 'Open lecturer marking worksheet'}</button><span className="muted">Local manual record · No authenticated gradebook</span></div>
        {worksheetOpen && <form className="pa-mark-form" onSubmit={saveMarks}><div className="pa-mark-notice"><TriangleAlert size={19} /><p>For lecturer-entered marks only. This browser worksheet is not an authenticated assessment system. Anyone using this device can edit it. Store official grades in your approved institutional system.</p></div><div className="pa-mark-grid">{task.rubric.map((criterion) => <label className="field-label" key={criterion.id}>{criterion.label}<span className="muted">0–{criterion.marks} marks</span><input className="text-input" name={criterion.id} type="number" min="0" max={criterion.marks} step="1" required defaultValue={attempt?.criteria?.[criterion.id] ?? ''} /></label>)}</div><label className="field-label">Lecturer feedback (optional)<textarea className="text-input" name="markingNote" rows="3" maxLength="2000" defaultValue={attempt?.markingNote || ''} placeholder="Record observable strengths and next steps." /></label>{markError && <p className="pa-error" role="alert">{markError}</p>}<div className="pa-mark-actions"><button className="button primary" type="submit"><CheckCircle2 size={17} /> Save local lecturer record</button>{attempt?.marks !== undefined && <strong>Saved total: {attempt.marks}/100</strong>}</div></form>}
      </section>
    </div>
  )
}

export default function PracticalPage(props) {
  const [selectedTopic, setSelectedTopic] = useState(null)
  const activeTopicId = props.topicId || selectedTopic
  const topic = topics.find((item) => String(item.id) === String(activeTopicId))
  const task = practicals.find((item) => String(item.topicId) === String(activeTopicId))
  if (topic && task) return <PracticalExperience key={topic.id} {...props} topic={topic} task={task} onBack={props.topicId ? undefined : () => setSelectedTopic(null)} />
  return (
    <div className="pa-page"><div className="page-heading"><div><span className="eyebrow">Make your knowledge tangible</span><h1>Practical Assessment</h1><p>Five authentic tasks. Plan your solution, construct it, test it, and show your evidence.</p></div><span className="badge"><Clock3 size={16} /> 60 minutes per practical</span></div><div className="pa-local-note"><TriangleAlert size={17} /><span>Practical work is marked by your lecturer. The browser timer does not upload or submit source files.</span></div><div className="pa-topic-grid">{topics.map((item) => { const practical = practicals.find((candidate) => String(candidate.topicId) === String(item.id)); const saved = props.hub.practicals?.[item.id]; if (!practical) return null; return <article className={`panel pa-topic-card theme-${item.color || 'purple'}`} key={item.id}><div className="pa-topic-top"><span className="topic-icon"><Code2 size={24} /></span><span className="badge">Topic {item.number}</span></div><h2>{practical.title}</h2><p>{item.title}</p><div className="pa-card-meta"><span><Clock3 size={16} /> 60 minutes</span><span>100 marks</span></div><span className={`pa-card-status ${saved?.status || 'not-started'}`}>{saved?.status === 'assessed' ? `Local lecturer record: ${saved.marks}/100` : saved?.status === 'evidence-ready' ? 'Evidence ready on this device' : saved?.status === 'in-progress' ? 'Practical in progress' : 'Ready to begin'}</span><div className="pa-card-actions"><button className="button primary" onClick={() => setSelectedTopic(item.id)}>Read task <ArrowRight size={16} /></button><button className="button secondary" aria-label={`Download Topic ${item.number} practical task`} onClick={() => downloadFile(`programming-fundamentals-topic-${item.number}-practical.txt`, taskText(practical, item))}><Download size={17} /></button></div></article> })}</div></div>
  )
}
