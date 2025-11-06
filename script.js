const API_KEY = "1ce776ad5b2bbe35b1bc08fea05dfe54"; // вставь свой ключ
const BASE_URL = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/w500";

let page = 1;
let currentMode = "popular";
let currentQuery = "";

const el = {
  catalog: document.getElementById("catalog"),
  search: document.getElementById("search"),
  sort: document.getElementById("sort"),
  prev: document.getElementById("prev"),
  next: document.getElementById("next"),
  pageLabel: document.getElementById("pageLabel"),
  empty: document.getElementById("empty"),
  backdrop: document.getElementById("backdrop"),
  closeModal: document.getElementById("closeModal"),
  modalPoster: document.getElementById("modalPoster"),
  modalTitle: document.getElementById("modalTitle"),
  modalMeta: document.getElementById("modalMeta"),
  modalSummary: document.getElementById("modalSummary"),
};

// загрузка фильмов
async function loadMovies() {
  let url = "";
  if (currentQuery.trim()) {
    url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(currentQuery)}&page=${page}&language=ru-RU`;
  } else {
    url = `${BASE_URL}/movie/${currentMode}?api_key=${API_KEY}&page=${page}&language=ru-RU`;
  }

  const res = await fetch(url);
  const data = await res.json();
  renderMovies(data.results || []);
}

function renderMovies(movies) {
  el.catalog.innerHTML = "";
  if (!movies.length) {
    el.empty.style.display = "block";
    return;
  }
  el.empty.style.display = "none";

  el.catalog.innerHTML = movies.map(m => `
    <div class="card" data-id="${m.id}">
      <img src="${m.poster_path ? IMG + m.poster_path : 'https://via.placeholder.com/400x600?text=No+Image'}" class="poster">
      <div class="meta">
        <div class="title">${m.title}</div>
        <div class="sub">${m.release_date ? m.release_date.slice(0,4) : "—"} • ⭐ ${m.vote_average}</div>
      </div>
    </div>
  `).join("");

  el.pageLabel.textContent = `Страница ${page}`;
  document.querySelectorAll(".card").forEach(c =>
    c.addEventListener("click", () => openModal(c.dataset.id))
  );
}

async function openModal(id) {
  const res = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=ru-RU`);
  const m = await res.json();
  el.modalPoster.src = m.poster_path ? IMG + m.poster_path : "";
  el.modalTitle.textContent = m.title;
  el.modalMeta.textContent = `${m.release_date?.slice(0,4) || "—"} • ⭐ ${m.vote_average}`;
  el.modalSummary.textContent = m.overview || "Описание отсутствует.";
  el.backdrop.style.display = "flex";
}

function closeModal() {
  el.backdrop.style.display = "none";
}

// события
el.sort.onchange = e => { currentMode = e.target.value; page = 1; currentQuery = ""; el.search.value = ""; loadMovies(); };
el.search.oninput = e => { currentQuery = e.target.value; page = 1; loadMovies(); };
el.prev.onclick = () => { if(page>1){ page--; loadMovies(); } };
el.next.onclick = () => { page++; loadMovies(); };
el.closeModal.onclick = closeModal;
el.backdrop.onclick = e => { if(e.target===el.backdrop) closeModal(); };

// первая загрузка
loadMovies();
