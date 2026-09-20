# Wissensbasis und Rechercheprotokoll

Recherchestand **20.09.2026**. 518 Einträge, 42 Quellen, 414 studiengangsbezogene Moduleinträge. Gemeinsam angebotene Module sind mehrfach erfasst, damit ECTS, Modulgruppe und Prüfungsform nicht zwischen Studiengängen verwechselt werden.

Die neuen Inhalte wurden aus öffentlich zugänglichen offiziellen Hochschulseiten, sechs SPOs, der ASPO sowie sechs Studienplänen und sechs Modulhandbüchern zusammengetragen. Die Semesterübersichten wurden zusätzlich an den PDF-Tabellen visuell geprüft. Kurze Modulbeschreibungen sind redaktionelle Zusammenfassungen; das vollständige Modulhandbuch bleibt die Quelle für detaillierte Lehrinhalte und Literatur. Einzelne ältere Basiseinträge tragen weiterhin ihr Prüfdatum 18.09.2026.

## Abdeckung

| Studiengang | Moduleinträge | Kohorte der erfassten Module |
|---|---:|---|
| Bachelor Informatik | 84 | ab WS 2021/22 |
| Bachelor Medieninformatik | 87 | ab WS 2021/22 |
| Bachelor Wirtschaftsinformatik | 92 | ab WS 2021/22 |
| Master Informatik | 50 | ab WS 2025/26 |
| Master Medieninformatik | 51 | ab WS 2025/26 |
| Master Wirtschaftsinformatik | 50 | ab WS 2025/26 |

Weitere Themen: alle sieben Bachelor-Plansemester, Wahlpflichtumfang, GOP, 38-ECTS-Übergang, Zulassung zum Praxissemester, Abschlussarbeiten, Bestehensnoten, Multiple Choice, Wiederholungsfristen, Studienzeit, Krankheit/Rücktritt, Nachteilsausgleich, Prüfungsanmeldung, Semestertermine, Beratung, Studienbüro, StudyOhm, Moodle, Ohmcard und Bibliothek. Der alphabetische Modulindex mit Fundstellen steht in `MODULKATALOG.md`.

## Besonders wichtige Unterschiede

- **Zweiter Studienabschnitt:** 38 ECTS aus den Fächern des ersten Abschnitts (§7 Abs.2 der Bachelor-SPOs). Nicht mit Praxiszulassung verwechseln.
- **Praxissemester:** sämtliche Fächer aus Abschnitt 1 bestanden plus mindestens20 ECTS aus den Fächern der Plansemester3/4. Die praktische Tätigkeit umfasst20 zusammenhängende Wochen.
- **Bachelorarbeit:** praktischer Teil und Praxisseminar erfolgreich plus160 ECTS, zusätzliche organisatorische Anforderungen des Studienplans beachten. Maximal5 Monate Bearbeitungsfrist.
- **Bestehen:** benotet grundsätzlich mindestens4,0 nach ASPO. Eine pauschale Prozentgrenze für jede Klausur wäre falsch. Antwort-Wahl-Prüfungen haben eine eigene Regel.
- **Wiederholung:** aktuelle ASPO-Regeln sind nicht automatisch auf APO-Altfälle übertragbar. ASPO2023 gilt laut §46 für Studienbeginn ab WS2023/24; bei früherem Beginn ist ein schriftlicher Wechsel möglich.

## Dokumentierte Konflikte und Lücken

