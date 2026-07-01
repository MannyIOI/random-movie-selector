# random-movie-selector

**PAC-PICKS** — a retro, MS Pac-Man-inspired arcade for picking your next movie night title.

## Features
- 🕹️ Retro arcade UI (CRT scanlines, neon glow, chasing Pac-Man & ghosts)
- 🎯 Random picker with a spinning Pac-Man reel and **confetti** on every reveal
- 🔢 **Max rank** control that actually sticks (pick from the top *N* of the IMDb Top 250)
- 🌶️ **Spicy** list of picks that are outside the IMDb Top 250
- 🎭 **Genre** filtering
- ✔ **Watched** tab — mark titles as watched so they are excluded from the lottery (saved in your browser via `localStorage`)

## How it works
Movie data ships with the app in [`movies-data.js`](movies-data.js):
- `TOP_250_MOVIES` — the IMDb Top 250 (approx. rank order), each with title, year and genres
- `SPICY_MOVIES` — a curated list of movies that are **not** in the Top 250

Because the data is bundled locally, the picker no longer depends on any external
network request. (The previous remote data source went offline, which forced the
app onto a 10-item fallback and capped every spin at the top 10.)

## Run locally
Open `index.html` in your browser.

## GitHub Pages
After the workflow runs on `main`, the site is available at:

https://mannyioi.github.io/random-movie-selector/
