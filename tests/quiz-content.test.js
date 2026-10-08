import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { quizzes } from '../src/data/quizzes.js'

const verbs = {
  C1: ['Identify', 'Recognize', 'Select', 'List'],
  C2: ['Explain', 'Classify', 'Interpret', 'Differentiate', 'Summarize'],
  C3: ['Apply', 'Calculate', 'Determine', 'Predict', 'Demonstrate'],
  C4: ['Analyze', 'Compare', 'Examine', 'Distinguish', 'Debug'],
}
const questions = new Map(quizzes.flatMap((quiz) => quiz.questions.map((question) => [question.id, question])))

test('the five topic quizzes contain exactly 50 unique questions', () => {
  assert.deepEqual(quizzes.map((quiz) => quiz.topicId), ['intro', 'variables', 'control', 'arrays', 'functions'])
  assert.equal(new Set(quizzes.map((quiz) => quiz.id)).size, 5)
  assert.equal(quizzes.reduce((sum, quiz) => sum + quiz.questions.length, 0), 50)
  assert.equal(questions.size, 50)
})

for (const quiz of quizzes) {
  test(`${quiz.topicId}: exactly 10 progressively ordered, validated MCQs in 15 minutes`, () => {
    assert.equal(quiz.durationSeconds, 900)
    assert.equal(quiz.questions.length, 10)
    assert.deepEqual(quiz.questions.map((question) => question.bloom), ['C1', 'C1', 'C2', 'C2', 'C2', 'C3', 'C3', 'C3', 'C4', 'C4'])
    assert.deepEqual(
      quiz.questions.reduce((totals, question) => ({ ...totals, [question.bloom]: totals[question.bloom] + 1 }), { C1: 0, C2: 0, C3: 0, C4: 0 }),
      { C1: 2, C2: 3, C3: 3, C4: 2 },
    )
    for (const [index, question] of quiz.questions.entries()) {
      assert.equal(question.id, `t${quizzes.indexOf(quiz) + 1}-q${index + 1}`)
      assert.equal(question.options.length, 4, question.id)
      assert.equal(new Set(question.options).size, 4, question.id)
      assert.ok(question.options.every((option) => typeof option === 'string' && option.trim().length > 0), question.id)
      assert.ok(Number.isInteger(question.answer) && question.answer >= 0 && question.answer <= 3, question.id)
      assert.ok(verbs[question.bloom].some((verb) => question.question.startsWith(`${verb} `)), question.id)
      assert.ok(!/^(what|why|when|where|who|how)\b/i.test(question.question), question.id)
      assert.ok(question.explanation.length > 70, `${question.id}: a meaningful explanation is required`)
      assert.ok(typeof question.concept === 'string' && question.concept.length > 8, `${question.id}: concept mapping is required`)
    }
  })
}

test('Topic 1 applied pseudocode calculations and data dependencies have verified answers', () => {
  assert.equal(questions.get('t1-q6').options[questions.get('t1-q6').answer], `RM ${3 * 12 + 2 * 8}`)
  const score = 70
  assert.equal(questions.get('t1-q7').options[questions.get('t1-q7').answer], score >= 70 ? 'Ready' : 'Revise')
  assert.equal(questions.get('t1-q8').options[questions.get('t1-q8').answer], String(25 * 4 + (4 - 1) * 5))
  assert.equal((60 + 80) / 2, 70)
  let a = 3, b = 8
  const temp = a
  a = b
  b = temp
  assert.deepEqual([a, b], [8, 3])
  a = 3
  b = 8
  a = b
  b = a
  assert.deepEqual([a, b], [8, 8])
})

test('function content excludes overloading and documents the unavailable official scope', () => {
  assert.ok(!/overload/i.test(JSON.stringify(quizzes.find((quiz) => quiz.topicId === 'functions'))))
  const source = readFileSync(new URL('../src/data/quizzes.js', import.meta.url), 'utf8')
  assert.match(source, /official 5\.2\.3 document was not provided/)
})

const compilerAvailable = spawnSync('g++', ['--version'], { encoding: 'utf8' }).status === 0
const nativeDirectory = compilerAvailable ? mkdtempSync(join(tmpdir(), 'programming-quiz-native-')) : null
after(() => { if (nativeDirectory) rmSync(nativeDirectory, { recursive: true, force: true }) })

function questionCode(questionId) {
  const stem = questions.get(questionId).question
  const marker = stem.indexOf('\n\n')
  assert.ok(marker >= 0, `${questionId}: code must be present in the question`)
  return stem.slice(marker + 2)
}

