import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'

const topicTitles = [
  'Introduction & Algorithms',
  'Variables & Data Types',
  'Operators & Expressions',
  'Control Flow',
  'Functions & Arrays',
]

async function resetProgress(page) {
  await page.getByRole('button', { name: 'Open profile settings' }).click()
  await page.getByRole('button', { name: 'Reset all progress' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Reset progress', exact: true }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
}

test('production subpath loads five topics and the chart period changes', async ({ page }) => {
  const browserErrors = []
  page.on('pageerror', error => browserErrors.push(error.message))
  await page.goto('./')

  await expect(page.getByRole('heading', { name: 'Your next chapter starts here.' })).toBeVisible()
  for (const title of topicTitles) {
    await expect(page.getByRole('button', { name: `Open ${title}`, exact: true })).toBeVisible()
  }
  await expect(page.getByRole('img', { name: '5 completed, 1 in progress, 19 not started', exact: true })).toBeVisible()
  const currentChart = page.getByRole('img', { name: /^Illustrative current week activity/ })
  await expect(currentChart).toBeVisible()
  await page.getByLabel('Chart time range').selectOption('last')
  await expect(page.getByRole('img', { name: /^Illustrative last week activity: Mon 0, Tue 1/ })).toBeVisible()
  await expect(currentChart).toHaveCount(0)
  await expect(page).toHaveURL(/\/programming\/$/)
  expect(browserErrors).toEqual([])
})

test('search, compound filters, empty results, and CSV export use the visible data', async ({ page }) => {
  await page.goto('./')
  const table = page.getByRole('table')
  await expect(table.locator('tbody tr')).toHaveCount(5)
  await page.getByRole('button', { name: 'Next page', exact: true }).click()
  await expect(table.getByText('Notes: Variables & Types', { exact: true })).toBeVisible()
  await page.getByLabel('Search activities').fill('control flow')
  await expect(table.locator('tbody tr')).toHaveCount(5)
  await page.getByRole('group', { name: 'Activity status filter' }).getByRole('button', { name: 'Completed', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'No matching activities' })).toBeVisible()
  await page.getByRole('button', { name: 'Clear all filters', exact: true }).click()
  await expect(table.locator('tbody tr')).toHaveCount(5)

  await page.getByRole('button', { name: 'Filters', exact: true }).click()
  await page.getByLabel('Filter by topic').selectOption('variables')
  await page.getByLabel('Filter by activity type').selectOption('quiz')
  await expect(table.locator('tbody tr')).toHaveCount(1)
  await expect(table.getByText('Quiz: Variables & Types', { exact: true })).toBeVisible()
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export CSV', exact: true }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('programming-progress.csv')
  const csv = await readFile(await download.path(), 'utf8')
  expect(csv.split('\r\n')).toEqual([
    '"Topic","Activity","Status","Score (%)"',
    '"Variables & Data Types","Quiz","not-started",""',
  ])
  await page.getByRole('button', { name: 'Clear filters', exact: true }).click()
  await expect(page.getByText('Showing 1–5 of 25 activities', { exact: true })).toBeVisible()
})

test('profile settings and reset persist while keeping the learner name', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'Open profile settings' }).click()
  await page.getByLabel('Display name').fill('Amir')
  await page.getByRole('button', { name: 'Save changes', exact: true }).click()
  await expect(page.getByText(/Good to see you, Amir$/)).toBeVisible()
  await page.reload()
  await expect(page.getByText(/Good to see you, Amir$/)).toBeVisible()
  await resetProgress(page)
  await expect(page.getByRole('img', { name: '0 completed, 0 in progress, 25 not started', exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('img', { name: '0 completed, 0 in progress, 25 not started', exact: true })).toBeVisible()
  await expect(page.getByText(/Good to see you, Amir$/)).toBeVisible()
})

