// Logica de la página principal del foro (Foro.html)

// ── RENDER ────────────────────────────────────────────────────────────

function htmlHiloCard(hilo) {
  var n = hilo.totalRespuestas || 0;
  var extracto = hilo.texto && hilo.texto.length > 130
    ? hilo.texto.substring(0, 130) + "..."
    : (hilo.texto || "");

  return `
    <a href="Hilo.html?id=${hilo.id}" class="hilo-card">
      <div>
        <h3 class="hilo-titulo">${hilo.titulo}</h3>
        ${extracto ? `<p class="hilo-extracto">${extracto}</p>` : ""}
      </div>
      <div class="hilo-meta">
        <span class="hilo-autor">${hilo.autorNombre}</span>
        <span class="hilo-fecha">${hilo.fecha}</span>
        <span class="hilo-respuestas">${n} ${n === 1 ? "respuesta" : "respuestas"}</span>
      </div>
    </a>
  `;
}

async function renderizarHilos() {
  var contenedor = document.getElementById("lista-hilos");
  contenedor.innerHTML = '<p class="foro-vacio">Cargando hilos...</p>';

  var resp = await llamarAPI("/foro");

  if (!resp || !resp.ok) {
    contenedor.innerHTML = '<p class="foro-vacio">No se pudieron cargar los hilos. Verifica que el servidor esté activo.</p>';
    return;
  }

  var hilos = resp.data || [];

  if (hilos.length === 0) {
    contenedor.innerHTML = '<p class="foro-vacio">No hay hilos aún. ¡Sé el primero en publicar!</p>';
    return;
  }

  var html = "";
  for (var i = 0; i < hilos.length; i++) {
    html += htmlHiloCard(hilos[i]);
  }
  contenedor.innerHTML = html;
}

// ── FORMULARIO ────────────────────────────────────────────────────────

function toggleFormulario() {
  var form = document.getElementById("form-nuevo-hilo");
  var btn  = document.getElementById("btn-nuevo-hilo");
  var visible = form.classList.contains("visible");

  if (visible) {
    form.classList.remove("visible");
    btn.textContent = "+ Nuevo hilo";
  } else {
    form.classList.add("visible");
    btn.textContent = "Cancelar";
    document.getElementById("input-titulo").focus();
  }
}

async function publicarHilo() {
  var usuario = obtenerUsuarioActivo();
  if (!usuario) return;

  var titulo = document.getElementById("input-titulo").value.trim();
  var texto  = document.getElementById("input-texto").value.trim();

  if (!titulo) {
    mostrarToast("Escribe un título para el hilo.", "error");
    return;
  }

  var resp = await llamarAPI("/foro", {
    method: "POST",
    body: { titulo: titulo, texto: texto }
  });

  if (!resp || !resp.ok) {
    mostrarToast(resp && resp.mensaje ? resp.mensaje : "No se pudo publicar el hilo.", "error");
    return;
  }

  document.getElementById("input-titulo").value = "";
  document.getElementById("input-texto").value  = "";
  toggleFormulario();
  renderizarHilos();
}

// ── INICIO ────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", function () {
  var usuario = obtenerUsuarioActivo();
  var btnNuevo = document.getElementById("btn-nuevo-hilo");

  if (!usuario && btnNuevo) {
    btnNuevo.style.display = "none";
  }

  renderizarHilos();
});
