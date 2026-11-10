import { detectPrograms, matchesTerm, normalize, rankKnowledge, searchTerms } from './retrieval.js';

// Reine Textsuche, kein Sprachmodell. Punkte allein belegen keine passende Antwort:
// Studiengang, angefragtes Jahr und Themenwörter müssen ebenfalls passen.
const GENERIC = new Set('th nuernberg hochschule ohm bachelor master informatik medieninformatik wirtschaftsinformatik ects leistungspunkte modul module fach faecher semester studium studiengang pruefung pruefungen bitte hallo erklaere erklaeren wissen lerne lernen brauche brauch benoetige brauche ich gibt gelten gilt viel viele welche welchen fuer fuers meinem meinen zum zweiten ersten und jetzt aktuell heute ins hat haben mich sich er sie wir ihr uns mir dort dortigen'.split(' '));
const universityContext = /\b(th|ohm|hochschule|nuernberg|studium|studiengang|semester|ects|spo|aspo|modul|module|studienabschnitt|praxissemester|bachelorarbeit|masterarbeit)\b/;
const generalTask = /\b(koch\w*|rezept\w*|wetter|witz\w*|gedicht\w*|uebersetz\w*|programmier\w*|schreib\w*|implementier\w*|debug\w*)\b/;
const clarification = (text) => ({ status: 'clarification', lookup_query: '', paragraphs: [{ text, kind: 'clarification', entry_ids: [] }] });

export function offlineSelection(input, entries) {
  const current = normalize(input.message);
  const previous = (input.history || []).filter(h => h.role === 'user').at(-1)?.content || '';
  // Nur eindeutige Anschlussformen übernehmen das vorige Thema, niemals alte
  // Assistentenantworten. Eine neue allgemeine Frage erbt keine Hochschultreffer.
  const followUp = /^(und\b|wie viele\??$|wie lange\??$|was ist damit\b)/.test(current) && previous;
  const query = (followUp ? `${previous} ${input.message}` : input.message).replace(/aufgebaut/gi, 'Studienaufbau');
  if (generalTask.test(current) && !universityContext.test(current)) {
    return clarification('Allgemeine Aufgaben kann ich im Basis-Modus nicht frei beantworten. Ich kann gespeicherte Informationen zu deinem Studium an der TH Nürnberg mit Quellen anzeigen.');
  }
  const programs = detectPrograms(input.message);
  const selectedPrograms = programs.length ? programs : followUp ? detectPrograms(previous) : [];
  const topicTerms = searchTerms(query).filter(t => !GENERIC.has(t) && !/^\d+$/.test(t));
  const semesterTerms = searchTerms(query).join(' ').match(/\b([1-7]) semester\b/);
  const overview = !topicTerms.length && programs.length && /^(was ist|was sind|erklaere)\b/.test(current);
  if (!topicTerms.length && !semesterTerms && !overview) return clarification('Bitte nenne das konkrete Thema und möglichst deinen Studiengang, zum Beispiel „Praxissemester Bachelor Informatik“. Im Basis-Modus kann ich nur gespeicherte Hochschulinformationen anzeigen.');
  const years = normalize(query).match(/\b20\d{2}\b/g) || [];
  const candidates = rankKnowledge({ message: query, history: [] }, entries).filter(({ entry }) => {
    if (entry.id === 'regulations-scope') return false;
    if (selectedPrograms.length && entry.programs?.length && !entry.programs.some(p => selectedPrograms.includes(p))) return false;
    if (years.length && !years.every(year => `${entry.title} ${entry.scope} ${entry.text}`.includes(year))) return false;
    if (overview) return entry.category === 'overview' && /ueberblick|studienaufbau/.test(normalize(entry.title)) && entry.programs?.some(p => programs.includes(p));
    if (semesterTerms && !topicTerms.length) return entry.category === 'curriculum' && entry.id.endsWith(`-${semesterTerms[1]}`);
    const anchors = searchTerms(`${entry.title} ${entry.keywords.join(' ')}`);
    const matched = topicTerms.filter(term => anchors.some(anchor => matchesTerm(term, anchor)));
    return matched.length >= Math.ceil(topicTerms.length * 0.6);
  });
  if (!candidates.length) return clarification('Dazu finde ich im Basis-Modus keinen ausreichend passenden gespeicherten Eintrag. Bitte formuliere das Thema konkreter und nenne deinen Studiengang. Allgemeine Fragen und freie Erklärungen benötigen den KI-Dienst.');

  const best = candidates[0].score;
  const selected = candidates.filter(row => row.score >= best * 0.8)
    .sort((a, b) => Number(b.entry.kind === 'gap') - Number(a.entry.kind === 'gap') || b.score - a.score)
    .slice(0, 3).map(row => row.entry);
  // Regeln niemals ohne die gepflegte Einordnung der Ordnungsfassungen ausgeben.
  const guard = entries.find(e => e.id === 'regulations-scope');
  if (guard && selected.some(e => e.category === 'rule')) selected.push(guard);
  return {
    status: 'partial', lookup_query: '',
    paragraphs: selected.map(entry => ({
      text: `${entry.title}\nGeltungsbereich: ${entry.scope}\n\n${entry.text}`,
      kind: 'university', entry_ids: [entry.id],
    })),
  };
}
