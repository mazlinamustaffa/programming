import { useCallback, useEffect, useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  Check,
  CalendarDays,
  Search,
  Bell,
  ShieldCheck,
  Download,
  RotateCcw,
  Code2,
  CircleHelp,
} from 'lucide-react'
import { topics, parts } from './data/curriculum'
import {
  activityId,
  readState,
  STORAGE_KEY,
  getRows,
  exportRows,
  downloadFile,
} from './lib/storage'
import { Sidebar, Header } from './components/Shell'
import { Dialog, TopicIcon } from './components/ui'
import Dashboard from './components/Dashboard'
import Learning from './components/Learning'
import Catalog from './components/Catalog'

function readRoute() {
  const [page, topicId, partId] = window.location.hash.slice(1).split('/')
  const view = [
    'overview',
    'learning',
    'learn',
    'lab',
    'assessments',
    'resources',
  ].includes(page)
    ? page
    : 'overview'
  return {
    view,
    topicId: topics.some((t) => t.id === topicId) ? topicId : null,
    partId: parts.some((p) => p.id === partId) ? partId : 'notes',
  }
}

export default function App() {
  const [state, setState] = useState(readState)
  const [route, setRoute] = useState(readRoute)
  const [dialog, setDialog] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [storageError, setStorageError] = useState(false)
  const [search, setSearch] = useState('')
  const [draftName, setDraftName] = useState(state.name)
  const closeDialog = useCallback(() => setDialog(null), [])
  const notify = useCallback((message) => setToast(message), [])

  useEffect(() => {
    let active = true
    Promise.resolve().then(() => {
      if (!active) return
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
        setStorageError(false)
      } catch {
        setStorageError(true)
      }
    })
    return () => {
      active = false
    }
  }, [state])
  useEffect(() => {
    const listener = () => {
      setRoute(readRoute())
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
    window.addEventListener('hashchange', listener)
    return () => window.removeEventListener('hashchange', listener)
  }, [])
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

  function navigate(view, topicId, partId) {
    window.location.hash = [view, topicId, partId].filter(Boolean).join('/')
    setMobileOpen(false)
  }
  function openTopic(topicId, partId = 'notes', view = 'learn') {
    const id = activityId(topicId, partId)
    setState((prev) => ({
      ...prev,
      activities: {
        ...prev.activities,
        [id]: prev.activities[id] || { status: 'in-progress' },
      },
    }))
    navigate(view, topicId, partId)
  }
  function complete(topicId, partId, score) {
    const id = activityId(topicId, partId)
    const passed = score === undefined || score >= 67
    setState((prev) => ({
      ...prev,
      activities: {
        ...prev.activities,
        [id]: {
          status: passed ? 'completed' : 'in-progress',
          ...(score !== undefined ? { score } : {}),
        },
      },
    }))
    notify(
      passed
        ? 'Great work! Your progress has been updated.'
        : 'Attempt saved. Review the feedback and try again.',
    )
  }
  function saveCode(id, code) {
    setState((prev) => ({ ...prev, code: { ...prev.code, [id]: code } }))
  }
  function openProfile() {
    setDraftName(state.name)
    setDialog('profile')
  }
  const sidebarCurrent = route.view === 'learn' ? 'learning' : route.view
  const title = {
    overview: 'Overview',
    learning: 'My learning',
    learn: 'My learning',
    lab: 'Practice lab',
    assessments: 'Assessments',
    resources: 'Resources',
  }[route.view]
  const next =
    getRows(state).find((r) => r.status !== 'completed') || getRows(state)[0]
  const searchResults = topics.filter((t) =>
    `${t.title} ${t.description}`.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="app-shell">
      <Sidebar
        current={sidebarCurrent}
        navigate={navigate}
        mobileOpen={mobileOpen}
        closeMobile={() => setMobileOpen(false)}
        openPlan={() => setDialog('plan')}
        openHelp={() => setDialog('help')}
      />
      <div className="main-shell">
        <Header
          title={title}
          name={state.name}
          openMenu={() => setMobileOpen(true)}
          openSearch={() => {
            setSearch('')
            setDialog('search')
          }}
          openNotifications={() => setDialog('notifications')}
          openProfile={openProfile}
        />
        <main id="main-content" className="main-content">
          {storageError && (
            <div className="storage-warning" role="alert">
              Browser storage is unavailable. Your progress works for this
              session but cannot be saved.
            </div>
          )}
          {route.topicId ? (
            <Learning
              key={`${route.topicId}:${route.partId}`}
              topic={topics.find((t) => t.id === route.topicId)}
              partId={route.partId}
              state={state}
              openTopic={(id, part) => openTopic(id, part, route.view)}
              complete={complete}
              saveCode={saveCode}
              notify={notify}
              goBack={() => navigate(sidebarCurrent)}
            />
          ) : route.view === 'overview' ? (
            <Dashboard
              state={state}
              openTopic={openTopic}
              navigate={navigate}
              openPlan={() => setDialog('plan')}
              next={next}
              notify={notify}
            />
          ) : (
            <Catalog
              view={route.view}
              state={state}
              openTopic={openTopic}
              notify={notify}
            />
          )}
        </main>
        <footer className="page-footer">
          <span>Built for curious minds.</span>
          <span>
            Programming Fundamentals Hub<span className="footer-dot">·</span>C++
            Foundations
          </span>
        </footer>
      </div>
      {toast && (
        <div className="toast" role="status">
          <span>
            <Check size={17} />
          </span>
          {toast}
        </div>
      )}
      {dialog === 'search' && (
        <Dialog title="Find your next step" onClose={closeDialog}>
          <label className="search-field search-dialog">
            <Search size={20} />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search topics, concepts, or skills..."
              aria-label="Search topics"
            />
          </label>
          <p className="dialog-caption">
            {searchResults.length} topics in your learning path
          </p>
          <div className="search-results">
            {searchResults.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  closeDialog()
                  openTopic(t.id)
                }}
              >
                <TopicIcon topic={t} />
                <span>
                  <strong>{t.title}</strong>
                  <small>Topic {t.number} · 5 learning activities</small>
                </span>
                <ArrowRight size={18} />
              </button>
            ))}
            {!searchResults.length && (
              <div className="empty-state">
                <Search size={28} />
                <h3>No topics found</h3>
                <p>Try “variables”, “loops”, or “functions”.</p>
              </div>
            )}
          </div>
        </Dialog>
      )}
      {dialog === 'notifications' && (
        <Dialog title="Your learning reminders" onClose={closeDialog}>
          <p className="muted">
            A few helpful next steps in your sample workspace.
          </p>
          <div className="notification-list">
            <button
              onClick={() => {
                closeDialog()
                openTopic(next.topic.id, next.part.id)
              }}
            >
              <BookOpen size={20} />
              <span>
                <strong>Your next activity is waiting</strong>
                <small>
                  {next.topic.title} · {next.part.label}
                </small>
              </span>
              <ArrowRight size={17} />
            </button>
            <button
              onClick={() => {
                setDialog('plan')
              }}
            >
              <CalendarDays size={20} />
              <span>
                <strong>Make room for a little practice</strong>
                <small>Plan your weekly study days.</small>
              </span>
              <ArrowRight size={17} />
            </button>
            <button
              onClick={() => {
                closeDialog()
                navigate('assessments')
              }}
            >
              <Bell size={20} />
              <span>
                <strong>Put your knowledge to the test</strong>
                <small>10 quizzes and tests across 5 topics.</small>
              </span>
              <ArrowRight size={17} />
            </button>
          </div>
        </Dialog>
      )}
      {dialog === 'plan' && (
        <Dialog title="Your weekly study plan" onClose={closeDialog}>
          <div className="dialog-feature-icon">
            <CalendarDays size={27} />
          </div>
          <h3>A small habit goes a long way.</h3>
          <p className="muted">
            Choose the days you want to study. Aim for one activity each day —
            about 15–20 minutes. Your plan is saved on this device.
          </p>
          <div className="study-days">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
              <button
                key={day}
                aria-pressed={state.plannedDays.includes(i)}
                className={state.plannedDays.includes(i) ? 'selected' : ''}
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    plannedDays: prev.plannedDays.includes(i)
                      ? prev.plannedDays.filter((d) => d !== i)
                      : [...prev.plannedDays, i],
                  }))
                }
              >
                <span>{day}</span>
                <span>
                  {state.plannedDays.includes(i) ? <Check size={18} /> : '–'}
                </span>
              </button>
            ))}
          </div>
          <div className="plan-summary">
            <strong>{state.plannedDays.length} study days / week</strong>
            <span>
              {state.plannedDays.length * 20} minutes of focused learning
            </span>
          </div>
          <button
            className="button primary full"
            onClick={() => {
              closeDialog()
              notify('Your weekly study plan is saved.')
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
              if (!draftName.trim()) return
              setState((prev) => ({ ...prev, name: draftName.trim() }))
              closeDialog()
              notify('Your profile has been updated.')
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
            <p className="dialog-caption">
              <ShieldCheck size={15} />
              Your name and progress stay in this browser. No account is
              required.
            </p>
            <button className="button primary full" type="submit">
              Save changes
              <Check size={17} />
            </button>
          </form>
          <div className="settings-actions">
            <button
              className="button secondary full"
              onClick={() => {
                exportRows(getRows(state))
                notify('All 25 activities exported as CSV.')
              }}
            >
              <Download size={17} />
              Export all progress
            </button>
            <button
              className="button danger full"
              onClick={() => setDialog('reset')}
            >
              <RotateCcw size={17} />
              Reset all progress
            </button>
          </div>
        </Dialog>
      )}
      {dialog === 'reset' && (
        <Dialog title="Start with a clean slate?" onClose={closeDialog}>
          <p className="muted">
            This removes all completed activities, assessment scores, and saved
            code from this browser. Your name and weekly study plan will stay.
          </p>
          <div className="dialog-actions">
            <button
              className="button secondary"
              onClick={() => setDialog('profile')}
            >
              Keep my progress
            </button>
            <button
              className="button danger"
              onClick={() => {
                setState((prev) => ({ ...prev, activities: {}, code: {} }))
                closeDialog()
                navigate('overview')
                notify('Progress reset. Your next chapter is ready.')
              }}
            >
              Reset progress
            </button>
          </div>
        </Dialog>
      )}
      {dialog === 'help' && (
        <Dialog title="Welcome to Fundamentals Hub" onClose={closeDialog}>
          <div className="dialog-feature-icon">
            <Code2 size={28} />
          </div>
          <p className="muted">
            Build a strong foundation in C++ through five topics. Each has notes
            to learn, exercises to try, practicals to build, a quiz to check in,
            and a test to consolidate.
          </p>
          <div className="help-steps">
            <p>
              <BookOpen size={18} />
              <span>
                <strong>Learn at your pace.</strong> Start with a topic’s notes,
                then try its activities.
              </span>
            </p>
            <p>
              <CircleHelp size={18} />
              <span>
                <strong>Practice and get feedback.</strong> Run C++ code in the
                browser. Pass assessments with at least 2 of 3 correct answers.
              </span>
            </p>
            <p>
              <ShieldCheck size={18} />
              <span>
                <strong>Keep your progress.</strong> Everything saves on this
                device. Export a CSV whenever you need it.
              </span>
            </p>
          </div>
          <div className="info-callout">
            This is a demo learning workspace with sample progress. Use Settings
            → Reset all progress to start at zero. There is no account, server,
            or real class tracking.
          </div>
          <button
            className="button primary full"
            onClick={() => {
              closeDialog()
              openTopic('intro')
            }}
          >
            Start learning
            <ArrowRight size={17} />
          </button>
          <button
            className="text-button full"
            onClick={() =>
              downloadFile(
                'fundamentals-course-outline.txt',
                topics
                  .map(
                    (t) =>
                      `${t.number}. ${t.title}\n${t.description}\nActivities: Notes, Exercise, Practical, Quiz, Test\n`,
                  )
                  .join('\n'),
              )
            }
          >
            Download course outline
            <Download size={16} />
          </button>
        </Dialog>
      )}
    </div>
  )
}
