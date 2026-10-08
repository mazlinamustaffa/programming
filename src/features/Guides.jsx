import { useState } from 'react'
import {
  ArrowRight, BadgeCheck, BookOpen, CheckCircle2, ClipboardCheck, Download,
  Eye, FileCheck2, GraduationCap, HeartHandshake, Lightbulb, LockKeyhole,
  Scale, ShieldCheck, Sparkles, Users, Workflow,
} from 'lucide-react'
import './guides.css'

const principles = [
  { icon: GraduationCap, title: 'Your thinking comes first', color: 'purple', text: 'Attempt the problem and explain your algorithm before asking AI for help. Use hints to strengthen your understanding, then write and test your own C++ solution.', example: 'Ask: “Give me one hint for choosing a loop, without writing the solution.”' },
  { icon: BadgeCheck, title: 'Protect academic integrity', color: 'blue', text: 'Follow the lecturer’s assessment rules. Do not submit someone else’s code, an AI answer, or a copied explanation as your own work.', example: 'Keep your initial attempt, revisions and testing evidence. Explain every line you submit.' },
  { icon: Eye, title: 'Be transparent about AI', color: 'pink', text: 'Disclose the tool, the help received and your changes whenever AI is permitted. A disclosure does not make otherwise prohibited assistance acceptable.', example: '“I used an AI assistant to suggest test cases. I wrote the program and verified each result myself.”' },
  { icon: FileCheck2, title: 'Verify every suggestion', color: 'teal', text: 'AI can produce incorrect C++ syntax, unsafe array access or inaccurate explanations. Check authoritative material, compile your code and test ordinary and boundary inputs.', example: 'For an array of five values, valid indices are 0 to 4. Verify that a suggested loop stops before index 5.' },
  { icon: Scale, title: 'Recognise bias and assumptions', color: 'orange', text: 'Question examples that stereotype people, assume everyone has the same resources, or favour one language or perspective. Replace them with inclusive, relevant scenarios.', example: 'Choose sample names and contexts fairly. Check whether an explanation assumes knowledge a beginner has not learned.' },
  { icon: LockKeyhole, title: 'Keep private information private', color: 'green', text: 'Do not paste student identifiers, grades, passwords, private assessment files or another person’s work into an external AI service. Check its privacy policy before use.', example: 'Use fictional inputs such as five anonymous marks. Keep personal details out of code samples.' },
  { icon: HeartHandshake, title: 'Choose accessible alternatives', color: 'yellow', text: 'AI access is optional. Course notes, worked examples, peer discussion and lecturer guidance remain valid ways to learn. Ask for an accessible alternative when you need one.', example: 'You do not need a paid AI account to complete the activities in this hub.' },
]

const scenarios = [
  { title: 'A hint that helps you learn', scenario: 'After attempting an array task, a learner asks an AI assistant to explain an off-by-one error. The learner fixes the loop, tests it and discloses the help.', good: true, feedback: 'Appropriate when the lecturer permits AI assistance. The learner keeps ownership of the solution, verifies the correction and records the support received.' },
  { title: 'A ready-made assessment solution', scenario: 'A learner copies a complete AI-generated practical solution, changes the variable names and submits it without disclosure.', good: false, feedback: 'This misrepresents authorship and does not demonstrate the learner’s practical skills. Rebuild the solution independently and follow the lecturer’s assessment rules.' },
  { title: 'A spreadsheet of student records', scenario: 'A learner pastes a class list with student identifiers and actual grades into a public AI tool to generate sample array data.', good: false, feedback: 'This exposes personal information without a learning need. Use anonymous fictional values and follow institutional privacy requirements.' },
  { title: 'A claim without a test', scenario: 'An AI assistant says that a C++ program works for every input. A learner submits it without compiling it or testing boundary cases.', good: false, feedback: 'AI confidence is not evidence. Compile the program, predict expected outputs, test normal and boundary inputs, and document any corrections.' },
]

