import {
  LayoutDashboard,
  GraduationCap,
  Terminal,
  ClipboardCheck,
  FolderOpen,
  ChevronDown,
  ArrowUpRight,
  Search,
  Bell,
  Menu,
  X,
  Code2,
  Sparkles,
  ChevronRight,
} from 'lucide-react'

const navigation = [
  ['overview', 'Overview', LayoutDashboard],
  ['learning', 'My learning', GraduationCap],
  ['lab', 'Practice lab', Terminal],
  ['assessments', 'Assessments', ClipboardCheck],
  ['resources', 'Resources', FolderOpen],
]

export function Sidebar({
  current,
  navigate,
  mobileOpen,
  closeMobile,
  openPlan,
  openHelp,
}) {
  return (
    <>
      {mobileOpen && (
        <button
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={closeMobile}
        />
      )}
      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <a className="brand" href="#overview" onClick={closeMobile}>
          <span className="brand-mark">
            <Code2 size={24} />
          </span>
          <span>
            fundamentals<span className="brand-sub">PROGRAMMING HUB</span>
          </span>
        </a>
        <button
          className="mobile-close icon-button"
          onClick={closeMobile}
          aria-label="Close navigation"
        >
          <X size={20} />
        </button>
        <div className="workspace-select">
          <span className="workspace-symbol">PF</span>
          <span>
            My learning space<small>C++ · Foundations</small>
          </span>
          <span className="workspace-dot" />
        </div>
        <span className="nav-label">WORKSPACE</span>
        <nav aria-label="Main navigation">
          {navigation.map(([id, label, Icon]) => (
            <a
              key={id}
              href={`#${id}`}
              className={`nav-item ${current === id ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault()
                navigate(id)
                closeMobile()
              }}
              aria-current={current === id ? 'page' : undefined}
            >
              <Icon size={19} strokeWidth={1.7} />
              <span>{label}</span>
              {id === 'learning' && <span className="nav-count">5</span>}
              {current === id && <span className="nav-active-dot" />}
            </a>
          ))}
        </nav>
        <div className="sidebar-plan">
          <span className="plan-icon">
            <Sparkles size={20} />
          </span>
          <h3>Small steps. Big skills.</h3>
          <p>
            A little practice every day
            <br />
            makes a lasting difference.
          </p>
          <button onClick={openPlan}>
            Set your study plan
            <ArrowUpRight size={15} />
          </button>
        </div>
        <div className="sidebar-bottom">
          <button onClick={openHelp}>
            <span className="help-symbol">?</span>Help & getting started
            <ArrowUpRight size={15} />
          </button>
          <div className="sidebar-footer">
            <span className="live-dot" />
            Your learning, your pace<span>v1.0</span>
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
        <span>Workspace</span>
        <ChevronRight size={14} />
        <strong>{title}</strong>
      </div>
      <div className="topbar-actions">
        <button className="global-search" onClick={openSearch}>
          <Search size={17} />
          <span>Search anything...</span>
          <kbd>⌘ K</kbd>
        </button>
        <span className="header-divider" />
        <button
          className="icon-button notification-button"
          aria-label="Open notifications"
          onClick={openNotifications}
        >
          <Bell size={20} />
          <i />
        </button>
        <button
          className="profile-button"
          onClick={openProfile}
          aria-label="Open profile settings"
        >
          <span className="avatar">{name.slice(0, 1).toUpperCase()}</span>
          <span className="profile-text">
            {name}
            <small>Student workspace</small>
          </span>
          <ChevronDown size={14} />
        </button>
      </div>
    </header>
  )
}
