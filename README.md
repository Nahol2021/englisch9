# California Dreaming Trainer

Übungsseite für die 1. Englischarbeit, Klasse 9 (Unterrichtsvorhaben 9.1-1 „California Dreaming“).

**Seite:** https://nahol2021.github.io/englisch9/

- `index.html`, `style.css`, `app.js` – die Seite (kein Build-Schritt nötig)
- `data/vokabeln.js` – Vokabeln aus Navigium, **nicht von Hand bearbeiten**

## Vokabeln aktualisieren

Neue Greenline-Seiten wie gewohnt einscannen (Vokabel-Scanner → Navigium), dann:

```bash
~/claude-projects/vokabel-scanner/venv/bin/python tools/navigium_export.py
git add data/vokabeln.js && git commit -m "Vokabeln aktualisiert" && git push
```

Das Skript nimmt automatisch das neueste Buch (höchste Bandnummer, z. B. „Greenline 5“).
Mit `--buch "Greenline 4"` lässt sich ein bestimmtes Buch wählen. Login und `.env` kommen aus dem
Vokabel-Scanner; Zugangsdaten landen nie in diesem Repo.
