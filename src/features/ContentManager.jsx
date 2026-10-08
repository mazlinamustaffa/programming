import { useEffect, useRef, useState } from 'react'
import { Archive, ArrowRight, BookImage, Check, Cloud, Download, FileText, Gamepad2, ImagePlus, Layers, Pencil, Plus, Save, Search, ShieldCheck, Trash2, Upload, X } from 'lucide-react'
import { topics } from '../data/topics.js'
import { contentURL, DIFFICULTIES, downloadBlob, makeContentId, makeFilePath, PLATFORMS, verifyFileSignature } from '../lib/content.js'
import './content.css'

const types = [
  { id: 'infographic', title: 'Infographic notes', detail: 'JPG · PNG · WEBP', icon: ImagePlus },
  { id: 'comic', title: 'Comic notes', detail: 'Images or PDF', icon: BookImage },
  { id: 'pdf', title: 'PDF notes', detail: 'PDF documents', icon: FileText },
  { id: 'game', title: 'Quiz & game links', detail: 'Educational HTTPS links', icon: Gamepad2 },
]
const newEditor = (kind = 'infographic') => ({ type: kind === 'game' ? 'game' : 'resource', kind, topicId: 1, title: '', description: '', platform: PLATFORMS[0], difficulty: DIFFICULTIES[0], url: '', id: '' })
const topicName = (id) => topics.find((topic) => Number(topic.number) === Number(id))?.title || `Topic ${id}`

function MaterialPreview({ record, file, large = false }) {
  const previewRef = useRef(null)
  const [imageError, setImageError] = useState(false)
  const mime = file?.type || record?.mimeType || ''
  const blob = file || record?.fileBlob
  const path = record?.file
  useEffect(() => {
    const objectURL = blob ? URL.createObjectURL(blob) : ''
    const source = objectURL || contentURL(path)
    if (previewRef.current) previewRef.current.src = source
    return () => { if (objectURL) URL.revokeObjectURL(objectURL) }
  }, [blob, path, mime])
  if (!blob && !path) return <div className="cm-preview-empty"><ImagePlus size={30} /><strong>Your material preview</strong><span>Choose an image or PDF to see it here.</span></div>
  return <div className={`cm-file-preview ${large ? 'cm-preview-large' : ''}`}>
    {mime === 'application/pdf' ? <><iframe ref={previewRef} title={`PDF preview: ${record?.title || file?.name || 'selected notes'}`} /><p>PDF previews depend on your browser. Use Download if the preview is unavailable.</p></> : <><img ref={previewRef} alt={record?.title || file?.name || 'Selected learning material'} onError={() => setImageError(true)} onLoad={() => setImageError(false)} style={imageError ? { display: 'none' } : undefined} />{imageError && <p>This image cannot be previewed. Check the original file and choose a replacement if necessary.</p>}</>}
  </div>
}

function ManagerDialog({ title, children, onClose }) {
  const ref = useRef(null)
  useEffect(() => {
    const dialog = ref.current
    const previous = document.activeElement
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.showModal()
    return () => { dialog.close(); document.body.style.overflow = overflow; previous?.focus() }
  }, [])
  return <dialog ref={ref} className="cm-dialog" aria-labelledby="cm-dialog-title" onCancel={(event) => { event.preventDefault(); onClose() }}>
    <div className="cm-dialog-header"><h2 id="cm-dialog-title">{title}</h2><button className="cm-icon-button" aria-label="Close preview" onClick={onClose}><X size={20} /></button></div>
    {children}
  </dialog>
}

