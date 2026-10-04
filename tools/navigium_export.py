"""Holt die Englisch-Vokabeln des neuesten Buchs aus Navigium und schreibt data/vokabeln.js.

Aufruf (mit der Python-Umgebung des Vokabel-Scanners, dort liegen Login und .env):
    ~/claude-projects/vokabel-scanner/venv/bin/python tools/navigium_export.py
    ... tools/navigium_export.py --buch "Greenline 5"     # Buch fest vorgeben

"Neuestes Buch" = höchste Bandnummer unter deinen eigenen Lektionen mit Namen
"<Reihe> <Band>/Lektion <n>/S.<seite>". Benutzername und Passwort landen nie in der Datei.
"""
import argparse, datetime, json, os, re, sys

SCANNER = os.path.expanduser("~/claude-projects/vokabel-scanner")
sys.path.insert(0, SCANNER)
from dotenv import load_dotenv  # noqa: E402
load_dotenv(os.path.join(SCANNER, ".env"))
from navigium_common import BASE, SCHOOL, login  # noqa: E402

ZIEL = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "vokabeln.js")
MUSTER = re.compile(r"^(?P<buch>.+?\s(?P<band>\d+))/Lektion (?P<lektion>[\d+]+)/S\.(?P<seite>\d+)(?P<rest>.*)$")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--buch", help='z. B. "Greenline 5"; ohne Angabe das neueste')
    args = ap.parse_args()

    s = login()
    r = s.get(f"{BASE}/schule/vokabellektionen/alle",
              params={"schule": SCHOOL, "user": s.navigium_user, "lang": "*"})
    r.raise_for_status()
    eigene = []
    for l in r.json():
        if not isinstance(l, dict) or l.get("eigner") != s.navigium_user or l.get("lang") != "EN":
            continue
        m = MUSTER.match(l.get("name", ""))
        if m:
            eigene.append((m, l["key"]["id"]))
    if not eigene:
        sys.exit("Keine passenden Englisch-Lektionen gefunden.")

    buch = args.buch or max(eigene, key=lambda e: int(e[0]["band"]))[0]["buch"]
    auswahl = sorted((e for e in eigene if e[0]["buch"] == buch),
                     key=lambda e: (int(e[0]["seite"]), e[0]["rest"]))

    lektionen = []
    for m, lid in auswahl:
        r = s.get(f"{BASE}/schule/rest/vokabellektion/{lid}",
                  params={"schule": SCHOOL, "user": s.navigium_user})
        r.raise_for_status()
        d = r.json()
        lektionen.append({
            "id": str(lid),
            "lektion": m["lektion"],
            "seite": "S. " + m["seite"] + m["rest"],
            "vokabeln": [{"en": v["latein"], "de": v.get("bedeutungen") or [], "wortart": v.get("wortart")}
                         for v in sorted(d.get("vokabeln", []), key=lambda v: v.get("pos") or 0)],
        })

    daten = {"buch": buch, "quelle": "Navigium", "stand": datetime.date.today().isoformat(),
             "lektionen": lektionen}
    with open(ZIEL, "w", encoding="utf-8") as f:
        f.write("// Automatisch erzeugt von tools/navigium_export.py – nicht von Hand bearbeiten.\n")
        f.write("window.VOKABELN = " + json.dumps(daten, ensure_ascii=False, indent=1) + ";\n")
    n = sum(len(l["vokabeln"]) for l in lektionen)
    print(f"{buch}: {len(lektionen)} Lektionen, {n} Vokabeln -> {os.path.relpath(ZIEL)}")


if __name__ == "__main__":
    main()
