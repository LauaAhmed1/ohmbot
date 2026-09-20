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
  if (![1, 2].includes(data.version) || !Array.isArray(data.sources) || !Array.isArray(data.entries) || !data.entries.length) throw new Error('Ungültige Wissensbasis');
  const sourceIds = new Set();
  for (const source of data.sources) {
    const url = new URL(source.url);
    if (url.protocol !== 'https:' || !(url.hostname === 'th-nuernberg.de' || url.hostname.endsWith('.th-nuernberg.de')) || url.username || url.password) throw new Error('Nur offizielle HTTPS-Quellen sind erlaubt');
    if (!source.id || sourceIds.has(source.id) || !source.title || !validDate(source.checked_at)) throw new Error('Ungültige Quelle');
    sourceIds.add(source.id);
  }
  const entryIds = new Set();
  for (const entry of data.entries) {
    if (!/^[a-z0-9-]+$/.test(entry.id) || entryIds.has(entry.id) || !entry.title || !entry.scope || !entry.text || entry.text.length > 3000 || !['fact', 'gap'].includes(entry.kind) || !validDate(entry.review_by)) throw new Error(`Ungültiger Wissenseintrag: ${entry.id}`);
    if (!Array.isArray(entry.keywords) || entry.keywords.some((k) => typeof k !== 'string') || !Array.isArray(entry.source_ids) || !entry.source_ids.length || entry.source_ids.some((id) => !sourceIds.has(id))) throw new Error('Fehlende Quellenreferenz');
    if (entry.programs && (!Array.isArray(entry.programs) || entry.programs.some((p) => !['b-in', 'b-min', 'b-win', 'm-in', 'm-min', 'm-win'].includes(p)))) throw new Error('Ungültiger Studiengang');
    if (entry.references !== undefined && (!Array.isArray(entry.references) || !entry.references.length || entry.references.some((r) => !r || !entry.source_ids.includes(r.source_id) || !r.locator || (r.page != null && (!Number.isInteger(r.page) || r.page < 1))))) throw new Error('Ungültige Fundstelle');
    entryIds.add(entry.id);
  }
  if (JSON.stringify(data).length > 2000000) throw new Error('Wissensbasis über 2 MB: Suchindex überprüfen');
  return true;
}
validateKnowledge(knowledge);

export function berlinDate(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}
// Veraltete Einträge kommen nicht in den Modellkontext. Historische Daten separat pflegen.
export function getActiveKnowledge(today = berlinDate(), data = knowledge) {
  return data.entries.filter((entry) => entry.review_by >= today);
}