const evidence = [
  { id: 1, category: 'Teaching & learning', criterion: 'Curriculum alignment', feature: 'Five topic pages, stated learning objectives, C1–C4 quizzes and topic-specific practical tasks.', route: 'learning', action: 'Open learning', gap: 'Compare every objective and assessment with the official syllabus. Verify Topic 5 coverage through 5.2.3 and retain a signed mapping; exact official wording has not been supplied.' },
  { id: 2, category: 'Teaching & learning', criterion: 'Real instructional problems', feature: 'Beginner scenarios ask learners to plan algorithms, build C++ programs, test outputs and diagnose errors.', route: 'practical', action: 'Open practicals', gap: 'Document the original teaching problem, learner needs and pilot feedback. Practical scenarios alone do not prove impact.' },
  { id: 3, category: 'Teaching & learning', criterion: 'Inclusive learning', feature: 'Responsive layouts, readable text, reduced motion, adjustable text size and optional Bahasa Melayu explanations.', route: 'learning', action: 'Open learning', gap: 'Complete a keyboard, screen reader and contrast audit. Obtain accessibility and bilingual feedback from the target cohort.' },
  { id: 4, category: 'Teaching & learning', criterion: 'Critical thinking', feature: 'C3 application, C4 analysis, code tracing, debugging, test cases and reflection prompts.', route: 'quiz', action: 'Open quizzes', gap: 'Review learner reasoning and examples of improved debugging. Moderate question difficulty and cognitive level with another lecturer.' },
  { id: 5, category: 'Teaching & learning', criterion: 'Ethical and assessable engagement', feature: 'Transparent quiz marking, observable 100-mark practical rubrics and responsible AI guidance.', route: 'responsible-ai', action: 'Open AI guidance', gap: 'Publish institutional assessment and AI-use rules. Retain lecturer-marked submissions and rubric moderation evidence in an approved system.' },
  { id: 6, category: 'Ethical considerations & bias', criterion: 'Purpose-built educational use', feature: 'Semester 1 C++ activities progress from problem solving to variables, control structures, arrays and functions.', route: 'learning', action: 'Open learning', gap: 'Record the design rationale, lesson implementation and evidence that the platform addresses the identified learners’ needs.' },
  { id: 7, category: 'Ethical considerations & bias', criterion: 'AI transparency', feature: 'AI-assisted content is labelled for verification; disclosure examples and human-review guidance explain appropriate use.', route: 'responsible-ai', action: 'Open AI guidance', gap: 'Keep an authoring record and dated human verification log. Review examples for accuracy, bias and permitted assessment use.' },
  { id: 8, category: 'Ethical considerations & bias', criterion: 'Equitable accessibility', feature: 'Public static access, no paid backend requirement, downloadable tasks and browser-based learning resources.', route: 'practical', action: 'Open task downloads', gap: 'Test on lower-end phones and limited bandwidth. Offer accessible alternatives for uploaded images/PDFs and students without a suitable IDE.' },
  { id: 9, category: 'Practical implementation & support', criterion: 'Intuitive interface', feature: 'Consistent navigation, topic resource cards, previews, visible progress and guided content publication.', route: 'manager', action: 'Open Content Manager', gap: 'Conduct a usability study with students and a non-technical lecturer. Record task success, errors and improvements.' },
  { id: 10, category: 'Practical implementation & support', criterion: 'LMS and SSO compatibility', feature: 'The permanent site URL, task downloads and exported content can be shared through an institutional LMS.', route: null, action: null, gap: 'No LMS grade sync, roster integration or SSO is implemented. Confirm institution requirements and separately validate any proposed integration with authorised secure infrastructure.' },
  { id: 11, category: 'Practical implementation & support', criterion: 'Monitoring and continuous improvement', feature: 'Device-specific progress, quiz feedback, learning reflections and CSV export support learner self-monitoring.', route: 'progress', action: 'Open progress', gap: 'No central lecturer analytics exist. With consent, collect anonymised pilot feedback and approved assessment evidence, then document a continuous quality improvement cycle.' },
]

function downloadText(name, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = name
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}

function GuideHeading({ eyebrow, title, children }) {
  return <div className="page-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{children}</p></div></div>
}

