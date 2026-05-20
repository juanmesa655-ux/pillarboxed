// Logica de la página de catálogo de películas (Catalogo.html)

// ── MAPA DE GÉNEROS ───────────────────────────────────────────────────
var MAPA_GENEROS = {
  28: "accion",
  12: "accion",
  878: "sci-fi",
  14: "sci-fi",
  35: "comedia",
  18: "drama",
  27: "terror",
  53: "terror",
};

function obtenerGenero(genre_ids) {
  if (!genre_ids || genre_ids.length === 0) return "todos";
  for (var i = 0; i < genre_ids.length; i++) {
    if (MAPA_GENEROS[genre_ids[i]]) return MAPA_GENEROS[genre_ids[i]];
  }
  return "todos";
}

// ── TARJETA HTML ──────────────────────────────────────────────────────
function crearTarjetaHTML(pelicula) {
  var año = pelicula.release_date ? pelicula.release_date.split("-")[0] : "N/A";
  var rating = pelicula.vote_average ? pelicula.vote_average.toFixed(1) : "N/A";
  var poster = pelicula.poster_path ? CONFIG.IMAGE_URL + pelicula.poster_path : null;
  var genero = obtenerGenero(pelicula.genre_ids);

  return `
    <a href="Peliculas.html?id=${pelicula.id}" class="tarjeta-link">
      <div class="tarjeta" data-genero="${genero}"
        data-id="${pelicula.id}"
        data-titulo="${pelicula.title}"
        data-imagen="${pelicula.poster_path || ""}"
        data-calificacion="${pelicula.vote_average || 0}"
        data-anio="${año}">
        <div class="poster-container">
          ${poster
            ? `<img src="${poster}" alt="${pelicula.title}" class="poster-imagen">`
            : `<div class="poster-container" style="display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.3);font-size:12px;">Sin poster</div>`
          }
          <div class="rating-badge">★ ${rating}</div>
        </div>
        <p class="titulo">${pelicula.title}</p>
        <p class="año">${año}</p>
        <button class="btn-wishlist-card"
          onclick="event.preventDefault(); event.stopPropagation(); toggleWishlistCard(this)">
          + Mi lista
        </button>
      </div>
    </a>
  `;
}

// ── ESTADO ────────────────────────────────────────────────────────────
var categoriaActiva = "popular";
var filtroGenero = "todos";
var peliculasCargadas = [];
var temporizadorBusqueda;

var TITULOS_CATEGORIA = {
  popular:    "Películas populares",
  top_rated:  "Mejor valoradas",
  now_playing: "En cines ahora",
  upcoming:   "Próximamente",
};

// ── CARGA Y RENDER ────────────────────────────────────────────────────

async function cargarCategoria(categoria) {
  var grid = document.getElementById("grid-peliculas");
  var h2   = document.getElementById("catalogo-h2");

  categoriaActiva = categoria;
  h2.textContent  = TITULOS_CATEGORIA[categoria] || "Películas";
  grid.innerHTML  = '<p class="cargando">Cargando películas...</p>';

  var peliculas = [];
  if (categoria === "popular")     peliculas = await obtenerPeliculasPopulares();
  else if (categoria === "top_rated")   peliculas = await obtenerPeliculasTopRated();
  else if (categoria === "now_playing") peliculas = await obtenerPeliculasEnCines();
  else if (categoria === "upcoming")    peliculas = await obtenerPeliculasProximas();

  peliculasCargadas = peliculas;
  aplicarFiltroGenero();
}

function aplicarFiltroGenero() {
  var grid = document.getElementById("grid-peliculas");

  var filtradas = [];
  for (var i = 0; i < peliculasCargadas.length; i++) {
    if (filtroGenero === "todos" ||
        obtenerGenero(peliculasCargadas[i].genre_ids) === filtroGenero) {
      filtradas.push(peliculasCargadas[i]);
    }
  }

  if (filtradas.length === 0) {
    grid.innerHTML =
      '<p class="cargando">No hay películas en este género para la categoría seleccionada.</p>';
    return;
  }

  grid.innerHTML = "";
  for (var i = 0; i < filtradas.length; i++) {
    grid.innerHTML += crearTarjetaHTML(filtradas[i]);
  }

  if (typeof actualizarBotonesGrid === "function") actualizarBotonesGrid();
}

// ── BÚSQUEDA ──────────────────────────────────────────────────────────

function configurarBuscador() {
  var input      = document.getElementById("input-buscar");
  var btnLimpiar = document.getElementById("btn-limpiar");

  input.addEventListener("input", function () {
    var texto = this.value.trim();

    if (texto.length > 0) {
      btnLimpiar.style.display = "block";
    } else {
      btnLimpiar.style.display = "none";
      cargarCategoria(categoriaActiva);
      return;
    }

    clearTimeout(temporizadorBusqueda);
    temporizadorBusqueda = setTimeout(async function () {
      await realizarBusqueda(texto);
    }, 500);
  });

  btnLimpiar.addEventListener("click", function () {
    input.value = "";
    this.style.display = "none";
    cargarCategoria(categoriaActiva);
    input.focus();
  });
}

async function realizarBusqueda(texto) {
  var grid = document.getElementById("grid-peliculas");
  var h2   = document.getElementById("catalogo-h2");

  grid.innerHTML = '<p class="cargando">Buscando...</p>';

  var resultados = await buscarPeliculas(texto);

  h2.innerHTML =
    "Resultados para <span style=\"color:white;\">“" + texto + "”</span> " +
    "<span style=\"color:rgba(255,255,255,0.3);font-size:13px;font-weight:400;\">— " +
    resultados.length + " películas</span>";

  if (resultados.length === 0) {
    grid.innerHTML = '<p class="error">No encontramos películas con ese nombre.</p>';
    return;
  }

  grid.innerHTML = "";
  for (var i = 0; i < resultados.length; i++) {
    grid.innerHTML += crearTarjetaHTML(resultados[i]);
  }

  if (typeof actualizarBotonesGrid === "function") actualizarBotonesGrid();
}

// ── FILTROS DE GÉNERO ─────────────────────────────────────────────────

function configurarFiltros() {
  var botones = document.querySelectorAll(".filtro");
  for (var i = 0; i < botones.length; i++) {
    botones[i].addEventListener("click", function () {
      for (var j = 0; j < botones.length; j++) botones[j].classList.remove("activo");
      this.classList.add("activo");
      filtroGenero = this.dataset.filtro;
      aplicarFiltroGenero();
    });
  }
}

// ── TABS DE CATEGORÍA ─────────────────────────────────────────────────

function configurarTabs() {
  var tabs    = document.querySelectorAll(".cat-tab");
  var filtros = document.querySelectorAll(".filtro");

  for (var i = 0; i < tabs.length; i++) {
    tabs[i].addEventListener("click", function () {
      for (var j = 0; j < tabs.length; j++) tabs[j].classList.remove("activo");
      this.classList.add("activo");

      // resetear género
      filtroGenero = "todos";
      for (var j = 0; j < filtros.length; j++) filtros[j].classList.remove("activo");
      document.querySelector(".filtro[data-filtro='todos']").classList.add("activo");

      cargarCategoria(this.dataset.categoria);
    });
  }
}

// ── INICIO ────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", function () {
  configurarTabs();
  configurarFiltros();
  configurarBuscador();
  cargarCategoria("popular");
});
