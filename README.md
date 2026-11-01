# Europa entscheidet

Ein browserbasiertes Strategiespiel über die Regierung eines europäischen Landes. Wähle aus 50 Ländern, verwalte den Haushalt, beschließe Gesetze, verhandle Abkommen und reagiere auf Krisen. Länder starten mit unterschiedlichen Wirtschafts- und Verteidigungswerten, politischen Schwerpunkten und Bündnissen. Beschaffe Personal und Ausrüstung mit selbst gewählten Stückzahlen, eröffne Botschaften und verhandle eine zeitlich begrenzte europäische Friedensvereinbarung. Aufrüstung kann Beziehungen belasten; Konflikte bleiben abstrakt und werden anhand von Spielwerten ausgewertet. Spielstände bleiben lokal im Browser.

## Lokal starten

Die Seite verwendet ES-Module und lädt Kartendaten per `fetch`. Starte sie daher über einen lokalen Webserver statt mit `file://`:

```sh
python3 -m http.server 8000
```

Öffne anschließend <http://localhost:8000>.

## Tests

```sh
node --test tests/*.test.mjs
```

## Veröffentlichung

GitHub Pages wird über `.github/workflows/pages.yml` aus dem Repository-Hauptverzeichnis veröffentlicht. Nach dem Push auf `main` muss in den Repository-Einstellungen unter **Settings → Pages** gegebenenfalls **GitHub Actions** als Quelle ausgewählt werden.

## Daten und Grenzen

- Ländergrenzen: Natural Earth; Wirtschafts- und Bevölkerungsdaten: World Bank. Im Länderprofil stehen Quellen und Datenstände.
- Fotos werden nur mit Lizenz- und Urhebernachweis verwendet; die eingebaute SVG-Illustration dient als Ersatz.
- Gegnerstaaten und Ereignisse folgen festen lokalen Spielregeln. Spielwerte, Wahlen und Konflikte sind abstrahierte Spielmechaniken und keine aktuellen Bewertungen realer Staaten.
- Bündniszugehörigkeiten dienen der vereinfachten politischen Simulation. Atomare Abschreckung erscheint allenfalls als abstraktes Eskalationsrisiko; nukleare Waffen lassen sich weder beschaffen noch einsetzen.
- Beschaffung, Bereitschaft und Konfliktfolgen sind erfundene Spielmechaniken, keine aktuellen Militärdaten, Einsatzanleitungen oder realistischen Kostenprognosen.
- Es gibt keinen Multiplayer. Spielstände werden im Local Storage des verwendeten Browsers gespeichert.
