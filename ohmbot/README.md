# OhmBot – Version 2

Studierendenprojekt für die TH Nürnberg: einfache HTML/CSS/JavaScript-Webseite, Netlify Function und OpenAI. Kein Frontend-Framework, keine Vektordatenbank und keine npm-Laufzeitpakete. Recherchestand: **20.09.2026**.

Das Update erweitert die Wissensbasis auf **518 Einträge aus 42 offiziellen Quellen**, darunter **414 Moduleinträge** für Bachelor und Master Informatik, Medieninformatik und Wirtschaftsinformatik. Gemeinsame Module werden je Studiengang separat geführt. Das ist ein umfangreicher, datierter Bestand, keine vollständige oder amtliche Hochschulauskunft.

## Was sich geändert hat

- Hochschulantworten werden passend zur Frage formuliert. Version 1 konnte nur fertige Texte auswählen.
- Lokale Suche berücksichtigt Abkürzungen, einfache Tippfehler, Studiengang und Anschlussfragen. Sie sendet höchstens 18 passende Einträge statt der gesamten Datei an die KI.
- Die KI darf bei fehlenden Treffern einmal mit anderen Suchbegriffen nachsuchen.
- „Hallo“, „Danke“ und kurze Abschiede werden direkt ohne OpenAI beantwortet. Allgemeine Fragen bekommen allgemeine KI-Antworten mit entsprechender Kennzeichnung.
- Hochschulregeln brauchen Quellenbelege. Fundstellen enthalten Abschnitt, Prüfdatum und gegebenenfalls PDF-Seite.
- Fristen, Wiederholungen und ECTS werden nach Studiengang, Jahrgang und Dokumentfassung unterschieden. Gefundene Quellenkonflikte sind ausdrücklich erfasst.

## 1. Das bestehende GitHub-/Netlify-Projekt aktualisieren

**Nicht nur die Wissensdatei austauschen:** Neue Antwortlogik und Daten gehören zusammen.

1. ZIP entpacken. Im darin enthaltenen Ordner `ohmbot` liegen `index.html`, `package.json`, `netlify.toml`, `lib/`, `data/` und `netlify/`.
2. Im bestehenden GitHub-Repository den bisherigen Projektordner öffnen. Wenn dort bereits ein Unterordner `ohmbot` liegt, dessen **Inhalt** mit diesen Dateien ersetzen. Keinen zusätzlichen Ordner `ohmbot/ohmbot` erzeugen.
3. Alle Projektdateien einschließlich `lib/retrieval.js`, `lib/answer.js`, `lib/chat-service.js`, `lib/knowledge.js` und `data/thn_knowledge.json` übernehmen. Ebenso Frontend, `scripts/`, `test/` und Konfiguration übernehmen. `.env` niemals hochladen. Im GitHub-Webeditor vor dem Commit die geänderten Dateipfade kontrollieren.
4. Änderungen auf dem mit Netlify verbundenen Branch speichern/committen. Bei aktivem automatischem Deployment startet Netlify den neuen Build. Unter **Deploys** auf **Published** warten.
5. Die aktuelle Seite `https://ohmbot.netlify.app` neu laden. „Hallo“ und danach „wie viele ects brauch ich fürs 2 studienabschnitt“ testen. Die zweite Frage soll 38 ECTS **aus dem ersten Studienabschnitt** mit Quellen nennen.

Der bereits bei Netlify hinterlegte `OPENAI_API_KEY` bleibt dort. Für dieses Update ist kein neuer Schlüssel erforderlich. Wenn ein Schlüssel offengelegt wurde, diesen separat bei OpenAI widerrufen und ersetzen.

Dieses Paket verändert die Live-Seite nicht von selbst. Erst das Übernehmen der Dateien und ein erfolgreicher Netlify-Build veröffentlichen das Update. Beim bestehenden Git-Deployment sind spätere reine Wissensänderungen ebenfalls erst **nach dem automatisch ausgelösten Deploy** live.

## 2. Lokal ausprobieren

Voraussetzung: **Node.js 24 oder neuer**. Terminal im entpackten Ordner `ohmbot` öffnen. Es ist kein `npm install` nötig.

```sh
npm run demo
```

