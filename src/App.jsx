import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import {
  ArrowRight,
  Check,
  Search,
  ShieldCheck,
  Download,
  Code2,
  CalendarDays,
  BookOpen,
  Archive,
} from 'lucide-react'
import { topics } from './data/topics'
import {
  topics as earlierTopics,
  parts as earlierParts,
} from './data/curriculum'
import { HUB_KEY, readHub, recordChanges, hubRows } from './lib/hub'
import {
  readState,
  STORAGE_KEY,
  getRows,
  activityId,
  exportRows,
  downloadFile,
} from './lib/storage'
import { expireQuizAttempts } from './lib/assessment'
import { useContentCatalog } from './lib/content'
import { Sidebar, Header } from './components/Shell'
import { navigation } from './data/navigation'
import { Dialog, TopicIcon } from './components/ui'
import Dashboard, { TopicCards } from './components/Dashboard'
import ActivityTable from './components/ActivityTable'
import Learning from './components/Learning'
import TopicPage from './features/TopicPage'
import PracticeLab from './features/PracticeLab'
import ProgressPage from './features/ProgressPage'
import ResourceLibrary from './features/ResourceLibrary'
import GameZone from './features/GameZone'
const QuizPage = lazy(() => import('./features/QuizPage'))
const PracticalPage = lazy(() => import('./features/PracticalPage'))
const ContentManager = lazy(() => import('./features/ContentManager'))
const ResponsibleAI = lazy(() =>
  import('./features/Guides').then((module) => ({
    default: module.ResponsibleAI,
  })),
)
const LecturerGuide = lazy(() =>
  import('./features/Guides').then((module) => ({
    default: module.LecturerGuide,
  })),
)

