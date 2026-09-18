# OhmBot

Ein kleiner, quellenbasierter Studierenden-Chatbot für ein IT-Projekt an der **TH Nürnberg Georg Simon Ohm**. HTML, CSS und JavaScript im Browser, eine Netlify Function auf dem Server und die OpenAI Responses API. Kein Framework, keine Datenbank, kein RAG-System, keine notwendigen npm-Laufzeitpakete.

Die Gestaltung greift Rot, Weiß und eine klare Hochschul-Typografie auf. OhmBot ist sichtbar als **Studierendenprojekt** gekennzeichnet. Das Symbol ist ein eigenes Chat-Symbol, kein offizielles Hochschullogo.

## 1. Schnellstart ohne API-Key

Voraussetzung: **Node.js 24 oder neuer** mit npm. Prüfen mit `node --version`. Das Projekt vollständig entpacken und ein Terminal im Ordner `ohmbot` öffnen (dort liegt diese README).

```sh
npm run demo
```

Dann **http://localhost:3000** öffnen. Beenden mit `Strg+C` im Terminal.

Diese ausdrücklich gekennzeichnete **lokale Demo** wählt Wissenseinträge über Stichwörter aus. Sie dient zum Prüfen der Oberfläche, Quellenanzeige und Einbettung, ist keine KI und bewertet keine komplexen Anschlussfragen. Sie benötigt weder Schlüssel noch Internet und verursacht keine API-Kosten. Der Demo-Code ist nur im lokalen Entwicklungsserver; auf Netlify gibt es keinen automatischen Demo-Fallback.

Einbettungsbeispiel: **http://localhost:3000/embed-example.html**.

## 2. Lokal mit OpenAI testen

