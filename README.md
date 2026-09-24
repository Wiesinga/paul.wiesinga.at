# paul.wiesinga.at – Persönliche One-Pager Visitenkarte & Portfolio

Moderne, minimalistische digitale Visitenkarte und One-Pager Portfolio für **Paul Wiesinger**, optimiert für **Cloudflare Pages** und die Subdomain **`paul.wiesinga.at`**.

---

## ✨ Features & UX Highlights

- 📇 **3D-Tilt & Dynamic Spotlight**: Elegante, dreidimensionale Visitenkarte mit realistischem 3D-Blickwinkel und interaktivem Spotlight-Lichtreflex, der dem Mauszeiger geschmeidig folgt.
- 💾 **Dynamischer vCard-Export (.vcf)**: Ein Klick auf *„vCard speichern“* generiert sofort eine digitale Kontaktkarte (RFC 6350), die direkt in iOS Kontakte, Google Kontakte oder Outlook importiert werden kann.
- 📋 **1-Klick E-Mail-Kopieren**: Mit haptischem Toast-Feedback („In Zwischenablage kopiert! ✓“).
- 📱 **QR-Code Visitenkarte**: Integriertes QR-Code Modal zum schnellen Scannen bei Networking-Events oder Meetups.
- 🌓 **Dark & Light Mode**: Flüssiger Theme-Wechsel mit automatischer Erkennung der Systempräferenzen und `localStorage`-Speicherung.
- ⚡ **Zero Dependencies**: Reines semantisches HTML5, modernes CSS und leichtgewichtiges Vanilla JavaScript – lädt in Millisekunden weltweit über das Cloudflare Edge CDN.
- ⌨️ **Tastatur-Shortcuts**:
  - `T`: Theme wechseln (Dark / Light)
  - `C`: E-Mail-Adresse kopieren
  - `V`: vCard herunterladen
  - `Q`: QR-Code öffnen / schließen
  - `1` bis `4`: Abschnitte wechseln
  - `Esc`: Modal schließen

---

## 📁 Projektstruktur

```text
paul.wiesinga.at/
├── index.html          # Struktur, Inhalte (Name, Ausbildung, Projekte, Skills)
├── style.css           # Modernes Glassmorphism-Design, 3D-Tilt, Themes & Bento-Grid
├── script.js           # 3D-Effekt, vCard-Blob, QR-Modal, Copy-To-Clipboard
├── _headers            # Cloudflare Pages Security & Cache Header
├── package.json        # Hilfs-Skripte (dev, deploy)
├── wrangler.toml       # Cloudflare Pages Konfiguration
└── assets/
    ├── avatar.svg      # Stilvoller Vektor-Platzhalter (kann durch avatar.jpg ersetzt werden)
    ├── favicon.svg     # Modernes Monogramm-Favicon
    └── qrcode.svg      # Generierter QR-Code für https://paul.wiesinga.at
```

---

## 🚀 Lokale Vorschau

Da es sich um reines HTML/CSS/JS handelt, kannst du das Projekt auf zwei Wegen lokal ansehen:

### Option A: Direkt im Browser
Doppelklicke einfach auf `index.html` in deinem Dateiexplorer.

### Option B: Mit lokalem Dev-Server
```bash
# Im Projektordner C:\Users\paulw\source\repos\paul.wiesinga.at
npm run dev
# oder
npx serve . -l 3000
```
Öffne anschließend [http://localhost:3000](http://localhost:3000) im Browser.

---

## 🎨 Inhalte anpassen

### 1. Eigenes Profilbild einfügen
Kopiere dein Profilfoto einfach als **`avatar.jpg`** in den Ordner `assets/`.
Das Skript erkennt automatisch, ob `assets/avatar.jpg` existiert, und tauscht den Platzhalter nahtlos aus.

### 2. Kontaktdaten & Texte
- **Name, Bio, Ausbildung, Projekte, Skills**: Alle Texte lassen sich direkt in [index.html](file:///C:/Users/paulw/source/repos/paul.wiesinga.at/index.html) anpassen.
- **vCard Kontaktdaten**: In [script.js](file:///C:/Users/paulw/source/repos/paul.wiesinga.at/script.js) findest du ganz oben das Objekt `CONTACT`:
  ```javascript
  const CONTACT = {
    firstName: 'Paul',
    lastName: 'Wiesinger',
    email: 'paul@wiesinga.at',
    website: 'https://paul.wiesinga.at',
    title: 'Software Developer & IT-Spezialist',
    location: 'Oberösterreich, Österreich'
  };
  ```

---

## ☁️ Deployment auf Cloudflare Pages mit Subdomain `paul.wiesinga.at`

### Schritt 1: Cloudflare Pages Projekt anlegen

#### Weg 1: Über GitHub (Empfohlen für automatisches Deployment)
1. Initialisiere das Git-Repository und pushe es auf dein GitHub-Konto:
   ```bash
   cd C:\Users\paulw\source\repos\paul.wiesinga.at
   git init
   git add .
   git commit -m "Initial commit: Paul Wiesinger personal digital card"
   git branch -M main
   # Repository auf GitHub erstellen und verknüpfen:
   # git remote add origin https://github.com/<DEIN-USER>/paul.wiesinga.at.git
   # git push -u origin main
   ```
2. Gehe ins [Cloudflare Dashboard](https://dash.cloudflare.com/) ➔ **Workers & Pages** ➔ **Create application** ➔ **Pages** ➔ **Connect to Git**.
3. Wähle dein Repository aus.
4. Einstellungen:
   - **Framework preset**: `None`
   - **Build command**: *(leer lassen)*
   - **Build output directory**: *(leer lassen oder `.`)*
5. Klicke auf **Save and Deploy**.

#### Weg 2: Direkt via Cloudflare CLI (Wrangler)
```bash
npx wrangler pages deploy . --project-name=paul-wiesinga-card
```

---

### Schritt 2: Subdomain `paul.wiesinga.at` einrichten

1. Öffne in Cloudflare dein erstelltes Pages-Projekt.
2. Wechsle auf den Reiter **Custom domains**.
3. Klicke auf **Set up a custom domain**.
4. Gib `paul.wiesinga.at` ein und klicke auf **Continue**.
5. Wenn deine Hauptdomain `wiesinga.at` bereits bei Cloudflare verwaltet wird, richtet Cloudflare den passenden **CNAME-Record** und das kostenlose **SSL/TLS-Zertifikat** vollautomatisch ein!
6. Deine persönliche Visitenkarte ist nun unter **`https://paul.wiesinga.at`** erreichbar.