export function ContentManager({ catalog, notify, navigate }) {
  const [editor, setEditor] = useState(() => newEditor())
  const [selectedFile, setSelectedFile] = useState(null)
  const [formError, setFormError] = useState('')
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [filterTopic, setFilterTopic] = useState('all')
  const [search, setSearch] = useState('')
  const [preview, setPreview] = useState(null)
  const [deleteCandidate, setDeleteCandidate] = useState(null)
  const [fileKey, setFileKey] = useState(0)
  const editorRef = useRef(null)
  const [resourceBusy, setResourceBusy] = useState('')
  const localDrafts = catalog.drafts || []
  const publishedRows = [...(catalog.published?.resources || []).map((resource) => ({ ...resource, type: 'resource' })), ...(catalog.published?.games || []).map((game) => ({ ...game, type: 'game' }))]
  const matches = (record) => (filterTopic === 'all' || Number(record.topicId) === Number(filterTopic)) && `${record.title || ''} ${record.description || ''}`.toLowerCase().includes(search.toLowerCase())
  const visiblePublished = publishedRows.filter(matches)
  const visibleDrafts = localDrafts.filter(matches)
  const isGame = editor.type === 'game'
  const publishMessage = (message) => { setStatus(message); notify?.(message) }
  const update = (field) => (event) => { setEditor((previous) => ({ ...previous, [field]: event.target.value })); setFormError('') }
  const resetEditor = (kind = editor.kind) => {
    setEditor(newEditor(kind)); setSelectedFile(null); setFormError(''); setFileKey((previous) => previous + 1)
  }
  const chooseKind = (kind) => { resetEditor(kind); setStatus('') }
  const edit = (record) => {
    if (record.action === 'delete') return
    setEditor({ ...newEditor(record.kind || 'game'), ...record })
    setSelectedFile(null); setFormError(''); setStatus(''); setFileKey((previous) => previous + 1)
    editorRef.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
  }
  const chooseFile = async (event) => {
    const file = event.target.files?.[0]
    setFormError(''); setSelectedFile(null)
    if (!file) return
    try { await verifyFileSignature(file, editor.kind); setSelectedFile(file) }
    catch (cause) { setFormError(cause.message); event.target.value = '' }
  }
  const save = async (event) => {
    event.preventDefault(); setFormError(''); setStatus(''); setBusy(true)
    try {
      const id = editor.id || makeContentId(editor.type)
      let draft = { ...editor, id, topicId: Number(editor.topicId), action: 'upsert' }
      if (!isGame) {
        const blob = selectedFile || editor.fileBlob
        if (blob) {
          const filename = selectedFile?.name || editor.fileName
          const file = new File([blob], filename, { type: selectedFile?.type || editor.mimeType })
          const details = await verifyFileSignature(file, editor.kind)
          draft = { ...draft, file: makeFilePath(id, details.extension), mimeType: details.mimeType, fileName: file.name, size: file.size, fileBlob: blob }
        } else if (!editor.file) throw new Error('Choose a material file before saving your draft.')
      }
      const saved = await catalog.saveDraft(draft)
      setEditor({ ...newEditor(saved.kind || 'game'), ...saved }); setSelectedFile(null)
      publishMessage('Draft saved on this device. Export an update package when you are ready to publish.')
    } catch (cause) { setFormError(cause.message) }
    finally { setBusy(false) }
  }
  const discard = async (record) => {
    setResourceBusy(record.id)
    try { await catalog.deleteDraft(record.id); if (editor.id === record.id) resetEditor(); publishMessage('Local draft discarded. Published content is unchanged.') }
    catch (cause) { setFormError(cause.message) }
    finally { setResourceBusy(''); setDeleteCandidate(null) }
  }
  const deletePublished = async (record) => {
    setResourceBusy(record.id)
    try {
      await catalog.saveDraft({ id: record.id, type: record.type, action: 'delete', title: record.title, topicId: record.topicId })
      if (editor.id === record.id) resetEditor()
      publishMessage('Removal saved as a local draft. The public material stays visible until you export and publish this change.')
    } catch (cause) { setFormError(cause.message) }
    finally { setResourceBusy(''); setDeleteCandidate(null) }
  }
  const exportChanges = async () => {
    setExporting(true); setFormError(''); setStatus('')
    try { await catalog.exportPackage(); publishMessage('Update ZIP downloaded. Follow README-PUBLISH.txt inside it to commit the files to GitHub.') }
    catch (cause) { setFormError(cause.message) }
    finally { setExporting(false) }
  }
  const downloadResource = (record) => {
    if (record.fileBlob) downloadBlob(record.fileBlob, record.fileName || record.title)
    else {
      const anchor = document.createElement('a'); anchor.href = contentURL(record.file); anchor.download = record.fileName || record.title; document.body.appendChild(anchor); anchor.click(); anchor.remove()
    }
  }
  return <div className="cm-page">
    <header className="cm-hero">
      <div className="cm-hero-icon"><Layers size={30} /></div>
      <div><span className="cm-eyebrow">YOUR TEACHING STUDIO</span><h1>Content Manager</h1><p>Add your materials. Preview with confidence. Publish through your existing GitHub repository.</p></div>
      <button className="cm-primary" onClick={exportChanges} disabled={exporting || catalog.loading || !!catalog.error}>{exporting ? <span className="cm-spinner" /> : <Archive size={18} />}{exporting ? 'Preparing package…' : 'Export update package'}</button>
    </header>
    <div className="cm-status-grid">
      <div className="cm-status-card"><span className="cm-status-icon cm-purple"><Save size={21} /></span><div><strong>{localDrafts.length} local {localDrafts.length === 1 ? 'draft' : 'drafts'}</strong><p>This browser and device only</p></div><span className="cm-badge cm-local">LOCAL</span></div>
      <div className="cm-status-card"><span className="cm-status-icon cm-green"><Cloud size={21} /></span><div><strong>{publishedRows.length} published {publishedRows.length === 1 ? 'item' : 'items'}</strong><p>Visible to everyone on the website</p></div><span className="cm-badge cm-public">PUBLIC</span></div>
    </div>
    <div className="cm-callout"><ShieldCheck size={20} /><p><strong>You are editing browser-local drafts.</strong> Saving or exporting does not update the live website. No admin login or GitHub credentials are required here. Publish the exported files through GitHub to make them available to students.</p></div>
    {catalog.loading && <p className="cm-message" role="status">Loading materials and local drafts…</p>}
    {catalog.error && <div className="cm-error" role="alert">{catalog.error} <button onClick={() => catalog.refresh()}>Retry loading</button></div>}
    {catalog.storageError && <div className="cm-error" role="alert">{catalog.storageError} Draft saving is currently unavailable. <button onClick={() => catalog.refresh()}>Retry storage</button></div>}
    {formError && <p className="cm-error" role="alert">{formError}</p>}
    {status && <p className="cm-success" role="status"><Check size={18} />{status}</p>}
    <section className="cm-workspace" ref={editorRef}>
      <div className="cm-editor">
        <div className="cm-section-title"><div><span className="cm-eyebrow">CREATE & CURATE</span><h2>{editor.id ? 'Edit material draft' : 'Add a new material'}</h2></div>{editor.id && <button className="cm-text-button" onClick={() => resetEditor()}><Plus size={16} /> New material</button>}</div>
        <div className="cm-type-grid" aria-label="Material type">{types.map(({ id, title, detail, icon: Icon }) => <button key={id} type="button" className={`cm-type-button ${editor.kind === id ? 'is-active' : ''}`} onClick={() => chooseKind(id)} aria-pressed={editor.kind === id}><Icon size={22} /><strong>{title}</strong><span>{detail}</span></button>)}</div>
        <form onSubmit={save} className="cm-form">
          <div className="cm-form-row"><label>Topic<select aria-label="Topic" value={editor.topicId} onChange={update('topicId')}>{topics.map((topic) => <option key={topic.id} value={topic.number}>Topic {topic.number} · {topic.title}</option>)}</select></label><label>Title<input required maxLength={120} value={editor.title} onChange={update('title')} placeholder={isGame ? 'e.g. Selection structure challenge' : 'e.g. Understanding input, process & output'} /></label></div>
          {isGame ? <><div className="cm-form-row"><label>Quiz platform<select aria-label="Quiz platform" value={editor.platform} onChange={update('platform')}>{PLATFORMS.map((platform) => <option key={platform}>{platform}</option>)}</select></label><label>Difficulty<select aria-label="Difficulty" value={editor.difficulty} onChange={update('difficulty')}>{DIFFICULTIES.map((difficulty) => <option key={difficulty}>{difficulty}</option>)}</select></label></div><label>Game URL<input type="url" required value={editor.url} onChange={update('url')} placeholder="https://…" inputMode="url" /><small>Use a public HTTPS link. Students open games in a new tab.</small></label></> : <label className="cm-upload"><Upload size={25} /><strong>{editor.file ? 'Choose a replacement file (optional)' : 'Choose your material file'}</strong><span>{types.find((type) => type.id === editor.kind)?.detail} · Maximum 10 MB</span><input key={fileKey} type="file" accept={editor.kind === 'pdf' ? '.pdf,application/pdf' : editor.kind === 'infographic' ? '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp' : '.jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf'} onChange={chooseFile} aria-label="Upload material file" /><small>{selectedFile?.name || editor.fileName || 'The file stays on this device until you publish the update package.'}</small></label>}
          <label>Short description<textarea maxLength={1000} rows={3} value={editor.description} onChange={update('description')} placeholder="Tell students how this material supports their learning." /></label>
          <div className="cm-form-footer"><span><Save size={15} />Saved privately in this browser</span><button className="cm-primary" type="submit" disabled={busy || catalog.loading || !!catalog.storageError}>{busy ? <span className="cm-spinner" /> : <Save size={17} />}{busy ? 'Saving…' : 'Save draft'}</button></div>
        </form>
      </div>
      <aside className="cm-preview-panel"><span className="cm-eyebrow">BEFORE YOU PUBLISH</span><h2>Live material preview</h2>{isGame ? <div className="cm-game-preview"><Gamepad2 size={36} /><span className="cm-badge cm-local">LOCAL PREVIEW</span><h3>{editor.title || 'Your next learning challenge'}</h3><p>{editor.description || 'Add a title and description to help students choose this activity.'}</p><div><span>{editor.platform}</span><span>{editor.difficulty}</span></div><small>Topic {editor.topicId} · Links appear in Quiz & Game Zone after publication.</small></div> : <MaterialPreview record={editor} file={selectedFile} />}
        <div className="cm-preview-caption"><strong>{editor.title || 'Untitled material'}</strong><span>Topic {editor.topicId} · {topicName(editor.topicId)}</span><p>{editor.description || 'Your description appears alongside the published material.'}</p></div>
        {!isGame && (selectedFile || editor.fileBlob || editor.file) && <button className="cm-secondary" onClick={() => setPreview({ ...editor, fileBlob: selectedFile || editor.fileBlob, mimeType: selectedFile?.type || editor.mimeType })}>Open large preview <ArrowRight size={16} /></button>}
      </aside>
    </section>
    <section className="cm-collection">
      <div className="cm-section-title"><div><span className="cm-eyebrow">MATERIAL COLLECTION</span><h2>Manage your resources</h2></div><button className="cm-text-button" onClick={() => navigate?.('games')}>Open Quiz & Game Zone <ArrowRight size={16} /></button></div>
      <div className="cm-filter-row"><label className="cm-search"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search material titles…" aria-label="Search materials" /></label><label className="cm-topic-filter"><span>Topic</span><select aria-label="Filter materials by topic" value={filterTopic} onChange={(event) => setFilterTopic(event.target.value)}><option value="all">All topics</option>{topics.map((topic) => <option key={topic.id} value={topic.number}>Topic {topic.number}</option>)}</select></label></div>
      <div className="cm-list-heading"><h3><Save size={18} />Local drafts</h3><span>Included in the next export · device-specific</span></div>
      {visibleDrafts.length ? <div className="cm-resource-list">{visibleDrafts.map((record) => <div className="cm-resource-row" key={record.id}><span className={`cm-resource-icon ${record.type === 'game' ? 'cm-pink' : 'cm-purple'}`}>{record.action === 'delete' ? <Trash2 size={22} /> : record.type === 'game' ? <Gamepad2 size={22} /> : <FileText size={22} />}</span><div className="cm-resource-description"><strong>{record.title}</strong><span>{record.action === 'delete' ? 'Planned public removal' : `Topic ${record.topicId} · ${record.type === 'game' ? record.platform : types.find((type) => type.id === record.kind)?.title}`}</span></div><span className="cm-badge cm-local">{record.action === 'delete' ? 'REMOVE ON PUBLISH' : 'LOCAL DRAFT'}</span><div className="cm-row-actions">{record.action !== 'delete' && <><button className="cm-icon-button" aria-label={`Preview draft ${record.title}`} onClick={() => setPreview(record)}><Search size={17} /></button><button className="cm-icon-button" aria-label={`Edit draft ${record.title}`} onClick={() => edit(record)}><Pencil size={17} /></button></>}<button className="cm-icon-button cm-delete" aria-label={`Discard local draft ${record.title}`} disabled={resourceBusy === record.id} onClick={() => setDeleteCandidate({ record, local: true })}><Trash2 size={17} /></button></div></div>)}</div> : <div className="cm-empty"><Save size={24} /><strong>{search || filterTopic !== 'all' ? 'No matching local drafts' : 'Your teaching ideas start here'}</strong><p>Add your first material above, then save a draft.</p></div>}
      <div className="cm-list-heading"><h3><Cloud size={18} />Published materials</h3><span>Loaded from version-controlled project files</span></div>
      {visiblePublished.length ? <div className="cm-resource-list">{visiblePublished.map((record) => <div className="cm-resource-row" key={record.id}><span className="cm-resource-icon cm-green">{record.type === 'game' ? <Gamepad2 size={22} /> : <FileText size={22} />}</span><div className="cm-resource-description"><strong>{record.title}</strong><span>Topic {record.topicId} · {record.type === 'game' ? record.platform : types.find((type) => type.id === record.kind)?.title}</span></div><span className="cm-badge cm-public">PUBLISHED</span><div className="cm-row-actions"><button className="cm-icon-button" aria-label={`Preview published ${record.title}`} onClick={() => setPreview(record)}><Search size={17} /></button><button className="cm-icon-button" aria-label={`Edit published ${record.title} as local draft`} onClick={() => edit(record)}><Pencil size={17} /></button><button className="cm-icon-button cm-delete" aria-label={`Plan removal of published ${record.title}`} disabled={resourceBusy === record.id} onClick={() => setDeleteCandidate({ record, local: false })}><Trash2 size={17} /></button></div></div>)}</div> : <div className="cm-empty"><Cloud size={24} /><strong>{search || filterTopic !== 'all' ? 'No matching published materials' : 'Ready for your original materials'}</strong><p>Your infographic, comic, PDF and game cards appear here after publication.</p></div>}
    </section>
    <section className="cm-publish-guide"><div><span className="cm-eyebrow">FROM YOUR DEVICE TO YOUR STUDENTS</span><h2>Publish in three simple steps</h2><p>Your website keeps the same address. Your existing GitHub Actions workflow handles deployment.</p></div><ol><li><span>1</span><div><strong>Save your drafts</strong><p>Review every material and game link. Unsaved form changes are not exported.</p></div></li><li><span>2</span><div><strong>Export your update ZIP</strong><p>Includes a complete content folder, real resource files, links, and a beginner-friendly publishing guide.</p></div></li><li><span>3</span><div><strong>Commit the files to GitHub</strong><p>Replace only public/content in the existing repository, commit and push to main. Wait for Pages deployment, then refresh the website.</p></div></li></ol><button className="cm-primary" onClick={exportChanges} disabled={exporting || catalog.loading || !!catalog.error}><Archive size={18} />{exporting ? 'Preparing package…' : 'Export update package'}</button><p className="cm-fine-print">Published materials are public. Share only resources you own or have permission to use. Refresh before editing to avoid exporting an older catalog. Exporting is a manual publication workflow; this browser editor does not monitor all student devices.</p></section>
    {preview && <ManagerDialog title={preview.title || 'Material preview'} onClose={() => setPreview(null)}>{preview.type === 'game' ? <div className="cm-game-preview"><Gamepad2 size={40} /><span className="cm-badge cm-local">PREVIEW</span><h3>{preview.title}</h3><p>{preview.description}</p><span>{preview.platform} · {preview.difficulty}</span><p className="cm-link-preview">{preview.url}</p><p>This is a material preview. The public Play now link appears after publication.</p></div> : <><MaterialPreview record={preview} large /><button className="cm-secondary" onClick={() => downloadResource(preview)}><Download size={17} />Download material</button></>}</ManagerDialog>}
    {deleteCandidate && <ManagerDialog title={deleteCandidate.local ? 'Discard local draft?' : 'Prepare public removal?'} onClose={() => setDeleteCandidate(null)}><p className="cm-confirm-text">{deleteCandidate.local ? 'This removes the draft from this browser only. Any currently published material stays on the website.' : 'This saves a local removal draft. The material remains public until you export the update and commit it to GitHub.'}</p><div className="cm-confirm-actions"><button className="cm-secondary" onClick={() => setDeleteCandidate(null)}>Keep material</button><button className="cm-danger" disabled={resourceBusy === deleteCandidate.record.id} onClick={() => deleteCandidate.local ? discard(deleteCandidate.record) : deletePublished(deleteCandidate.record)}><Trash2 size={16} />{deleteCandidate.local ? 'Discard draft' : 'Save removal draft'}</button></div></ManagerDialog>}
  </div>
}

export default ContentManager
