import knowledgeData from '../data/thn_knowledge.json' with { type: 'json' };

// Statischer JSON-Import wird von Netlify/esbuild eingebunden: keine Laufzeit-Pfadannahmen.
export const knowledge = knowledgeData;

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
function validDate(value) {
  if (typeof value !== 'string' || !datePattern.test(value)) return false;
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value;
}
export function validateKnowledge(data) {
  if (data.version !== 1 || !Array.isArray(data.sources) || !Array.isArray(data.entries) || !data.entries.length) throw new Error('Ungültige Wissensbasis');
  const sourceIds = new Set();
  for (const source of data.sources) {
    const url = new URL(source.url);
    if (url.protocol !== 'https:' || !(url.hostname === 'th-nuernberg.de' || url.hostname.endsWith('.th-nuernberg.de')) || url.username || url.password) throw new Error('Nur offizielle HTTPS-Quellen sind erlaubt');
    if (!source.id || sourceIds.has(source.id) || !source.title || !validDate(source.checked_at)) throw new Error('Ungültige Quelle');
    sourceIds.add(source.id);
  }
  const entryIds = new Set();
  for (const entry of data.entries) {
    if (!/^[a-z0-9-]+$/.test(entry.id) || entryIds.has(entry.id) || !entry.title || !entry.scope || !entry.text || entry.text.length > 1400 || !['fact', 'gap'].includes(entry.kind) || !validDate(entry.review_by)) throw new Error('Ungültiger Wissenseintrag');
    if (!Array.isArray(entry.keywords) || !Array.isArray(entry.source_ids) || !entry.source_ids.length || entry.source_ids.some((id) => !sourceIds.has(id))) throw new Error('Fehlende Quellenreferenz');
    entryIds.add(entry.id);
  }
  if (JSON.stringify(data).length > 80000) throw new Error('Wissensbasis zu groß: Auswahlverfahren erweitern');
  return true;
}
validateKnowledge(knowledge);

export function berlinDate(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}
// Klarer Erweiterungspunkt: später durch Suche/RAG ersetzen. V1 übergibt die kleine Basis vollständig.
export function getActiveKnowledge(today = berlinDate(), data = knowledge) {
  return data.entries.filter((entry) => entry.review_by >= today);
}
