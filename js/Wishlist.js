// WISHLIST.JS
// Cargado en todas las páginas principales. Define helpers globales de API,
// toast, confirm modal, sesión y gestión de wishlist con caché.

// ── API HELPER ────────────────────────────────────────────────────────

function obtenerToken() {
  return localStorage.getItem("token");
}

async function llamarAPI(endpoint, opciones) {
  var token = obtenerToken();
  var headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = "Bearer " + token;

  var config = Object.assign({ headers: headers }, opciones || {});
  if (config.body && typeof config.body === "object") {
    config.body = JSON.stringify(config.body);
  }

  try {
    var res = await fetch(CONFIG.API_URL + endpoint, config);
    return await res.json();
  } catch (err) {
    console.error("Error de red:", err);
    return { ok: false, mensaje: "Error de red." };
  }
}

// ── ACCESO AL USUARIO ─────────────────────────────────────────────────

function obtenerUsuarioActivo() {
  return JSON.parse(localStorage.getItem("usuarioActivo"));
}

// ── CACHÉ DE WISHLIST ─────────────────────────────────────────────────

var _wlCache = null;

async function cargarWishlistCache() {
  if (!obtenerToken()) { _wlCache = []; return true; }
  var resp = await llamarAPI("/wishlist");
  if (resp && resp.ok) {
    _wlCache = resp.data || [];
    return true;
  }
  _wlCache = [];
  return false;
}

function obtenerWishlist() {
  return _wlCache || [];
}

function estaEnWishlist(id) {
  var wl = obtenerWishlist();
  for (var i = 0; i < wl.length; i++) {
    if (wl[i].peliculaId === id) return true;
  }
  return false;
}

// ── TOGGLE: agregar o quitar ──────────────────────────────────────────

async function toggleWishlist(pelicula, boton) {
  if (!obtenerUsuarioActivo()) {
    mostrarToast("Debes iniciar sesión para guardar películas.", "info");
    setTimeout(function () { window.location.href = "Login.html"; }, 1500);
    return;
  }

  if (estaEnWishlist(pelicula.id)) {
    var resp = await llamarAPI("/wishlist/" + pelicula.id, { method: "DELETE" });
    if (resp && resp.ok) {
      _wlCache = _wlCache.filter(function (i) { return i.peliculaId !== pelicula.id; });
      if (boton) { boton.textContent = "+ Mi lista"; boton.classList.remove("en-lista"); }
    } else {
      mostrarToast(resp && resp.mensaje ? resp.mensaje : "No se pudo quitar de la lista.", "error");
    }
  } else {
    var dto = {
      peliculaId: pelicula.id,
      titulo: pelicula.titulo,
      imagen: pelicula.imagen || null,
      calificacion: pelicula.calificacion || null,
      anio: pelicula.anio || null
    };
    var resp = await llamarAPI("/wishlist", { method: "POST", body: dto });
    if (resp && resp.ok) {
      if (!_wlCache) _wlCache = [];
      _wlCache.push(dto);
      if (boton) { boton.textContent = "✓ En lista"; boton.classList.add("en-lista"); }
    } else {
      mostrarToast(resp && resp.mensaje ? resp.mensaje : "No se pudo agregar a la lista.", "error");
    }
  }
}

// ── FUNCIONES POR CONTEXTO ────────────────────────────────────────────

function toggleWishlistSlider(boton) {
  var pelicula = {
    id: parseInt(boton.dataset.id),
    titulo: boton.dataset.titulo,
    imagen: boton.dataset.imagen || "",
    calificacion: parseFloat(boton.dataset.calificacion),
    anio: boton.dataset.anio,
  };
  toggleWishlist(pelicula, boton);
}

function toggleWishlistCard(boton) {
  var tarjeta = boton.closest(".tarjeta");
  var pelicula = {
    id: parseInt(tarjeta.dataset.id),
    titulo: tarjeta.dataset.titulo,
    imagen: tarjeta.dataset.imagen,
    calificacion: parseFloat(tarjeta.dataset.calificacion),
    anio: tarjeta.dataset.anio,
  };
  toggleWishlist(pelicula, boton);
}

// ── ACTUALIZAR ESTADO VISUAL ──────────────────────────────────────────

function actualizarBotonesGrid() {
  var botones = document.querySelectorAll(".btn-wishlist-card");
  botones.forEach(function (boton) {
    var tarjeta = boton.closest(".tarjeta");
    if (!tarjeta) return;
    var id = parseInt(tarjeta.dataset.id);
    if (estaEnWishlist(id)) {
      boton.textContent = "✓ En lista";
      boton.classList.add("en-lista");
    }
  });
}

function actualizarBotonesSlider() {
  var botones = document.querySelectorAll(".btn-wishlist");
  botones.forEach(function (boton) {
    var id = parseInt(boton.dataset.id);
    if (id && estaEnWishlist(id)) {
      boton.textContent = "✓ En lista";
      boton.classList.add("en-lista");
    }
  });
}

// ── TOAST ─────────────────────────────────────────────────────────────

function mostrarToast(texto, tipo) {
  var t = document.getElementById("pb-toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "pb-toast";
    t.className = "pb-toast";
    document.body.appendChild(t);
  }
  t.textContent = texto;
  t.className = "pb-toast pb-toast-" + (tipo || "info");
  requestAnimationFrame(function () {
    t.classList.add("pb-toast-visible");
  });
  clearTimeout(t._timer);
  t._timer = setTimeout(function () {
    t.classList.remove("pb-toast-visible");
  }, 3000);
}

// ── CONFIRM MODAL ─────────────────────────────────────────────────────

function mostrarConfirm(texto, callback) {
  var overlay = document.createElement("div");
  overlay.className = "pb-confirm-overlay";
  overlay.innerHTML =
    '<div class="pb-confirm-box">' +
      '<p class="pb-confirm-texto">' + texto + "</p>" +
      '<div class="pb-confirm-botones">' +
        '<button class="pb-confirm-btn pb-confirm-cancelar">Cancelar</button>' +
        '<button class="pb-confirm-btn pb-confirm-ok">Confirmar</button>' +
      "</div>" +
    "</div>";
  document.body.appendChild(overlay);
  function cerrar(resultado) {
    document.body.removeChild(overlay);
    callback(resultado);
  }
  overlay.querySelector(".pb-confirm-cancelar").addEventListener("click", function () { cerrar(false); });
  overlay.querySelector(".pb-confirm-ok").addEventListener("click", function () { cerrar(true); });
}

// ── SESIÓN ────────────────────────────────────────────────────────────

function cerrarSesion() {
  localStorage.removeItem("usuarioActivo");
  localStorage.removeItem("token");
  window.location.href = "Login.html";
}

// Actualiza navbar y precarga el caché de wishlist en cuanto el DOM está listo
document.addEventListener("DOMContentLoaded", function () {
  var usuario = obtenerUsuarioActivo();
  var slot = document.getElementById("nav-usuario");
  if (slot) {
    if (usuario) {
      var primerNombre = usuario.nombre.split(" ")[0];
      slot.innerHTML = '<a href="Perfil.html" class="nav-usuario-link">' + primerNombre + "</a>";
    } else {
      slot.innerHTML = '<a href="Login.html" class="nav-usuario-link">Iniciar sesión</a>';
    }
  }

  if (obtenerToken()) cargarWishlistCache();
});
