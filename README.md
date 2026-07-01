# random-movie-selector

**Happy &amp; Happy** — a romantic, animated movie-night ritual for two. Let love pick tonight's story. ♥

## Features
- 💖 Romantic, AWWWARDS-inspired UI (animated aurora backdrop, glassmorphism cards, drifting hearts, shimmering "Happy & Happy" title)
- ✨ Rich micro-interactions and animations (heartbeat pulses, shine-sweep button, hover lifts, animated spinner)
- 🎯 Random picker with a pulsing heart reel and a burst of **heart confetti** on every reveal
- 🔢 **Top picks** control that actually sticks (choose from the top *N* of the IMDb Top 250)
- 🌶️ **Spicy** list of picks that are outside the IMDb Top 250
- 🎭 **Mood / genre** filtering
- ✓ **Watched Together** tab — mark titles you've shared so they're excluded from the draw (saved in your browser via `localStorage`)
- ♿ Respects `prefers-reduced-motion` — animations gracefully turn off for those who prefer less motion

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