function readRoute() {
  let [view, topicId, partId] = window.location.hash.slice(1).split('/')
  const aliases = {
    assessments: 'quiz',
    resources: 'infographics',
    practice: 'lab',
    content: 'manager',
    'content-manager': 'manager',
    responsible: 'responsible-ai',
    guide: 'lecturer',
  }
  view = aliases[view] || view || 'overview'
  if (view.startsWith('topic-')) {
    topicId = view.slice(6)
    view = 'topic'
  }
  if (view === 'learn') {
    view =
      ['exercise', 'practical', 'quiz', 'test'].includes(partId) ||
      topicId === 'operators'
        ? 'legacy'
        : 'topic'
  }
  if (
    ![
      'overview',
      'learning',
      'topic',
      'infographics',
      'comics',
      'pdf',
      'quiz',
      'practical',
      'lab',
      'games',
      'progress',
      'responsible-ai',
      'lecturer',
      'manager',
      'legacy',
    ].includes(view)
  )
    view = 'overview'
  if (![...topics, ...earlierTopics].some((t) => t.id === topicId))
    topicId = null
  if (!earlierParts.some((p) => p.id === partId)) partId = 'notes'
  return { view, topicId, partId }
}
export default function App() {
  const [hub, setHub] = useState(readHub),
    [legacy, setLegacy] = useState(readState),
    [route, setRoute] = useState(readRoute),
    [dialog, setDialog] = useState(null),
    [mobileOpen, setMobileOpen] = useState(false),
    [toast, setToast] = useState(''),
    [storageError, setStorageError] = useState(false),
    [search, setSearch] = useState(''),
    [draftName, setDraftName] = useState(hub.name)
  const catalog = useContentCatalog()
  const updateHub = useCallback(
    (updater) =>
      setHub((previous) => {
        const next = typeof updater === 'function' ? updater(previous) : updater
        return next === previous ? previous : recordChanges(previous, next)
      }),
    [],
  )
  const notify = useCallback((message) => setToast(message), []),
    closeDialog = useCallback(() => setDialog(null), [])
  const navigate = useCallback((view, topicId, partId) => {
    window.location.hash = [view, topicId, partId].filter(Boolean).join('/')
    setMobileOpen(false)
  }, [])
  const openTopic = useCallback(
    (id, part = 'notes') =>
      navigate(
        part === 'quiz'
          ? `quiz/${id}`
          : part === 'practical'
            ? `practical/${id}`
            : part === 'exercise'
              ? `lab/${id}`
              : `topic/${id}`,
      ),
    [navigate],
  )
  useEffect(() => {
    let active = true
    Promise.resolve().then(() => {
      if (!active) return
      try {
        localStorage.setItem(HUB_KEY, JSON.stringify(hub))
        setStorageError(false)
      } catch {
        setStorageError(true)
      }
    })
    return () => {
      active = false
    }
  }, [hub])
  useEffect(() => {
    const listener = () => {
      setRoute(readRoute())
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
    window.addEventListener('hashchange', listener)
    return () => window.removeEventListener('hashchange', listener)
  }, [])
  useEffect(() => {
    if (!route.topicId || route.view === 'legacy') return
    let active = true
    Promise.resolve().then(() => {
      if (active)
        updateHub((p) =>
          p.visitedTopics[route.topicId]
            ? p
            : {
                ...p,
                visitedTopics: {
                  ...p.visitedTopics,
                  [route.topicId]: Date.now(),
                },
              },
        )
    })
    return () => {
      active = false
    }
  }, [route.topicId, route.view, updateHub])
  useEffect(() => {
    const reconcile = () =>
      updateHub((p) => {
        const attempts = expireQuizAttempts(p.quizAttempts, Date.now())
        return attempts === p.quizAttempts
          ? p
          : { ...p, quizAttempts: attempts }
      })
    const timer = setInterval(reconcile, 1000)
    Promise.resolve().then(reconcile)
    return () => clearInterval(timer)
  }, [updateHub])
  useEffect(() => {
    document.documentElement.dataset.textSize = [
      'standard',
      'large',
      'extra-large',
    ].includes(hub.preferences.textSize)
      ? hub.preferences.textSize
      : 'standard'
    document.documentElement.dataset.reducedMotion = hub.preferences
      .reducedMotion
      ? 'true'
      : 'false'
  }, [hub.preferences])
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 4500)
    return () => clearTimeout(timer)
  }, [toast])
  useEffect(() => {
    const listener = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearch('')
        setDialog('search')
      }
    }
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [])
  function saveLegacy(updater) {
    setLegacy((p) => {
      const next = updater(p)
      try {
        let raw = {}
        try {
          raw = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
        } catch {
          /* Retain unreadable original data under a backup key. */ localStorage.setItem(
            `${STORAGE_KEY}:backup`,
            localStorage.getItem(STORAGE_KEY) || '',
          )
        }
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            ...raw,
            ...next,
            activities: { ...raw.activities, ...next.activities },
            code: { ...raw.code, ...next.code },
          }),
        )
      } catch {
        notify(
          'Earlier workspace change could not be saved. Export your records before closing.',
        )
      }
      return next
    })
  }
  const title =
    route.view === 'topic'
      ? `Topic ${topics.find((t) => t.id === route.topicId)?.number || 1}`
      : navigation.find((n) => n[0] === route.view)?.[1] ||
        { pdf: 'PDF Notes', legacy: 'Earlier workspace' }[route.view] ||
        'Dashboard Overview'
  const next =
    hubRows(hub).find((r) => r.status !== 'completed') || hubRows(hub)[0]
  const shared = { hub, updateHub, notify, navigate, topicId: route.topicId }
  const legacyTopic = earlierTopics.find((t) => t.id === route.topicId)
  let page
  if (route.view === 'overview')
    page = (
      <Dashboard
        state={hub}
        openTopic={openTopic}
        navigate={navigate}
        openPlan={() => setDialog('plan')}
        next={next}
        notify={notify}
      />
    )
  else if (route.view === 'learning')
    page = (
      <>
        <div className="page-heading">
          <div>
            <span className="eyebrow">FIVE TOPICS • ENDLESS POSSIBILITIES</span>
            <h1>My Learning</h1>
            <p>
              Follow your own path from problem solving to modular C++ programs.
            </p>
          </div>
          <BookOpen size={32} />
        </div>
        <TopicCards state={hub} openTopic={openTopic} compact />
        <section className="panel curriculum-note">
          <h2>A purposeful learning cycle</h2>
          <p>
            Read the notes, practise a concept, complete the timed quiz, build a
            practical solution, and reflect on your learning.
          </p>
          <p>
            The exact official syllabus has not been supplied. Topic 5 is
            limited to the requested introductory functions scope; lecturer
            verification through subtopic 5.2.3 is required.
          </p>
          <button className="text-button" onClick={() => navigate('legacy')}>
            <Archive size={16} />
            Your earlier learning workspace →
          </button>
        </section>
      </>
    )
  else if (route.view === 'topic')
    page = <TopicPage key={route.topicId} {...shared} catalog={catalog} />
  else if (route.view === 'quiz')
    page = <QuizPage key={route.topicId || 'all'} {...shared} />
  else if (route.view === 'practical')
    page = <PracticalPage key={route.topicId || 'all'} {...shared} />
  else if (route.view === 'lab')
    page = <PracticeLab key={route.topicId || 'all'} {...shared} />
  else if (route.view === 'progress')
    page = <ProgressPage {...shared} openTopic={openTopic} />
  else if (['infographics', 'comics', 'pdf'].includes(route.view))
    page = (
      <ResourceLibrary
        key={`${route.view}/${route.topicId}`}
        kind={
          route.view === 'infographics'
            ? 'infographic'
            : route.view === 'comics'
              ? 'comic'
              : 'pdf'
        }
        topicId={route.topicId}
        catalog={catalog}
        navigate={navigate}
        notify={notify}
      />
    )
  else if (route.view === 'games')
    page = (
      <GameZone
        catalog={catalog}
        navigate={navigate}
        notify={notify}
        topicId={route.topicId}
      />
    )
  else if (route.view === 'manager')
    page = (
      <ContentManager catalog={catalog} navigate={navigate} notify={notify} />
    )
  else if (route.view === 'responsible-ai')
    page = <ResponsibleAI navigate={navigate} notify={notify} />
  else if (route.view === 'lecturer')
    page = <LecturerGuide navigate={navigate} notify={notify} />
  else if (route.view === 'legacy' && legacyTopic)
    page = (
      <>
        <div className="notice">
          <strong>Preserved earlier activity.</strong> Original content, saved
          code and scoring remain available. These records are separate from new
          timed assessments.
        </div>
        <Learning
          key={`${route.topicId}/${route.partId}`}
          topic={legacyTopic}
          partId={route.partId}
          state={legacy}
          openTopic={(id, part) => navigate('legacy', id, part)}
          complete={(id, part, score) => {
            saveLegacy((p) => ({
              ...p,
              activities: {
                ...p.activities,
                [activityId(id, part)]: {
                  status:
                    score === undefined || score >= 67
                      ? 'completed'
                      : 'in-progress',
                  ...(score !== undefined ? { score } : {}),
                },
              },
            }))
            notify('Earlier workspace record saved.')
          }}
          saveCode={(id, code) =>
            saveLegacy((p) => ({ ...p, code: { ...p.code, [id]: code } }))
          }
          notify={notify}
          goBack={() => navigate('legacy')}
        />
      </>
    )
  else
    page = (
      <>
        <div className="page-heading">
          <div>
            <span className="eyebrow">PRESERVED IN YOUR BROWSER</span>
            <h1>Earlier workspace</h1>
            <p>
              Your original learning activities and code remain accessible.
              Original assessment formats and marks are retained.
            </p>
          </div>
          <Archive size={32} />
        </div>
        <div className="notice">
          Earlier versions began with illustrative sample progress. Retained
          records are displayed as earlier workspace data; they are not treated
          as results of the new 50-question assessment bank.
        </div>
        <div className="button-row">
          {earlierTopics.map((t) => (
            <button
              key={t.id}
              className="button secondary"
              onClick={() => navigate('legacy', t.id, 'notes')}
            >
              {t.title}
            </button>
          ))}
        </div>
        <ActivityTable
          state={legacy}
          rows={getRows(legacy)}
          legacy
          openTopic={(id, part) => navigate('legacy', id, part)}
          notify={notify}
        />
      </>
    )
  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault()
          document.getElementById('main-content')?.focus()
        }}
      >
        Skip to content
      </a>
      <Sidebar
        current={route.view === 'topic' ? `topic/${route.topicId}` : route.view}
        navigate={navigate}
        mobileOpen={mobileOpen}
        closeMobile={() => setMobileOpen(false)}
        openPlan={() => setDialog('plan')}
        openHelp={() => setDialog('help')}
      />
      <div className="main-shell" inert={mobileOpen ? true : undefined}>
        <Header
          title={title}
          name={hub.name}
          openMenu={() => setMobileOpen(true)}
          openSearch={() => {
            setSearch('')
            setDialog('search')
          }}
          openNotifications={() => setDialog('notifications')}
          openProfile={() => {
            setDraftName(hub.name)
            setDialog('profile')
          }}
        />
        <main id="main-content" tabIndex={-1} className="main-content">
          {storageError && (
            <div className="storage-warning" role="alert">
              Browser storage is unavailable. This session works, but progress
              cannot be saved. Export your records before closing.
            </div>
          )}
          <Suspense
            fallback={
              <div className="notice" role="status">
                Opening your learning space…
              </div>
            }
          >
            {page}
          </Suspense>
        </main>
        <footer className="page-footer">
          <span>Prepared by 3M@MazlinaMdMustaffa</span>
          <span>
            PROGRAMMING FUNDAMENTALS<span className="footer-dot">·</span>Ts.
            Mazlina Md Mustaffa
          </span>
        </footer>
      </div>
      {toast && (
        <div className="toast" role="status">
          <Check size={18} />
          {toast}
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast('')}
          >
            ×
          </button>
        </div>
      )}
      {dialog === 'search' && (
        <Dialog title="Find your next discovery" wide onClose={closeDialog}>
          <label className="dialog-search">
            <Search size={20} />
            <input
              aria-label="Search topics and pages"
              placeholder="Search a topic or learning tool…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <div className="search-results">
            {topics
              .filter((t) =>
                `${t.title} ${t.notes.map((n) => n.title).join(' ')}`
                  .toLowerCase()
                  .includes(search.toLowerCase()),
              )
              .map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    closeDialog()
                    openTopic(t.id)
                  }}
                >
                  <TopicIcon topic={t} />
                  <span>
                    <strong>{t.shortTitle}</strong>
                    <small>
                      Topic {t.number} · {t.description}
                    </small>
                  </span>
                  <ArrowRight size={17} />
                </button>
              ))}
            {navigation
              .filter((n) => n[1].toLowerCase().includes(search.toLowerCase()))
              .map(([id, label, Icon]) => (
                <button
                  key={id}
                  onClick={() => {
                    closeDialog()
                    navigate(id)
                  }}
                >
                  <Icon size={20} />
                  <strong>{label}</strong>
                  <ArrowRight size={16} />
                </button>
              ))}
          </div>
        </Dialog>
      )}
      {dialog === 'notifications' && (
        <Dialog title="Your learning reminders" onClose={closeDialog}>
          <div className="notice">
            <strong>Your next step</strong>
            <p>
              {next.topic.shortTitle} · {next.part.label}. A small focused
              session is a good place to start.
            </p>
          </div>
          <p className="muted">
            Quiz and practical timers use saved deadlines and keep counting
            while you navigate away. Quiz results, study plans and learning
            records belong to this browser.
          </p>
          <button
            className="button primary"
            onClick={() => {
              closeDialog()
              openTopic(next.topic.id, next.part.id)
            }}
          >
            Continue learning
            <ArrowRight size={16} />
          </button>
        </Dialog>
      )}
      {dialog === 'plan' && (
        <Dialog title="Make space for your learning" onClose={closeDialog}>
          <p className="muted">
            Choose your study days. Your plan is saved on this device.
          </p>
          <div className="study-days">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
              <button
                key={day}
                aria-pressed={hub.plannedDays.includes(i)}
                className={hub.plannedDays.includes(i) ? 'selected' : ''}
                onClick={() =>
                  updateHub((p) => ({
                    ...p,
                    plannedDays: p.plannedDays.includes(i)
                      ? p.plannedDays.filter((d) => d !== i)
                      : [...p.plannedDays, i],
                  }))
                }
              >
                <span>{day}</span>
                <span>
                  {hub.plannedDays.includes(i) ? <Check size={18} /> : '–'}
                </span>
              </button>
            ))}
          </div>
          <div className="plan-summary">
            <CalendarDays size={20} />
            <strong>{hub.plannedDays.length} study days / week</strong>
          </div>
          <button
            className="button primary full"
            onClick={() => {
              closeDialog()
              notify('Your study plan is saved on this device.')
            }}
          >
            Save study plan
            <Check size={17} />
          </button>
        </Dialog>
      )}
      {dialog === 'profile' && (
        <Dialog title="Your workspace settings" onClose={closeDialog}>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              updateHub((p) => ({ ...p, name: draftName.trim() || 'Learner' }))
              closeDialog()
              notify('Workspace settings saved.')
            }}
          >
            <label className="field-label">
              Display name
              <input
                className="text-input"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                maxLength={30}
                required
              />
            </label>
            <label className="field-label">
              Text size
              <select
                aria-label="Text size"
                value={hub.preferences.textSize}
                onChange={(e) =>
                  updateHub((p) => ({
                    ...p,
                    preferences: { ...p.preferences, textSize: e.target.value },
                  }))
                }
              >
                <option value="standard">Standard</option>
                <option value="large">Large</option>
                <option value="extra-large">Extra large</option>
              </select>
            </label>
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={hub.preferences.reducedMotion}
                onChange={(e) =>
                  updateHub((p) => ({
                    ...p,
                    preferences: {
                      ...p.preferences,
                      reducedMotion: e.target.checked,
                    },
                  }))
                }
              />
              Reduced motion
            </label>
            <p className="dialog-caption">
              <ShieldCheck size={15} />
              Your settings and progress stay in this browser. No account or
              central monitoring.
            </p>
            <button className="button primary full" type="submit">
              Save changes
              <Check size={17} />
            </button>
          </form>
          <div className="settings-actions">
            <button
              className="button secondary full"
              onClick={() => exportRows(hubRows(hub))}
            >
              <Download size={16} />
              Export all progress
            </button>
            <button
              className="button secondary full"
              onClick={() =>
                downloadFile(
                  'programming-learning-backup.json',
                  JSON.stringify(
                    {
                      hub,
                      earlierWorkspace: localStorage.getItem(STORAGE_KEY),
                    },
                    null,
                    2,
                  ),
                  'application/json',
                )
              }
            >
              <Download size={16} />
              Download learning backup
            </button>
          </div>
        </Dialog>
      )}
      {dialog === 'help' && (
        <Dialog title="Welcome to your learning hub" onClose={closeDialog}>
          <div className="dialog-feature-icon">
            <Code2 size={28} />
          </div>
          <p className="muted">
            PROGRAMMING FUNDAMENTALS combines five C++ topics, notes, practice,
            15-minute quizzes, 60-minute practicals and reflection.
          </p>
          <div className="help-steps">
            <p>
              <BookOpen size={19} />
              <span>
                Start with a topic’s objectives and notes. Practise before
                checking your understanding.
              </span>
            </p>
            <p>
              <ShieldCheck size={19} />
              <span>
                Progress is device-specific. Export a backup before clearing
                browser data.
              </span>
            </p>
            <p>
              <Archive size={19} />
              <span>
                Earlier activities and saved code are preserved in Practice Lab
                → Earlier workspace.
              </span>
            </p>
          </div>
          <div className="notice">
            Content Manager saves local drafts in this browser. Export a package
            and commit its files to GitHub to publish materials for students.
          </div>
          <button
            className="button primary full"
            onClick={() => {
              closeDialog()
              openTopic('intro')
            }}
          >
            Start learning
            <ArrowRight size={16} />
          </button>
          <button
            className="text-button full"
            onClick={() =>
              downloadFile(
                'programming-fundamentals-outline.txt',
                [
                  'PROGRAMMING FUNDAMENTALS',
                  'Lecturer: Ts. Mazlina Md Mustaffa',
                  'Proposed teaching outline: official syllabus verification required.',
                  ...topics.map(
                    (t) =>
                      `\nTopic ${t.number}: ${t.title}\n${t.overview}\nObjectives:\n${t.objectives.map((o) => `- ${o}`).join('\n')}`,
                  ),
                ].join('\n'),
              )
            }
          >
            <Download size={16} />
            Download course outline
          </button>
        </Dialog>
      )}
    </div>
  )
}