function executeQuestion(questionId, { replace, append = '', input = '' } = {}) {
  let code = questionCode(questionId)
  if (replace) code = code.replace(replace[0], replace[1])
  const parts = code.split('// Inside main:')
  let functions = ''
  let main = code
  if (parts.length === 2) {
    functions = parts[0]
    main = parts[1]
  } else if (/^(?:int|double|void)\s+\w+\(/.test(code)) {
    functions = code
    main = ''
  }
  const filename = join(nativeDirectory, `${questionId}.cpp`)
  const executable = join(nativeDirectory, questionId)
  writeFileSync(filename, `#include <iostream>\nusing namespace std;\n${functions}\nint main() {\n${main}\n${append}\nreturn 0;\n}\n`)
  const compiled = spawnSync('g++', ['-std=c++17', '-Wall', '-Wextra', filename, '-o', executable], { encoding: 'utf8', timeout: 15000 })
  assert.equal(compiled.status, 0, `${questionId}: ${compiled.stderr}`)
  const executed = spawnSync(executable, [], { input, encoding: 'utf8', timeout: 2000 })
  assert.equal(executed.status, 0, `${questionId}: ${executed.stderr}`)
  return executed.stdout.trim()
}

const outputCases = [
  ['t2-q6', '5'],
  ['t2-q7', '15', { input: '2 7.5\n' }],
  ['t2-q8', '14 8'],
  ['t3-q4', '14'],
  ['t3-q5', 'AB'],
  ['t3-q6', '20'],
  ['t3-q7', '8', { input: '3 5 -1 8\n' }],
  ['t3-q8', 'Good', { replace: ['if (mark >= 80)', 'int mark = 67;\nif (mark >= 80)'] }],
  ['t4-q4', '5'],
  ['t4-q6', '18'],
  ['t4-q7', '12'],
  ['t4-q8', '3'],
  ['t5-q4', '12'],
  ['t5-q6', '34'],
  ['t5-q7', '6 5'],
  ['t5-q8', '11'],
]
for (const [questionId, expected, options] of outputCases) {
  test(`${questionId}: the question's actual C++ source produces the verified result`, { skip: !compilerAvailable }, () => {
    assert.equal(executeQuestion(questionId, options), expected)
    // The interpretive function-call item explains the result rather than using a numeric choice.
    if (questionId !== 't5-q4') {
      const question = questions.get(questionId)
      assert.equal(question.options[question.answer], expected)
    }
  })
}

test('partial array initialization really zero-initializes the unlisted elements', { skip: !compilerAvailable }, () => {
  assert.equal(executeQuestion('t4-q3', { append: 'cout << scores[2] << " " << scores[3] << " " << scores[4];' }), '0 0 0')
})

test('percentage and average debugging answers fix the demonstrated C++ faults', { skip: !compilerAvailable }, () => {
  assert.equal(executeQuestion('t2-q9'), '0')
  assert.equal(executeQuestion('t2-q9', { replace: ['completed / activities * 100', questions.get('t2-q9').options[questions.get('t2-q9').answer]] }), '75')
  assert.equal(executeQuestion('t2-q10'), '10')
  assert.equal(executeQuestion('t2-q10', { replace: ['a + b / 2', questions.get('t2-q10').options[questions.get('t2-q10').answer]] }), '6.5')
})

test('nested-loop debugging answer produces the required triangle', { skip: !compilerAvailable }, () => {
  assert.equal(executeQuestion('t3-q9'), '***\n***\n***')
  assert.equal(executeQuestion('t3-q9', { replace: ['column <= rows', 'column <= row'] }), '*\n**\n***')
})

test('inclusive-loop correction fixes both the normal and boundary cases', { skip: !compilerAvailable }, () => {
  assert.equal(executeQuestion('t3-q10'), '6')
  assert.equal(executeQuestion('t3-q10', { replace: ['number < n', 'number <= n'] }), '10')
  assert.equal(executeQuestion('t3-q10', { replace: ['int n = 4', 'int n = 1'] }), '0')
  assert.equal(executeQuestion('t3-q10', { replace: ['int n = 4, number = 1, sum = 0;\nwhile (number < n)', 'int n = 1, number = 1, sum = 0;\nwhile (number <= n)'] }), '1')
})

test('maximum search is corrected for the provided negative values', { skip: !compilerAvailable }, () => {
  assert.equal(executeQuestion('t4-q9'), '0')
  assert.equal(executeQuestion('t4-q9', { replace: ['int largest = 0;', 'int largest = values[0];'] }), '-3')
})

test('array reversal diagnosis matches actual value loss and a temporary variable fixes it', { skip: !compilerAvailable }, () => {
  const display = 'for (int i = 0; i < 4; ++i) { if (i > 0) cout << " "; cout << values[i]; }'
  assert.equal(executeQuestion('t4-q10', { append: display }), '4 3 3 4')
  assert.equal(executeQuestion('t4-q10', {
    replace: ['values[i] = values[3 - i];\n    values[3 - i] = values[i];', 'int temp = values[i];\n    values[i] = values[3 - i];\n    values[3 - i] = temp;'],
    append: display,
  }), '4 3 2 1')
})

test('function-debugging answers fix return-expression and argument-mapping faults', { skip: !compilerAvailable }, () => {
  assert.equal(executeQuestion('t5-q9', { append: 'cout << fraction(1, 4);' }), '0')
  assert.equal(executeQuestion('t5-q9', { replace: ['return numerator / denominator;', questions.get('t5-q9').options[questions.get('t5-q9').answer]], append: 'cout << fraction(1, 4);' }), '0.25')
  assert.equal(executeQuestion('t5-q10', { append: 'cout << netAmount(50, 20);' }), '-30')
  assert.equal(executeQuestion('t5-q10', { replace: ['return difference(expense, income);', questions.get('t5-q10').options[questions.get('t5-q10').answer]], append: 'cout << netAmount(50, 20);' }), '30')
})