1. **Statistik:** Die drei Bachelor-Studienpläne nennen6 ECTS, die Handbücher5. Beide Angaben bleiben sichtbar. Die Software entscheidet nicht selbst, welches Dokument im Einzelfall maßgeblich ist.
2. **Semesterzuordnung:** Der WIN-Studienplan und der Handbuch-Turnus weichen bei Grundlagen Informatik/Wirtschaftsinformatik voneinander ab. Auch Modulgruppen im Handbuch sind nicht automatisch ein persönlicher Stundenplan.
3. **Master WIN, Games-Module:** Bei MMO Games und Wissensbasierte Games-Entwicklungstechniken nennt das Handbuch5 ECTS, der Studienplan4.
4. **Abschlussarbeiten:** Die neuen Studienpläne verweisen auf ein digitales Portal und die Umstellung zum30.09.2026; ältere konsolidierte SPOs enthalten noch andere Abgabeverfahren. Aktuelle PK-Bekanntmachung prüfen.
5. **Master-Studienpläne:** Die bereits erreichbaren Dateien tragen das Datum01.10.2026, also nach dem Recherchestand. Die Antwort muss diesen Dokumentstand nennen und darf seine heutige Geltung nicht einfach voraussetzen.
6. **Master MIN/WIN, SPO:** Die verlinkten konsolidierten Dateien enthalten noch ENTWURF-Kopfzeilen. Zulassungs- und Organisationsdetails daraus nicht als abschließende rechtsverbindliche Zusage ausgeben.
7. **Master-WIN-Beratung:** Die Fakultäts-Beratungsseite nennt Patricia Brockmann; die Studiengangsseite David Müller. Zuständigkeit bei der Hochschule klären.
8. **Master MIN, Deterministische und statistische Verfahren der Datenverarbeitung:** Die Handbuchseite enthält nur wenige Metadaten, keine nähere Inhaltsbeschreibung oder Prüfungsform. Der Eintrag ist ausdrücklich eine Lücke.
9. **Ältere Jahrgänge:** Vollständige Modulkataloge vor den genannten Kohorten sind nicht erfasst. Keine neuen ECTS-Werte auf ältere SPOs übertragen.
10. **Interne und persönliche Daten:** Kein Zugriff auf Moodle-Kurse, Noten, persönliche ECTS-Konten, alle Klausurräume/-termine oder Intranet-Dokumente. Einzelne Semesterfristen wie die Rückmeldung Sommer2027 waren noch nicht veröffentlicht.

„Alles über die TH“ ist kein abschließbarer, unveränderlicher Datenbestand. Nicht vollständig erfasst sind beispielsweise jede fakultätsübergreifende Dienstleistung, alle Sonderfälle, Anerkennungsentscheidungen, laufende Stundenpläne, sämtliche alten Satzungsfassungen und Änderungen nach dem Recherchedatum. Eine unbekannte Regel bleibt unbekannt; allgemeines KI-Wissen darf diese Lücke nicht verdecken.

## Redaktioneller Ablauf

1. Originalquelle öffnen. Studiengang, Jahrgang, Dokumentversion und amtliche Veröffentlichung prüfen.
2. Fakten mit Quelle und konkreter Fundstelle in die JSON-Datei schreiben; Widersprüche explizit erfassen.
3. `checked_at` nur nach tatsächlicher Prüfung setzen. `review_by` passend zum Änderungstempo wählen.
4. `npm test`, `npm run build` und fachliche Testfragen durchführen.
5. Änderungen auf GitHub übernehmen; Netlify baut die Wissensdatei neu in die Function ein.

Fristen veralten früher als Modulkataloge. Einträge werden nach `review_by` aus dem Suchbestand entfernt. Das Feld ist eine Wiedervorlage, kein amtliches Ablaufdatum. Es gibt keinen Hintergrund-Crawler. Automatisch heruntergeladene Volltexte sollen nicht ohne redaktionelle Prüfung die freigegebene Wissensdatei überschreiben.

## Quellenverzeichnis

PDF-Fundstellen werden mit der tatsächlichen PDF-Seitennummer angegeben; diese kann von der aufgedruckten Seitenzahl abweichen. Die Detailreferenzen stehen an jedem JSON-Eintrag.

