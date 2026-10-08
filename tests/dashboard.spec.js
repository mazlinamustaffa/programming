import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import JSZip from 'jszip'
import { quizzes } from '../src/data/quizzes.js'
import { topics } from '../src/data/topics.js'

const HUB_KEY = 'programming-fundamentals-hub:v2'
const LEGACY_KEY = 'programming-fundamentals-hub:v1'
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6M1sAAAAASUVORK5CYII=', 'base64')
const routes = [
  ['learning', 'My Learning'],
  ...topics.map(topic => [`topic/${topic.id}`, topic.title]),
  ['infographics', 'Infographic Library'], ['comics', 'Comic Notes Library'],
  ['quiz', 'Interactive Quiz'], ['practical', 'Practical Assessment'],
  ['games', 'Quiz & Game Zone'], ['lab', 'Practice Lab'], ['progress', 'Learning Progress'],
  ['responsible-ai', 'Responsible AI in Learning'], ['lecturer', 'Lecturer Guide'], ['manager', 'Content Manager'],
]

async function navigate(page, route) {
  await page.evaluate(value => { window.location.hash = value }, route)
}

async function savedHub(page) {
  return page.evaluate(key => JSON.parse(localStorage.getItem(key)), HUB_KEY)
}

async function readDownload(download) {
  return readFile(await download.path(), 'utf8')
}

test('production subpath shows all five topics and real empty progress with working charts', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('./')
  for (const topic of topics) await expect(page.getByRole('button', { name: `Open ${topic.title}`, exact: true })).toBeVisible()
  await expect(page.getByRole('img', { name: '0 completed, 0 in progress, 25 not started', exact: true })).toBeVisible()
  await expect(page.getByRole('img', { name: /^Recorded current week activity: Mon 0/ })).toBeVisible()
  await page.getByLabel('Chart time range').selectOption('last')
  await expect(page.getByRole('img', { name: /^Recorded last week activity: Mon 0/ })).toBeVisible()
  await expect(page.locator('.page-footer')).toContainText('Prepared by 3M@MazlinaMdMustaffa')
  await expect(page.locator('body')).not.toContainText('BFC10033')
  await expect(page).toHaveURL(/\/programming\/$/)
  expect(errors).toEqual([])
})

test('all 17 main navigation destinations load without broken routes or browser errors', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('./')
  const nav = page.getByRole('navigation', { name: 'Main navigation' })
  await expect(nav.getByRole('link')).toHaveCount(17)
  for (const [route, heading] of routes) {
    await nav.locator(`a[href="#${route}"]`).click()
    await expect(page).toHaveURL(new RegExp(`#${route}$`))
    await expect(page.getByRole('heading', { name: heading, level: 1, exact: true })).toBeVisible()
  }
  await nav.getByRole('link', { name: 'Dashboard Overview', exact: true }).click()
  await expect(page).toHaveURL(/#overview$/)
  expect(errors).toEqual([])
})

test('activity search, compound filters and CSV export reflect current filtered rows', async ({ page }) => {
  await page.goto('./')
  const table = page.getByRole('table')
  await expect(table.locator('tbody tr')).toHaveCount(5)
  await page.getByLabel('Search activities').fill('no-such-learning-topic')
  await expect(page.getByRole('heading', { name: 'No matching activities' })).toBeVisible()
  await page.getByRole('button', { name: 'Clear all filters', exact: true }).click()
  await page.getByRole('button', { name: 'Filters', exact: true }).click()
  await page.getByLabel('Filter by topic').selectOption('arrays')
  await page.getByLabel('Filter by activity type').selectOption('quiz')
  await expect(table.locator('tbody tr')).toHaveCount(1)
  const promise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export CSV', exact: true }).click()
  const download = await promise
  expect(download.suggestedFilename()).toBe('programming-progress.csv')
  expect(await readDownload(download)).toBe('"Topic","Activity","Status","Score (%)"\r\n"ARRAYS","Quiz","not-started",""')
})

