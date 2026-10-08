import { useEffect, useState } from 'react'
import {
  ChevronDown,
  ArrowUpRight,
  Search,
  Bell,
  Menu,
  X,
  Code2,
  Sparkles,
  ChevronRight,
  BookOpen,
  Settings2,
  CircleHelp,
} from 'lucide-react'
import { topics } from '../data/topics'
import { navigation } from '../data/navigation'

export function Sidebar({
  current,
  navigate,
  mobileOpen,
  closeMobile,
  openPlan,
  openHelp,
}) {
  const [expanded, setExpanded] = useState(true)
  useEffect(() => {
    if (mobileOpen) document.querySelector('.mobile-close')?.focus()
  }, [mobileOpen])
  const item = ([id, label, Icon]) => (
    <a
      key={id}
      href={`#${id}`}
      className={`nav-item ${current === id ? 'active' : ''}`}
      aria-current={current === id ? 'page' : undefined}
      onClick={(e) => {
        e.preventDefault()
        navigate(id)
        closeMobile()
      }}
    >
      <Icon size={18} />
      <span>{label}</span>
      {current === id && <span className="nav-active-dot" />}
    </a>
  )
  return (
    <>
      {mobileOpen && (
        <button
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={closeMobile}
        />
      )}
      <aside
        className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}
        aria-label="Learning sidebar"
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            closeMobile()
            setTimeout(() => document.querySelector('.mobile-menu')?.focus(), 0)
          }
        }}
      >
        <a className="brand" href="#overview" onClick={closeMobile}>
          <span className="brand-mark">
            <Code2 size={25} />
          </span>
          <span>
            PROGRAMMING<span className="brand-sub">FUNDAMENTALS</span>
          </span>
        </a>
        <button
          className="mobile-close icon-button"
          aria-label="Close navigation"
          onClick={closeMobile}
        >
          <X />
        </button>
        <div className="workspace-select">
          <span className="workspace-symbol">C++</span>
          <span>
            Learning & teaching hub<small>Learn • Practice • Achieve</small>
          </span>
          <span className="workspace-dot" />
        </div>
        <span className="nav-label">YOUR LEARNING SPACE</span>
        <nav aria-label="Main navigation">
          {navigation.slice(0, 2).map(item)}
          <button
            className="nav-item topic-toggle"
            aria-expanded={expanded}
            aria-controls="topic-navigation"
            onClick={() => setExpanded(!expanded)}
          >
            <BookOpen size={18} />
            <span>Learning Topics</span>
            <ChevronDown size={16} className={expanded ? 'expanded' : ''} />
          </button>
          {expanded && (
            <div id="topic-navigation" className="topic-nav">
              {topics.map((t) => (
                <a
                  key={t.id}
                  href={`#topic/${t.id}`}
                  className={current === `topic/${t.id}` ? 'active' : ''}
                  aria-current={
                    current === `topic/${t.id}` ? 'page' : undefined
                  }
                  onClick={(e) => {
                    e.preventDefault()
                    navigate(`topic/${t.id}`)
                    closeMobile()
                  }}
                >
                  <span className={`topic-nav-dot ${t.color}`} />
                  <span>
                    Topic {t.number}
                    <small>{t.shortTitle}</small>
                  </span>
                </a>
              ))}
            </div>
          )}
          {navigation.slice(2).map(item)}
        </nav>
        <div className="sidebar-plan">
          <Sparkles size={20} />
          <h3>A little code. A big future.</h3>
          <p>Make time for your next small win.</p>
          <button onClick={openPlan}>
            My study plan
            <ArrowUpRight size={15} />
          </button>
        </div>
        <div className="sidebar-bottom">
          <button onClick={openHelp}>
            <CircleHelp size={16} />
            Getting started
            <ArrowUpRight size={15} />
          </button>
          <div className="sidebar-footer">
            <span className="live-dot" />
            Device-specific progress<span>v2.0</span>
          </div>
        </div>
      </aside>
    </>
  )
}
export function Header({
  title,
  name,
  openMenu,
  openSearch,
  openNotifications,
  openProfile,
}) {
  return (
    <header className="topbar">
      <div className="breadcrumb">
        <button
          className="icon-button mobile-menu"
          aria-label="Open navigation"
          onClick={openMenu}
        >
          <Menu size={21} />
        </button>
        <span>Learning hub</span>
        <ChevronRight size={14} />
        <strong>{title}</strong>
      </div>
      <div className="topbar-actions">
        <button className="global-search" onClick={openSearch}>
          <Search size={17} />
          <span>Find your next discovery</span>
          <kbd>⌘ K</kbd>
        </button>
        <button
          className="icon-button"
          aria-label="Open notifications"
          onClick={openNotifications}
        >
          <Bell size={20} />
        </button>
        <button
          className="profile-button"
          aria-label="Open profile settings"
          onClick={openProfile}
        >
          <span className="avatar">{name.slice(0, 1).toUpperCase()}</span>
          <span className="profile-name">
            {name}
            <small>My learning space</small>
          </span>
          <Settings2 size={17} />
        </button>
      </div>
    </header>
  )
}
