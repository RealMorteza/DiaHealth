import assert from 'node:assert/strict';
import test from 'node:test';
import {
  canManageQuestionnaire,
  createQuestionnaireService,
  questionnaireErrorMessage,
} from '../src/services/questionnaireService.js';

function fakeClient(readResult, writeResult = readResult) {
  const calls = [];
  let writing = false;
  const query = {
    select(column) { calls.push(['select', column]); return this; },
    update(value) { writing = true; calls.push(['update', value]); return this; },
    eq(column, value) { calls.push(['eq', column, value]); return this; },
    single() { return Promise.resolve(writing ? writeResult : readResult); },
  };
  return { calls, from(table) { calls.push(['from', table]); return query; } };
}

test('only the two specified usernames can manage the questionnaire', () => {
  assert.equal(canManageQuestionnaire('09154184247@example.com'), true);
  assert.equal(canManageQuestionnaire('۰۹۳۶۴۳۲۳۷۳۶'), true);
  assert.equal(canManageQuestionnaire('09120000000@example.com'), false);
  assert.equal(canManageQuestionnaire('x09154184247@example.com'), false);
});

test('reads the one shared setting, including its false value', async () => {
  const client = fakeClient({ data: { enabled: false }, error: null });
  const service = createQuestionnaireService(client);
  assert.equal(await service.getEnabled(), false);
  assert.deepEqual(client.calls, [
    ['from', 'app_settings'],
    ['select', 'enabled'],
    ['eq', 'key', 'questionnaire_enabled'],
  ]);
});

test('returns the saved server value and does not treat a missing row as success', async () => {
  const client = fakeClient(
    { data: { enabled: false }, error: null },
    { data: { enabled: true }, error: null },
  );
  const service = createQuestionnaireService(client);
  assert.equal(await service.setEnabled(true), true);
  assert.deepEqual(client.calls[1], ['update', { enabled: true }]);

  const missingRow = createQuestionnaireService(fakeClient(
    { data: null, error: null },
    { data: null, error: null },
  ));
  await assert.rejects(missingRow.setEnabled(true), { code: 'PGRST116' });
});

test('surfaces missing-table and network errors with useful messages', async () => {
  const missingTable = { code: 'PGRST205', message: 'Table not found' };
  const service = createQuestionnaireService(fakeClient({ data: null, error: missingTable }));
  await assert.rejects(service.getEnabled(), (error) => error === missingTable);
  assert.match(questionnaireErrorMessage(missingTable), /SQL/);
  assert.match(questionnaireErrorMessage(new TypeError('Failed to fetch')), /ارتباط/);
});
