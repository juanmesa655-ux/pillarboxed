// Logica principal de index.html

var temporizadorBusqueda;

// ── MAPAS DE GÉNERO ───────────────────────────────────────────────────

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

var NOMBRES_GENERO = {
  28: "Acción",    12: "Aventura",  878: "Ciencia Ficción", 14: "Fantasía",
  35: "Comedia",   18: "Drama",      27: "Terror",          53: "Suspenso",
  80: "Crimen",    99: "Documental", 10749: "Romance",      36: "Historia",
};

function obtenerGenero(genre_ids) {
  if (!genre_ids || genre_ids.length === 0) return "todos";
  for (var i = 0; i < genre_ids.length; i++) {
    if (MAPA_GENEROS[genre_ids[i]]) return MAPA_GENEROS[genre_ids[i]];
  }
  return "todos";
}

function obtenerGeneroNombre(genre_ids) {
  if (!genre_ids || !genre_ids.length) return "Película";
  return NOMBRES_GENERO[genre_ids[0]] || "Película";
}

// ── TARJETA HTML ──────────────────────────────────────────────────────

function crearTarjetaHTML(pelicula) {
  var año = pelicula.release_date ? pelicula.release_date.split("-")[0] : "N/A";
  var rating = pelicula.vote_average ? pelicula.vote_average.toFixed(1) : "N/A";
  var poster = pelicula.poster_path ? CONFIG.IMAGE_URL + pelicula.poster_path : null;
  var genero = obtenerGenero(pelicula.genre_ids);

  return '<a href="Peliculas.html?id=' + pelicula.id + '" class="tarjeta-link">' +
    '<div class="tarjeta" data-genero="' + genero + '"' +
      ' data-id="' + pelicula.id + '"' +
      ' data-titulo="' + pelicula.title.replace(/"/g, '&quot;') + '"' +
      ' data-imagen="' + (pelicula.poster_path || '') + '"' +
      ' data-calificacion="' + (pelicula.vote_average || 0) + '"' +
      ' data-anio="' + año + '">' +
      '<div class="poster-container">' +
        (poster
          ? '<img src="' + poster + '" alt="' + pelicula.title.replace(/"/g, '&quot;') + '" class="poster-imagen">'
          : '<div class="poster-p1">Sin poster</div>'
        ) +
        '<div class="rating-badge">&#9733; ' + rating + '</div>' +
      '</div>' +
      '<p class="titulo">' + pelicula.title + '</p>' +
      '<p class="año">' + año + '</p>' +
      '<button class="btn-wishlist-card"' +
        ' onclick="event.preventDefault(); event.stopPropagation(); toggleWishlistCard(this)">' +
        '+ Mi lista' +
      '</button>' +
    '</div>' +
  '</a>';
}

// ── HERO SLIDER DINÁMICO ──────────────────────────────────────────────

async function cargarHeroSlider(peliculasPreCargadas) {
  var slider = document.getElementById("hero-slider");
  var dotsContainer = document.getElementById("hero-dots");
  if (!slider || !dotsContainer) return;

  var peliculas = (peliculasPreCargadas && peliculasPreCargadas.length)
    ? peliculasPreCargadas
    : await obtenerPeliculasPopulares();

  if (!peliculas.length) return;

  document.querySelectorAll(".hero-slide").forEach(function (s) { s.remove(); });
  dotsContainer.innerHTML = "";

  var insertBefore = slider.querySelector(".slider-btn");
  var primeras = peliculas.slice(0, 4);

  primeras.forEach(function (pelicula, i) {
    var year = pelicula.release_date ? pelicula.release_date.split("-")[0] : "N/A";
    var rating = pelicula.vote_average ? pelicula.vote_average.toFixed(1) : "N/A";
    var generoNombre = obtenerGeneroNombre(pelicula.genre_ids);
    var descripcion = pelicula.overview
      ? (pelicula.overview.length > 150 ? pelicula.overview.substring(0, 150) + "..." : pelicula.overview)
      : "";
    var titulo = pelicula.title.replace(/"/g, "&quot;").replace(/'/g, "&#39;");

    var slide = document.createElement("div");
    slide.className = "hero-slide" + (i === 0 ? " activo" : "");
    slide.dataset.id = pelicula.id;

    if (pelicula.backdrop_path) {
      slide.style.backgroundImage =
        "linear-gradient(to right, rgba(13,13,13,0.97) 35%, rgba(13,13,13,0.25)), " +
        "url(https://image.tmdb.org/t/p/w1280" + pelicula.backdrop_path + ")";
    } else {
      slide.style.background = "linear-gradient(to right, #0d0d0d 40%, #1a0a1a)";
    }

    slide.innerHTML =
      '<div class="hero-content">' +
        '<span class="badge">Destacado</span>' +
        '<h1>' + pelicula.title + '</h1>' +
        '<p class="meta">&#9733; ' + rating + ' &nbsp;|&nbsp; ' + year + ' &nbsp;|&nbsp; ' + generoNombre + '</p>' +
        '<p class="descripcion">' + descripcion + '</p>' +
        '<div class="botones">' +
          '<button class="btn-primary" onclick="event.stopPropagation(); window.location.href=\'404.html\'">&#9654; Reproducir</button>' +
          '<button class="btn-secondary btn-wishlist"' +
            ' data-id="' + pelicula.id + '"' +
            ' data-titulo="' + titulo + '"' +
            ' data-imagen="' + (pelicula.poster_path || '') + '"' +
            ' data-calificacion="' + (pelicula.vote_average || 0) + '"' +
            ' data-anio="' + year + '"' +
            ' onclick="event.stopPropagation(); toggleWishlistSlider(this)">+ Mi lista</button>' +
        '</div>' +
      '</div>';

    slider.insertBefore(slide, insertBefore);

    var dot = document.createElement("button");
    dot.className = "slider-dot" + (i === 0 ? " activo" : "");
    (function (idx) {
      dot.addEventListener("click", function () { irASlide(idx); });
    })(i);
    dotsContainer.appendChild(dot);
  });

  inicializarSlider();
}

// ── BUSCADOR ──────────────────────────────────────────────────────────

function configurarBuscador() {
  var input = document.getElementById("input-buscar");
  var btnLimpiar = document.getElementById("btn-limpiar");
  if (!input || !btnLimpiar) return;

  input.addEventListener("input", function () {
    var texto = this.value.trim();
    if (texto.length > 0) {
      btnLimpiar.style.display = "block";
    } else {
      btnLimpiar.style.display = "none";
      mostrarPeliculasPopulares();
      return;
    }
    clearTimeout(temporizadorBusqueda);
    temporizadorBusqueda = setTimeout(function () {
      realizarBusqueda(texto);
    }, 500);
  });

  btnLimpiar.addEventListener("click", function () {
    input.value = "";
    this.style.display = "none";
    mostrarPeliculasPopulares();
    input.focus();
  });
}

async function realizarBusqueda(texto) {
  var grid = document.getElementById("grid-peliculas");
  var h2 = document.querySelector(".seccion-header h2");

  grid.innerHTML = '<p class="cargando">Buscando...</p>';
  var resultados = await buscarPeliculas(texto);

  h2.innerHTML =
    'Resultados para <span style="color:white;">"' + texto + '"</span> ' +
    '<span style="color:rgba(255,255,255,0.3);font-size:13px;font-weight:400;">— ' +
    resultados.length + ' películas</span>';

  if (resultados.length === 0) {
    grid.innerHTML = '<p class="error">No encontramos películas con ese nombre.</p>';
    return;
  }

  grid.innerHTML = "";
  resultados.forEach(function (pelicula) { grid.innerHTML += crearTarjetaHTML(pelicula); });
  if (typeof actualizarBotonesGrid === "function") actualizarBotonesGrid();
}

async function mostrarPeliculasPopulares() {
  var grid = document.getElementById("grid-peliculas");
  var h2 = document.querySelector(".seccion-header h2");
  h2.textContent = "Tendencias";
  grid.innerHTML = '<p class="cargando">Cargando películas...</p>';

  var peliculas = await obtenerPeliculasPopulares();
  if (peliculas.length === 0) {
    grid.innerHTML = '<p class="error">No se pudieron cargar las películas.</p>';
    return;
  }
  grid.innerHTML = "";
  peliculas.forEach(function (pelicula) { grid.innerHTML += crearTarjetaHTML(pelicula); });
  if (typeof actualizarBotonesGrid === "function") actualizarBotonesGrid();
}

// ── INICIO ────────────────────────────────────────────────────────────

async function IniciarWeb() {
  var grid = document.getElementById("grid-peliculas");
  grid.innerHTML = '<p class="cargando">Cargando películas...</p>';
  configurarBuscador();

  var peliculas = await obtenerPeliculasPopulares();

  cargarHeroSlider(peliculas);

  if (peliculas.length === 0) {
    grid.innerHTML = '<p class="error">No se pudieron cargar las películas. Verifica tu conexión.</p>';
    return;
  }

  grid.innerHTML = "";
  peliculas.forEach(function (pelicula) { grid.innerHTML += crearTarjetaHTML(pelicula); });
  if (typeof actualizarBotonesGrid === "function") actualizarBotonesGrid();
}

document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("grid-peliculas")) {
    IniciarWeb();
  }
});
