import test from 'node:test';
import assert from 'node:assert/strict';
import { knowledge, getActiveKnowledge } from '../lib/knowledge.js';
import { retrieveKnowledge, detectPrograms } from '../lib/retrieval.js';
import { createChatHandler } from '../lib/chat-service.js';

const entries = getActiveKnowledge('2026-09-20');
const search = (message, history = []) => retrieveKnowledge({ message, history }, entries);
const ids = (message, history) => search(message, history).map(e => e.id);
const request = message => new Request('https://ohmbot.example/api/chat', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({message}) });
const now = () => new Date('2026-09-20');
const paragraph = (text, kind, entry_ids = []) => ({status:'answered', lookup_query:'', paragraphs:[{text,kind,entry_ids}]});

test('Screenshot-Frage, Umgangssprache und Tippfehler finden dieselbe Übergangsregel', () => {
  for (const q of ['wie viele ects brauch ich fürs 2 studienabschnitt', 'Wie viele LP für den zweiten Studienabschnit?', 'Welche Grenze gilt zum Vorrücken?', 'Reichen 37 ECTS um in Abschnitt 2 weiterzukommen?']) {
    assert.ok(ids(q).includes('second-section'), q);
  }
  const rule = entries.find(e => e.id === 'second-section');
  assert.match(rule.text, /38 ECTS aus den Fächern des ersten/);
  assert.equal(rule.references.length, 3);
});
test('Praxis und Abschlussarbeit finden eigene Zulassungsregeln', () => {
  assert.ok(ids('Darf ich mit 38 ECTS ins Praxissemester?').includes('practice-admission'));
  assert.ok(ids('Wie viele Punkte für die BA Anmeldung?').includes('thesis-admission'));
  assert.ok(ids('Wie viele Versuche habe ich?').includes('repeat-exams'));
  assert.ok(ids('Reichen immer 50 Prozent zum Bestehen?').includes('multiple-choice'));
});
test('Alle sechs Studiengänge, Modulalias und aktuelles Plansemester', () => {
  assert.deepEqual(detectPrograms('Winfo'), ['b-win']);
  assert.deepEqual(detectPrograms('Master Medieninformatik'), ['m-min']);
  assert.ok(ids('Was ist Winfo?').some(id => ['winfo-overview','faculty-overview'].includes(id)));
  assert.ok(ids('Was lerne ich in OOP?').includes('module-b-in-objektorientierte-programmierung'));
  assert.equal(ids('Welche Module im vierten Semester Medieninformatik?')[1], 'semester-min-4');
  assert.ok(ids('Welche Module im Master Wirtschaftsinformatik?').includes('master-modules-win'));
});
test('Anschlussfrage behält das Thema bei und wechselt den Studiengang', () => {
  const result = ids('Und in Winfo?', [{role:'user',content:'Wie viele ECTS hat Algorithmen und Datenstrukturen im Bachelor Informatik?'}]);
  assert.ok(result.includes('module-b-win-algorithmen-und-datenstrukturen'));
  assert.ok(result.indexOf('module-b-win-algorithmen-und-datenstrukturen') < result.indexOf('module-b-in-algorithmen-und-datenstrukturen') || !result.includes('module-b-in-algorithmen-und-datenstrukturen'));
});
test('Katalogabdeckung und dokumentierte Abweichungen bleiben erhalten', () => {
  const counts = Object.fromEntries(['b-in','b-min','b-win','m-in','m-min','m-win'].map(p => [p,entries.filter(e=>e.category==='module'&&e.programs.includes(p)).length]));
  assert.deepEqual(counts, {'b-in':84,'b-min':87,'b-win':92,'m-in':50,'m-min':51,'m-win':50});
  assert.match(entries.find(e=>e.id==='module-b-win-algorithmen-und-datenstrukturen').text, /5 ECTS/);
  assert.match(entries.find(e=>e.id==='module-b-in-algorithmen-und-datenstrukturen').text, /7 ECTS/);
  assert.ok(ids('Wie viele ECTS hat Statistik in Medieninformatik?').includes('statistics-conflict-min'));
  assert.match(entries.find(e=>e.id==='regulations-scope').text, /WS 2023\/24/);
});
test('Große Wissensdatei geht nur als begrenzter Suchauszug an das Modell', () => {
  const found=search('Erkläre alle Module ECTS Prüfungen Informatik');
  assert.ok(found.length <= 18);
  assert.ok(found.reduce((n,e)=>n+JSON.stringify(e).length,0)<=26000);
});
test('Hallo, Danke und Abschied funktionieren ohne Schlüssel und API-Kosten', async () => {
  const handler=createChatHandler({env:{},now,fetchImpl:()=>{throw Error('Kein API-Aufruf erlaubt');}});
  for(const q of ['Hallo!','Hi OhmBot','Danke','Tschüss']) {
    const r=await handler(request(q)); assert.equal(r.status,200);
    const data=await r.json(); assert.equal(data.status,'answered'); assert.ok(data.message); assert.deepEqual(data.sources,[]);
  }
});
test('Begrüßung plus Fachfrage wird nicht als bloßes Hallo abgeschnitten', async () => {
  let calls=0;
  const handler=createChatHandler({env:{},now,responder:({entries})=>{calls++;assert.ok(entries.some(e=>e.id==='second-section'));return paragraph('Mindestens 38 ECTS aus Abschnitt 1.','university',['second-section']);}});
  const data=await (await handler(request('Hallo, wie viele ECTS für den 2 Studienabschnitt?'))).json();
  assert.equal(calls,1); assert.ok(data.sources.length);
});
test('Fachfremde Fragen bekommen freie Antworten ohne TH-Belege', async () => {
  const handler=createChatHandler({env:{},now,responder:()=>paragraph('Schneide das Gemüse klein.','general')});
  const data=await (await handler(request('Wie koche ich eine Gemüsesuppe?'))).json();
  assert.equal(data.status,'answered');assert.deepEqual(data.sources,[]);assert.equal(data.blocks[0].title,'Allgemeine Antwort');
});
test('Eine alternative Suche ist erlaubt, keine unendliche API-Schleife', async () => {
  let calls=0;
  const handler=createChatHandler({env:{},now,responder:({input,entries})=>{
    calls++;
    if(calls===1)return {status:'lookup',lookup_query:'zweiter Studienabschnitt ECTS',paragraphs:[]};
    assert.equal(input.second_search,true); assert.ok(entries.some(e=>e.id==='second-section'));
    return paragraph('38 ECTS aus dem ersten Studienabschnitt.','university',['second-section']);
  }});
  assert.equal((await (await handler(request('Was brauche ich zum Weiterkommen?'))).json()).status,'answered');
  assert.equal(calls,2);
  calls=0;
  const looping=createChatHandler({env:{},now,responder:()=>{calls++;return {status:'lookup',lookup_query:'ECTS',paragraphs:[]};}});
  assert.equal((await (await looping(request('Welche ECTS-Grenze?'))).json()).status,'unknown');assert.equal(calls,2);
});
test('Quotenfehler unterscheiden Guthaben von kurzfristiger Ratenbegrenzung',async()=>{
  for(const [code,expected] of [['insufficient_quota',/API-Guthaben/],['rate_limit_exceeded',/viele Anfragen/]]){
    const handler=createChatHandler({now,env:{OPENAI_API_KEY:'test'},fetchImpl:async()=>Response.json({error:{code}},{status:429})});
    assert.match((await (await handler(request('Was ist ein Baum?'))).json()).error,expected);
  }
});
