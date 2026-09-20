import { knowledge, getActiveKnowledge, berlinDate } from './knowledge.js';
import { retrieveKnowledge, normalize } from './retrieval.js';
import { INSTRUCTIONS, answerSchema, smallTalk } from './answer.js';

export const UNKNOWN = 'Dazu habe ich in der bereitgestellten Wissensbasis keine verlässliche Information gefunden. Bitte präzisiere gegebenenfalls Studiengang und Semester oder wende dich an die Studienberatung.';
const MAX_BODY_BYTES = 18000;
const MAX_MESSAGE = 1500;

class RequestError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extra } });
}
async function readBoundedBody(request) {
  if (Number(request.headers.get('content-length')) > MAX_BODY_BYTES) throw new RequestError(413, 'Die Anfrage ist zu groß. Bitte kürze deine Frage.');
  const reader = request.body?.getReader();
  if (!reader) throw new RequestError(400, 'Bitte gib eine Frage ein.');
  const chunks = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) { await reader.cancel(); throw new RequestError(413, 'Die Anfrage ist zu groß. Bitte kürze deine Frage.'); }
    chunks.push(value);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new RequestError(400, 'Die Anfrage ist nicht gültig.'); }
}
export function validateInput(body) {
  if (!body || typeof body.message !== 'string' || !body.message.trim() || body.message.length > MAX_MESSAGE) throw new RequestError(400, 'Bitte gib eine Frage mit höchstens 1500 Zeichen ein.');
  const history = body.history ?? [];
  if (!Array.isArray(history) || history.length > 6 || history.some((item) => !item || !['user', 'assistant'].includes(item.role) || typeof item.content !== 'string' || !item.content.trim() || item.content.length > MAX_MESSAGE)) throw new RequestError(400, 'Der Gesprächskontext ist nicht gültig. Bitte starte einen neuen Chat.');
  return { message: body.message.trim(), history: history.map(({ role, content }) => ({ role, content })) };
}

export async function answerWithOpenAI({ input, entries, today, env, fetchImpl = fetch }) {
  const response = await fetchImpl('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(22000),
    body: JSON.stringify({
      model: env.OPENAI_MODEL || 'gpt-4.1-mini',
      store: false,
      max_output_tokens: 1600,
      instructions: `${INSTRUCTIONS}\nHeutiges Datum (Europe/Berlin): ${today}\nBelegte Informationen:\n${JSON.stringify(entries.map(({ id, scope, title, text, kind, references }) => ({ id, scope, title, text, kind, references })))}`,
      input: [{ role: 'user', content: JSON.stringify({ conversation: input.history, question: input.message, second_search: input.second_search || false }) }],
      text: { format: { type: 'json_schema', name: 'ohmbot_answer', strict: true, schema: answerSchema } },
    }),
  });
  // Niemals Anbieterantworten oder Schlüssel in Fehlermeldungen/Logs spiegeln.
  if (!response.ok) {
    if (response.status === 429) {
      const detail = await response.json().catch(() => ({}));
      throw new RequestError(503, detail?.error?.code === 'insufficient_quota' ? 'Das API-Guthaben oder Nutzungslimit des Projekts reicht derzeit nicht aus. Bitte informiere das Projektteam.' : 'Der KI-Dienst erhält gerade zu viele Anfragen. Bitte warte kurz und versuche es erneut.');
    }
    if ([401, 403].includes(response.status)) throw new RequestError(503, 'OhmBot ist noch nicht korrekt freigeschaltet. Bitte informiere das Projektteam.');
    throw new RequestError(502, 'Der KI-Dienst konnte die Anfrage nicht beantworten. Bitte versuche es später erneut.');
  }
  const result = await response.json();
  if (result.status !== 'completed' || !Array.isArray(result.output)) throw new RequestError(502, 'Die Antwort konnte nicht vollständig geprüft werden. Bitte versuche es erneut.');
  const content = result.output.filter((item) => item.type === 'message').flatMap((item) => item.content || []);
  if (content.some((item) => item.type === 'refusal')) return { status: 'unknown', paragraphs: [{ text: 'Bei dieser Anfrage kann ich dir nicht helfen. Du kannst mir gern eine andere Frage stellen.', kind: 'clarification', entry_ids: [] }], lookup_query: '' };
  try { return JSON.parse(content.filter((item) => item.type === 'output_text').map((item) => item.text).join('')); }
  catch { throw new RequestError(502, 'Die Antwort konnte nicht geprüft werden. Bitte versuche es erneut.'); }
}

