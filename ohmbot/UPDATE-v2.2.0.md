# OhmBot v2.2.0 – Neues Design

Dieses Paket enthält das neue Design und den automatischen Basis-Modus aus Version 2.1.0.

## Übernehmen

1. ZIP entpacken.
2. Im geklonten Repository einen Branch `design-v2.2.0` erstellen.
3. Den **Inhalt** des entpackten Ordners `ohmbot` in den vorhandenen Projektordner `ohmbot` kopieren. Dateien ersetzen, keinen weiteren Unterordner `ohmbot/ohmbot` anlegen.
4. Geänderte Dateien prüfen, committen und den Branch pushen. Keine echte `.env` hochladen; `.env.example` ist nur eine Vorlage.
5. Pull Request nach `main` erstellen. Nach dem Merge veröffentlicht das verbundene Netlify-Projekt bei aktivem automatischem Deployment den neuen Stand.
6. Unter Netlify → Deploys auf `Published` warten und die Website neu laden.

API-Schlüssel und Netlify-Einstellungen müssen für dieses Update nicht geändert werden. Dieses ZIP veröffentlicht sich nicht selbst.

## Was zum Design gehört

`index.html`, `style.css`, `script.js`, `favicon.svg` sowie `embed-example.html`, `embed-example.css` und `embed-example.js`. Versionsangabe und Dokumentation stehen in `package.json`, `README.md` und `CHANGELOG.md`.

Das Design benötigt keine zusätzlichen Pakete oder externen Bilder. Lokal mit Node.js 24 oder neuer im Projektordner `npm run demo` starten und `http://localhost:3000` öffnen. Die Demo arbeitet ohne API-Key und ohne kostenpflichtige KI-Aufrufe.

## Release auf GitHub

Tag: `v2.2.0`

Titel: **OhmBot v2.2.0 – Neues Design im Ohm-Stil**

Beschreibung:

OhmBot erhält eine neue Oberfläche mit Ohm-Rot, klarer Typografie und einem eigenen Roboter-Maskottchen. Die Startseite führt mit vier Themenkarten in den Chat. Antworten, Geltungsbereiche und Quellen sind übersichtlicher dargestellt; lange Antworten öffnen sich an ihrem Anfang.

- Dezentes Schweben und Blinzeln des Roboters; Unterstützung für reduzierte Bewegung.
- Überarbeitete Wortmarke, Seitenleiste, Chatnachrichten und Eingabe.
- Themen und Hochschul-Links auf Smartphone und Tablet aufklappbar.
- Neue Roboter-Avatare und ein passendes Favicon.
- Angepasstes Chat-Widget zur Einbettung in andere Websites.
- Automatischer Basis-Modus aus v2.1.0 weiterhin enthalten.

Prüfung: 45 automatische Tests bestanden, Build erfolgreich und Bedienung im lokalen Browser geprüft. Die Wissensbasis wurde durch dieses Design-Update nicht fachlich erweitert.
