import { useEffect, useRef } from 'react'
import { X, ArrowUpRight } from 'lucide-react'
import { topicIcons } from './icons'

export function TopicIcon({ topic, size = 22 }) {
  const Icon = topicIcons[topic.icon] || topicIcons.Compass
  return (
    <span className={`topic-icon ${topic.color}`}>
      <Icon size={size} strokeWidth={1.8} />
    </span>
  )
}

export function Status({ status }) {
  return (
    <span className={`status ${status}`}>
      <i />
      {status === 'completed'
        ? 'Completed'
        : status === 'in-progress'
          ? 'In progress'
          : 'Not started'}
    </span>
  )
}

export function ProgressBar({ value, color = 'orange' }) {
  return (
    <div
      className={`progress-track ${color}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Topic progress"
    >
      <span style={{ width: `${value}%` }} />
    </div>
  )
}

export function SectionHeading({ eyebrow, title, detail, action, onAction }) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {detail && <p>{detail}</p>}
      </div>
      {action && (
        <button className="text-button" onClick={onAction}>
          {action}
          <ArrowUpRight size={16} />
        </button>
      )}
    </div>
  )
}

export function Dialog({ title, children, onClose, wide = false }) {
  const ref = useRef(null)
  useEffect(() => {
    const previous = document.activeElement
    const getControls = () =>
      [
        ...ref.current.querySelectorAll(
          'button, input, select, textarea, a[href], [tabindex="0"]',
        ),
      ].filter((el) => !el.disabled)
    getControls()[0]?.focus()
    const oldOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function keyHandler(e) {
      if (e.key === 'Escape') onClose()
      if (e.key !== 'Tab') return
      const controls = getControls()
      if (e.shiftKey && document.activeElement === controls[0]) {
        e.preventDefault()
        controls.at(-1)?.focus()
      }
      if (!e.shiftKey && document.activeElement === controls.at(-1)) {
        e.preventDefault()
        controls[0]?.focus()
      }
    }
    document.addEventListener('keydown', keyHandler)
    return () => {
      document.removeEventListener('keydown', keyHandler)
      document.body.style.overflow = oldOverflow
      previous?.focus()
    }
  }, [onClose])
  return (
    <div
      className="dialog-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <section
        ref={ref}
        className={`dialog ${wide ? 'wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <div className="dialog-heading">
          <h2 id="dialog-title">{title}</h2>
          <button
            className="icon-button"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </section>
    </div>
  )
}
