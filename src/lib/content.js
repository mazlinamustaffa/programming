import { useCallback, useEffect, useState } from 'react'

export const CONTENT_DB = 'programming-fundamentals-content:v1'
export const MAX_FILE_SIZE = 10 * 1024 * 1024
export const PLATFORMS = ['Wayground / Quizizz', 'Wordwall', 'Kahoot', 'Blooket', 'Gimkit', 'Google Forms', 'Other']
export const DIFFICULTIES = ['Beginner', 'Intermediate', 'Challenge']
export const EMPTY_CATALOG = { version: 1, resources: [], games: [] }
const FILE_TYPES = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', pdf: 'application/pdf' }
class ContentStorageError extends Error {
  constructor(message) { super(message); this.name = 'ContentStorageError' }
}
const baseURL = () => import.meta.env?.BASE_URL || '/programming/'
const validId = (id) => typeof id === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(id)
const validTopic = (id) => (typeof id === 'number' || typeof id === 'string') && /^[1-5]$/.test(String(id))
const textField = (value, max = 250) => typeof value === 'string' ? value.trim().slice(0, max) : ''

export function contentURL(path) {
  return typeof path === 'string' && /^content\/files\/[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp|pdf)$/.test(path)
    ? `${baseURL()}${path}` : ''
}

export function validateExternalURL(value) {
  let url
  try { url = new URL(String(value).trim()) } catch { throw new Error('Enter a complete HTTPS link, for example https://wordwall.net/…') }
  const host = url.hostname.toLowerCase().replace(/\.$/, '')
  const octets = host.split('.').map(Number)
  const isIPv4 = /^\d+\.\d+\.\d+\.\d+$/.test(host)
  const isPrivateIPv4 = isIPv4 && (octets.some((part) => part > 255) || octets[0] === 0 || octets[0] === 10 || octets[0] === 127 || octets[0] >= 224 || (octets[0] === 169 && octets[1] === 254) || (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) || (octets[0] === 192 && octets[1] === 168) || (octets[0] === 100 && octets[1] >= 64 && octets[1] <= 127))
  if (url.protocol !== 'https:' || url.username || url.password || host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.localdomain') || !host.includes('.') || host.includes(':') || isPrivateIPv4) {
    throw new Error('Use a public HTTPS website link without passwords, local addresses, or private network addresses.')
  }
  return url.href
}

export function validateFile(file, kind) {
  if (!(file instanceof Blob) || !file.size) throw new Error('Choose a non-empty image or PDF file.')
  if (file.size > MAX_FILE_SIZE) throw new Error('This file is too large. Please use a file smaller than 10 MB.')
  const extension = (file.name || '').split('.').at(-1)?.toLowerCase()
  const mimeType = FILE_TYPES[extension]
  if (!mimeType || file.type !== mimeType || (kind === 'infographic' && extension === 'pdf') || (kind === 'pdf' && extension !== 'pdf') || !['infographic', 'comic', 'pdf'].includes(kind)) {
    throw new Error(kind === 'pdf' ? 'Choose a PDF file.' : kind === 'infographic' ? 'Choose a JPG, PNG, or WEBP image.' : 'Choose a JPG, PNG, WEBP, or PDF file.')
  }
  return { mimeType, extension }
}

export async function verifyFileSignature(file, kind) {
  const details = validateFile(file, kind)
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer())
  const at = (...values) => values.every((value, index) => bytes[index] === value)
  const text = (start, end) => String.fromCharCode(...bytes.slice(start, end))
  const matches = details.mimeType === 'image/jpeg' ? at(0xff, 0xd8, 0xff)
    : details.mimeType === 'image/png' ? at(137, 80, 78, 71, 13, 10, 26, 10)
      : details.mimeType === 'image/webp' ? text(0, 4) === 'RIFF' && text(8, 12) === 'WEBP'
        : text(0, 5) === '%PDF-'
  if (!matches) throw new Error('The file contents do not match its file type. Select a genuine image or PDF.')
  return details
}

export function normalizeRecord(record, type) {
  if (!record || !validId(record.id) || !validTopic(record.topicId) || !textField(record.title, 120)) throw new Error('Each material needs a valid identifier, topic, and title.')
  const common = { id: record.id, topicId: Number(record.topicId), title: textField(record.title, 120), description: textField(record.description, 1000) }
  if (type === 'game') {
    if (!PLATFORMS.includes(record.platform) || !DIFFICULTIES.includes(record.difficulty)) throw new Error('Choose a supported quiz platform and difficulty.')
    return { ...common, platform: record.platform, difficulty: record.difficulty, url: validateExternalURL(record.url) }
  }
  if (!['infographic', 'comic', 'pdf'].includes(record.kind) || !contentURL(record.file)) throw new Error('A resource must reference an image or PDF in content/files/.')
  const extension = record.file.split('.').at(-1)
  if (FILE_TYPES[extension] !== record.mimeType || (record.kind === 'infographic' && extension === 'pdf') || (record.kind === 'pdf' && extension !== 'pdf')) throw new Error('The resource file type does not match its learning material category.')
  return { ...common, kind: record.kind, file: record.file, mimeType: record.mimeType, fileName: textField(record.fileName || record.file.split('/').at(-1), 180), size: Math.max(0, Number(record.size) || 0) }
}

