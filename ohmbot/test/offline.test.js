import test from 'node:test';
import assert from 'node:assert/strict';
import { createChatHandler } from '../lib/chat-service.js';
import { getActiveKnowledge, knowledge } from '../lib/knowledge.js';
import { offlineSelection } from '../lib/offline-answer.js';

const now = () => new Date('2026-10-07T12:00:00Z');
const active = getActiveKnowledge('2026-10-07');
const question = 'wie viele ects brauch ich fürs 2 studienabschnitt';
const request = (message = question, history = []) => new Request('https://ohmbot.example/api/chat', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, history }),
});
const select = (message, history = [], entries = active) => offlineSelection({ message, history }, entries);
const ids = result => result.paragraphs.flatMap(p => p.entry_ids);

test('Ohne Schlüssel, mit Leerzeichen oder Platzhalter keine API-Anfrage; Quellen und Regeln bleiben erhalten', async () => {
  for (const key of [undefined, '', '   ', 'DEIN_OPENAI_API_KEY']) {
    let calls = 0;
    const handler = createChatHandler({ now, env: { OPENAI_API_KEY: key }, fetchImpl: () => { calls++; throw Error('Verboten'); } });
    const response = await handler(request());
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(calls, 0);
    assert.equal(body.mode, 'basis');
    assert.equal(body.status, 'partial');
    assert.match(body.blocks[0].text, /38 ECTS aus den Fächern des ersten/);
    assert.match(body.blocks[0].text, /Geltungsbereich:/);
    assert.ok(body.sources.some(s => s.id === 'spo-in' && s.url.endsWith('#page=3')));
    assert.match(body.notice, /Basis-Modus/);
  }
});

test('Erfolgreiche KI-Antwort bleibt erhalten, nächster Aufruf erholt sich nach Ausfall automatisch', async () => {
  let calls = 0;
  const handler = createChatHandler({ now, env: { OPENAI_API_KEY: 'test-only' }, fetchImpl: async () => {
    calls++;
    if (calls === 1) return new Response('Ausfall', { status: 503 });
    return Response.json({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify({
      status: 'answered', lookup_query: '', paragraphs: [{ kind: 'university', text: 'Normale KI-Antwort.', entry_ids: ['second-section'] }],
    }) }] }] });
  } });
  assert.equal((await (await handler(request())).json()).mode, 'basis');
  const recovered = await (await handler(request())).json();
  assert.equal(recovered.mode, undefined);
  assert.equal(recovered.blocks[0].text, 'Normale KI-Antwort.');
  assert.equal(calls, 2);
});

test('Fehler in der zweiten KI-Suche greift auf die ursprüngliche Nutzerfrage zurück', async () => {
  let calls = 0;
  const handler = createChatHandler({ now, env: {}, responder: async () => {
    if (++calls === 1) return { status: 'lookup', lookup_query: 'unbekanntes Thema', paragraphs: [] };
    throw new Error('secret-provider-detail');
  } });
  const body = await (await handler(request())).json();
  assert.equal(body.mode, 'basis');
  assert.match(body.blocks[0].text, /38 ECTS/);
  assert.equal(calls, 2);
});

test('API-Ablehnung wird nicht durch gespeicherte Antworten übergangen', async () => {
  const handler = createChatHandler({ now, env: { OPENAI_API_KEY: 'test-only' }, fetchImpl: async () => Response.json({
    status: 'completed', output: [{ type: 'message', content: [{ type: 'refusal' }] }],
  }) });
  const body = await (await handler(request())).json();
  assert.equal(body.mode, undefined);
  assert.equal(body.status, 'unknown');
  assert.equal(body.sources.length, 0);
});

test('Typische Fragen, Abkürzungen und Tippfehler finden passende gespeicherte Themen', () => {
  for (const [q, id] of [
    ['Wie viele LP für den zweiten Studienabschnit?', 'second-section'],
    ['Darf ich mit 38 ECTS ins Praxissemester?', 'practice-admission'],
    ['Wie viele Punkte für die BA Anmeldung?', 'thesis-admission'],
    ['Wie ist der Bachelor Informatik aufgebaut?', 'structure'],
    ['Was ist Winfo?', 'winfo-overview'],
    ['Was lerne ich in OOP?', 'module-b-in-objektorientierte-programmierung'],
    ['Welche Module im vierten Semester Medieninformatik?', 'semester-min-4'],
    ['Wann muss ich mich für Prüfungen anmelden?', 'exam-registration'],
  ]) assert.ok(ids(select(q)).includes(id), q);
});

test('Keine erfundenen Antworten für unbekannte Details, fremde Jahre oder allgemeine Aufgaben', () => {
  for (const q of ['Wie viel Gehalt bekomme ich im Praxissemester?', 'Was sind Quantenbananen an der TH Nürnberg?', 'Wann ist die Prüfungsanmeldung 2030?', 'Was kann ich heute kochen?', 'Schreibe mir Java Code', 'Wie viele ECTS habe ich?']) {
    assert.deepEqual(ids(select(q)), [], q);
  }
});

test('Expliziter Master wird nicht mit Bachelor-Regeln beantwortet', () => {
  assert.ok(!ids(select('Wie viele ECTS für den zweiten Studienabschnitt im Master Informatik?')).includes('second-section'));
  const found = ids(select('Welche Module im vierten Semester Medieninformatik?'));
  assert.deepEqual(found, ['semester-min-4']);
});

test('Regelkontext und dokumentierter Statistik-Widerspruch bleiben sichtbar', () => {
  assert.ok(ids(select(question)).includes('regulations-scope'));
  const result = select('Wie viele ECTS hat Statistik in Medieninformatik?');
  assert.equal(ids(result)[0], 'statistics-conflict-min');
  assert.match(result.paragraphs[0].text, /6 ECTS/);
  assert.match(result.paragraphs[0].text, /5 ECTS/);
});

test('Anschlussfrage wechselt Studiengang; neue allgemeine Frage übernimmt keine alten Treffer', () => {
  const history = [{ role: 'user', content: 'Wie viele ECTS hat Algorithmen und Datenstrukturen im Bachelor Informatik?' }, { role: 'assistant', content: 'Erfundene Angabe: 999 ECTS.' }];
  const result = select('Und in Winfo?', history);
  assert.ok(ids(result).includes('module-b-win-algorithmen-und-datenstrukturen'));
  assert.ok(!ids(result).includes('module-b-in-algorithmen-und-datenstrukturen'));
  assert.ok(!JSON.stringify(result).includes('999'));
  assert.deepEqual(ids(select('Wie koche ich Suppe?', history)), []);
});

test('Alle angezeigten Inhalte kommen unverändert aus den aktiven Einträgen', () => {
  for (const q of [question, 'Praxissemester', 'OOP', 'Statistik Medieninformatik']) {
    const result = select(q);
    assert.ok(result.paragraphs.length <= 4);
    for (const p of result.paragraphs.filter(p => p.kind === 'university')) {
      const entry = active.find(e => e.id === p.entry_ids[0]);
      assert.ok(entry);
      assert.ok(p.text.endsWith(entry.text));
    }
  }
});

test('Abgelaufene Daten werden auch ohne KI nicht ausgegeben', async () => {
  const handler = createChatHandler({ env: {}, now: () => new Date('2028-01-01') });
  const body = await (await handler(request())).json();
  assert.equal(body.mode, 'basis');
  assert.equal(body.sources.length, 0);
  assert.ok(!JSON.stringify(body).includes('38 ECTS'));
  assert.ok(knowledge.entries.some(e => e.id === 'second-section'));
});
