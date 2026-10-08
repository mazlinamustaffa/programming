import assert from 'node:assert/strict'
import test from 'node:test'
import JSZip from 'jszip'
import { contentURL, createPublicationPackage, EMPTY_CATALOG, makeFilePath, MAX_FILE_SIZE, mergeCatalog, normalizeRecord, validateExternalURL, validateFile, validateManifest, verifyFileSignature } from '../src/lib/content.js'

const pngBytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0])
const image = () => new File([pngBytes], 'my-notes.png', { type: 'image/png' })
const resource = (overrides = {}) => ({ id: 'resource-1', topicId: 1, kind: 'infographic', title: 'My own notes', description: 'Real lecturer material', file: 'content/files/resource-1.png', mimeType: 'image/png', fileName: 'my-notes.png', size: pngBytes.length, ...overrides })
const game = (overrides = {}) => ({ id: 'game-1', topicId: 2, title: 'My activity', description: 'Lecturer supplied', platform: 'Wordwall', difficulty: 'Beginner', url: 'https://wordwall.net/resource/123', ...overrides })

test('content links stay inside the Pages base path and reject traversal and active formats', () => {
  assert.equal(contentURL('content/files/resource-1.png'), '/programming/content/files/resource-1.png')
  for (const path of ['../notes.pdf', 'content/files/../private.pdf', 'content/files/%2e%2e.png', 'https://example.org/a.png', 'content/files/image.svg', 'content/files/index.html', 'content/files/a.png?x=1']) assert.equal(contentURL(path), '')
  assert.equal(makeFilePath('resource-safe', 'pdf'), 'content/files/resource-safe.pdf')
  assert.throws(() => makeFilePath('../unsafe', 'pdf'))
  assert.throws(() => makeFilePath('resource-safe', 'svg'))
})

test('external game links permit public HTTPS sites and reject unsafe or private destinations', () => {
  assert.equal(validateExternalURL('  https://wordwall.net/resource/123  '), 'https://wordwall.net/resource/123')
  assert.equal(validateExternalURL('https://forms.gle/approved-form'), 'https://forms.gle/approved-form')
  assert.equal(validateExternalURL('https://example.edu/quiz?topic=3'), 'https://example.edu/quiz?topic=3')
  for (const url of ['javascript:alert(1)', 'data:text/html,hello', 'http://example.org/', 'https://user:password@example.org/', 'https://localhost/', 'https://localhost.localdomain/', 'https://127.0.0.1/', 'https://2130706433/', 'https://10.0.0.2/', 'https://172.16.1.1/', 'https://192.168.1.3/', 'https://169.254.169.254/', 'https://100.64.1.2/', 'https://[::1]/', 'https://device.local/', '/some/path', 'not a link']) {
    assert.throws(() => validateExternalURL(url), url)
  }
})

test('uploads enforce category, type, size, and actual file signature', async () => {
  assert.deepEqual(validateFile(image(), 'infographic'), { mimeType: 'image/png', extension: 'png' })
  await verifyFileSignature(image(), 'comic')
  const pdf = new File(['%PDF-1.7\nreal-header'], 'notes.pdf', { type: 'application/pdf' })
  await verifyFileSignature(pdf, 'pdf')
  assert.throws(() => validateFile(pdf, 'infographic'))
  assert.throws(() => validateFile(image(), 'pdf'))
  assert.throws(() => validateFile(new File(['<svg/>'], 'notes.svg', { type: 'image/svg+xml' }), 'comic'))
  assert.throws(() => validateFile(new File([pngBytes], 'notes.jpg', { type: 'image/png' }), 'infographic'))
  assert.throws(() => validateFile(new File([], 'notes.png', { type: 'image/png' }), 'infographic'))
  assert.throws(() => validateFile(new File([new Uint8Array(MAX_FILE_SIZE + 1)], 'huge.png', { type: 'image/png' }), 'infographic'))
  await assert.rejects(() => verifyFileSignature(new File(['<script>bad</script>'], 'pretend.png', { type: 'image/png' }), 'infographic'))
})

test('manifest requires valid topics, files, HTTPS links, and globally unique identifiers', () => {
  assert.deepEqual(validateManifest(EMPTY_CATALOG), EMPTY_CATALOG)
  assert.equal(validateManifest({ version: 1, resources: [resource()], games: [game()] }).resources.length, 1)
  for (const topicId of [0, 6, 'intro', null, true, '', 1.5]) assert.throws(() => normalizeRecord(resource({ topicId }), 'resource'))
  assert.throws(() => validateManifest({ version: 2, resources: [], games: [] }))
  assert.throws(() => validateManifest({ version: 1, resources: [resource()], games: [game({ id: 'resource-1' })] }))
  assert.throws(() => normalizeRecord(resource({ file: 'content/files/unsafe.html' }), 'resource'))
  assert.throws(() => normalizeRecord(resource({ mimeType: 'application/pdf' }), 'resource'))
  assert.throws(() => normalizeRecord(game({ platform: 'Unsupported', url: 'https://example.edu/' }), 'game'))
  assert.equal(normalizeRecord(resource({ fileName: undefined }), 'resource').fileName, 'resource-1.png')
})

test('export merges draft edits and removals without changing the published source', () => {
  const original = { version: 1, resources: [resource()], games: [game()] }
  const before = JSON.stringify(original)
  const merged = mergeCatalog(original, [
    { ...resource({ id: 'resource-2', topicId: 5, file: 'content/files/resource-2.png' }), type: 'resource', action: 'upsert' },
    { ...game({ title: 'Updated activity' }), type: 'game', action: 'upsert' },
    { id: 'resource-1', type: 'resource', action: 'delete' },
  ])
  assert.deepEqual(merged.resources.map((entry) => entry.id), ['resource-2'])
  assert.equal(merged.games[0].title, 'Updated activity')
  assert.equal(JSON.stringify(original), before)
  assert.throws(() => mergeCatalog(original, [{ id: '../bad', type: 'resource', action: 'delete' }]))
})

test('publication ZIP includes retained public files, draft files, metadata, and instructions', async () => {
  const published = { version: 1, resources: [resource()], games: [game()] }
  const drafts = [{ ...resource({ id: 'resource-2', topicId: 3, file: 'content/files/resource-2.png' }), type: 'resource', action: 'upsert', fileBlob: image() }]
  const fetched = []
  const blob = await createPublicationPackage(published, drafts, async (url) => {
    fetched.push(url)
    return { ok: true, blob: async () => image() }
  })
  const zip = await JSZip.loadAsync(await blob.arrayBuffer())
  const manifest = JSON.parse(await zip.file('public/content/manifest.json').async('string'))
  assert.equal(manifest.resources.length, 2)
  assert.equal(manifest.games.length, 1)
  assert.deepEqual(fetched, ['/programming/content/files/resource-1.png'])
  assert.ok(zip.file('public/content/files/resource-1.png'))
  assert.ok(zip.file('public/content/files/resource-2.png'))
  assert.ok((await zip.file('README-PUBLISH.txt').async('string')).includes('mazlinamustaffa/programming'))
  assert.ok(!JSON.stringify(manifest).includes('fileBlob'))
})

test('export failure never silently drops an existing public material', async () => {
  await assert.rejects(() => createPublicationPackage({ version: 1, resources: [resource()], games: [] }, [], async () => ({ ok: false })), /could not be downloaded/)
})