| ID | Quelle | Geprüft |
|---|---|---|
| `degree` | [Bachelor Informatik – Studiengang und Dokumente](https://www.th-nuernberg.de/studiengang/informatik-bsc/) | 2026-09-18 |
| `structure` | [Bachelor Informatik – Studienaufbau und Praxis](https://www.th-nuernberg.de/studiengangsdaten/inhaltsseiten/informatik-bsc/) | 2026-09-18 |
| `winter` | [Zentraler Terminplan – Wintersemester 2026/27](https://www.th-nuernberg.de/studium-karriere/wichtiges-zum-studienstart/termine-im-ueberblick/wintersemester/) | 2026-09-20 |
| `summer` | [Zentraler Terminplan – Sommersemester 2026](https://www.th-nuernberg.de/studium-karriere/wichtiges-zum-studienstart/termine-im-ueberblick/sommersemester/) | 2026-09-18 |
| `advice` | [Fakultät Informatik – Studienberatung und Anmeldung](https://www.th-nuernberg.de/fakultaeten/in/studium/studienberatung-und-anmeldung/) | 2026-09-20 |
| `office` | [Fakultät Informatik – Dekanat und Studienbüro](https://www.th-nuernberg.de/fakultaeten/in/fakultaet/dekanat/) | 2026-09-18 |
| `services` | [TH Nürnberg – Kontakt und Öffnungszeiten](https://www.th-nuernberg.de/wie-erreichen-sie-uns/oeffnungszeiten/) | 2026-09-18 |
| `winfo-degree` | [Wirtschaftsinformatik (B.Sc.) – Studiengangsseite](https://www.th-nuernberg.de/fakultaeten/in/studium/bachelorstudiengang-wirtschaftsinformatik/) | 2026-09-20 |
| `application-process` | [Bewerbungsablauf an der TH Nürnberg](https://www.th-nuernberg.de/studium-karriere/zulassung-und-bewerbung/bewerbungsablauf/) | 2026-09-20 |
| `study-start` | [Studienstart an der TH Nürnberg](https://www.th-nuernberg.de/internationales/international-academic-services/studierende/studienstart/) | 2026-09-20 |
| `informatics-faq` | [FAQ zu den Bachelorstudiengängen – Fakultät Informatik](https://www.th-nuernberg.de/fakultaeten/in/studium/faq-zu-den-bachelor-studiengaengen/) | 2026-09-20 |
| `modules-m-win` | [Modulhandbuch Master Wirtschaftsinformatik](https://www.th-nuernberg.de/fileadmin/global/Public_Docs/IN/IN_1753_VO_Modulhandbuch_WIN_Master_public.pdf) | 2026-09-20 |
| `spo-m-in` | [SPO Master Informatik](https://www.th-nuernberg.de/fileadmin/zentrale-einrichtungen/szs/sb/sb_docs/SPOs/Informatik/spoM-IN_aktuell.pdf) | 2026-09-20 |
| `spo-m-min` | [SPO Master Medieninformatik](https://www.th-nuernberg.de/fileadmin/zentrale-einrichtungen/szs/sb/sb_docs/SPOs/Informatik/spoM-MIN_aktuell.pdf) | 2026-09-20 |
| `spo-m-win` | [SPO Master Wirtschaftsinformatik](https://www.th-nuernberg.de/fileadmin/zentrale-einrichtungen/szs/sb/sb_docs/SPOs/Informatik/spoM-WIN_aktuell.pdf) | 2026-09-20 |
| `plan-m-in` | [Studienplan Master Informatik](https://www.th-nuernberg.de/fileadmin/global/Public_Docs/IN/IN_1658_VO_Studienplan_IN_Master_public.pdf) | 2026-09-20 |
| `plan-m-min` | [Studienplan Master Medieninformatik](https://www.th-nuernberg.de/fileadmin/global/Public_Docs/IN/IN_1655_VO_Studienplan_MIN_Master_public.pdf) | 2026-09-20 |
| `plan-m-win` | [Studienplan Master Wirtschaftsinformatik](https://www.th-nuernberg.de/fileadmin/global/Public_Docs/IN/IN_1656_VO_Studienplan_WIN_Master_public.pdf) | 2026-09-20 |
| `modules-m-in` | [Modulhandbuch Master Informatik](https://www.th-nuernberg.de/fileadmin/global/Public_Docs/IN/IN_1665_VO_Modulhandbuch_IN_Master_public.pdf) | 2026-09-20 |
| `modules-m-min` | [Modulhandbuch Master Medieninformatik](https://www.th-nuernberg.de/fileadmin/global/Public_Docs/IN/IN_1752_VO_Modulhandbuch_MIN_Master_public.pdf) | 2026-09-20 |
| `spo-in` | [SPO Bachelor Informatik](https://www.th-nuernberg.de/fileadmin/zentrale-einrichtungen/szs/sb/sb_docs/SPOs/Informatik/spoB-IN_aktuell.pdf) | 2026-09-20 |
| `spo-min` | [SPO Bachelor Medieninformatik](https://www.th-nuernberg.de/fileadmin/zentrale-einrichtungen/szs/sb/sb_docs/SPOs/Informatik/spoB-MIN_aktuell.pdf) | 2026-09-20 |
| `spo-win` | [SPO Bachelor Wirtschaftsinformatik](https://www.th-nuernberg.de/fileadmin/zentrale-einrichtungen/szs/sb/sb_docs/SPOs/Informatik/spoB-WIN_aktuell.pdf) | 2026-09-20 |
| `plan-in` | [Studienplan Bachelor Informatik](https://www.th-nuernberg.de/fileadmin/global/Public_Docs/IN/IN_1648_VO_Studienplan_B_IN_ab_21_public.pdf) | 2026-09-20 |
| `plan-min` | [Studienplan Bachelor Medieninformatik](https://www.th-nuernberg.de/fileadmin/global/Public_Docs/IN/IN_1650_VO_Studienplan_B_MIN_ab_21_public.pdf) | 2026-09-20 |
| `plan-win` | [Studienplan Bachelor Wirtschaftsinformatik](https://www.th-nuernberg.de/fileadmin/global/Public_Docs/IN/IN_1649_VO_Studienplan_B_WIN_ab_21_public.pdf) | 2026-09-20 |
| `modules-in` | [Modulhandbuch Bachelor Informatik](https://www.th-nuernberg.de/fileadmin/global/Public_Docs/IN/IN_1784_VO_Modulhandbuch_B_IN_ab_21_public.pdf) | 2026-09-20 |
| `modules-min` | [Modulhandbuch Bachelor Medieninformatik](https://www.th-nuernberg.de/fileadmin/global/Public_Docs/IN/IN_1651_VO_IN_Modulhandbuch_B_MIN_ab_21_public.pdf) | 2026-09-20 |
| `modules-win` | [Modulhandbuch Bachelor Wirtschaftsinformatik](https://www.th-nuernberg.de/fileadmin/global/Public_Docs/IN/IN_1652_VO_Modulhandbuch_B_WIN_ab_21_public.pdf) | 2026-09-20 |
| `aspo` | [Allgemeine Studien- und Prüfungsordnung (ASPO), Fassung 22.07.2025](https://www.th-nuernberg.de/fileadmin/zentrale-einrichtungen/szs/sb/sb_docs/SPOs/ASPO_2023_aktuell.pdf) | 2026-09-20 |
| `min-degree` | [Medieninformatik (B.Sc.)](https://www.th-nuernberg.de/studiengang/medieninformatik-bsc/) | 2026-09-20 |
| `pk` | [Prüfungskommission Informatik](https://www.th-nuernberg.de/fakultaeten/in/studium/pruefungskommission/) | 2026-09-20 |
| `office-faq` | [Studienbüro: FAQ](https://www.th-nuernberg.de/einrichtungen-gesamt/administration-und-service/studienbuero/faqs/) | 2026-09-20 |
| `fee` | [Studierendenwerkbeitrag und Rückmeldung](https://www.th-nuernberg.de/studium-karriere/wichtiges-zum-studienstart/studentenwerkbeitrag/) | 2026-09-20 |
| `start` | [Wichtiges zum Studienstart](https://www.th-nuernberg.de/studium-karriere/wichtiges-zum-studienstart/) | 2026-09-20 |
| `moodle` | [Moodle: Wiki Digitale Lehre](https://leko.service.th-nuernberg.de/wiki-digitale-lehre/doku.php?id=moodle4%3Amoodle4) | 2026-09-20 |
| `library` | [Bibliothek der TH Nürnberg](https://www.th-nuernberg.de/einrichtungen-gesamt/administration-und-service/bibliothek/) | 2026-09-20 |
| `faculty` | [Fakultät Informatik](https://www.th-nuernberg.de/fakultaeten/in/) | 2026-09-20 |
| `legal` | [Rechtsgrundlagen des Studienbüros](https://www.th-nuernberg.de/einrichtungen-gesamt/administration-und-service/studienbuero/rechtsgrundlagen/) | 2026-09-20 |
| `degree-m-in` | [Master Informatik](https://www.th-nuernberg.de/fakultaeten/in/studium/masterstudiengang-informatik/) | 2026-09-20 |
| `degree-m-min` | [Master Medieninformatik](https://www.th-nuernberg.de/studiengang/medieninformatik-msc/) | 2026-09-20 |
| `degree-m-win` | [Master Wirtschaftsinformatik](https://www.th-nuernberg.de/fakultaeten/in/studium/masterstudiengang-wirtschaftsinformatik/) | 2026-09-20 |
