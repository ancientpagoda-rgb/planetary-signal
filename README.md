# Planetary Signal

Ambient data sonification in the browser. Planetary Signal turns live(ish) data streams from space weather, global weather, and human financial systems into a calm, evolving soundscape.

- **Cosmic layer:** low drones shaped by geomagnetic activity (Kp index)
- **Planetary layer:** mid textures from wind, temperature, and pressure
- **Human systems layer:** high band motion driven by BTC price volatility

The output is intentionally subtle and atmospheric — not a melody generator.

## Features (V1 / MVP)

- Runs entirely in the browser (no backend)
- Uses public, no-key APIs only
- Web Audio API–based ambient engine
- Three independent layers with separate frequency bands
- Exponential smoothing on all data streams
- Minimal UI with Start/Stop controls and layer toggles

## Tech Stack

- HTML, CSS, JavaScript (ES modules)
- Web Audio API (no external audio libraries)
- Hosted via GitHub Pages (static site)

## Repo Structure

```text
planetary-signal/
  index.html
  style.css
  app.js
  README.md
  /audio
    engine.js
    layers.js
    mapping.js
  /data
    sources.js
    normalize.js
    smoothing.js
  /ui
    controls.js
```

## How It Works

### Audio Engine

- `audio/engine.js` creates the `AudioContext`, a master gain node, and the three sound layers via `createLayers`.
- Audio only starts after the user clicks **Start Audio**, satisfying browser autoplay policies.

### Layers

Defined in `audio/layers.js`:

- **Cosmic layer**
  - Low-pass filtered noise centered roughly 40–150 Hz
  - Very slow LFO modulates the filter frequency
  - Kp index (space weather) controls filter cutoff and layer gain

- **Planetary layer**
  - Band-pass noise in the 200–800 Hz region
  - Aggregated from temperature, wind speed, and pressure (Open-Meteo API)
  - Controls center frequency and amplitude

- **Human systems layer**
  - Band-pass noise in the 800–3000 Hz region
  - Tremolo LFO rate and depth are driven by estimated BTC price volatility

Layer enable/disable is handled via per-layer gains, preserving continuous playback while muting.

### Data Flow

`data/sources.js`:

- **Cosmic** — NOAA SWPC planetary K-index feed:
  - `https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json`
  - Last sample is parsed and normalized via `normalizeKp`.

- **Planetary** — Open-Meteo forecast (fixed coordinates, no geolocation):
  - `https://api.open-meteo.com/v1/forecast?latitude=40.0&longitude=-100.0&current=temperature_2m,pressure_msl,wind_speed_10m`
  - Temperature, wind, and pressure are normalized individually and then averaged.

- **Human systems** — BTC price from Coindesk:
  - `https://api.coindesk.com/v1/bpi/currentprice/BTC.json`
  - Volatility is estimated as `|price - lastPrice| / price`.
  - Mapped via `normalizeVolatility`.

All normalized values go through exponential smoothers (see `data/smoothing.js`):

```js
smoothed = previous + (current - previous) * factor;
```

Smoothing factors are in the `0.04–0.08` range to keep motion slow and organic.

### Mapping

`audio/mapping.js` converts smoothed 0–1 inputs into audio parameters:

- **Cosmic:** filter cutoff (40–150 Hz, exponential) and gain
- **Planetary:** band-pass center (200–800 Hz, exponential) and gain
- **Human:** band-pass center (800–3000 Hz), tremolo rate (0.3–3 Hz), tremolo depth, and gain

### Update Interval

In `app.js`, the app polls all data sources every **120 seconds** (2 minutes), within the 60–300s target window.

## Running Locally

1. Clone or download this repository.
2. Serve the folder with any static HTTP server. For example, with Node installed:

   ```bash
   npx serve .
   ```

3. Open the printed URL (e.g. `http://localhost:3000/planetary-signal/`).
4. Click **Start Audio** to begin the soundscape.

If you open `index.html` directly from the file system (`file://`), browsers may block `fetch` and some audio features; use a local server instead.

## GitHub Pages Deployment

1. Create a GitHub repository named `planetary-signal` and push this folder as the repo root.

2. In GitHub, go to **Settings → Pages**:
   - **Source:** select `Deploy from a branch`.
   - **Branch:** choose `main` (or `master`) and the `/ (root)` folder.
   - Save.

3. GitHub will build and publish a static site. After a minute, you should see a URL like:

   ```text
   https://<your-username>.github.io/planetary-signal/
   ```

4. Open that URL in a modern browser (Chrome, Edge, Firefox, Safari), wait for the page to load, and click **Start Audio**.

## Assumptions & Notes

- All APIs used are public and keyless as of early 2026. If any endpoint changes or rate-limits aggressively, the app falls back to synthetic but slowly varying values to keep the soundscape alive.
- Network failures degrade gracefully rather than stopping audio.
- No user-specific data is collected; the system uses a fixed geographic point for weather.

## Ideas for V2

- Detect significant anomalies (e.g., geomagnetic storms, extreme weather, price spikes) and briefly emphasize them as motifs.
- Add simple presets (Calm / Active / Deep Space) that change gains and mapping curves.
- Auto-detect user location for local weather (with permission).
- Optional user-controlled intensity sliders per layer.
- Visual layer status indicators and soft, generative visuals.
