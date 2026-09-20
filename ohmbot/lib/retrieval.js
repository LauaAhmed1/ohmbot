// Kleine lokale Textsuche: keine Vektordatenbank und keine zusätzlichen API-Aufrufe.
export function normalize(value) {
  return value.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}
const STOP = new Set('ich du der die das den dem des ein eine einer einem und oder ist sind was wie wann wo welche welchen welcher warum muss kann darf fuer im in am an auf zu zum zur mit von mein meine mir man noch es auch habe hab geht es denn schon bitte'.split(' '));
function words(s) { return [...new Set(normalize(s).split(' ').filter((w) => (w.length > 1 || /^\d$/.test(w)) && !STOP.has(w)))]; }
const aliases = [
  [/\b(ersten|erstes|erstem|erste)\s+semester\b/g, '1 semester'],
  [/\b(zweiten|zweites|zweitem|zweite)\s+semester\b/g, '2 semester'],
  [/\b(dritten|drittes|drittem|dritte)\s+semester\b/g, '3 semester'],
  [/\b(vierten|viertes|viertem|vierte)\s+semester\b/g, '4 semester'],
  [/\b(fuenften|fuenftes|fuenftem|fuenfte)\s+semester\b/g, '5 semester'],
  [/\b(sechsten|sechstes|sechstem|sechste)\s+semester\b/g, '6 semester'],
  [/\b(siebten|siebtes|siebtem|siebte)\s+semester\b/g, '7 semester'],
  [/\b(winfo|winf|bwin)\b/g, 'wirtschaftsinformatik'], [/\b(min|medieninfo)\b/g, 'medieninformatik'],
  [/\b(ects|credits|lp|punkte|creditpoints)\b/g, 'ects leistungspunkte'],
  [/\b(gdi)\b/g, 'grundlagen informatik'], [/\b(gmi)\b/g, 'grundlagen medieninformatik'],
  [/\b(gwi)\b/g, 'grundlagen wirtschaftsinformatik'], [/\b(ad|ads|adk)\b/g, 'algorithmen datenstrukturen'],
  [/\b(oop)\b/g, 'objektorientierte programmierung'], [/\b(pp)\b/g, 'prozedurale programmierung'],
  [/\b(ti)\b/g, 'theoretische informatik'], [/\b(db)\b/g, 'datenbanken'], [/\b(bs)\b/g, 'betriebssysteme'],
  [/\b(se)\b/g, 'software engineering'], [/\b(mci|hci)\b/g, 'mensch computer interaktion'],
  [/\b(2|zweite|zweiten|zweit)\s*(studien)?abschnitt\b/g, 'zweiter studienabschnitt uebertritt'],
  [/\b(weiterkommen|vorruecken|vorrueck|huerde)\b/g, 'uebertritt studienabschnitt'],
  [/\b(bestehen|bestehensgrenze|bestehgrenze|durchfallen|durchgefallen|grenzen)\b/g, 'bestehen pruefung note grenze'],
  [/\b(versuche|versuch|wiederholen|wiederholung|drittversuch|zweitversuch)\b/g, 'wiederholung pruefung'],
  [/\b(praxis|praktisches|praktikumssemester)\b/g, 'praxissemester praktikum'],
  [/\b(ba|bachelorthesis)\b/g, 'bachelorarbeit'], [/\b(spo)\b/g, 'spo pruefungsordnung'],
  [/\b(studienbeginn|studienstart|anfaengt|beginnt|los)\b/g, 'studienbeginn semesterbeginn'],
];
function expand(s) { let n = normalize(s); for (const [rx, replacement] of aliases) n = n.replace(rx, replacement); return n; }

export function detectPrograms(message) {
  const s = expand(message);
  const level = /\bmaster\b|\bm sc\b/.test(s) ? 'm' : 'b';
  const out = [];
  if (/wirtschaftsinformatik|\bwin\b/.test(s)) out.push(`${level}-win`);
  if (/medieninformatik/.test(s)) out.push(`${level}-min`);
  if (/\binformatik\b/.test(s) && (!out.length || /\b(und|oder|vergleich|unterschied)\b/.test(s))) out.push(`${level}-in`);
  if (!out.length && /\bmaster\b/.test(s)) return ['m-in', 'm-min', 'm-win'];
  return out;
}

