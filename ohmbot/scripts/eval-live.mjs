// Bewusst nur manuell starten: nutzt echtes Projektguthaben, keine privaten Testdaten.
import { writeFile } from 'node:fs/promises';
import { createChatHandler } from '../lib/chat-service.js';

if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'DEIN_OPENAI_API_KEY') {
  console.error('Für den freiwilligen KI-Test fehlt OPENAI_API_KEY in der lokalen .env. Der Offline-Test ist npm test.');
  process.exitCode = 1;
} else {
  console.log('KI-Prüfung: 10 feste Testfragen; höchstens 20 kostenpflichtige API-Aufrufe. Ergebnisse anschließend fachlich prüfen.');
  const chat = createChatHandler();
  const cases = [
    ['wie viele ects brauch ich fürs 2 studienabschnitt', /38/, true],
    ['Darf ich mit 38 ECTS ins Praxissemester im Bachelor Informatik?', /20/, true],
    ['Was ist Winfo?', /Wirtschaftsinformatik/i, true],
    ['Was lerne ich in OOP im Bachelor Informatik?', /Objekt|Klassen/i, true],
    ['Wie viele ECTS hat Algorithmen und Datenstrukturen im Bachelor Winfo?', /5/, true],
    ['Wie viele ECTS hat Statistik im Bachelor Medieninformatik?', /5[\s\S]*6|6[\s\S]*5/, true],
    ['Bachelor Informatik, Studienbeginn 2024: Habe ich immer vier Prüfungsversuche?', /dritt|drei|ersten Studienabschnitt|4\.|vier/i, true],
    ['Wer berät zum Master Wirtschaftsinformatik?', /abweich|widerspr|klär|klär/i, true],
    ['Erkläre Rekursion mit einem einfachen Beispiel.', /rekurs|selbst/i, false],
    ['Gib mir eine Idee für ein vegetarisches Abendessen.', /./, false],
  ];
  const results=[];
  for (const [question, expected, sourcesExpected] of cases) {
    const response=await chat(new Request('https://local-eval.invalid/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:question})}));
    const data=await response.json();
    const text=[data.message,...(data.blocks||[]).map(b=>b.text)].filter(Boolean).join('\n');
    const pass=response.ok && expected.test(text) && (sourcesExpected ? data.sources?.length>0 : data.sources?.length===0);
    results.push({question,technical_check:pass,expected_sources:sourcesExpected,http_status:response.status,response:data});
    console.log(`${pass?'OK':'PRÜFEN'}: ${question}`);
  }
  const file=new URL('../evaluation-results.json',import.meta.url);
  await writeFile(file,JSON.stringify({checked_at:new Date().toISOString(),model:process.env.OPENAI_MODEL||'gpt-4.1-mini',note:'Stichwortprüfungen sind keine fachliche Abnahme.',results},null,2)+'\n');
  console.log('Bericht: evaluation-results.json. Quellen, Einschränkungen und Formulierungen manuell gegen testfragen.md prüfen.');
  if(results.some(r=>!r.technical_check))process.exitCode=1;
}
