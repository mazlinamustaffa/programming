import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { topics } from '../src/data/topics.js'

const manifest = JSON.parse(await readFile(new URL('../public/content/manifest.json', import.meta.url), 'utf8'))

test('actual published images load, preview, zoom and download unchanged across all topics', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  for (const kind of ['infographic', 'comic']) {
    const resources = manifest.resources.filter(resource => resource.kind === kind)
    await page.goto(`./#${kind === 'infographic' ? 'infographics' : 'comics'}`)
    await expect(page.locator('.rl-resource-card')).toHaveCount(resources.length)
    for (const resource of resources) {
      await expect(page.getByRole('heading', { name: resource.title, exact: true })).toBeVisible()
      await page.getByRole('button', { name: `Preview ${resource.title}`, exact: true }).click()
      const preview = page.getByRole('dialog', { name: resource.title })
      await expect(preview).toBeVisible()
      await expect.poll(() => preview.locator('.rl-image-stage img').evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true)
      await preview.getByRole('button', { name: 'Zoom in', exact: true }).click()
      await expect(preview.locator('output')).toHaveText('125%')
      const downloading = page.waitForEvent('download')
      await preview.getByRole('link', { name: 'Download image', exact: true }).click()
      const download = await downloading
      expect(download.suggestedFilename()).toBe(resource.fileName)
      expect(await readFile(await download.path())).toEqual(await readFile(new URL(`../public/${resource.file}`, import.meta.url)))
      await preview.getByRole('button', { name: 'Close resource preview', exact: true }).click()
    }
  }
  expect(errors).toEqual([])
})

test('actual published games appear on their topic with the supplied URL and safe new-tab behavior', async ({ page }) => {
  await page.goto('./#games')
  await expect(page.locator('.gz-game-card')).toHaveCount(manifest.games.length)
  for (const game of manifest.games) {
    const link = page.getByRole('link', { name: `Play ${game.title} (opens in a new tab)`, exact: true })
    await expect(link).toHaveAttribute('href', game.url)
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    const topic = topics.find(topic => topic.number === game.topicId)
    await page.goto(`./#games/${topic.id}`)
    await expect(link).toBeVisible()
    await page.goto('./#games')
  }
})