// Genau ein Tippfehler bei längeren Wörtern; verhindert z.B. "studienabschnit"-Ausfälle.
function near(a, b) {
  if (Math.min(a.length, b.length) < 5 || Math.abs(a.length - b.length) > 1) return false;
  let i = 0, j = 0, edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (a.length <= b.length) j++;
    if (a.length >= b.length) i++;
  }
  return edits + (i < a.length || j < b.length ? 1 : 0) <= 1;
}
export function retrieveKnowledge(input, entries, { maxEntries = 18, maxChars = 26000 } = {}) {
  const current = expand(input.message);
  const previousQuestions = (input.history || []).filter((h) => h.role === 'user').slice(-2).map((h) => h.content).join(' ');
  const query = words(current);
  const contextWords = words(expand(previousQuestions));
  const programs = detectPrograms(input.message);
  const contextPrograms = programs.length ? programs : detectPrograms(previousQuestions);
  const index = entries.map((entry) => ({ entry, tokens: words(expand(`${entry.title} ${entry.keywords.join(' ')} ${entry.text}`)), title: expand(entry.title), keys: expand(entry.keywords.join(' ')) }));
  const freq = new Map();
  for (const row of index) for (const w of row.tokens) freq.set(w, (freq.get(w) || 0) + 1);
  const scored = index.map(({ entry, tokens, title, keys }) => {
    let score = 0;
    for (const w of query) {
      const exact = tokens.includes(w);
      const stem = !exact && w.length >= 5 && tokens.some((t) => t.startsWith(w) || w.startsWith(t) && t.length >= 5);
      const fuzzy = !exact && !stem && tokens.some((t) => near(t, w));
      if (exact || stem || fuzzy) score += Math.log(2 + entries.length / (1 + (freq.get(w) || 0))) * (exact ? 1 : stem ? .65 : .5) * (title.includes(w) ? 3 : keys.includes(w) ? 2 : 1);
    }
    // Der aktuelle Satz dominiert, der Verlauf hilft bei "und in Winfo?" und "wie viele?".
    for (const w of contextWords) if (tokens.includes(w)) score += (query.length <= 4 ? .65 : .15) * Math.log(2 + entries.length / (1 + (freq.get(w) || 0))) * (title.includes(w) ? 3 : 1);
    if (contextPrograms.length && entry.programs?.length) score *= entry.programs.some((p) => contextPrograms.includes(p)) ? 1.5 : .12;
    if (entry.category === 'rule' && /studienabschnitt|uebertritt|voraussetz|bestehen|pruefung|frist|wiederholung/.test(current)) score *= 1.3;
    if (entry.category === 'overview' && /\b(was ist|unterschied|vergleich)\b/.test(current)) score *= 2.5;
    const semester = current.match(/\b([1-7])\s+semester\b/);
    if (semester && entry.id.startsWith('semester-') && entry.id.endsWith(`-${semester[1]}`)) score *= 2;
    return { entry, score };
  }).filter((row) => row.score > 0).sort((a, b) => b.score - a.score || a.entry.id.localeCompare(b.entry.id));
  const result = [];
  let size = 0;
  // Grundlagen zur Geltung verhindern die Vermischung von ASPO/APO und Jahrgängen.
  const guard = entries.find((e) => e.id === 'regulations-scope');
  const candidates = guard ? [guard, ...scored.map((r) => r.entry)] : scored.map((r) => r.entry);
  for (const entry of candidates) {
    if (result.some((e) => e.id === entry.id)) continue;
    const length = JSON.stringify(entry).length;
    if (result.length >= maxEntries) break;
    if (size + length > maxChars) continue;
    result.push(entry); size += length;
  }
  return result;
}
