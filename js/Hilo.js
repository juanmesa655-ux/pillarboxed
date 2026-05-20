// Logica de la página de un hilo individual (Hilo.html)

var hiloActual = null;   // HiloDto
var respuestasActuales = []; // RespuestaDto[]

// ── INICIO ────────────────────────────────────────────────────────────

async function iniciarHilo() {
  var params = new URLSearchParams(window.location.search);
  var id = parseInt(params.get("id"));

  if (!id) {
    window.location.href = "Foro.html";
    return;
  }

  var resp = await llamarAPI("/foro/" + id);
  if (!resp || !resp.ok || !resp.data) {
    document.getElementById("hilo-titulo").textContent = "Hilo no encontrado";
    return;
  }

  hiloActual = resp.data.hilo;
  respuestasActuales = resp.data.respuestas || [];

  renderizarPost();
  renderizarRespuestas();
  renderizarFormRespuesta();
}

// ── POST ORIGINAL ─────────────────────────────────────────────────────

function renderizarPost() {
  var usuario = obtenerUsuarioActivo();

  document.title = hiloActual.titulo + " - Pillarboxed";
  document.getElementById("hilo-titulo").textContent = hiloActual.titulo;
  document.getElementById("hilo-autor").textContent  = hiloActual.autorNombre;
  document.getElementById("hilo-fecha").textContent  = hiloActual.fecha;
  document.getElementById("hilo-texto").textContent  = hiloActual.texto || "";

  if (usuario && usuario.id === hiloActual.usuarioId) {
    document.getElementById("btn-eliminar-hilo").style.display = "inline-flex";
  }
}

// ── RESPUESTAS ────────────────────────────────────────────────────────

function renderizarRespuestas() {
  var usuario    = obtenerUsuarioActivo();
  var contenedor = document.getElementById("lista-respuestas");
  var contador   = document.getElementById("contador-respuestas");
  var n = respuestasActuales.length;

  contador.textContent = n + " " + (n === 1 ? "respuesta" : "respuestas");

  if (n === 0) {
    contenedor.innerHTML =
      '<p class="foro-vacio">Aún no hay respuestas. ¡Sé el primero!</p>';
    return;
  }

  var html = "";
  for (var i = 0; i < respuestasActuales.length; i++) {
    html += htmlRespuestaCard(respuestasActuales[i], usuario);
  }
  contenedor.innerHTML = html;
}

function htmlRespuestaCard(respuesta, usuario) {
  var esPropia = usuario && usuario.id === respuesta.usuarioId;

  return `
    <div class="respuesta-card${esPropia ? " propia" : ""}">
      <div class="respuesta-header">
        <span class="respuesta-autor">${respuesta.autorNombre}</span>
        <span class="respuesta-fecha">${respuesta.fecha}</span>
        ${esPropia
          ? `<button class="btn-eliminar-respuesta"
               onclick="eliminarRespuesta(${respuesta.id})">Eliminar</button>`
          : ""}
      </div>
      <p class="respuesta-texto">${respuesta.texto}</p>
    </div>
  `;
}

// ── FORMULARIO DE RESPUESTA ───────────────────────────────────────────

function renderizarFormRespuesta() {
  var usuario = obtenerUsuarioActivo();
  var formDiv = document.getElementById("form-respuesta");

  if (!usuario) {
    formDiv.innerHTML =
      '<p class="foro-vacio"><a href="Login.html" class="link-rojo">' +
      "Inicia sesión</a> para responder.</p>";
    return;
  }

  formDiv.innerHTML = `
    <h3 class="form-respuesta-titulo">Tu respuesta</h3>
    <textarea id="input-respuesta" class="foro-textarea"
      placeholder="Escribe tu respuesta..." rows="4"></textarea>
    <button class="btn-primary" onclick="publicarRespuesta()">Responder</button>
  `;
}

// ── ACCIONES ──────────────────────────────────────────────────────────

async function publicarRespuesta() {
  var usuario = obtenerUsuarioActivo();
  if (!usuario) return;

  var texto = document.getElementById("input-respuesta").value.trim();
  if (!texto) {
    mostrarToast("Escribe tu respuesta.", "error");
    return;
  }

  var resp = await llamarAPI("/foro/" + hiloActual.id + "/respuestas", {
    method: "POST",
    body: { texto: texto }
  });

  if (!resp || !resp.ok) {
    mostrarToast(resp && resp.mensaje ? resp.mensaje : "No se pudo publicar.", "error");
    return;
  }

  document.getElementById("input-respuesta").value = "";

  // Recargar hilo completo para obtener la nueva respuesta con su ID
  var actualizado = await llamarAPI("/foro/" + hiloActual.id);
  if (actualizado && actualizado.ok && actualizado.data) {
    respuestasActuales = actualizado.data.respuestas || [];
  }
  renderizarRespuestas();
}

function eliminarRespuesta(respuestaId) {
  mostrarConfirm("¿Eliminar esta respuesta?", async function (ok) {
    if (!ok) return;
    var resp = await llamarAPI(
      "/foro/" + hiloActual.id + "/respuestas/" + respuestaId,
      { method: "DELETE" }
    );
    if (resp && resp.ok) {
      respuestasActuales = respuestasActuales.filter(function (r) { return r.id !== respuestaId; });
      renderizarRespuestas();
    } else {
      mostrarToast(resp && resp.mensaje ? resp.mensaje : "No se pudo eliminar.", "error");
    }
  });
}

function eliminarHilo() {
  mostrarConfirm("¿Eliminar este hilo y todas sus respuestas?", async function (ok) {
    if (!ok) return;
    var resp = await llamarAPI("/foro/" + hiloActual.id, { method: "DELETE" });
    if (resp && resp.ok) {
      window.location.href = "Foro.html";
    } else {
      mostrarToast(resp && resp.mensaje ? resp.mensaje : "No se pudo eliminar.", "error");
    }
  });
}

document.addEventListener("DOMContentLoaded", iniciarHilo);
