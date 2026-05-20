// Funciones para manejar películas marcadas como vistas.
// Se carga en cualquier página que necesite esta funcionalidad.

var _vistasCache = null;

async function cargarVistasCache() {
  if (!obtenerToken()) { _vistasCache = []; return; }
  var resp = await llamarAPI("/vistas");
  _vistasCache = (resp && resp.ok && resp.data) ? resp.data : [];
}

function obtenerVistas() {
  return _vistasCache || [];
}

function estaEnVistas(id) {
  var vistas = obtenerVistas();
  for (var i = 0; i < vistas.length; i++) {
    if (vistas[i].peliculaId === id) return true;
  }
  return false;
}

// pelicula: { id, titulo, imagen, anio }
async function toggleVista(pelicula, boton) {
  if (!obtenerUsuarioActivo()) {
    mostrarToast("Debes iniciar sesión.", "info");
    setTimeout(function () { window.location.href = "Login.html"; }, 1500);
    return;
  }

  if (estaEnVistas(pelicula.id)) {
    var resp = await llamarAPI("/vistas/" + pelicula.id, { method: "DELETE" });
    if (resp && resp.ok) {
      _vistasCache = _vistasCache.filter(function (v) { return v.peliculaId !== pelicula.id; });
      if (boton) { boton.textContent = "Marcar como vista"; boton.classList.remove("vista"); }
    }
  } else {
    var dto = {
      peliculaId: pelicula.id,
      titulo: pelicula.titulo,
      imagen: pelicula.imagen || null,
      anio: pelicula.anio || null
    };
    var resp = await llamarAPI("/vistas", { method: "POST", body: dto });
    if (resp && resp.ok) {
      if (!_vistasCache) _vistasCache = [];
      _vistasCache.push(dto);
      if (boton) { boton.textContent = "✓ Vista"; boton.classList.add("vista"); }
    }
  }
}
