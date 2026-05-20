// Logica de la pagina de detalle de pelicula

// datos de la película actual (se rellenan en renderizarDetalle)
var peliculaActual = null;

async function iniciarDetalle() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    window.location.href = "Index.html";
    return;
  }

  document.getElementById("detalle-titulo").textContent = "Cargando...";

  const [pelicula, creditos, similares] = await Promise.all([
    obtenerDetallePelicula(id),
    obtenerCreditos(id),
    obtenerPeliculasSimilares(id),
  ]);

  if (!pelicula) {
    document.getElementById("detalle-titulo").textContent = "Película no encontrada";
    return;
  }

  peliculaActual = pelicula;

  renderizarDetalle(pelicula, creditos);
  renderizarSimilares(similares);
  inicializarBotonesDetalle(pelicula);

  if (typeof renderizarSeccionResenas === "function") {
    renderizarSeccionResenas(pelicula);
  }
}

function renderizarDetalle(pelicula, creditos) {
  const contenedorPoster = document.getElementById("detalle-poster");
  if (pelicula.poster_path) {
    contenedorPoster.innerHTML = `
      <img
        src="${CONFIG.IMAGE_URL}${pelicula.poster_path}"
        alt="${pelicula.title}"
        style="width:100%; height:100%; object-fit:cover; border-radius:12px;"
      >
    `;
  } else {
    contenedorPoster.textContent = "Sin poster";
  }

  document.getElementById("detalle-titulo").textContent = pelicula.title;

  const año = pelicula.release_date ? pelicula.release_date.split("-")[0] : "N/A";
  const duracion = pelicula.runtime
    ? `${Math.floor(pelicula.runtime / 60)}h ${pelicula.runtime % 60}m`
    : "N/A";
  const rating = pelicula.vote_average ? pelicula.vote_average.toFixed(1) : "N/A";

  const generosHTML = pelicula.genres
    .map((g) => `<span class="genero-badge">${g.name}</span>`)
    .join("");

  document.getElementById("detalle-meta").innerHTML =
    `<span class="rating">★ ${rating}</span>
    <span>${año}</span>
    <span>${duracion}</span>
    ${generosHTML}`;

  document.getElementById("detalle-descripcion").textContent =
    pelicula.overview || "Sin descripción disponible.";

  const director = creditos?.crew?.find((p) => p.job === "Director");
  const actores = creditos?.cast?.slice(0, 4).map((a) => a.name).join(", ");
  const idioma = pelicula.original_language?.toUpperCase() || "N/A";

  document.getElementById("detalle-ficha").innerHTML = `
    <div class="ficha-fila">
      <span class="etiqueta">Director</span>
      <span class="valor">${director ? director.name : "N/A"}</span>
    </div>
    <div class="ficha-fila">
      <span class="etiqueta">Reparto</span>
      <span class="valor">${actores || "N/A"}</span>
    </div>
    <div class="ficha-fila">
      <span class="etiqueta">País</span>
      <span class="valor">${pelicula.production_countries?.[0]?.name || "N/A"}</span>
    </div>
    <div class="ficha-fila">
      <span class="etiqueta">Idioma</span>
      <span class="valor">${idioma}</span>
    </div>
    <div class="ficha-fila">
      <span class="etiqueta">Votos</span>
      <span class="valor">${pelicula.vote_count?.toLocaleString() || "N/A"}</span>
    </div>
  `;
}

function inicializarBotonesDetalle(pelicula) {
  var btnWishlist = document.getElementById("btn-wishlist-detalle");
  var btnVista = document.getElementById("btn-vista-detalle");

  if (btnWishlist && typeof estaEnWishlist === "function") {
    if (estaEnWishlist(pelicula.id)) {
      btnWishlist.textContent = "✓ En lista";
      btnWishlist.classList.add("en-lista");
    }
  }

  if (btnVista && typeof estaEnVistas === "function") {
    if (estaEnVistas(pelicula.id)) {
      btnVista.textContent = "✓ Vista";
      btnVista.classList.add("vista");
    }
  }
}

function toggleWishlistDetalle(boton) {
  if (!peliculaActual) return;
  var año = peliculaActual.release_date
    ? peliculaActual.release_date.split("-")[0]
    : "N/A";
  var pelicula = {
    id: peliculaActual.id,
    titulo: peliculaActual.title,
    imagen: peliculaActual.poster_path || "",
    calificacion: peliculaActual.vote_average || 0,
    anio: año,
  };
  toggleWishlist(pelicula, boton);
}

function toggleVistaDetalle(boton) {
  if (!peliculaActual) return;
  var año = peliculaActual.release_date
    ? peliculaActual.release_date.split("-")[0]
    : "N/A";
  var pelicula = {
    id: peliculaActual.id,
    titulo: peliculaActual.title,
    imagen: peliculaActual.poster_path || "",
    anio: año,
  };
  toggleVista(pelicula, boton);
}

function renderizarSimilares(similares) {
  const grid = document.getElementById("grid-relacionadas");

  if (similares.length === 0) {
    grid.innerHTML = '<p class="cargando">No hay películas similares.</p>';
    return;
  }

  grid.innerHTML = "";
  similares.forEach(function (pelicula) {
    if (!pelicula.release_date) return;
    grid.innerHTML += crearTarjetaHTML(pelicula);
  });

  if (typeof actualizarBotonesGrid === "function") actualizarBotonesGrid();
}

document.addEventListener("DOMContentLoaded", iniciarDetalle);
