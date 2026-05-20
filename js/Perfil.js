// Logica de la pagina de perfil

async function iniciarPerfil() {
  var usuario = obtenerUsuarioActivo();
  if (!usuario) {
    window.location.href = "Login.html";
    return;
  }

  renderizarCabecera(usuario);

  // Cargar datos desde la API en paralelo
  await Promise.all([cargarWishlistCache(), cargarVistasCache()]);
  var misResenas = await cargarMisResenas();

  renderizarEstadisticas(misResenas);
  renderizarWishlistPerfil();
  renderizarVistasPerfil();
  renderizarResenasPerfil(misResenas);
}

// ── CABECERA ──────────────────────────────────────────────────────────

function renderizarCabecera(usuario) {
  var iniciales = usuario.nombre.trim().charAt(0).toUpperCase();
  document.getElementById("perfil-avatar").textContent = iniciales;
  document.getElementById("perfil-nombre").textContent = usuario.nombre;
  document.getElementById("perfil-email").textContent = usuario.email;
}

// ── CARGA DE RESEÑAS ──────────────────────────────────────────────────

async function cargarMisResenas() {
  var resp = await llamarAPI("/resenas/mias");
  return (resp && resp.ok && resp.data) ? resp.data : [];
}

// ── ESTADÍSTICAS ──────────────────────────────────────────────────────

function renderizarEstadisticas(resenas) {
  document.getElementById("stat-lista").textContent   = obtenerWishlist().length;
  document.getElementById("stat-vistas").textContent  = obtenerVistas().length;
  document.getElementById("stat-resenas").textContent = resenas.length;
}

// ── MI LISTA ──────────────────────────────────────────────────────────

function renderizarWishlistPerfil() {
  var wishlist   = obtenerWishlist();
  var contenedor = document.getElementById("perfil-lista");

  if (wishlist.length === 0) {
    contenedor.innerHTML = '<p class="perfil-vacio">Tu lista está vacía.</p>';
    return;
  }

  var html = "";
  for (var i = 0; i < wishlist.length; i++) {
    html += htmlTarjetaCompacta({
      id:     wishlist[i].peliculaId,
      titulo: wishlist[i].titulo,
      imagen: wishlist[i].imagen,
      anio:   wishlist[i].anio
    });
  }
  contenedor.innerHTML = html;
}

// ── VISTAS ────────────────────────────────────────────────────────────

function renderizarVistasPerfil() {
  var vistas     = obtenerVistas();
  var contenedor = document.getElementById("perfil-vistas");

  if (vistas.length === 0) {
    contenedor.innerHTML = '<p class="perfil-vacio">Aún no has marcado ninguna película como vista.</p>';
    return;
  }

  var html = "";
  for (var i = 0; i < vistas.length; i++) {
    html += htmlTarjetaCompacta({
      id:     vistas[i].peliculaId,
      titulo: vistas[i].titulo,
      imagen: vistas[i].imagen,
      anio:   vistas[i].anio
    });
  }
  contenedor.innerHTML = html;
}

// ── RESEÑAS ───────────────────────────────────────────────────────────

function renderizarResenasPerfil(resenas) {
  var contenedor = document.getElementById("perfil-resenas");

  if (resenas.length === 0) {
    contenedor.innerHTML = '<p class="perfil-vacio">Aún no has escrito ninguna reseña.</p>';
    return;
  }

  var html = "";
  for (var i = 0; i < resenas.length; i++) html += htmlResenaPerfilCard(resenas[i]);
  contenedor.innerHTML = html;
}

// ── HTML HELPERS ──────────────────────────────────────────────────────

function htmlTarjetaCompacta(pelicula) {
  var imagen = pelicula.imagen ? CONFIG.IMAGE_URL + pelicula.imagen : null;
  var imgHTML = imagen
    ? `<img src="${imagen}" alt="${pelicula.titulo}" class="tarjeta-compacta-img">`
    : `<div class="tarjeta-compacta-img" style="display:flex;align-items:center;justify-content:center;font-size:11px;color:rgba(255,255,255,0.3);">Sin poster</div>`;

  return `
    <a href="Peliculas.html?id=${pelicula.id}" class="tarjeta-compacta-link">
      <div class="tarjeta-compacta">
        ${imgHTML}
        <p class="tarjeta-compacta-titulo">${pelicula.titulo}</p>
        <p class="tarjeta-compacta-anio">${pelicula.anio || ""}</p>
      </div>
    </a>
  `;
}

function htmlResenaPerfilCard(resena) {
  var imagen = resena.imagenPelicula ? CONFIG.IMAGE_URL + resena.imagenPelicula : null;
  var estrellas = "";
  for (var i = 1; i <= 5; i++) estrellas += i <= resena.calificacion ? "★" : "☆";

  var imgHTML = imagen
    ? `<img src="${imagen}" alt="${resena.tituloPelicula}" class="resena-perfil-img">`
    : `<div class="resena-perfil-img" style="display:flex;align-items:center;justify-content:center;font-size:10px;color:rgba(255,255,255,0.3);">Sin poster</div>`;

  return `
    <a href="Peliculas.html?id=${resena.peliculaId}" class="resena-perfil">
      ${imgHTML}
      <div class="resena-perfil-contenido">
        <p class="resena-perfil-titulo">${resena.tituloPelicula}</p>
        <div class="resena-perfil-meta">
          <span class="resena-perfil-estrellas">${estrellas}</span>
          <span class="resena-perfil-fecha">${resena.fecha}</span>
        </div>
        ${resena.texto
          ? `<p class="resena-perfil-texto">${resena.texto}</p>`
          : '<p class="resena-perfil-texto" style="font-style:italic;opacity:0.5">Sin comentario</p>'
        }
      </div>
    </a>
  `;
}

// ── CERRAR SESIÓN ─────────────────────────────────────────────────────

function cerrarSesion() {
  localStorage.removeItem("usuarioActivo");
  localStorage.removeItem("token");
  window.location.href = "Login.html";
}

// ── INICIO ────────────────────────────────────────────────────────────

iniciarPerfil();