test('workspace settings, reduced motion and larger text persist; global search has keyboard dismissal', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'Open profile settings' }).click()
  await page.getByLabel('Display name').fill('Amir')
  await page.getByLabel('Text size').selectOption('extra-large')
  await page.getByLabel('Reduced motion', { exact: true }).check()
  await page.getByRole('button', { name: 'Save changes', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('data-text-size', 'extra-large')
  await expect(page.locator('html')).toHaveAttribute('data-reduced-motion', 'true')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-text-size', 'extra-large')
  await expect(page.locator('.greeting')).toContainText('Good to see you, Amir')
  await page.keyboard.press('Control+k')
  const dialog = page.getByRole('dialog', { name: 'Find your next discovery' })
  await dialog.getByLabel('Search topics and pages').fill('functions')
  await dialog.getByRole('button', { name: /Functions/ }).click()
  await expect(page).toHaveURL(/#topic\/functions$/)
  await page.keyboard.press('Control+k')
  await expect(dialog).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
})

test('all five topic pages contain required learning resources; notes and reflections persist', async ({ page }) => {
  await page.goto('./')
  for (const topic of topics) {
    await navigate(page, `topic/${topic.id}`)
    await expect(page.getByRole('heading', { name: topic.title, level: 1, exact: true })).toBeVisible()
    for (const name of ['Topic overview', 'Learning objectives', 'Quick Notes', 'Infographic Notes', 'Comic Notes', 'Interactive Quiz', 'Practical Assessment', 'Learning reflection']) {
      await expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
    }
    await expect(page.getByRole('checkbox', { name: 'Bahasa Melayu support' })).toBeVisible()
  }
  await navigate(page, 'topic/arrays')
  await page.getByRole('button', { name: 'Mark notes as completed', exact: true }).click()
  await page.getByLabel('My reflection').fill('I can trace an array loop. I will check the last valid index before using a value.')
  await page.getByRole('button', { name: 'Save reflection', exact: true }).click()
  await page.reload()
  await expect(page.getByRole('button', { name: 'Notes completed', exact: true })).toBeDisabled()
  await expect(page.getByLabel('My reflection')).toHaveValue(/last valid index/)
  await expect(page.getByText('40% complete', { exact: true })).toBeVisible()
})

test('all 50 quiz answers score correctly through the interactive interface and persist', async ({ page }) => {
  await page.goto('./')
  for (const quiz of quizzes) {
    await navigate(page, `quiz/${quiz.topicId}`)
    await page.getByRole('button', { name: 'Start quiz', exact: true }).click()
    await expect(page.getByRole('timer', { name: 'Quiz time remaining' })).toContainText(/14:5\d|15:00/)
    for (let index = 0; index < quiz.questions.length; index += 1) {
      const question = quiz.questions[index]
      await expect(page.locator('.qz-options-fieldset legend')).toHaveText(question.question)
      await expect(page.getByRole('radio')).toHaveCount(4)
      await page.getByRole('radio').nth(question.answer).check()
      if (index < quiz.questions.length - 1) await page.getByRole('button', { name: 'Next', exact: true }).click()
    }
    await expect(page.getByRole('progressbar', { name: 'Questions answered' })).toHaveAttribute('aria-valuenow', '10')
    await page.getByRole('button', { name: 'Submit quiz', exact: true }).click()
    await expect(page.locator('.qz-score-orb')).toContainText('10/10')
    await expect(page.locator('.qz-score-orb')).toContainText('100%')
    await page.getByRole('button', { name: 'Review answers', exact: true }).click()
    await expect(page.locator('.qz-review-card')).toHaveCount(10)
    await expect(page.locator('.qz-review-card.correct')).toHaveCount(10)
    await page.reload()
    await expect(page.locator('.qz-score-orb')).toContainText('100%')
  }
  const hub = await savedHub(page)
  expect(Object.values(hub.quizAttempts).filter(attempt => attempt.result.score === 10)).toHaveLength(5)
  await navigate(page, 'progress')
  await expect(page.locator('.progress-summary')).toContainText('5 / 5')
})

test('partial quiz scoring distinguishes incorrect and unanswered answers and retains attempt history on retry', async ({ page }) => {
  await page.goto('./#quiz/intro')
  await page.getByRole('button', { name: 'Start quiz', exact: true }).click()
  await page.getByRole('radio').nth(quizzes[0].questions[0].answer).check()
  await page.getByRole('button', { name: 'Next', exact: true }).click()
  await page.getByRole('radio').nth((quizzes[0].questions[1].answer + 1) % 4).check()
  await page.getByRole('button', { name: 'Submit quiz', exact: true }).click()
  await expect(page.locator('.qz-result-facts')).toContainText('1 correct')
  await expect(page.locator('.qz-result-facts')).toContainText('1 incorrect')
  await expect(page.locator('.qz-result-facts')).toContainText('8 unanswered')
  await page.getByRole('button', { name: 'Review answers', exact: true }).click()
  await expect(page.locator('.qz-review-card')).toHaveCount(10)
  await page.getByRole('button', { name: 'Retry quiz (new attempt)', exact: true }).click()
  await expect(page.getByRole('progressbar', { name: 'Questions answered' })).toHaveAttribute('aria-valuenow', '0')
  await expect.poll(async () => (await savedHub(page)).quizHistory.length).toBe(1)
  await page.getByRole('button', { name: 'Submit quiz', exact: true }).click()
  await expect(page.locator('.qz-score-orb')).toContainText('0/10')
})

test('quiz expires while on the overview and a restored overdue attempt auto-submits exactly once', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-09T10:00:00Z') })
  await page.goto('./#quiz/intro')
  await page.getByRole('button', { name: 'Start quiz', exact: true }).click()
  await page.getByRole('radio').nth(quizzes[0].questions[0].answer).check()
  await navigate(page, 'overview')
  await page.clock.fastForward(901_000)
  await expect.poll(async () => (await savedHub(page)).quizAttempts.intro.result?.score).toBe(1)
  await navigate(page, 'quiz/intro')
  await expect(page.locator('.qz-result-facts')).toContainText('15:00 time used')
  const firstSubmission = (await savedHub(page)).quizAttempts.intro.submittedAt
  await page.reload()
  await expect(page.locator('.qz-score-orb')).toContainText('1/10')
  expect((await savedHub(page)).quizAttempts.intro.submittedAt).toBe(firstSubmission)
  await page.evaluate(({ key, quiz }) => {
    const hub = JSON.parse(localStorage.getItem(key))
    const time = Date.now() - 1_000_000
    hub.quizAttempts.variables = { quizId: quiz.id, startedAt: time, deadline: time + 900_000, answers: {}, questionsSnapshot: quiz.questions }
    localStorage.setItem(key, JSON.stringify(hub))
  }, { key: HUB_KEY, quiz: quizzes[1] })
  await page.reload()
  await navigate(page, 'quiz/variables')
  await expect(page.locator('.qz-score-orb')).toContainText('0/10')
  await expect(page.locator('.qz-result-facts')).toContainText('10 unanswered')
})