export function composeAnswer(result, entries, data = knowledge, { universityQuestion = false } = {}) {
  const unknown = { status: 'unknown', message: UNKNOWN, blocks: [], sources: [], notice: '' };
  if (!result || !['answered', 'partial', 'unknown', 'clarification'].includes(result.status) || !Array.isArray(result.paragraphs) || !result.paragraphs.length || result.paragraphs.length > 8) return unknown;
  const byId = new Map(entries.map((e) => [e.id, e]));
  const sources = [], blocks = [];
  for (const [index, p] of result.paragraphs.entries()) {
    if (!p || typeof p.text !== 'string' || !p.text.trim() || p.text.length > 5000 || !['university', 'general', 'clarification'].includes(p.kind) || !Array.isArray(p.entry_ids) || p.entry_ids.length > 6 || p.entry_ids.some((id) => !byId.has(id))) return unknown;
    if ((p.kind === 'university' && !p.entry_ids.length) || (p.kind !== 'university' && p.entry_ids.length)) return unknown;
    const labels = [];
    for (const id of new Set(p.entry_ids)) {
      const entry = byId.get(id);
      const refs = entry.references || entry.source_ids.map((source_id) => ({ source_id, locator: entry.title }));
      for (const ref of refs) {
        const source = data.sources.find((s) => s.id === ref.source_id);
        if (!source) return unknown;
        const url = new URL(source.url);
        if (ref.page) url.hash = `page=${ref.page}`;
        let pos = sources.findIndex((s) => s.url === url.href && s.locator === ref.locator);
        if (pos < 0) { sources.push({ ...source, url: url.href, locator: ref.locator }); pos = sources.length - 1; }
        if (!labels.includes(pos + 1)) labels.push(pos + 1);
      }
    }
    blocks.push({ id: `answer-${index}`, title: p.kind === 'general' ? 'Allgemeine Antwort' : '', text: p.text.trim(), citations: labels });
  }
  if (universityQuestion && result.paragraphs.every((p) => p.kind === 'general')) return unknown;
  return { status: result.status, message: '', blocks, sources,
    notice: sources.length ? 'Quellenstand beachten. KI-Antworten können Fehler enthalten; verbindlich sind die geltenden Hochschuldokumente.' : result.paragraphs.some((p) => p.kind === 'general') ? 'Allgemeine KI-Antwort · ohne aktuelle Internetrecherche.' : '' };
}

export function isUniversityQuestion(input) {
  const s = normalize(input.message);
  return /\b(th|ohm|hochschule|nuernberg|ects|spo|aspo|studyohm|studienabschnitt|pruefungsordnung|praxissemester|modulhandbuch)\b|studienaufbau|semesterbeginn|pruefungsfrist|pruefungsanmeldung|bachelorarbeit|masterarbeit|rueckmeldung/.test(s);
}

// Dependency injection erlaubt Tests ohne echte API-Kosten und ohne Netzverbindung.
export function createChatHandler({ env = process.env, fetchImpl = fetch, now = () => new Date(), responder } = {}) {
  return async function chat(request) {
    try {
      if (request.method !== 'POST') return json({ error: 'Nur POST-Anfragen sind erlaubt.' }, 405, { Allow: 'POST' });
      const origin = request.headers.get('origin');
      if (origin && origin !== new URL(request.url).origin) return json({ error: 'Diese Anfrage kommt nicht von der OhmBot-Webseite.' }, 403);
      if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return json({ error: 'Bitte sende die Anfrage als JSON.' }, 415);
      if (env.CHAT_DISABLED === 'true') return json({ error: 'OhmBot ist vorübergehend pausiert. Bitte versuche es später erneut.' }, 503);
      const input = validateInput(await readBoundedBody(request));
      const greeting = smallTalk(input.message);
      if (greeting) return json({ status: 'answered', message: greeting, blocks: [], sources: [], notice: '' });
      const today = berlinDate(now());
      const active = getActiveKnowledge(today);
      if (!active.length && isUniversityQuestion(input)) return json(composeAnswer(null, []));
      if (!responder && (!env.OPENAI_API_KEY || env.OPENAI_API_KEY === 'DEIN_OPENAI_API_KEY')) return json({ error: 'OhmBot ist noch nicht eingerichtet. Das Projektteam muss den API-Zugang hinterlegen.' }, 503);
      const respond = responder || answerWithOpenAI;
      let entries = retrieveKnowledge(input, active);
      let result = await respond({ input, entries, today, env, fetchImpl });
      // Genau eine Nachsuche, damit schwierige Fragen nicht sofort als unbekannt enden.
      if (result?.status === 'lookup' && typeof result.lookup_query === 'string' && result.lookup_query.trim() && result.lookup_query.length <= 300) {
        entries = retrieveKnowledge({ message: result.lookup_query, history: [...input.history, { role: 'user', content: input.message }] }, active);
        result = await respond({ input: { ...input, second_search: true }, entries, today, env, fetchImpl });
      }
      return json(composeAnswer(result, entries, knowledge, { universityQuestion: isUniversityQuestion(input) }));
    } catch (error) {
      if (error instanceof RequestError) return json({ error: error.message }, error.status);
      if (['TimeoutError', 'AbortError'].includes(error.name)) return json({ error: 'Die Antwort dauert zu lange. Bitte versuche es erneut.' }, 504);
      return json({ error: 'OhmBot ist gerade nicht erreichbar. Bitte versuche es später erneut.' }, 502);
    }
  };
}