test('global topic search opens a matching topic and works with keyboard dismissal', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: /Search anything/ }).click()
  const dialog = page.getByRole('dialog', { name: 'Find your next step' })
  await dialog.getByLabel('Search topics').fill('zzzzzz')
  await expect(dialog.getByRole('heading', { name: 'No topics found' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await page.getByRole('button', { name: /Search anything/ }).click()
  await page.getByLabel('Search topics').fill('functions')
  await page.getByRole('dialog').getByRole('button', { name: /Functions & Arrays/ }).click()
  await expect(page).toHaveURL(/#learn\/functions\/notes$/)
  await expect(page.getByRole('heading', { name: 'Functions & Arrays', exact: true })).toBeVisible()
})

test('all five learning sections open and completed notes survive a reload', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'Open Control Flow', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Control Flow', exact: true })).toBeVisible()
  const tabs = page.getByRole('tablist', { name: 'Learning sections' })
  for (const name of ['Notes', 'Exercise', 'Practical', 'Quiz', 'Test']) {
    await expect(tabs.getByRole('tab', { name, exact: true })).toBeVisible()
  }
  await page.getByRole('button', { name: 'Mark as complete', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Notes completed', exact: true })).toBeDisabled()
  await page.reload()
  await expect(page.getByRole('button', { name: 'Notes completed', exact: true })).toBeDisabled()
  await expect(page.getByText('20% complete', { exact: true })).toBeVisible()

  for (const name of ['Exercise', 'Practical', 'Quiz', 'Test']) {
    await tabs.getByRole('tab', { name, exact: true }).click()
    await expect(tabs.getByRole('tab', { name, exact: true })).toHaveAttribute('aria-selected', 'true')
    await expect(page.getByRole('tabpanel', { name, exact: true })).toBeVisible()
    if (name === 'Exercise' || name === 'Practical') {
      await expect(page.getByLabel('Code editor', { exact: true })).toHaveValue(/#include <iostream>/)
    } else {
      await expect(page.getByRole('radio')).toHaveCount(12)
      await expect(page.getByRole('button', { name: `Submit ${name.toLowerCase()}`, exact: true })).toBeVisible()
    }
  }
})

test('quiz validates missing answers, scores failures, permits retry, and persists a passing score', async ({ page }) => {
  await page.goto('./#learn/variables/quiz')
  await page.getByRole('button', { name: 'Submit quiz', exact: true }).click()
  await expect(page.getByRole('alert')).toHaveText('Please answer all 3 questions before submitting.')

  await page.getByRole('radio', { name: 'A char', exact: true }).check()
  await page.getByRole('radio', { name: 'A int hours = 1.5;', exact: true }).check()
  await page.getByRole('radio', { name: 'B true', exact: true }).check()
  await page.getByRole('button', { name: 'Submit quiz', exact: true }).click()
  const result = page.getByRole('region', { name: 'Assessment result' })
  await expect(result).toContainText('0 / 3 correct · 0%')
  await expect(result).toContainText('Review the explanations and try again')
  await expect(page.getByRole('radio').first()).toBeDisabled()

  await page.getByRole('button', { name: 'Try again', exact: true }).click()
  await expect(page.getByRole('radio').first()).not.toBeChecked()
  await page.getByRole('radio', { name: 'C int', exact: true }).check()
  await page.getByRole('radio', { name: 'B double hours = 1.5;', exact: true }).check()
  await page.getByRole('radio', { name: 'B true', exact: true }).check()
  await page.getByRole('button', { name: 'Submit quiz', exact: true }).click()
  await expect(result).toContainText('2 / 3 correct · 67% · Activity completed')
  await page.reload()
  await expect(page.getByText('Last score: 67%', { exact: true })).toBeVisible()

  await page.getByRole('radio', { name: 'C int', exact: true }).check()
  await page.getByRole('radio', { name: 'B double hours = 1.5;', exact: true }).check()
  await page.getByRole('radio', { name: 'A 1', exact: true }).check()
  await page.getByRole('button', { name: 'Submit quiz', exact: true }).click()
  await expect(result).toContainText('3 / 3 correct · 100% · Activity completed')
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Assessments', exact: true }).click()
  const variableCard = page.locator('.assessment-card').filter({ has: page.getByRole('heading', { name: 'Variables & Data Types', exact: true }) })
  const quizRow = variableCard.locator('.assessment-row').filter({ has: page.getByRole('heading', { name: 'Quick quiz', exact: true }) })
  await expect(quizRow).toContainText('Last score: 100%')
  await expect(quizRow).toContainText('Completed')
  await expect(quizRow.getByRole('button', { name: 'Retake', exact: true })).toBeVisible()
})

test('C++ practical executes code, handles syntax errors and timeouts, and recovers', async ({ page }) => {
  await page.goto('./')
  await resetProgress(page)
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Practice lab', exact: true }).click()
  await page.getByRole('button', { name: /Build a study-time planner/ }).click()
  const editor = page.getByLabel('Code editor', { exact: true })
  const output = page.getByRole('region', { name: 'Program output' })

  await editor.focus()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Reset code', exact: true })).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(editor).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(page.getByRole('tab', { name: 'Test', exact: true })).toBeFocused()

  await editor.fill('#include <iostream>\nint main() { this is not valid C++; return 0; }')
  await page.keyboard.press('Control+Enter')
  await expect(output.locator('.runtime-error')).toBeVisible()
  await expect(output).not.toContainText('Output matches!')
  await expect(page.getByRole('button', { name: 'Run code', exact: true })).toBeEnabled()

  await editor.fill('#include <iostream>\nint main() { while (true) {} return 0; }')
  await page.getByRole('button', { name: 'Run code', exact: true }).click()
  await expect(output).toContainText('Execution stopped after 5 seconds', { timeout: 15_000 })
  await expect(page.getByRole('button', { name: 'Run code', exact: true })).toBeEnabled()

  await editor.fill('#include <iostream>\nusing namespace std;\nint main() { int value = 0; cin >> value; cout << value * 2 << endl; return 0; }')
  await page.getByLabel('Program input (optional)', { exact: true }).fill('21')
  await page.getByRole('button', { name: 'Run code', exact: true }).click()
  await expect(output.locator('pre')).toHaveText('42\n', { timeout: 15_000 })
  await expect(output).toContainText('Not quite yet. Compare your result with the expected output and try again.')

  await page.getByRole('button', { name: 'Show solution', exact: true }).click()
  await page.getByRole('button', { name: 'Use solution', exact: true }).click()
  await expect(editor).toHaveValue(/int totalMinutes = sessions \* minutesPerSession;/)
  await page.getByRole('button', { name: 'Run code', exact: true }).click()
  await expect(output).toContainText('Sessions: 4\nTotal study time: 100 minutes', { timeout: 15_000 })
  await expect(output).toContainText('Exit code: 0')
  await expect(output).toContainText('Output matches! This activity is complete.')
  await page.reload()
  await expect(editor).toHaveValue(/int totalMinutes = sessions \* minutesPerSession;/)
  await expect(page.locator('.challenge-heading').getByText('Completed', { exact: true })).toBeVisible()
})

test('mobile navigation changes sections and the dashboard fits the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('./')
  await expect(page.getByRole('heading', { name: 'Your next chapter starts here.' })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toHaveCount(0)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click()
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Assessments', exact: true }).click()
  await expect(page).toHaveURL(/#assessments$/)
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click()
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Practice lab', exact: true }).click()
  await expect(page).toHaveURL(/#lab$/)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})