test('five practical task downloads contain complete briefs and 100-mark rubrics; manual marking is explicit', async ({ page }) => {
  await page.goto('./#practical')
  await expect(page.locator('.pa-topic-card')).toHaveCount(5)
  for (const topic of topics) {
    await navigate(page, `practical/${topic.id}`)
    await expect(page.getByRole('timer', { name: 'Practical time remaining' })).toContainText('60:00')
    await expect(page.locator('.pa-rubric tbody tr')).toHaveCount(6)
    const promise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Download task', exact: true }).click()
    const text = await readDownload(await promise)
    for (const heading of ['LEARNING OBJECTIVES', 'PROBLEM SCENARIO', 'PRACTICAL INSTRUCTIONS', 'INPUT REQUIREMENTS', 'PROCESSING REQUIREMENTS', 'OUTPUT REQUIREMENTS', 'EXPECTED PROGRAM BEHAVIOUR', 'SUBMISSION REQUIREMENTS', 'ASSESSMENT RUBRIC', 'Total: 100 marks']) expect(text).toContain(heading)
  }
  await page.getByRole('button', { name: 'Open lecturer marking worksheet', exact: true }).click()
  const worksheet = page.locator('.pa-mark-form')
  await expect(worksheet).toContainText('Anyone using this device can edit it')
  const limits = [15, 20, 25, 20, 10, 10]
  for (let index = 0; index < limits.length; index += 1) await worksheet.locator('input[type="number"]').nth(index).fill(String(limits[index]))
  await worksheet.locator('input[type="number"]').first().fill('16')
  await worksheet.getByRole('button', { name: 'Save local lecturer record', exact: true }).click()
  expect(await worksheet.locator('input[type="number"]').first().evaluate(input => input.validity.rangeOverflow)).toBe(true)
  expect((await savedHub(page)).practicals.functions).toBeUndefined()
  await worksheet.locator('input[type="number"]').first().fill('15')
  await worksheet.getByRole('button', { name: 'Save local lecturer record', exact: true }).click()
  await expect(page.getByText('Saved total: 100/100', { exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByText('Local lecturer record · 100/100', { exact: true })).toBeVisible()
})

test('practical timer warns at ten minutes, survives reload and expires without claiming file submission', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-09T10:00:00Z') })
  await page.goto('./#practical/arrays')
  await page.getByRole('button', { name: 'Start practical', exact: true }).click()
  await page.clock.fastForward(50 * 60 * 1000 + 1000)
  await expect(page.getByRole('status').filter({ hasText: '10 minutes or less remain.' })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('timer', { name: 'Practical time remaining' })).toContainText('09:59')
  await page.clock.fastForward(10 * 60 * 1000)
  await expect(page.getByRole('timer', { name: 'Practical time remaining' })).toContainText('00:00')
  await expect(page.getByRole('status').filter({ hasText: 'Your source files have not been submitted automatically.' })).toBeVisible()
  expect((await savedHub(page)).practicals.arrays.status).toBe('in-progress')
})

test('IndexedDB image drafts can be saved, edited, previewed, exported and discarded without public publication', async ({ page }) => {
  await page.goto('./#manager')
  await page.locator('.cm-form select').first().selectOption('4')
  await page.getByLabel('Title', { exact: true }).fill('Lecturer array notes')
  await page.getByLabel('Short description', { exact: true }).fill('A checked illustration of array indices.')
  await page.getByLabel('Upload material file').setInputFiles({ name: 'invalid-image.png', mimeType: 'image/png', buffer: Buffer.from('not a PNG image') })
  await expect(page.getByRole('alert')).toContainText('contents do not match its file type')
  await page.getByLabel('Upload material file').setInputFiles({ name: 'array-notes.png', mimeType: 'image/png', buffer: png })
  await expect(page.locator('.cm-file-preview img')).toBeVisible()
  await page.getByRole('button', { name: 'Save draft', exact: true }).click()
  await expect(page.locator('.cm-resource-row').filter({ hasText: 'Lecturer array notes' })).toContainText('LOCAL DRAFT')
  await page.reload()
  await page.getByRole('button', { name: 'Edit draft Lecturer array notes', exact: true }).click()
  await page.getByLabel('Title', { exact: true }).fill('Reviewed array notes')
  await page.getByLabel('Upload material file').setInputFiles({ name: 'revised-array-notes.png', mimeType: 'image/png', buffer: png })
  await page.getByRole('button', { name: 'Save draft', exact: true }).click()
  await page.getByRole('button', { name: 'Preview draft Reviewed array notes', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  const promise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export update package', exact: true }).first().click()
  const download = await promise
  expect(download.suggestedFilename()).toMatch(/^programming-content-update-\d{4}-\d{2}-\d{2}\.zip$/)
  const zip = await JSZip.loadAsync(await readFile(await download.path()))
  const manifest = JSON.parse(await zip.file('public/content/manifest.json').async('string'))
  expect(manifest.resources).toHaveLength(1)
  expect(manifest.resources[0]).toMatchObject({ title: 'Reviewed array notes', topicId: 4, kind: 'infographic', fileName: 'revised-array-notes.png' })
  expect(Buffer.from(await zip.file(`public/${manifest.resources[0].file}`).async('uint8array'))).toEqual(png)
  expect(await zip.file('README-PUBLISH.txt').async('string')).toContain('Export does not publish anything')
  await navigate(page, 'infographics')
  await expect(page.locator('.rl-empty-topic')).toHaveCount(5)
  await expect(page.getByRole('heading', { name: 'Reviewed array notes', exact: true })).toHaveCount(0)
  await navigate(page, 'manager')
  await page.getByRole('button', { name: 'Discard local draft Reviewed array notes', exact: true }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Discard draft', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Edit draft Reviewed array notes', exact: true })).toHaveCount(0)
})

test('quiz game drafts validate public HTTPS URLs, persist and export while published game zone stays empty', async ({ page }) => {
  await page.goto('./#manager')
  await page.getByRole('button', { name: /Quiz & game links/ }).click()
  await page.getByLabel('Title', { exact: true }).fill('Loop revision')
  await page.getByLabel('Game URL').fill('http://wordwall.net/')
  await page.getByRole('button', { name: 'Save draft', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('public HTTPS')
  await page.getByLabel('Game URL').fill('https://localhost/')
  await page.getByRole('button', { name: 'Save draft', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('public HTTPS')
  await page.getByLabel('Quiz platform').selectOption('Wordwall')
  await page.locator('.cm-form select').nth(2).selectOption('Intermediate')
  await page.locator('.cm-form select').first().selectOption('3')
  await page.getByLabel('Game URL').fill('https://wordwall.net/')
  await page.getByRole('button', { name: 'Save draft', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Edit draft Loop revision', exact: true })).toBeVisible()
  const promise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export update package', exact: true }).first().click()
  const zip = await JSZip.loadAsync(await readFile(await (await promise).path()))
  const manifest = JSON.parse(await zip.file('public/content/manifest.json').async('string'))
  expect(manifest.games[0]).toMatchObject({ topicId: 3, platform: 'Wordwall', difficulty: 'Intermediate', url: 'https://wordwall.net/' })
  await navigate(page, 'games')
  await expect(page.locator('.gz-game-card')).toHaveCount(0)
  await expect(page.locator('.gz-empty-topic')).toHaveCount(5)
})

test('published resources preview with zoom, download and topic return; games use safe new-tab links', async ({ page }) => {
  const resource = { id: 'test-image', topicId: 4, kind: 'infographic', title: 'Published test resource', description: 'Browser-test fixture only.', file: 'content/files/test-image.png', mimeType: 'image/png', fileName: 'array-notes.png', size: png.length }
  await page.route('**/content/manifest.json', route => route.fulfill({ json: { version: 1, resources: [resource], games: [{ id: 'test-game', topicId: 3, title: 'Published test link', description: 'Browser-test fixture only.', platform: 'Wordwall', difficulty: 'Beginner', url: 'https://wordwall.net/' }] } }))
  await page.route('**/content/files/test-image.png', route => route.fulfill({ contentType: 'image/png', body: png }))
  await page.goto('./#infographics')
  await expect(page.getByRole('heading', { name: resource.title, exact: true })).toBeVisible()
  await page.getByRole('button', { name: `Preview ${resource.title}`, exact: true }).click()
  const preview = page.getByRole('dialog', { name: resource.title })
  await preview.getByRole('button', { name: 'Zoom in', exact: true }).click()
  await expect(preview.locator('output')).toHaveText('125%')
  await preview.getByRole('button', { name: 'Reset zoom', exact: true }).click()
  await expect(preview.locator('output')).toHaveText('100%')
  const promise = page.waitForEvent('download')
  await preview.getByRole('link', { name: 'Download image', exact: true }).click()
  expect((await promise).suggestedFilename()).toBe('array-notes.png')
  await preview.getByRole('button', { name: 'Back to Topic 4', exact: true }).click()
  await expect(page).toHaveURL(/#topic\/arrays$/)
  await expect(page.getByRole('heading', { name: 'ARRAYS', level: 1, exact: true })).toBeVisible()
  await navigate(page, 'games')
  const link = page.getByRole('link', { name: 'Play Published test link (opens in a new tab)', exact: true })
  await expect(link).toHaveAttribute('href', 'https://wordwall.net/')
  await expect(link).toHaveAttribute('target', '_blank')
  await expect(link).toHaveAttribute('rel', 'noopener noreferrer')
})

test('responsible AI reflections and lecturer evidence worksheet provide working honest interactions', async ({ page }) => {
  await page.goto('./#responsible-ai')
  await expect(page.getByText('AI-assisted teaching draft · human verification required.', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Responsible use', exact: true }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Sound judgement.' })).toBeVisible()
  await page.getByRole('button', { name: 'Next scenario', exact: true }).click()
  await page.getByRole('button', { name: 'Needs a better approach', exact: true }).click()
  await expect(page.getByRole('status').filter({ hasText: 'misrepresents authorship' })).toBeVisible()
  await navigate(page, 'lecturer')
  await expect(page.locator('.guide-evidence-table tbody tr')).toHaveCount(11)
  await page.getByLabel('Self-review rating for Curriculum alignment').selectOption('1')
  await page.getByLabel('Self-review rating for AI transparency').selectOption('2')
  await expect(page.locator('.guide-score')).toContainText('3/22')
  const promise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export worksheet', exact: true }).click()
  const text = await readDownload(await promise)
  expect(text).toContain('Self-review: 3/22; 2/11 criteria reviewed.')
  expect(text).toContain('No LMS grade sync, roster integration or SSO is implemented.')
  await page.getByRole('button', { name: 'Reset worksheet', exact: true }).click()
  await expect(page.locator('.guide-score')).toContainText('0/22')
})

test('legacy records stay unchanged and are not promoted into new actual assessment data', async ({ page }) => {
  await page.goto('./')
  const legacyRaw = JSON.stringify({ name: 'Earlier learner', activities: { 'intro:quiz': { status: 'completed', score: 100 } }, code: { 'intro:exercise': 'int retained = 7;' }, additionalOriginalData: { keep: true } })
  await page.evaluate(({ key, value }) => { localStorage.setItem(key, value) }, { key: LEGACY_KEY, value: legacyRaw })
  await page.reload()
  await expect(page.getByRole('img', { name: '0 completed, 0 in progress, 25 not started', exact: true })).toBeVisible()
  expect(await page.evaluate(key => localStorage.getItem(key), LEGACY_KEY)).toBe(legacyRaw)
  await navigate(page, 'legacy')
  await expect(page.getByRole('heading', { name: 'Earlier workspace', exact: true })).toBeVisible()
  expect((await savedHub(page)).quizAttempts).toEqual({})
  expect(await page.evaluate(key => localStorage.getItem(key), LEGACY_KEY)).toBe(legacyRaw)
})

test('preserved C++ runner executes real code, handles syntax errors and timeouts, and recovers', async ({ page }) => {
  await page.goto('./#legacy/intro/practical')
  const editor = page.getByLabel('Code editor', { exact: true })
  const output = page.getByRole('region', { name: 'Program output' })
  await editor.fill('#include <iostream>\nint main() { this is not valid C++; return 0; }')
  await page.getByRole('button', { name: 'Run code', exact: true }).click()
  await expect(output.locator('.runtime-error')).toBeVisible()
  await editor.fill('#include <iostream>\nint main() { while (true) {} return 0; }')
  await page.getByRole('button', { name: 'Run code', exact: true }).click()
  await expect(output).toContainText('Execution stopped after 5 seconds', { timeout: 15_000 })
  await editor.fill('#include <iostream>\nusing namespace std;\nint main() { int value = 0; cin >> value; cout << value * 2 << endl; return 0; }')
  await page.getByLabel('Program input (optional)', { exact: true }).fill('21')
  await page.getByRole('button', { name: 'Run code', exact: true }).click()
  await expect(output.locator('pre')).toHaveText('42\n', { timeout: 15_000 })
  await page.getByRole('button', { name: 'Show solution', exact: true }).click()
  await page.getByRole('button', { name: 'Use solution', exact: true }).click()
  await page.getByRole('button', { name: 'Run code', exact: true }).click()
  await expect(output).toContainText('Output matches! This activity is complete.', { timeout: 15_000 })
  await page.reload()
  await expect(editor).toHaveValue(/int totalMinutes = sessions \* minutesPerSession;/)
})

test('mobile navigation opens all learning destinations without document overflow, including enlarged text', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('./')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  for (const [route, heading] of routes) {
    await page.getByRole('button', { name: 'Open navigation', exact: true }).click()
    await page.getByRole('navigation', { name: 'Main navigation' }).locator(`a[href="#${route}"]`).click()
    await expect(page.getByRole('heading', { name: heading, level: 1, exact: true })).toBeVisible()
    await expect(page.locator('.sidebar')).not.toHaveClass(/mobile-open/)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), route).toBe(true)
  }
  await page.getByRole('button', { name: 'Open profile settings' }).click()
  await page.getByLabel('Text size').selectOption('extra-large')
  await page.getByRole('button', { name: 'Save changes', exact: true }).click()
  for (const width of [390, 320, 768]) {
    await page.setViewportSize({ width, height: 844 })
    for (const route of ['overview', 'topic/functions', 'lecturer', 'manager', 'quiz/arrays', 'practical/arrays']) {
      await navigate(page, route)
      await expect(page.locator('#main-content h1').first()).toBeVisible()
      if (route === 'quiz/arrays' && await page.getByRole('button', { name: 'Start quiz', exact: true }).count()) {
        await page.getByRole('button', { name: 'Start quiz', exact: true }).click()
      }
      if (route === 'practical/arrays' && await page.getByRole('button', { name: 'Start practical', exact: true }).count()) {
        await page.getByRole('button', { name: 'Start practical', exact: true }).click()
      }
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), { message: `${route} at ${width}px with extra-large text` }).toBe(true)
    }
  }
})