1. Einen API-Key im eigenen [OpenAI API-Projekt](https://platform.openai.com/api-keys) erstellen. Das Projekt muss API-Zugang und verfügbares Kontingent haben.
2. `.env.example` im Projektordner nach `.env` kopieren:

   **PowerShell / Windows:**

   ```powershell
   Copy-Item .env.example .env
   ```

   **macOS / Linux:**

   ```sh
   cp .env.example .env
   ```

3. `.env` in einem Texteditor öffnen und den Platzhalter ersetzen:

   ```dotenv
   OPENAI_API_KEY=DEIN_ECHTER_SCHLUESSEL
   OPENAI_MODEL=gpt-4.1-mini
   CHAT_DISABLED=false
   ```

4. Eine gegebenenfalls laufende Demo mit `Strg+C` beenden. Danach:

   ```sh
   npm start
   ```

5. **http://localhost:3000** öffnen. Jetzt werden Fragen tatsächlich durch OpenAI ausgewertet; der gelbe Demo-Hinweis verschwindet. Zum Beispiel: „Wie ist der Bachelor Informatik aufgebaut?“

Der lokale Server führt dieselbe Chat-Logik wie die Netlify Function aus. Er ist nur an die lokale Loopback-Adresse gebunden. **Kein `npm install` erforderlich.** `.env` wird von Node beim Start geladen; nach Änderungen den Server neu starten. Die HTML-Datei nicht per Doppelklick öffnen: Dafür fehlt der API-Server.

Schlüssel ausschließlich in `.env` beziehungsweise in Netlifys Umgebungsvariablen hinterlegen. `.env` ist von Git ausgeschlossen. Niemals Schlüssel in HTML, `script.js`, `netlify.toml`, Screenshots oder Chatnachrichten eintragen.

### Technische Prüfungen

```sh
npm test
npm run build
```

Die automatisierten Tests verwenden simulierte OpenAI-Antworten, benötigen keinen Key und kosten nichts. Der Build prüft die Wissensbasis und kopiert ausschließlich erlaubte Frontend-Dateien nach `dist/`. Der Ordner enthält **keinen API-Key, keine Serverdateien und keine Wissensdatei**.

Für einen zusätzlichen lokalen Test mit Netlifys eigener Umgebung:

```sh
npm run dev:netlify
```

Dabei lädt `npx` die offizielle `netlify-cli` aus npm; beim ersten Mal ist Internet nötig. Vorher andere Server auf Port 3000 beenden. Öffne danach **http://localhost:8888**. Netlify Dev verarbeitet `/api/chat`; der Hilfsserver liefert nur die Webseite aus. Die Plattform-Ratenbegrenzung wird erst nach einem Netlify-Deploy wirksam und muss dort geprüft werden.

## 3. Auf Netlify veröffentlichen

### Empfohlen: Git-Repository verbinden

1. Auf GitHub, GitLab oder Bitbucket ein Repository anlegen.
2. Den **Inhalt des Ordners `ohmbot`** als Repository-Inhalt hochladen. `package.json` und `netlify.toml` müssen im Repository-Hauptverzeichnis liegen. Auch `.env.example` und `.gitignore` übernehmen, **aber niemals `.env`**. `dist/` muss nicht hochgeladen werden.
3. Bei Netlify anmelden und **Add new project → Import an existing project** wählen. Git-Anbieter und Repository auswählen. Bezeichnungen können sich in der Oberfläche ändern.
4. Build-Einstellungen kontrollieren:

   | Einstellung | Wert |
   |---|---|
   | Base directory | leer, wenn OhmBot im Repository-Hauptverzeichnis liegt |
   | Build command | `npm run build` |
   | Publish directory | `dist` |
   | Functions directory | `netlify/functions` (steht bereits in `netlify.toml`) |
   | Node-Version | `24` (steht bereits in `netlify.toml`) |

   Falls das Repository einen übergeordneten Ordner enthält, als Base directory stattdessen `ohmbot` auswählen.

5. In **Project configuration → Environment variables** die Variablen anlegen:

   | Name | Wert | Zweck |
   |---|---|---|
   | `OPENAI_API_KEY` | eigener API-Key | geheimer Serverzugang |
   | `OPENAI_MODEL` | `gpt-4.1-mini` | austauschbares Modell |
   | `CHAT_DISABLED` | `false` | bei `true` werden Anfragen pausiert |

   Falls Netlify Scopes anbietet, muss **Functions** enthalten sein. Für den Livebetrieb den Production-Kontext wählen; für Deploy Previews bei Bedarf separat setzen. Den API-Key als Secret markieren, wenn diese Option verfügbar ist.

6. **Deploy** starten. Wenn die Seite schon gebaut wurde: nach dem Eintragen/Ändern von Variablen einen neuen Deploy auslösen. Netlifys offizielle Hinweise zu [Function-Umgebungsvariablen](https://docs.netlify.com/build/functions/environment-variables/) erklären die Laufzeit-Verfügbarkeit.
7. Im Deploy-Log kontrollieren, dass `chat` als Function verpackt wurde. Die Netlify-Adresse öffnen und mindestens eine Frage, eine unbekannte Frage und eine Quellenverknüpfung prüfen.
8. Im Post-processing-Abschnitt des Deploy-Logs nach der bestätigten Ratenregel für **beide** Pfade `/api/chat` und `/.netlify/functions/chat` suchen. Netlify kann ungültige Ratenregeln melden, ohne den Deploy abzubrechen. Siehe [Rate limiting](https://docs.netlify.com/manage/security/secure-access-to-sites/rate-limiting/).

**Nicht nur `dist` per Netlify Drop hochziehen.** Ein reiner statischer Upload stellt das Backend nicht bereit. Veröffentlicht werden müssen Frontend **und** Function über den Git-Build oder die CLI.

### Alternative: Netlify CLI

Im vollständigen Projektordner:

```sh
npx netlify-cli login
npx netlify-cli init
```

Das gewünschte Netlify-Projekt auswählen oder anlegen. Den Schlüssel anschließend über die Netlify-Weboberfläche hinterlegen; so landet er nicht im Shell-Verlauf. Danach:

```sh
npx netlify-cli deploy --build --prod
```

Den erzeugten Deploy genauso prüfen wie oben. Git-basierte Folgeänderungen lassen sich später automatisch veröffentlichen.

## 4. Architektur und Antwortprinzip

```text
Browser: index.html + style.css + script.js
  │ POST /api/chat  { message, history }
  ▼
netlify/functions/chat.js
  └─ lib/chat-service.js
      ├─ Eingabe/Origin prüfen, Größe begrenzen
      ├─ lib/knowledge.js → data/thn_knowledge.json
      ├─ nur noch frische Wissenseinträge auswählen
      ├─ OpenAI Responses API → Status + maximal 4 Eintrags-IDs
      └─ geprüfte Texte + serverseitig zugeordnete Quellen ausgeben
```

Die KI formuliert in Version 1 **keine neuen Hochschulfakten**. Sie erkennt die Frage und wählt passende Wissenseinträge. Der Server übernimmt ausschließlich die redaktionell hinterlegten Texte und zugehörigen TH-Links. Freitext, erfundene URLs und unbekannte IDs aus einer Modellantwort werden nicht übernommen. Das ist bewusst etwas weniger flexibel als ein frei formulierender Chatbot, bietet aber einen einfachen, nachvollziehbaren Ausgangspunkt.

Die Auswahl kann trotzdem falsch liegen, etwa bei mehrdeutigen Fragen. Eine Quellenangabe ist kein Beweis, dass ein Eintrag zur persönlichen Situation passt. Deshalb nennen die Texte Studiengang, Semester und Quellenstand; unbekannte Angaben werden als Lücke behandelt. Ein Modellwechsel muss mit `testfragen.md` geprüft werden.

- Der Browser merkt sich den sichtbaren Verlauf nur im Tab-Arbeitsspeicher. Neuladen oder „Neuer Chat“ löscht ihn.
- Für Anschlussfragen gehen höchstens sechs vorherige Nachrichten und die neue Frage an den Server und an OpenAI.
- OpenAI erhält die aktive, kleine Wissensbasis als Kontext. Es gibt keinen Webzugriff, keinen automatischen Abruf der Quellen und keine Vektordatenbank.
- Die API-Anfrage verwendet `store: false`. Das ist keine Zusage einer vollständigen Löschung aller Anbieterdaten oder von Infrastruktur-Logs.
- Die Anwendung selbst speichert keine Chats auf dem Server und protokolliert keine Frageinhalte. Netlify/OpenAI können eigene Betriebsdaten verarbeiten. Vor einem offiziellen Hochschulbetrieb sind passende Betreiber-/Datenschutzhinweise und die institutionelle Freigabe zu ergänzen.
- Keine externen Schriften, Analyse-Skripte, Cookies oder Browser-Speicher für Chatverläufe.

### Projektdateien

```text
ohmbot/
├── index.html, style.css, script.js, favicon.svg
├── netlify.toml
├── netlify/functions/chat.js        # Netlify-Einstieg + Plattformlimit
├── lib/chat-service.js              # Validierung, API, sichere Antwortausgabe
├── lib/knowledge.js                 # Laden, Prüfen, Aktualität
├── data/thn_knowledge.json          # redaktionelle Inhalte und Quellen
├── scripts/build.mjs                # nur öffentliche Dateien nach dist
├── scripts/dev.mjs                  # lokaler Server + sichtbare Demo
├── test/chat.test.js                # automatisierte Tests, kein API-Zugriff
├── embed-example.html/.css/.js      # iframe und aufklappbares Widget
├── package.json
├── .env.example, .gitignore
├── README.md, testfragen.md
└── dist/                           # automatisch erzeugt
```

## 5. Wissen pflegen und erweitern

Die Startbasis umfasst 17 Einträge mit sieben offiziellen Quellen, geprüft am **18.09.2026**: Hochschulname, Informatik-Studienaufbau, Praxissemester, ausgewählte Semestertermine und Prüfungsfristen sowie Anlaufstellen. SPO, Studienplan und Modulhandbuch sind als **Dokumentenwegweiser** enthalten, nicht als vollständig ausgewertete Regelwerke.

Bei der Bachelorarbeit ist bewusst eine Wissenslücke hinterlegt: Die Informatik-Studiengangsseite enthielt im entsprechenden Abschnitt einen Verweis auf Medieninformatik. Bearbeitungsfristen oder Zulassungsvoraussetzungen wurden daraus nicht ungeprüft übernommen. Ebenso werden unbekannte Rückmeldefristen nicht geschätzt.

In `data/thn_knowledge.json`:

- `sources`: eindeutige ID, Titel, offizieller HTTPS-Link, `checked_at` (tatsächliches Prüfdatum).
- `entries`: eindeutige ID, Titel, `scope` (Geltungsbereich), kurze vollständige Antwort in `text`, `source_ids`, `review_by`, `kind` (`fact` oder `gap`).
- `keywords`: nur für die lokale Demo. Die KI versteht die Texte ohne Stichwortsuche.
- `review_by`: redaktionelle Wiedervorlage, **keine amtliche Gültigkeit oder Frist**. Nach diesem Datum wird der Eintrag automatisch ausgeschlossen. Es gibt keinen automatischen Aktualisierungsdienst. Abgelaufene Inhalte nach Sichtprüfung aktualisieren und neu deployen; niemals bloß das Datum weiterstellen.

Vorgehen für neue Inhalte:

1. Offizielle Quelle öffnen und Datum, Studiengang sowie geltende SPO-Fassung prüfen.
2. Quelle eintragen oder vorhandene Quellen-ID wiederverwenden.
3. Einen kurzen Wissenseintrag ergänzen. Zahlen und Fristen immer mit Semester beziehungsweise Jahr nennen. `scope` ergänzt die Auswahl, ersetzt aber keine sichtbare Einordnung im Antworttext.
4. Bei Fristen eine nahe Wiedervorlage wählen. Regeln für unterschiedliche Studienanfänger-Jahrgänge getrennt erfassen.
5. `npm test` und `npm run build` ausführen; danach die zugehörigen Fragen aus `testfragen.md` mit echtem Modell prüfen.
6. Änderungen im Vier-Augen-Prinzip freigeben und neu veröffentlichen.

Die JSON-Datei verwendet ISO-Daten (`YYYY-MM-DD`) und darf keine Kommentare enthalten. Der Build lehnt fehlende Quellen, doppelte IDs, nicht offizielle Links, zu lange Einträge und eine über 80.000 Zeichen gewachsene Gesamtdatei ab. Damit wächst die API-Eingabe nicht unbemerkt unbegrenzt.

**Späteres RAG:** `getActiveKnowledge()` ist der Austauschpunkt für eine Suchschicht. Sie kann später passende Abschnitte aus PDFs oder einer Such-/Vektordatenbank liefern. Quellen-IDs, Geltungsbereich, Aktualität, Antwortprüfung und die Frontend-Schnittstelle beibehalten. Dafür ist jetzt kein Architekturwechsel im Browser nötig.

## 6. Kosten und Betrieb

Standard ist [GPT-4.1 mini](https://developers.openai.com/api/docs/models/gpt-4.1-mini), ein kleines Modell mit Unterstützung für strukturierte Ausgaben. Wechsel über `OPENAI_MODEL`; das Ersatzmodell muss Responses API und das verwendete JSON-Schema unterstützen. Ein Account kann andere Modellfreigaben haben.

Pro Frage gibt es genau einen API-Aufruf, keine automatischen kostenpflichtigen Wiederholungen, höchstens 350 Ausgabetokens, maximal 1500 Zeichen pro Nachricht und einen kurzen Verlauf. Der Netlify-Endpunkt begrenzt Anfragen pro IP und Domain auf 12 pro Minute. Mehrere Studierende im selben Hochschulnetz können dieselbe öffentliche IP teilen; die Grenze bei Bedarf bewusst anpassen.

**Ratenbegrenzung ist kein globales Kostenlimit und keine Anmeldung.** Der Origin-Check verhindert gewöhnliche fremde Browseraufrufe, aber keine direkten Anfragen aus Skripten. Projektverbrauch bei OpenAI und Netlify beobachten und Benachrichtigungen/Budgets konfigurieren; Alarmgrenzen nicht ungeprüft als harte Ausgabensperren betrachten. Für den späteren breiten Betrieb kann eine Anmeldung oder Bot-Schutz ergänzt werden. `CHAT_DISABLED=true` und ein neuer Deploy pausieren die Anwendung; bei einem kompromittierten Schlüssel diesen bei OpenAI widerrufen.

## 7. Einbetten in eine andere Website

Die API bleibt auf der OhmBot-Domain. Das eingebettete Dokument ruft sie unter seiner eigenen Origin auf; dafür sind **keine offenen CORS-Freigaben** nötig.

### Variante A: iframe im Seiteninhalt

```html
<iframe
  src="https://DEINE-SITE.netlify.app/?embed=1"
  title="OhmBot – Fragen zum Studium an der TH Nürnberg"
  width="100%"
  height="720"
  loading="lazy"
  referrerpolicy="no-referrer">
</iframe>
```

`DEINE-SITE` durch eure echte Netlify-Domain ersetzen. `?embed=1` blendet die Seitenleiste aus und passt die Ansicht an kleine Einbettungen an. Höhe und Rahmen können im CSS der Gast-Website geändert werden. Das iframe benötigt JavaScript; kein `sandbox` ohne die dafür nötigen Freigaben setzen.

### Variante B: aufklappbares Chat-Widget

`embed-example.html` enthält ein funktionierendes Beispiel mit Schaltfläche unten rechts, verzögert geladenem iframe und auf-/zuklappbarem Panel. Zur Integration die Widget-Elemente, die zugehörigen `.widget-*`-CSS-Regeln und `embed-example.js` in die Gast-Website übernehmen. Im `data-src` des Widget-iframes `./?embed=1` durch eure vollständige Netlify-URL ersetzen. Für die direkt eingebettete Variante zusätzlich das normale `src` anpassen. Bei einer fremden Host-Website die CSS-/JS-Dateien dort mit ausliefern.

Netlifys `Content-Security-Policy` erlaubt im Prototyp Einbettung durch HTTPS-Seiten und lokale Testseiten. Für die spätere Hochschule im Wert `frame-ancestors` nur `'self'` und die **genauen** erlaubten Website-Origins eintragen, beispielsweise:

```text
frame-ancestors 'self' https://www.th-nuernberg.de
```

Auch die Gast-Website muss eure Netlify-Domain in ihrem eigenen `frame-src` erlauben. Kein zusätzliches `X-Frame-Options: DENY` oder `SAMEORIGIN` setzen, wenn fremde Origins einbetten sollen.

## 8. Fehler finden

| Symptom | Prüfen |
|---|---|
| „noch nicht eingerichtet“ | `.env` lokal oder Netlify-Variable setzen; Server neu starten/neuen Deploy auslösen |
| „nicht korrekt freigeschaltet“ | API-Key, Berechtigungen und OpenAI-Projekt kontrollieren |
| KI-Dienst ausgelastet/Kontingent erschöpft | OpenAI-Kontingent und Projektverbrauch prüfen; keine Endlosschleife starten |
| 404 unter `/api/chat` | vollständiges Projekt inklusive Function deployen; nicht nur statische Dateien hochladen |
| Zu viele Anfragen | eine Minute warten; Netlify-Ratenregel und gemeinsam genutzte IP beachten |
| Nur noch unbekannte Antworten | `review_by` prüfen; Wissen nach Quellenprüfung aktualisieren |
| Nach neuem Schlüssel weiter Fehler | neuer Deploy; korrekter Functions-Scope und Deploy-Kontext |
| iframe leer/blockiert | `frame-ancestors` bei OhmBot und `frame-src` auf der Gast-Website prüfen |
| Lokal Port belegt | alten Server mit `Strg+C` beenden oder `npm start -- --port=3001` verwenden |

Die App gibt keine internen Anbieterfehler oder Schlüssel an den Browser zurück. Beim Debuggen nur Statuscodes und anonymisierte technische Daten protokollieren.

## 9. Zusammenarbeit zu fünft

Mögliche Aufteilung: (1) Oberfläche/Barrierefreiheit, (2) Backend/API, (3) Wissensredaktion, (4) Tests/Qualität, (5) Netlify/Integration/Dokumentation. Kleine Änderungen über Pull Requests teilen; Inhaltsänderungen insbesondere bei Fristen und Prüfungsregeln von einer zweiten Person prüfen lassen. Keine gemeinsamen Schlüssel in Git oder Messenger versenden.

## 10. Prüfstand dieser Lieferung

23 automatisierte Tests und der statische Build wurden lokal erfolgreich ausgeführt. Auch `npx netlify-cli build --offline` mit vollständiger Function-Verpackung war erfolgreich. Zusätzlich wurden Desktop-/Mobilansicht, Schnellfragen, Quellenanzeige, neuer Chat, API-Fehlermeldung und das iframe-/Widget-Beispiel im Browser geprüft. Echte OpenAI-Aufrufe und ein Live-Deploy benötigen euren API-Key beziehungsweise euren Netlify-Zugang und sind nicht Teil der kostenfreien Offline-Prüfung. Die fachliche Modell-Auswahl mit dem eigenen Key anhand von `testfragen.md` abnehmen.

Technische Referenzen: [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs), [Netlify Functions](https://docs.netlify.com/build/functions/overview/), [Function-Konfiguration](https://docs.netlify.com/build/functions/configuration/). Hochschulquellen sind direkt in der Wissensdatei dokumentiert und erscheinen an den jeweiligen Antworten.
