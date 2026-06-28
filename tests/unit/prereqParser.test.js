const assert = require('node:assert/strict');
const test = require('node:test');
const { parsePrerequisite } = require('../../lib/prereqParser');

test('extracts a single prerequisite module', () => {
  assert.deepEqual(parsePrerequisite('CS2040').modules, ['CS2040']);
});

test('extracts nested prerequisite modules without duplicates', () => {
  const result = parsePrerequisite('CS2040 and (CS2100 or CS2040)');

  assert.deepEqual(result.modules, ['CS2040', 'CS2100']);
  assert.equal(result.hasAnd, true);
  assert.equal(result.hasOr, true);
});

test('falls back safely when prerequisite text has no module code', () => {
  assert.deepEqual(parsePrerequisite('Department approval required'), {
    raw: 'Department approval required',
    modules: [],
    hasAnd: false,
    hasOr: false,
  });
});
