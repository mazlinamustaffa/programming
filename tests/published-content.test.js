import assert from 'node:assert/strict'
import test from 'node:test'
import { readFile } from 'node:fs/promises'
import { validateManifest, verifyFileSignature, validateExternalURL } from '../src/lib/content.js'

const manifest = validateManifest(JSON.parse(await readFile(new URL('../public/content/manifest.json', import.meta.url), 'utf8')))

test('version-controlled published catalog is valid and every resource references an intact supported file', async () => {
  for (const resource of manifest.resources) {
    const bytes = await readFile(new URL(`../public/${resource.file}`, import.meta.url))
    assert.equal(bytes.length, resource.size, resource.title)
    await verifyFileSignature(new File([bytes], resource.fileName, { type: resource.mimeType }), resource.kind)
  }
})

test('published game URLs are public HTTPS links with supported topics and metadata', () => {
  for (const game of manifest.games) {
    assert.equal(validateExternalURL(game.url), game.url)
    assert.ok(game.topicId >= 1 && game.topicId <= 5)
    assert.ok(game.title.trim())
  }
})
