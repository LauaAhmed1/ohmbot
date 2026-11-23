# OhmBot

OhmBot ist ein studentischer Chatbot für Fragen rund um das Studium an der Technischen Hochschule Nürnberg Georg Simon Ohm. Der aktuelle Schwerpunkt liegt auf den Studiengängen der Fakultät Informatik.

## Live-Demo

[OhmBot öffnen](https://ohmbot.netlify.app)

## Funktionen

- Antworten zu Studienaufbau, Modulen und Studienorganisation
- Informationen zu Informatik, Medieninformatik und Wirtschaftsinformatik
- Antworten zu ECTS-Grenzen, Praxissemester und Bachelorarbeit
- Quellenangaben bei hochschulbezogenen Antworten
- Unterstützung für allgemeine Fragen und Smalltalk
- Responsive Oberfläche im Ohm-Stil für Desktop, Tablet und Smartphone
- Automatischer Basis-Modus mit Quellen, wenn die KI nicht verfügbar ist
- Einbindung in andere Websites als Chat-Widget möglich

## Basis-Modus bei KI-Ausfall

Fehlt der OpenAI-Schlüssel, ist er ungültig, ist das Kontingent erschöpft oder antwortet der KI-Dienst nicht, wechselt OhmBot automatisch in den Basis-Modus. Bei passenden Treffern antwortet er aus der hinterlegten THN-Wissensbasis mit Quellen und kennzeichnet die Antwort als „Basis-Modus“. Bei der nächsten Anfrage versucht OhmBot erneut, einen vorhandenen Schlüssel zu nutzen.

Für den Basis-Modus müssen die Webseite und die Netlify-Funktion erreichbar sein. [Technische Details zum Basis-Modus](./ohmbot/README.md#neu-in-210-automatischer-basis-modus)

## Aktuelle Version

**OhmBot v2.2.0 – Neues Design im Ohm-Stil**

OhmBot hat eine komplett überarbeitete Oberfläche im Stil der TH Nürnberg: neue Startansicht mit vier Themenkarten, eigenes Roboter-Maskottchen, modernisierte Chatnachrichten und Quellenkarten sowie ein aufklappbares Themenmenü auf Smartphones und Tablets. Außerdem wurden Tastaturbedienung und das eingebettete Chat-Widget verbessert; die Einstellung „Bewegung reduzieren“ wird unterstützt. Der automatische Basis-Modus aus v2.1.0 bleibt erhalten.

[GitHub-Releases ansehen](https://github.com/LauaAhmed1/ohmbot/releases)

## Projektdateien

Der vollständige Quellcode und die technische Dokumentation befinden sich im Ordner [`ohmbot`](./ohmbot).

## Mitwirkende

- Ahmed Laua
- Aru Cagdas
- Nicevic Semiha
- Saron Simge
- Taskin Selin

## Hinweis

OhmBot ist ein studentisches IT-Projekt und kein offizielles Auskunftsangebot der TH Nürnberg. Verbindlich sind ausschließlich die offiziellen Hochschuldokumente und Auskünfte der zuständigen Stellen.
