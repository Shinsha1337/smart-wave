# Smart Wave

**Smart Wave** turns Spotify into an endless personalized radio station with a hardware-accelerated WebGL fluid wave visualizer — pick a mood, pin a genre, or let it read your library and surf your taste clusters.

![preview](preview.png)

## Features

- **Endless personalized radio** built on Spotify's own recommendation graph — three modes: **Favorites** (your library only), **Flow** (60% new / 40% comfort), **Discoveries** (100% new, zero tracks from your library).
- **Taste clusters** — the wave detects what you're listening to and stays in that musical territory. Hit **Shake** to jump into a different cluster.
- **Browse integration** — pin Spotify editorial categories (Chill, Focus, Indie, Rock, Hip-Hop…) to the wave's bottom bar.
- **Custom wave** — build a wave from your own playlists with per-mode sub-presets.
- **Regional filters** — settings let you exclude music from specific regions (Turkish, Indian, Pakistani, Egyptian, Vietnamese, Filipino, Indonesian, Nigerian, Argentinian, South African, German, French, Spanish/Latin, Brazilian, K-Pop, Japanese). Useful if your account is registered in a region whose local music you don't want.
- **WebGL visualizer** — fluid single-color plasma with silk caustics and needle rays, tinted by the current cover art. 60 FPS throttled, pauses when hidden.
- Localized UI — English, Russian, German, Spanish, French, Portuguese, Italian, Polish, Turkish, Ukrainian, Japanese, Korean, Chinese, Dutch, Swedish (follows the Spotify client language).

## Important compatibility note

Smart Wave works through Spicetify, so it requires the official **Spotify Desktop** app.

Spicetify does **not** work with the Spotify version installed from the Microsoft Store. If you installed Spotify from the Microsoft Store, uninstall it and install Spotify Desktop from the [official Spotify website](https://www.spotify.com/download/) instead.

For full Spicetify setup details, use the [official Spicetify installation guide](https://spicetify.app/docs/getting-started.html).

## Installation through Spicetify Marketplace

This is the recommended installation method — Marketplace installations update automatically.

### 1. Install Spotify Desktop

Install the official Spotify Desktop app from the [Spotify website](https://www.spotify.com/download/). Do not use the Microsoft Store version.

### 2. Install Spicetify and Marketplace

Follow the [official Spicetify installation guide](https://spicetify.app/docs/getting-started.html). The guide contains the latest commands for your operating system.

Common install commands:

Windows PowerShell (run with **normal user privileges**, not as Administrator):

```powershell
iwr -useb https://raw.githubusercontent.com/spicetify/cli/main/install.ps1 | iex
```

macOS / Linux:

```bash
curl -fsSL https://raw.githubusercontent.com/spicetify/cli/main/install.sh | sh
```

When the Spicetify installer asks whether to install Marketplace, type `yes` and press Enter.

### 3. Open Marketplace in Spotify

Open Spotify and select **Marketplace** from the sidebar.

### 4. Find Smart Wave

Open the **Extensions** tab and search for **Smart Wave**.

### 5. Install Smart Wave

Click **Install**. Restart Spotify if the extension does not appear immediately, then press the wave button next to Home.

If Smart Wave does not appear in Marketplace yet, use the manual installation method below.

## Manual installation

### 1. Install Spotify Desktop & Spicetify with Marketplace

Follow steps 1 and 2 from the Marketplace installation guide above.

### 2. Open the Spicetify config folder

Run:

```bash
spicetify config-dir
```

### 3. Copy Smart Wave into the Extensions folder

Put `smartWave.js` into the Spicetify `Extensions` folder in the opened window.

### 4. Enable the extension

Run:

```bash
spicetify config extensions smartWave.js
spicetify apply
```

Restart Spotify after applying.

## Updates

### Marketplace updates

**Marketplace installations update automatically through Spicetify Marketplace** — no manual file replacement needed.

### Manual updates

Download the latest `smartWave.js`, replace the old file in the Spicetify `Extensions` folder, and run:

```bash
spicetify apply
```

### Spotify updates and Spicetify

Spotify Desktop updates can overwrite the files Spicetify modifies. When this happens, Smart Wave may temporarily disappear or stop loading. After every Spotify update, re-apply Spicetify:

```bash
spicetify backup apply
```

If Spotify still looks broken or extensions do not load, try a full restore and re-apply:

```bash
spicetify restore backup apply
```

If Spicetify itself is outdated, update it and re-apply:

```bash
spicetify update
spicetify backup apply
```

## Removing Smart Wave

If installed manually, run:

```bash
spicetify config extensions smartWave.js-
spicetify apply
```

If installed through Marketplace, uninstall it from the **Installed** tab.

Your Smart Wave settings are stored in Spotify's local storage and survive uninstall. For a clean slate, use the **Reset** button in the extension's settings (gear icon inside the wave).

## Settings

Open the wave and click the **gear icon** (top left):

- **Wave effect** — toggle the WebGL visualizer.
- **Regional filters** — exclude music from selected regions.
- **Export / Import** — back up or restore all Smart Wave settings as a JSON file.
- **Reset all settings** — full wipe with a confirmation step.


## Development

The shipped `smartWave.js` is a **generated bundle** — the actual source is modular:

- `src/01-core.js` — config, i18n (15 languages), state, artist graph cache
- `src/02-engine.js` — recommendation engine: taste clusters, queue, browse catalog
- `src/03-shader.js` — WebGL fluid wave shader
- `src/04-ui.js` — overlay DOM, styles, event bindings

Edit the modules, then run `Build-SmartWave.ps1` — it concatenates them in order into the single file Spicetify expects (extensions are injected as one file), syncs this repo, and applies locally.

## Credits

Created by [Shinsha](https://github.com/Shinsha1337).
