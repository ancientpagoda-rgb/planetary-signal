# Planetary Signal

Browser-based ambient sound generator driven by:

- Space weather
- Global weather
- Market data

Runs entirely in the browser (GitHub Pages-friendly), no backend, no API keys.

## Local development

```bash
cd planetary-signal
python3 -m http.server 8000
# open http://localhost:8000
```

Then:

- Click **Start** to enable audio.
- Toggle data sources and presets.

## Deployment (GitHub Pages)

1. Initialize the repo and push:

```bash
git init
git add .
git commit -m "Initial Planetary Signal skeleton"
git remote add origin https://github.com/<you>/planetary-signal.git
git push -u origin main
```

2. In GitHub UI:
   - Go to **Settings → Pages**
   - Source: `main` branch, `/root` (or `/`)
   - Save and wait for deployment

3. Open the GitHub Pages URL shown in the banner.