export function validateManifest(value) {
  if (!value || value.version !== 1 || !Array.isArray(value.resources) || !Array.isArray(value.games)) throw new Error('The published content manifest is invalid. Its version must be 1.')
  const resources = value.resources.map((entry) => normalizeRecord(entry, 'resource'))
  const games = value.games.map((entry) => normalizeRecord(entry, 'game'))
  const ids = [...resources, ...games].map((entry) => entry.id)
  if (new Set(ids).size !== ids.length) throw new Error('Published content identifiers must be unique.')
  return { version: 1, resources, games }
}

export function mergeCatalog(published, drafts) {
  const original = validateManifest(published)
  const resources = new Map(original.resources.map((entry) => [entry.id, entry]))
  const games = new Map(original.games.map((entry) => [entry.id, entry]))
  for (const draft of drafts) {
    if (!validId(draft.id) || !['resource', 'game'].includes(draft.type)) throw new Error('A saved draft has an invalid identifier or type.')
    const collection = draft.type === 'resource' ? resources : games
    if (draft.action === 'delete') collection.delete(draft.id)
    else if (draft.action === 'upsert') collection.set(draft.id, normalizeRecord(draft, draft.type))
    else throw new Error('A saved draft has an invalid change operation.')
  }
  return validateManifest({ version: 1, resources: [...resources.values()], games: [...games.values()] })
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!globalThis.indexedDB) return reject(new ContentStorageError('Draft storage is unavailable in this browser. Enable browser storage or use another browser.'))
    let request
    try { request = indexedDB.open(CONTENT_DB, 1) }
    catch { return reject(new ContentStorageError('Draft storage is blocked by your browser. Check browser privacy and storage settings.')) }
    request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains('drafts')) request.result.createObjectStore('drafts', { keyPath: 'id' }) }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(new ContentStorageError('Draft storage could not be opened. Check your browser privacy and storage settings.'))
    request.onblocked = () => reject(new ContentStorageError('Another dashboard tab is holding draft storage open. Close that tab and try again.'))
  })
}

async function databaseOperation(mode, operation) {
  const database = await openDatabase()
  return new Promise((resolve, reject) => {
    let transaction, request
    try {
      transaction = database.transaction('drafts', mode)
      request = operation(transaction.objectStore('drafts'))
    } catch {
      database.close()
      return reject(new ContentStorageError('Draft storage could not perform this change. Check browser privacy and storage settings.'))
    }
    let result
    request.onsuccess = () => { result = request.result }
    transaction.oncomplete = () => { database.close(); resolve(result) }
    transaction.onerror = () => { database.close(); reject(new ContentStorageError('Draft storage failed. Your browser may be out of space. No publication was performed.')) }
    transaction.onabort = () => { database.close(); reject(new ContentStorageError('The draft was not saved. Check browser storage space and try again.')) }
  })
}

export const readDrafts = () => databaseOperation('readonly', (store) => store.getAll())
export const removeDraft = (id) => databaseOperation('readwrite', (store) => store.delete(id))

export async function storeDraft(value) {
  if (!validId(value?.id) || !['resource', 'game'].includes(value.type) || !['delete', 'upsert'].includes(value.action)) throw new Error('The draft change is invalid.')
  let record = { id: value.id, type: value.type, action: value.action }
  if (value.action === 'upsert') {
    const clean = normalizeRecord(value, value.type)
    if (value.fileBlob) {
      const file = new File([value.fileBlob], clean.fileName, { type: clean.mimeType })
      await verifyFileSignature(file, clean.kind)
      record = { ...record, ...clean, fileBlob: value.fileBlob }
    } else record = { ...record, ...clean }
  } else {
    record.title = textField(value.title, 120)
    if (validTopic(value.topicId)) record.topicId = Number(value.topicId)
  }
  record.updatedAt = new Date().toISOString()
  await databaseOperation('readwrite', (store) => store.put(record))
  return record
}