export function ResponsibleAI({ navigate, notify }) {
  const [scenarioIndex, setScenarioIndex] = useState(0)
  const [answer, setAnswer] = useState(null)
  const current = scenarios[scenarioIndex]
  function downloadDisclosure() {
    downloadText('responsible-ai-learning-checklist.txt', [
      'PROGRAMMING FUNDAMENTALS — Responsible AI learning checklist',
      'Lecturer: Ts. Mazlina Md Mustaffa',
      '',
      'Before using AI: Check the lecturer’s rules; attempt the task; remove personal information.',
      'While using AI: Ask for hints; question assumptions; keep a record of help received.',
      'Before submitting: Explain your code; compile and test; verify sources; disclose permitted assistance.',
      '',
      'AI assistance disclosure template',
      'Task:',
      'Tool and date:',
      'Assistance requested:',
      'My independent work and changes:',
      'Verification and test cases:',
      'Sources checked:',
      '',
      'AI assistance must be permitted by the lecturer. A disclosure does not override assessment rules.',
      'Prepared by 3M@MazlinaMdMustaffa',
    ].join('\n'))
    notify?.('Responsible AI checklist and disclosure template downloaded.')
  }
  return <div className="guide-page">
    <GuideHeading eyebrow="Learn with integrity" title="Responsible AI in Learning">AI is a learning assistant. Your reasoning, your verification and your work remain at the centre.</GuideHeading>
    <section className="panel guide-hero guide-ai-hero" aria-labelledby="ai-hero-title">
      <div className="guide-hero-icon"><ShieldCheck size={34} aria-hidden="true" /></div>
      <div><span className="badge">Human thinking. Human responsibility.</span><h2 id="ai-hero-title">Use AI to grow your skills.</h2><p>Ask better questions, compare explanations and test suggestions. Build the confidence to solve the next problem yourself.</p></div>
      <button type="button" className="button primary" onClick={downloadDisclosure}><Download size={18} aria-hidden="true" /> Download checklist</button>
    </section>
    <aside className="guide-disclosure" aria-label="Content transparency"><Sparkles size={20} aria-hidden="true" /><p><strong>AI-assisted teaching draft · human verification required.</strong> Learning notes, code examples, MCQs and practical briefs were prepared with AI assistance. The lecturer should verify correctness, syllabus alignment, bias and assessment suitability before formal use. Uploaded lecturer resources retain their own authorship.</p></aside>
    <section className="guide-principles" aria-label="Responsible AI principles">
      {principles.map(({ icon: Icon, title, color, text, example }) => <article className={`panel guide-principle guide-tone-${color}`} key={title}><span className="guide-icon"><Icon size={23} aria-hidden="true" /></span><h2>{title}</h2><p>{text}</p><div className="guide-example"><Lightbulb size={16} aria-hidden="true" /><span>{example}</span></div></article>)}
    </section>
    <section className="panel guide-scenario" aria-labelledby="ai-scenario-title">
      <div className="guide-section-heading"><div><span className="eyebrow">Pause. Think. Decide.</span><h2 id="ai-scenario-title">Practise an ethical decision</h2></div><span className="badge">Scenario {scenarioIndex + 1} of {scenarios.length}</span></div>
      <h3>{current.title}</h3><p>{current.scenario}</p>
      <div className="guide-actions"><button type="button" className={`button ${answer === true ? 'primary' : 'secondary'}`} aria-pressed={answer === true} onClick={() => setAnswer(true)}>Responsible use</button><button type="button" className={`button ${answer === false ? 'primary' : 'secondary'}`} aria-pressed={answer === false} onClick={() => setAnswer(false)}>Needs a better approach</button></div>
      {answer !== null && <div className={`guide-feedback ${answer === current.good ? 'positive' : ''}`} role="status"><strong>{answer === current.good ? 'Sound judgement.' : 'Consider the risks again.'}</strong><p>{current.feedback}</p></div>}
      <div className="guide-scenario-footer"><span className="muted">Reflection activity · not an assessed quiz</span><button type="button" className="button secondary" onClick={() => { setScenarioIndex((scenarioIndex + 1) % scenarios.length); setAnswer(null) }}>Next scenario <ArrowRight size={17} aria-hidden="true" /></button></div>
    </section>
    <section className="panel guide-pledge"><HeartHandshake size={30} aria-hidden="true" /><div><h2>A commitment to honest learning</h2><p>“I will attempt, understand, verify and acknowledge. I will use assistance responsibly and submit work that demonstrates my own learning.”</p><p className="muted" lang="ms">Bahasa Melayu: AI membantu pembelajaran; pemikiran, semakan dan tanggungjawab kekal milik pelajar.</p></div><button type="button" className="button secondary" onClick={() => navigate('learning')}>Continue learning <ArrowRight size={17} aria-hidden="true" /></button></section>
  </div>
}

