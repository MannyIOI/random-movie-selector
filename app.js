const spinBtn = document.getElementById("spinBtn");
const maxNumberInput = document.getElementById("maxNumber");
const spinner = document.getElementById("spinner");
const result = document.getElementById("result");

const fallbackMovies = [
  "The Shawshank Redemption",
  "The Godfather",
  "The Dark Knight",
  "12 Angry Men",
  "Schindler's List",
  "The Lord of the Rings: The Return of the King",
  "Pulp Fiction",
  "The Lord of the Rings: The Fellowship of the Ring",
  "The Good, the Bad and the Ugly",
  "Forrest Gump"
];

let imdbMovies = [];
let usingFallback = false;
let currentRotation = 0;

async function loadMovies() {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/hjorturlarsen/IMDB-top-250/master/data/movies.json"
    );
    if (!response.ok) {
      throw new Error(`Failed to load movie list: HTTP ${response.status}`);
    }

    const movies = await response.json();
    imdbMovies = movies.map((movie) => movie.name).filter(Boolean);

    if (!imdbMovies.length) {
      usingFallback = true;
      imdbMovies = fallbackMovies;
    }
  } catch {
    usingFallback = true;
    imdbMovies = fallbackMovies;
  }

  maxNumberInput.max = String(imdbMovies.length);
  maxNumberInput.value = String(imdbMovies.length);
}

function getRandomNumber(max) {
  return Math.floor(Math.random() * max) + 1;
}

function spinWheel() {
  const availableCount = Math.max(1, imdbMovies.length);
  const parsed = Number(maxNumberInput.value);
  const maxN = Number.isFinite(parsed)
    ? Math.max(1, Math.min(availableCount, Math.floor(parsed)))
    : availableCount;

  maxNumberInput.max = String(availableCount);
  maxNumberInput.value = String(maxN);

  const selectedNumber = getRandomNumber(maxN);
  const movie = imdbMovies[selectedNumber - 1];

  const extraRotation = 1800 + Math.floor(Math.random() * 1080);
  currentRotation += extraRotation;
  spinner.style.transform = `rotate(${currentRotation}deg)`;

  result.textContent = `🎉 Happy + Happy got #${selectedNumber}: ${movie}`;
}

spinBtn.addEventListener("click", spinWheel);

loadMovies().then(() => {
  result.textContent = usingFallback
    ? `Loaded fallback list (${imdbMovies.length} movies). Spin it, Happy + Happy!`
    : `Loaded IMDb Top 250 list (${imdbMovies.length} movies). Spin it, Happy + Happy!`;
});
