# random-movie-selector

A fun and interactive spinner that picks a random number from **1 to N** and maps it to the corresponding movie in the **IMDb Top 250** list.

## Features
- Spinner animation for movie selection
- Number range input from 1 to 250
- Pulls IMDb Top 250 movie names from a public dataset
- Automatically falls back to a local starter list if external fetch fails
- Happy + Happy themed UI

## Run locally
Open `index.html` in your browser.

## Data source note
The app fetches movie data from:

https://raw.githubusercontent.com/hjorturlarsen/IMDB-top-250/master/data/movies.json

If this source is unavailable, the app uses a built-in fallback movie list.

## GitHub Pages
After the workflow runs on `main`, the site is available at:

https://mannyioi.github.io/random-movie-selector/