export function makeContentId(type = 'resource') {
  return `${type}-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`}`
}

export function makeFilePath(id, extension) {
  if (!validId(id) || !FILE_TYPES[extension]) throw new Error('Invalid resource filename.')
  return `content/files/${id}.${extension}`
}

export function downloadBlob(blob, filename) {
  const objectURL = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectURL
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(objectURL), 1000)
}

const PUBLISH_GUIDE = `PROGRAMMING FUNDAMENTALS — CONTENT UPDATE\n\nThis ZIP contains a complete snapshot of public learning resources and your saved drafts.\nExport does not publish anything. Drafts remain only in this browser until the files are committed to GitHub.\n\nBEGINNER-FRIENDLY PUBLISHING\n1. Unzip this package on your computer.\n2. Open the existing mazlinamustaffa/programming repository in your GitHub-connected editor or GitHub Desktop.\n3. Replace ONLY the repository's public/content folder with this package's public/content folder.\n   Keep every other project file and the existing GitHub Actions workflow unchanged.\n4. Review public/content/manifest.json and the files in public/content/files.\n5. Commit with a message such as Update learning materials, then push to main.\n6. In GitHub, open Actions and wait for the existing Pages workflow to finish successfully.\n7. Open https://mazlinamustaffa.github.io/programming/ and refresh to verify your materials.\n\nGITHUB WEBSITE ALTERNATIVE\nOpen the existing repository, choose Add file > Upload files, and upload the contents of this package's public folder into the existing public folder. Preserve the content/files folder structure. Commit to main.\nThe manifest controls visibility; resources deleted from the manifest no longer appear. To remove old public files entirely, also delete their previous files from public/content/files in GitHub.\n\nIMPORTANT\nNo password or personal access token is requested by the dashboard. Use GitHub's normal sign-in or your connected editor.\nAll published files are public. Do not publish student details, personal data, or materials you are not permitted to share.\nExporting includes existing published resources, saved resource drafts, game links, and planned deletions.\nUnsaved form changes are not included. Export again after saving another draft.\nAfter deployment, use Discard draft for changes that now appear publicly; this only clears browser-local draft copies.\nA stale browser or old site version can produce a stale package. Refresh the dashboard before making updates and review the package before committing.\n`

export async function createPublicationPackage(published, drafts, fetchFile = (url) => fetch(url, { cache: 'no-store' })) {
  const manifest = mergeCatalog(published, drafts)
  const draftMap = new Map(drafts.filter((draft) => draft.type === 'resource' && draft.action === 'upsert').map((draft) => [draft.id, draft]))
  const { default: JSZip } = await import('jszip')
  const zip = new JSZip()
  zip.file('public/content/manifest.json', `${JSON.stringify(manifest, null, 2)}\n`)
  for (const resource of manifest.resources) {
    let blob = draftMap.get(resource.id)?.fileBlob
    if (!blob) {
      const response = await fetchFile(contentURL(resource.file))
      if (!response.ok) throw new Error(`Cannot include “${resource.title}”: its published file could not be downloaded. Retry after checking the website.`)
      blob = await response.blob()
    }
    const file = new File([blob], resource.fileName || `${resource.id}.${resource.file.split('.').at(-1)}`, { type: resource.mimeType })
    await verifyFileSignature(file, resource.kind)
    // ArrayBuffer works consistently in browser and Node; file blobs never enter localStorage.
    zip.file(`public/${resource.file}`, await blob.arrayBuffer())
  }
  zip.file('README-PUBLISH.txt', PUBLISH_GUIDE)
  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } })
}

export function useContentCatalog() {
  const [published, setPublished] = useState(EMPTY_CATALOG)
  const [drafts, setDrafts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [storageError, setStorageError] = useState('')
  const refresh = useCallback(async () => {
    setLoading(true)
    const [publicationResult, draftResult] = await Promise.allSettled([
      fetch(`${baseURL()}content/manifest.json`, { cache: 'no-store' }).then(async (response) => {
        if (!response.ok) throw new Error('Published learning materials could not be loaded. Refresh the page or check the published manifest.')
        return validateManifest(await response.json())
      }), readDrafts(),
    ])
    if (publicationResult.status === 'fulfilled') { setPublished(publicationResult.value); setError('') }
    else setError(publicationResult.reason.message)
    if (draftResult.status === 'fulfilled') { setDrafts(draftResult.value); setStorageError('') }
    else setStorageError(draftResult.reason.message)
    setLoading(false)
  }, [])
  useEffect(() => { const run = async () => { await refresh() }; void run() }, [refresh])
  const saveDraft = useCallback(async (draft) => {
    try {
      const saved = await storeDraft(draft)
      setDrafts((previous) => [...previous.filter((entry) => entry.id !== saved.id), saved])
      setStorageError('')
      return saved
    } catch (cause) { if (cause instanceof ContentStorageError) setStorageError(cause.message); throw cause }
  }, [])
  const deleteDraft = useCallback(async (id) => {
    try { await removeDraft(id); setDrafts((previous) => previous.filter((entry) => entry.id !== id)); setStorageError('') }
    catch (cause) { setStorageError(cause.message); throw cause }
  }, [])
  const exportPackage = useCallback(async () => {
    if (error) throw new Error('Fix the published catalog loading error before exporting; this protects existing materials.')
    // Copy the exact current state before any asynchronous downloads begin.
    const snapshot = drafts.map((draft) => ({ ...draft }))
    const blob = await createPublicationPackage(published, snapshot)
    const exportDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kuala_Lumpur', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
    downloadBlob(blob, `programming-content-update-${exportDate}.zip`)
    return blob
  }, [published, drafts, error])
  return { published, drafts, loading, error, storageError, refresh, saveDraft, deleteDraft, exportPackage }
}