export function LecturerGuide({ navigate, notify }) {
  const [ratings, setRatings] = useState({})
  const ratedCount = Object.values(ratings).filter((value) => value !== '').length
  const total = Object.values(ratings).reduce((sum, value) => sum + Number(value || 0), 0)
  function exportEvidence() {
    const rows = evidence.map((item) => [
      `${item.id}. ${item.criterion} (${item.category})`,
      `Feature evidence: ${item.feature}`,
      `Further evidence required: ${item.gap}`,
      `Self-review rating: ${ratings[item.id] === undefined || ratings[item.id] === '' ? 'Not reviewed' : `${ratings[item.id]}/2`}`,
      'Evidence reference / date / reviewer:',
      '',
    ].join('\n'))
    downloadText('programming-fundamentals-evidence-worksheet.txt', [
      'PROGRAMMING FUNDAMENTALS — Lecturer evidence worksheet',
      'Lecturer: Ts. Mazlina Md Mustaffa',
      'User-supplied IBM SkillsBuild evaluation criteria; this worksheet is not an official score or endorsement.',
      `Self-review: ${total}/22; ${ratedCount}/11 criteria reviewed.`,
      'Suggested self-review scale: 0 = not evidenced; 1 = partial evidence; 2 = documented and verified evidence.',
      'The evaluator’s official descriptors take precedence over this suggested scale.',
      '', ...rows,
      'Prepared by 3M@MazlinaMdMustaffa',
    ].join('\n'))
    notify?.('Evidence worksheet downloaded. Add your supporting references before review.')
  }
  return <div className="guide-page">
    <GuideHeading eyebrow="Teach with purpose" title="Lecturer Guide">An honest evidence map, a practical teaching plan and a clear path to continuous improvement.</GuideHeading>
    <section className="panel guide-hero guide-lecturer-hero" aria-labelledby="lecturer-hero-title"><div className="guide-hero-icon"><GraduationCap size={34} aria-hidden="true" /></div><div><span className="badge">Ts. Mazlina Md Mustaffa</span><h2 id="lecturer-hero-title">From activity to evidence of learning.</h2><p>Use the hub for student-centred preparation, formative feedback and observable practical performance. Confirm official alignment before formal assessment.</p></div><button type="button" className="button primary" onClick={exportEvidence}><Download size={18} aria-hidden="true" /> Download evidence worksheet</button></section>
    <section className="guide-teaching-grid" aria-label="Teaching and assessment guidance">
      <article className="panel"><BookOpen size={25} aria-hidden="true" /><h2>Plan the learning journey</h2><p>Introduce a topic objective, check prior understanding and connect the concept to a familiar problem. Assign quick notes and a low-stakes practice attempt before independent assessment.</p><ul><li>Read and predict before running code.</li><li>Use think–pair–share to explain algorithms.</li><li>Offer written explanations and optional BM support.</li></ul></article>
      <article className="panel"><ClipboardCheck size={25} aria-hidden="true" /><h2>Assess the right evidence</h2><p>Theory quizzes use 10 MCQs in 15 minutes: C1 × 2, C2 × 3, C3 × 3 and C4 × 2. Practical tasks use 60 minutes and a 100-mark observable rubric.</p><ul><li>Use quiz explanations as formative feedback.</li><li>Mark practical source files and test evidence manually.</li><li>Record official grades in your approved system.</li></ul></article>
      <article className="panel"><Workflow size={25} aria-hidden="true" /><h2>Close the improvement loop</h2><p>Collect consented, anonymised feedback and review misconceptions. Revise the teaching approach, retest difficult content and document the effect of each change.</p><ul><li>Plan: identify a measurable learning need.</li><li>Do and check: pilot, collect evidence and reflect.</li><li>Act: update materials and compare outcomes.</li></ul></article>
    </section>
    <aside className="guide-verification"><FileCheck2 size={24} aria-hidden="true" /><div><h2>Syllabus verification is still required</h2><p>The five-topic structure follows the supplied scope. No official syllabus document or official learning outcome codes were supplied. Topic 5 is restricted to introductory functions, declarations, definitions, calls, parameters, arguments, returns and passing arguments; function overloading is excluded. The lecturer must verify the exact scope through subtopic 5.2.3.</p></div></aside>
    <section className="panel guide-evidence" aria-labelledby="evidence-title">
      <div className="guide-section-heading"><div><span className="eyebrow">IBM SkillsBuild · supplied evaluation criteria</span><h2 id="evidence-title">11 criteria. Traceable evidence.</h2><p>Feature availability is a starting point. Add classroom evidence, human verification and approved records before submitting a showcase evaluation.</p></div><span className="guide-score"><strong>{total}<small>/22</small></strong><span>Self-review only</span></span></div>
      <div className="guide-review-note"><CheckCircle2 size={19} aria-hidden="true" /><p><strong>{ratedCount} of 11 reviewed.</strong> Optional scale: 0 = not evidenced, 1 = partial, 2 = documented and verified. This suggested worksheet does not guarantee marks, certification or IBM endorsement. Official evaluator descriptors take precedence. Ratings stay in this page until you download them.</p></div>
      <div className="guide-table-scroll" role="region" aria-label="Evaluation evidence table, scroll horizontally on small screens" tabIndex={0}><table className="guide-evidence-table"><caption>Evaluation criteria, available features and evidence still to collect</caption><thead><tr><th scope="col">Criterion</th><th scope="col">Available feature evidence</th><th scope="col">Additional evidence required</th><th scope="col">Self-review</th></tr></thead><tbody>{evidence.map((item) => <tr key={item.id}><th scope="row"><span className="guide-criterion-number">{String(item.id).padStart(2, '0')}</span>{item.criterion}<small>{item.category}</small></th><td><p>{item.feature}</p>{item.route && <button type="button" className="guide-inline-link" onClick={() => navigate(item.route)}>{item.action} <ArrowRight size={14} aria-hidden="true" /></button>}</td><td><span className="badge guide-pending">Further evidence</span><p>{item.gap}</p></td><td><label className="sr-only" htmlFor={`evidence-rating-${item.id}`}>Self-review rating for {item.criterion}</label><select id={`evidence-rating-${item.id}`} value={ratings[item.id] ?? ''} onChange={(event) => setRatings((previous) => ({ ...previous, [item.id]: event.target.value }))}><option value="">Not reviewed</option><option value="0">0 · Not evidenced</option><option value="1">1 · Partial</option><option value="2">2 · Verified</option></select></td></tr>)}</tbody></table></div>
      <div className="guide-actions"><button type="button" className="button primary" onClick={exportEvidence}><Download size={18} aria-hidden="true" /> Export worksheet</button><button type="button" className="button secondary" onClick={() => { setRatings({}); notify?.('Self-review ratings reset.') }}>Reset worksheet</button></div>
    </section>
    <section className="guide-boundary-grid" aria-label="Platform scope and publication guidance"><article className="panel"><Users size={24} aria-hidden="true" /><h2>Progress belongs to this device</h2><p>Quiz attempts, learning reflections and practical status support individual self-monitoring. Browser data is not central lecturer monitoring and is not a verified official grade record. Ask learners to share permitted exports through an approved institutional channel.</p><button type="button" className="button secondary" onClick={() => navigate('progress')}>View learning progress <ArrowRight size={16} aria-hidden="true" /></button></article><article className="panel"><LockKeyhole size={24} aria-hidden="true" /><h2>Share through your institutional LMS</h2><p>Post the permanent website link or downloadable task sheets in your LMS. This static website does not implement SSO, LMS grade sync or secure submission storage. Any future integration needs institutional approval and a separately verified implementation.</p><a className="guide-inline-link" href="https://mazlinamustaffa.github.io/programming/" target="_blank" rel="noopener noreferrer">Open permanent website <ArrowRight size={15} aria-hidden="true" /></a></article><article className="panel"><Sparkles size={24} aria-hidden="true" /><h2>Publish your own learning materials</h2><p>Create image, comic, PDF and quiz-link drafts in Content Manager. Drafts are local. Export the update package, review its files, then commit them to the existing repository to publish for all students.</p><button type="button" className="button secondary" onClick={() => navigate('manager')}>Open Content Manager <ArrowRight size={16} aria-hidden="true" /></button></article></section>
    <p className="guide-signoff">PROGRAMMING FUNDAMENTALS · LEARN • PRACTICE • CODE • ACHIEVE<br /><strong>Prepared by 3M@MazlinaMdMustaffa</strong></p>
  </div>
}