[Lokale Seite](http://localhost:3000) öffnen. Die gelb markierte Demo testet Suche, Darstellung und Quellen mit hinterlegten Texten; sie ist keine KI und beantwortet allgemeine Fragen nicht frei. Beenden mit Strg+C. Anderer Port: `npm run demo -- --port=3001`.

Mit echter KI:

1. `.env.example` nach `.env` kopieren, etwa in PowerShell mit `Copy-Item .env.example .env`.
2. `.env` im Editor öffnen und `OPENAI_API_KEY=DEIN_OPENAI_API_KEY` durch euren echten Schlüssel ersetzen. Schlüssel ausschließlich dort eintragen, nie im Browsercode.
3. `OPENAI_MODEL=gpt-4.1-mini` beibehalten oder ein kompatibles Modell wählen.
4. Demo beenden und `npm start` ausführen. [localhost:3000](http://localhost:3000) öffnen.

Die API-Nutzung benötigt ein freigeschaltetes API-Projekt mit Kontingent. Änderungen an `.env`, Backend oder Daten werden nach einem Serverneustart wirksam. Die HTML-Datei nicht per Doppelklick starten, da dann der Server fehlt.

## 3. Tests und Build

```sh
npm test
npm run build
```

Die Offline-Tests prüfen Eingaben, Suchtreffer, Kontext, Quellenreferenzen, Kontingentfehler und API-Vertrag ohne echte KI-Kosten. Der Build validiert die JSON-Datei und kopiert ausschließlich sieben öffentliche Dateien nach `dist/`. API-Schlüssel, Wissensdatei und Servercode werden nicht als statische Dateien veröffentlicht.

Die Qualität echter KI-Formulierungen zusätzlich mit `testfragen.md` prüfen. Dafür gibt es einen **freiwilligen, kostenpflichtigen** Test:

```sh
npm run eval:live
```

Er nutzt die lokale `.env`, stellt zehn feste Fragen und kann durch Nachsuchen bis zu 20 API-Aufrufe auslösen. Der Bericht `evaluation-results.json` bleibt von Git ausgeschlossen. Stichwortchecks ersetzen keine fachliche Prüfung der Antworten. Dieser Test wurde bei der Erstellung ohne verfügbaren Projekt-Key nicht ausgeführt.

Optional: `npm run dev:netlify` startet Netlify Dev auf [localhost:8888](http://localhost:8888). Dafür wird beim ersten Start die offizielle Netlify CLI aus npm benötigt. Der lokale Hilfsserver auf Port 3000 muss dafür frei sein. Plattform-Ratenlimits nach dem echten Deploy separat prüfen.

## 4. Netlify neu einrichten

Bei Netlify **Add new project → Import an existing project**, dann GitHub und das Repository wählen. Die Einstellungen aus `netlify.toml` werden verwendet:

| Einstellung | Wenn Projekt im Repository-Hauptordner | Wenn Projekt im Unterordner `ohmbot` |
|---|---|---|
| Base directory | leer | `ohmbot` |
| Package directory | leer | leer |
| Build command | `npm run build` | `npm run build` |
| Publish directory, relativ zur Base | `dist` | `dist` |
| Functions directory, relativ zur Base | `netlify/functions` | `netlify/functions` |
| Node-Version | `24` | `24` |

Netlify kann den Base-Pfad als festen Präfix anzeigen, beispielsweise `ohmbot/dist`. Diesen angezeigten Präfix nicht noch einmal eintippen.

In **Project configuration → Environment variables**:

| Key (Variablenname) | Value (Inhalt) |
|---|---|
| `OPENAI_API_KEY` | euer geheimer API-Schlüssel |
| `OPENAI_MODEL` | `gpt-4.1-mini` |
| `CHAT_DISABLED` | `false` |

Der Schlüssel gehört in **Value**, der Name `OPENAI_API_KEY` in **Key**. Der Production-Kontext und der Functions-Scope müssen abgedeckt sein. „All scopes“ deckt Functions ebenfalls ab. Wenn verfügbar, „Contains secret values“ aktivieren. Eine Umgebungsvariable wird nicht allein durch diese Checkbox vor dem Frontend geschützt: Entscheidend ist, dass ausschließlich die Serverfunktion sie liest und kein Build sie in öffentliche Dateien schreibt.

Nach Variablenänderungen unter **Deploys → Trigger deploy → Deploy project** neu bauen. Das Deploy-Log muss die Function `chat` enthalten. Nur `dist` per Netlify Drop hochzuladen genügt nicht für den Chat-Server. Die Variante mit Git oder `npx netlify-cli deploy --build --prod` veröffentlicht auch Functions.

## 5. Architektur

```text
Browser → POST /api/chat → Netlify Function
  → Eingaben, Origin und Not-Aus prüfen
  → reine Begrüßung? direkt lokal beantworten
  → gültige JSON-Einträge lokal suchen (max. 18 / 26.000 Zeichen)
  → OpenAI formuliert Antwort mit Eintrags-IDs
  → optional einmal mit präziseren Suchbegriffen nachsuchen
  → IDs prüfen und offizielle Quellenlinks serverseitig zuordnen
  → Text und Quellen im Browser anzeigen
```

Das ist eine einfache Suche mit Wissenskontext, ohne Embeddings oder Vektordatenbank. `lib/retrieval.js` ist der spätere Austauschpunkt für eine leistungsfähigere Suchschicht.

| Datei | Aufgabe |
|---|---|
| `index.html`, `style.css`, `script.js` | Oberfläche, Verlauf und Quellenanzeige |
| `netlify/functions/chat.js` | öffentlich erreichbare Serverfunktion und Ratenregel |
| `lib/chat-service.js` | Anfrageprüfung, KI-Aufruf, Antwort- und Quellenprüfung |
| `lib/retrieval.js` | lokale Suche, Abkürzungen und Gesprächskontext |
| `lib/answer.js` | Antwortanweisungen, JSON-Schema und Begrüßungen |
| `lib/knowledge.js` | Wissensdatei laden und validieren, Aktualität prüfen |
| `data/thn_knowledge.json` | redaktionell gepflegter Wissensbestand |
| `WISSENSBASIS.md`, `MODULKATALOG.md` | Abdeckung, Konflikte und prüfbarer Modulindex |
| `scripts/`, `test/` | Entwicklung, Build und Prüfungen |

Anders als Version 1 erzeugt Version 2 eigene Formulierungen. **Gültige Quellen-IDs beweisen nicht automatisch, dass jede Aussage korrekt aus der Quelle abgeleitet wurde.** Die Anweisungen begrenzen Hochschulantworten auf Belege; Fehler bleiben möglich. Die Benutzeroberfläche macht das sichtbar. Eine echte fachliche Abnahme ist vor breitem Einsatz erforderlich.

## 6. Wissen manuell erweitern

`data/thn_knowledge.json` enthält `sources` und `entries`. Eine Quelle benötigt `id`, `title`, einen offiziellen TH-HTTPS-Link und `checked_at`. Ein Eintrag zum Beispiel:

```json
{
  "id": "mein-neues-thema",
  "title": "Präzise Bezeichnung des Themas",
  "scope": "Bachelor Informatik, Studienbeginn ab WS 2021/22",
  "programs": ["b-in"],
  "category": "rule",
  "keywords": ["Suchbegriff", "gängige Abkürzung"],
  "text": "Hier ausschließlich selbst geprüfte Inhalte der genannten Quelle eintragen.",
  "kind": "fact",
  "source_ids": ["spo-in"],
  "references": [{"source_id": "spo-in", "locator": "Tatsächlich geprüfter Paragraph", "page": 3}],
  "review_by": "2026-12-31"
}
```

Das Beispiel zeigt das Format, keinen fertigen Wissensinhalt. Studiengänge: `b-in`, `b-min`, `b-win`, `m-in`, `m-min`, `m-win`. Allgemeine Hochschulinfos können `programs: []` verwenden. `kind: "gap"` bezeichnet dokumentierte Lücken oder Konflikte. `page` ist die **PDF-Seitennummer**, die von der gedruckten Seitenzahl abweichen kann.

Vorgehen: Originalquelle lesen → Geltung prüfen → kurze Fakten mit Fundstelle erfassen → sinnvolle Suchbegriffe ergänzen → Tests/Build → echte Fragen ausprobieren → GitHub-Commit. Ein bloßer Link macht dessen gesamten Inhalt nicht automatisch verfügbar.

`keywords` werden in Version 2 auch im Livebetrieb für die Suche genutzt. `review_by` ist eine redaktionelle Wiedervorlage, keine Hochschulfrist: abgelaufene Einträge werden ausgeschlossen. Nach Quellenprüfung aktualisieren, nie nur blind das Datum verlängern. Keine automatische Internetrecherche im laufenden Chat. Maximal 3.000 Zeichen pro Eintrag und 2 Millionen Zeichen in der Gesamtdatei; der Suchkontext ist unabhängig davon begrenzt.

## 7. Kosten und Betrieb

Standardmodell ist `gpt-4.1-mini`. Es lässt sich per `OPENAI_MODEL` ändern; das Ersatzmodell muss Responses API und das verwendete strukturierte Ausgabeformat unterstützen.

Eine normale Frage verursacht einen API-Aufruf, bei einer Nachsuche höchstens zwei. Reine Begrüßungen benötigen keinen. Die API berechnet die verarbeitete Textmenge: Anweisungen, passende Wissenseinträge, Frage, bis zu sechs Verlaufsnachrichten und Antwort. Jede Antwort ist auf 1.600 Ausgabetokens begrenzt. Allgemeine Fragen kosten ebenfalls API-Nutzung. Netlify kann eigene Hosting-/Funktionskosten haben.

Das API-Guthaben ist vom ChatGPT-Abo getrennt. Über [API-Nutzung](https://platform.openai.com/usage) den tatsächlichen Verbrauch beobachten. Die konfigurierte Netlify-Ratenregel ist 12 Anfragen pro Minute und IP/Domain; sie ist kein globales Kostenlimit. Gemeinsame Hochschulnetze können eine IP teilen. Der Origin-Check ist kein Login und hält direkte Skriptanfragen nicht auf. `CHAT_DISABLED=true` plus neuer Deploy pausiert den Chat.

## 8. Einbettung als iframe oder Chat-Widget

```html
<iframe src="https://ohmbot.netlify.app/?embed=1"
  title="OhmBot" width="100%" height="720"
  loading="lazy" referrerpolicy="no-referrer"></iframe>
```

`?embed=1` blendet die Seitenleiste aus. `embed-example.html`, `embed-example.css` und `embed-example.js` zeigen außerdem ein aufklappbares Widget unten rechts. Die Widget-Elemente und Dateien in die Gastseite übernehmen; dort beim iframe `data-src="./?embed=1"` durch die vollständige OhmBot-Adresse ersetzen. Das iframe lädt erst beim ersten Öffnen.

Die API bleibt auf der OhmBot-Domain, offene CORS-Freigaben sind nicht nötig. Die Content-Security-Policy in `netlify.toml` erlaubt zunächst HTTPS-Gastseiten. Für eine feste Integration `frame-ancestors` auf die konkret erlaubten Domains begrenzen. Die Gastseite muss die OhmBot-Domain in ihrem `frame-src` erlauben.

## 9. Häufige Fehler

| Meldung/Symptom | Nächster Schritt |
|---|---|
| 404 auf der Startseite | Base-/Publish-Verzeichnis und `dist/index.html` im Build prüfen |
| 404 bei `/api/chat` | vollständiges Projekt mit Function deployen |
| Noch nicht eingerichtet | Variablenname/Wert bei Netlify prüfen und neu deployen |
| Nicht korrekt freigeschaltet | Schlüssel, Rechte und zugehöriges API-Projekt prüfen |
| API-Guthaben/Nutzungslimit reicht nicht | API-Abrechnung und Projektkontingent prüfen |
| Zu viele Anfragen | kurz warten; API-/Netlify-Ratenlimit prüfen |
| Wissen vorhanden, trotzdem keine passende Antwort | Suchbegriffe, Studiengang, `review_by` und echte Antwort mit `testfragen.md` prüfen |
| Nur alte Antworten | GitHub-Dateien, letzten erfolgreichen Deploy und Browser-Neuladen kontrollieren |
| iframe blockiert | Sicherheitsrichtlinien von Gastseite und OhmBot prüfen |

Anbieterfehler und Schlüssel werden nicht an den Browser gespiegelt. Der Verlauf bleibt im Speicher des Tabs. `store:false` wird an OpenAI gesetzt; dies ist keine Zusage über sämtliche anbieterseitigen Aufbewahrungsregeln.

## 10. Zusammenarbeit und Prüfumfang

Für fünf Personen bieten sich Oberfläche, Backend, Wissensredaktion, Tests und Betrieb als Arbeitsbereiche an. Prüfungsregeln und Fristen im Vier-Augen-Prinzip abnehmen. Testfragen bei jeder Wissensänderung mitpflegen.

Prüfstand der Lieferung: 34 Offline-Tests bestanden, lokaler Build erfolgreich und Netlify-Offline-Build einschließlich Verpackung der Function erfolgreich. Desktop-, Smartphone- und Widget-Darstellung wurden lokal geprüft; alle 42 Quellenlinks waren erreichbar. Die lokale Demo prüft die Darstellung und Suche, nicht die Qualität echter Modellantworten. Ein realer Modelltest und die Veröffentlichung wurden nicht ausgeführt. Fachliche Abdeckung und bekannte Lücken stehen in `WISSENSBASIS.md`.

Technische Referenzen: [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs), [Netlify Functions](https://docs.netlify.com/build/functions/overview/), [Function-Umgebungsvariablen](https://docs.netlify.com/build/functions/environment-variables/).
