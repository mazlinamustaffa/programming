import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeft, ArrowUpRight, BookImage, Download, FileText, Image, Maximize2, Search, Sparkles, X, ZoomIn, ZoomOut } from 'lucide-react'
import { topics } from '../data/topics.js'
import { contentURL } from '../lib/content.js'
import './libraries.css'

const EMPTY = []
const COLOURS = ['#9b79ff', '#53b8ff', '#ed82c2', '#48d8bd', '#ffc269']
const topicNumber = topic => Number(topic.number ?? topic.id)
const matchesTopic = (topic, id) => String(topic.id) === String(id) || topicNumber(topic) === Number(id)
const LABELS = {
  infographic: { title: 'Infographic Library', singular: 'infographic', plural: 'infographics', Icon: Image, description: 'See the big picture. Explore visual notes organised around your five learning topics.' },
  comic: { title: 'Comic Notes Library', singular: 'comic note', plural: 'comic notes', Icon: BookImage, description: 'Follow the story behind the code. Discover lecturer-published comic notes for every topic.' },
  pdf: { title: 'PDF Notes Library', singular: 'PDF note', plural: 'PDF notes', Icon: FileText, description: 'Your topic notes, in one place. Read and download lecturer-published PDF resources.' },
}

function fileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return 'Learning resource'
  return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`
}

function ResourceThumbnail({ resource, Icon }) {
  const [failed, setFailed] = useState(false)
  const url = contentURL(resource.file)
  const isPdf = resource.mimeType === 'application/pdf' || /\.pdf$/i.test(resource.file || '')
  if (isPdf || failed || !url) return <div className="rl-file-art"><Icon size={44} aria-hidden="true" /><span>{isPdf ? 'PDF DOCUMENT' : failed ? 'Open or download material' : 'Preview unavailable'}</span></div>
  return <img src={url} alt={resource.title} loading="lazy" onError={() => setFailed(true)} />
}

function ResourcePreview({ resource, onClose, navigate }) {
  const dialogRef = useRef(null)
  const closeRef = useRef(null)
  const [zoom, setZoom] = useState(1)
  const [imageFailed, setImageFailed] = useState(false)
  const url = contentURL(resource.file)
  const isPdf = resource.mimeType === 'application/pdf' || /\.pdf$/i.test(resource.file || '')
  const topic = topics.find(item => matchesTopic(item, resource.topicId))

  useEffect(() => {
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const handleKey = event => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
      if (event.key !== 'Tab') return
      const focusable = Array.from(dialogRef.current?.querySelectorAll('button:not([disabled]), a[href], iframe, input, [tabindex="0"]') || []).filter(element => element.getClientRects().length > 0)
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (!first) { event.preventDefault(); dialogRef.current?.focus(); return }
      if (event.shiftKey && (document.activeElement === first || !dialogRef.current?.contains(document.activeElement))) {
        event.preventDefault(); last.focus()
      } else if (!event.shiftKey && (document.activeElement === last || !dialogRef.current?.contains(document.activeElement))) {
        event.preventDefault(); first.focus()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKey)
      if (previousFocus?.isConnected) previousFocus.focus()
    }
  }, [onClose])

  return createPortal(
    <div className="rl-preview-backdrop" onClick={event => { if (event.target === event.currentTarget) onClose() }}>
      <section ref={dialogRef} className="rl-preview" role="dialog" aria-modal="true" aria-labelledby="rl-preview-title" tabIndex={-1}>
        <div className="rl-preview-header">
          <div><span className="rl-eyebrow">TOPIC {topic ? topicNumber(topic) : resource.topicId} · PUBLISHED MATERIAL</span><h2 id="rl-preview-title">{resource.title}</h2></div>
          <button ref={closeRef} className="rl-icon-button" onClick={onClose} aria-label="Close resource preview"><X size={22} /></button>
        </div>
        <div className="rl-preview-toolbar">
          {!isPdf && <div className="rl-zoom-controls"><button className="rl-icon-button" onClick={() => setZoom(value => Math.max(0.5, +(value - 0.25).toFixed(2)))} disabled={zoom <= 0.5} aria-label="Zoom out"><ZoomOut size={18} /></button><output aria-live="polite">{Math.round(zoom * 100)}%</output><button className="rl-icon-button" onClick={() => setZoom(value => Math.min(3, +(value + 0.25).toFixed(2)))} disabled={zoom >= 3} aria-label="Zoom in"><ZoomIn size={18} /></button><button className="rl-small-button" onClick={() => setZoom(1)}>Reset zoom</button></div>}
          <a className="rl-download-button" href={url} download={resource.fileName || undefined}><Download size={17} /> Download {isPdf ? 'PDF' : 'image'}</a>
        </div>
        <div className={`rl-preview-canvas ${isPdf ? 'rl-preview-pdf' : ''}`}>
          {isPdf ? <iframe src={url} title={`PDF preview: ${resource.title}`} /> : imageFailed ? <div className="rl-preview-fallback"><Image size={42} /><p>The image preview is unavailable. Use Download image to open the original file.</p></div> : <div className="rl-image-stage" style={{ width: `${zoom * 100}%`, minWidth: `${zoom * 100}%` }}><img src={url} alt={resource.description || resource.title} onError={() => setImageFailed(true)} /></div>}
        </div>
        <div className="rl-preview-footer"><div>{resource.description && <p>{resource.description}</p>}{isPdf && <p className="rl-muted">Use your PDF viewer’s zoom controls. Download the PDF if the preview does not appear.</p>}</div><button className="rl-small-button" onClick={() => { onClose(); navigate?.(`topic/${topic?.id ?? resource.topicId}`) }}><ArrowLeft size={16} /> Back to Topic {topic ? topicNumber(topic) : resource.topicId}</button></div>
      </section>
    </div>, document.body,
  )
}

export default function ResourceLibrary({ kind = 'infographic', topicId, catalog, navigate, notify }) {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [preview, setPreview] = useState(null)
  const records = catalog?.published?.resources || EMPTY
  const activeTopic = topicId ?? filter
  const meta = LABELS[kind] || LABELS.infographic
  const Icon = meta.Icon
  const resources = useMemo(() => records.filter(resource => resource.kind === kind && topics.some(topic => matchesTopic(topic, resource.topicId))), [records, kind])
  const visibleTopics = topics.filter(topic => activeTopic === 'all' || matchesTopic(topic, activeTopic))
  const term = search.trim().toLowerCase()
  const filtered = resources.filter(resource => `${resource.title} ${resource.description || ''}`.toLowerCase().includes(term))

  const openResource = resource => {
    if (!contentURL(resource.file)) { notify?.('This published file has an invalid path. Please ask your lecturer to check the resource.'); return }
    setPreview(resource)
  }

  return <div className="rl-page">
    <header className="rl-page-header"><div><span className="rl-eyebrow"><Sparkles size={14} /> VISUAL LEARNING COLLECTION</span><h1>{meta.title}</h1><p>{meta.description}</p></div><button className="rl-small-button" onClick={() => navigate?.('manager')}>Content Manager <ArrowUpRight size={16} /></button></header>
    <div className="rl-published-note"><span className="rl-status-dot" />Published resources are available to everyone. Lecturer drafts stay on the device until published through GitHub.</div>
    <div className="rl-library-controls">
      {!topicId && <div className="rl-topic-filters" role="group" aria-label="Filter resources by topic"><button className={activeTopic === 'all' ? 'rl-filter active' : 'rl-filter'} onClick={() => setFilter('all')}>All topics</button>{topics.map(topic => <button key={topic.id} className={matchesTopic(topic, activeTopic) ? 'rl-filter active' : 'rl-filter'} onClick={() => setFilter(topic.id)}>Topic {topicNumber(topic)}</button>)}</div>}
      <label className="rl-search"><Search size={17} aria-hidden="true" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder={`Search ${meta.plural}…`} aria-label={`Search ${meta.plural}`} /></label>
    </div>
    {catalog?.loading && <div className="rl-status-message" role="status">Loading published materials…</div>}
    {catalog?.error && <div className="rl-status-message rl-error-message" role="alert">Published materials could not be loaded. {String(catalog.error.message || catalog.error)}</div>}
    <div className="rl-topic-sections">{visibleTopics.map(topic => {
      const topicResources = filtered.filter(resource => matchesTopic(topic, resource.topicId))
      const publishedCount = resources.filter(resource => matchesTopic(topic, resource.topicId)).length
      return <section className="rl-topic-section" key={topic.id} style={{ '--rl-accent': COLOURS[(topicNumber(topic) - 1) % COLOURS.length] }} aria-labelledby={`rl-topic-${kind}-${topic.id}`}>
        <div className="rl-topic-heading"><span className="rl-topic-number">0{topicNumber(topic)}</span><div><span className="rl-eyebrow">TOPIC {topicNumber(topic)}</span><h2 id={`rl-topic-${kind}-${topic.id}`}>{topic.title}</h2></div><button className="rl-topic-link" onClick={() => navigate?.(`topic/${topic.id}`)} aria-label={`Back to Topic ${topicNumber(topic)}`}><ArrowUpRight size={20} /></button></div>
        {topicResources.length ? <div className="rl-resource-grid">{topicResources.map(resource => <article className="rl-resource-card" key={resource.id}>
          <button className="rl-thumbnail" onClick={() => openResource(resource)} aria-label={`Preview ${resource.title}`}><ResourceThumbnail resource={resource} Icon={Icon} /><span className="rl-thumbnail-overlay"><Maximize2 size={18} /> Preview material</span></button>
          <div className="rl-resource-body"><div className="rl-resource-meta"><span>Topic {topicNumber(topic)}</span><span>{fileSize(resource.size)}</span></div><h3>{resource.title}</h3><p>{resource.description || `Published ${meta.singular} for this topic.`}</p><div className="rl-card-actions"><button className="rl-preview-button" onClick={() => openResource(resource)}>Preview <ArrowUpRight size={16} /></button>{contentURL(resource.file) && <a className="rl-icon-button" href={contentURL(resource.file)} download={resource.fileName || undefined} aria-label={`Download ${resource.title}`}><Download size={17} /></a>}</div></div>
        </article>)}</div> : <div className="rl-empty-topic"><div className="rl-empty-art"><span /><Icon size={38} aria-hidden="true" /></div><div><h3>{publishedCount && term ? 'No matching materials' : `Your ${meta.plural} belong here`}</h3><p>{publishedCount && term ? 'Try another search to find a published resource.' : `No ${meta.plural} have been published for Topic ${topicNumber(topic)} yet. Your lecturer will add the actual learning materials.`}</p></div><span className="rl-empty-label">{publishedCount && term ? 'SEARCH RESULTS' : 'READY FOR LECTURER MATERIALS'}</span></div>}
      </section>
    })}</div>
    {preview && <ResourcePreview key={preview.id} resource={preview} navigate={navigate} onClose={() => setPreview(null)} />}
  </div>
}
