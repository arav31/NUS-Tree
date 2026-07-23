const assert = require('node:assert/strict');
const test = require('node:test');

async function callRoute(path, fetchResult) {
  const originalFetch = global.fetch;
  const calls = [];
  global.fetch = async (...args) => {
    calls.push(args);
    return fetchResult;
  };

  try {
    const { GET } = await import('../../app/api/module/route.js');
    const response = await GET(new Request(`http://localhost${path}`));
    return { calls, response, body: await response.json() };
  } finally {
    global.fetch = originalFetch;
  }
}

test('fetches and normalizes a NUSMods module', async () => {
  const year = new Date().getMonth() >= 7
    ? new Date().getFullYear()
    : new Date().getFullYear() - 1;
  const { calls, body } = await callRoute('/api/module?code=cs2040s', {
    ok: true,
    json: async () => ({
      moduleCode: 'CS2040S',
      title: 'Data Structures and Algorithms',
      description: 'DSA module',
      prerequisite: 'CS1010X',
      semesterData: [{ semester: 1 }, { semester: 2 }],
    }),
  });

  assert.equal(calls[0][0], `https://api.nusmods.com/v2/${year}-${year + 1}/modules/CS2040S.json`);
  assert.equal(body.moduleCode, 'CS2040S');
  assert.deepEqual(body.semesterData, [1, 2]);
});

test('returns API errors without calling NUSMods for missing code', async () => {
  const { calls, response, body } = await callRoute('/api/module', {});

  assert.equal(response.status, 400);
  assert.equal(body.error, 'Missing module code');
  assert.equal(calls.length, 0);
});

test('returns 404 when NUSMods cannot find the module', async () => {
  const { response, body } = await callRoute('/api/module?code=NOMD6767', {
    ok: false,
  });

  assert.equal(response.status, 404);
  assert.equal(body.error, 'NOMD6767 was not found');
});
