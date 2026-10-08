import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { practiceTasks } from '../src/data/practice.js'

const tasks = new Map(practiceTasks.map((task) => [task.id, task]))
const topicIds = ['intro', 'variables', 'control', 'arrays', 'functions']

test('the practice bank contains 15 distinct tasks and three difficulty levels per topic', () => {
  assert.equal(practiceTasks.length, 15)
  assert.equal(tasks.size, 15)
  assert.deepEqual([...new Set(practiceTasks.map((task) => task.topicId))], topicIds)
  for (const topicId of topicIds) {
    const topicTasks = practiceTasks.filter((task) => task.topicId === topicId)
    assert.equal(topicTasks.length, 3, topicId)
    assert.deepEqual(topicTasks.map((task) => task.level), ['Beginner', 'Intermediate', 'Advanced'], topicId)
  }
  for (const task of practiceTasks) {
    assert.ok(task.title.length > 8, task.id)
    assert.ok(task.prompt.length > 50, task.id)
    assert.ok(task.explanation.length > 60, task.id)
    if (task.options) {
      assert.equal(task.options.length, 4, task.id)
      assert.equal(new Set(task.options).size, 4, task.id)
      assert.ok(Number.isInteger(task.answer) && task.answer >= 0 && task.answer < 4, task.id)
      assert.equal(task.starter, undefined, task.id)
    } else {
      assert.ok(task.starter.includes('int main()'), task.id)
      assert.ok(task.solution.includes('int main()'), task.id)
      assert.ok(typeof task.expectedOutput === 'string' && task.expectedOutput.length > 0, task.id)
      assert.notEqual(task.starter, task.solution, task.id)
    }
  }
})

test('introductory practice answers correctly model IPO, trace the discount and repair sequencing', () => {
  const ipo = tasks.get('ipo')
  assert.equal(ipo.options[ipo.answer], `Price and quantity → multiply → total RM ${4 * 3}`)
  const trace = tasks.get('trace-algorithm')
  const total = 20 * 2
  assert.equal(trace.options[trace.answer], `RM ${total - total * 0.10}`)
  const debugPlan = tasks.get('debug-plan')
  assert.equal(debugPlan.options[debugPlan.answer], 'Calculate total before displaying it')
  assert.match(debugPlan.explanation, /sequencing error/i)
})

test('topic scopes remain one-dimensional arrays and basic non-overloaded functions', () => {
  const arrayTasks = practiceTasks.filter((task) => task.topicId === 'arrays')
  assert.ok(arrayTasks.every((task) => !/\]\s*\[/.test(`${task.starter ?? ''}\n${task.solution ?? ''}\n${task.prompt}`)))
  for (const task of practiceTasks.filter((item) => item.topicId === 'functions')) {
    const source = task.solution ?? task.prompt
    const functionDefinitions = [...source.matchAll(/(?:int|void|double)\s+(\w+)\s*\([^)]*\)\s*\{/g)].map((match) => match[1])
    assert.equal(functionDefinitions.length, new Set(functionDefinitions).size, `${task.id}: repeated definitions would require scope review`)
  }
})

const compilerAvailable = spawnSync('g++', ['--version'], { encoding: 'utf8' }).status === 0
const directory = compilerAvailable ? mkdtempSync(join(tmpdir(), 'programming-practice-native-')) : null
after(() => { if (directory) rmSync(directory, { recursive: true, force: true }) })

function compileAndRun(id, source) {
  const filename = join(directory, `${id}.cpp`)
  const executable = join(directory, id)
  writeFileSync(filename, source)
  const compilation = spawnSync('g++', ['-std=c++17', '-Wall', '-Wextra', filename, '-o', executable], { encoding: 'utf8', timeout: 15000 })
  assert.equal(compilation.status, 0, `${id}: ${compilation.stderr}`)
  const execution = spawnSync(executable, [], { encoding: 'utf8', timeout: 2000 })
  assert.equal(execution.status, 0, `${id}: ${execution.stderr}`)
  return execution.stdout.trim()
}

for (const task of practiceTasks.filter((item) => item.solution)) {
  test(`${task.id}: its actual C++ solution compiles and produces its expected output`, { skip: !compilerAvailable }, () => {
    assert.equal(compileAndRun(`${task.id}-solution`, task.solution), task.expectedOutput.trim())
  })
  test(`${task.id}: its editable starter compiles and exposes a real learning task`, { skip: !compilerAvailable }, () => {
    const output = compileAndRun(`${task.id}-starter`, task.starter)
    assert.notEqual(output, task.expectedOutput.trim(), 'The unfinished starter must not already produce the target result')
  })
}

for (const taskId of ['integer-output', 'trace-selection', 'index', 'call', 'byvalue']) {
  test(`${taskId}: its actual prediction code agrees with the marked answer`, { skip: !compilerAvailable }, () => {
    const task = tasks.get(taskId)
    const marker = task.prompt.indexOf(': ')
    assert.ok(marker >= 0, taskId)
    const code = task.prompt.slice(marker + 2)
    const [firstPart, secondPart] = code.split(' ... ')
    const functions = secondPart ? firstPart : ''
    const body = secondPart ?? firstPart
    const source = `#include <iostream>\nusing namespace std;\n${functions}\nint main() { ${body} return 0; }\n`
    assert.equal(compileAndRun(taskId, source), task.options[task.answer])
  })
}

test('debug tasks demonstrate the exact faulty output described by their learning explanations', { skip: !compilerAvailable }, () => {
  const average = tasks.get('debug-average')
  assert.equal(compileAndRun('debug-average-fault', average.starter), '6')
  assert.equal(compileAndRun('debug-average-repair', average.solution), '6.5')
  const loop = tasks.get('repair-loop')
  assert.equal(compileAndRun('repair-loop-fault', loop.starter), '1 2 3')
  assert.equal(compileAndRun('repair-loop-repair', loop.solution), '1 2 3 4')
})
