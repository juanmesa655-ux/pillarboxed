// Logica de la pagina Wishlist.html

function crearTarjetaWishlist(item) {
  var imagen = item.imagen ? CONFIG.IMAGE_URL + item.imagen : null;

  return `
    <a href="Peliculas.html?id=${item.peliculaId}" class="tarjeta-link">
      <div class="tarjeta" data-id="${item.peliculaId}">
        <div class="poster-container">
          ${imagen
            ? `<img src="${imagen}" alt="${item.titulo}" class="poster-imagen">`
            : `<div class="poster-p1">Sin poster</div>`
          }
        </div>
        <p class="titulo">${item.titulo}</p>
        <p class="año">★ ${item.calificacion || "N/A"} | ${item.anio || "N/A"}</p>
        <button class="btn-wishlist-card en-lista"
          onclick="event.preventDefault(); event.stopPropagation(); quitarDeLista(${item.peliculaId}, this)">
          ✓ Quitar
        </button>
      </div>
    </a>
  `;
}

async function quitarDeLista(peliculaId, boton) {
  var resp = await llamarAPI("/wishlist/" + peliculaId, { method: "DELETE" });
  if (!resp || !resp.ok) return;

  _wlCache = _wlCache ? _wlCache.filter(function (i) { return i.peliculaId !== peliculaId; }) : [];

  var tarjeta = boton.closest(".tarjeta-link");
  tarjeta.style.transition = "opacity 0.3s ease, transform 0.3s ease";
  tarjeta.style.opacity = "0";
  tarjeta.style.transform = "scale(0.9)";

  setTimeout(function () {
    tarjeta.remove();
    actualizarContador();
    if (document.querySelectorAll(".tarjeta-link").length === 0) {
      document.getElementById("wishlist-vacia").style.display = "block";
      document.getElementById("seccion-lista").style.display = "none";
    }
  }, 300);
}

function actualizarContador() {
  var count = document.querySelectorAll(".tarjeta-link").length;
  var titulo = document.getElementById("titulo-lista");
  titulo.textContent = count > 0
    ? "Mi lista (" + count + " películas)"
    : "Mi lista";
}

async function renderizarWishlist() {
  var grid = document.getElementById("grid-wishlist");
  var seccion = document.getElementById("seccion-lista");
  var vacia = document.getElementById("wishlist-vacia");

  grid.innerHTML = '<p class="cargando">Cargando tu lista...</p>';
  var exito = await cargarWishlistCache();

  if (!exito) {
    vacia.style.display = "none";
    seccion.style.display = "block";
    grid.innerHTML = '<p class="error">No se pudo cargar tu lista. Verifica que el servidor esté activo.</p>';
    return;
  }

  var wishlist = obtenerWishlist();

  if (wishlist.length === 0) {
    vacia.style.display = "block";
    seccion.style.display = "none";
    return;
  }

  vacia.style.display = "none";
  seccion.style.display = "block";
  grid.innerHTML = "";
  for (var i = 0; i < wishlist.length; i++) {
    grid.innerHTML += crearTarjetaWishlist(wishlist[i]);
  }
  actualizarContador();
}

if (!obtenerUsuarioActivo()) {
  window.location.href = "Login.html";
} else {
  renderizarWishlist();
}
