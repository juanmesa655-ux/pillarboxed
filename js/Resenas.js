// Logica de reseñas y calificaciones para Peliculas.html

var calificacionSeleccionada = 0;
var _peliculaResenas = null;
var _miResenaActual = null;

// ── HTML HELPERS ──────────────────────────────────────────────────────

function htmlEstrellas(calificacion) {
  var html = "";
  for (var i = 1; i <= 5; i++) html += i <= calificacion ? "★" : "☆";
  return html;
}

function htmlFormulario(peliculaId, resenaExistente) {
  var cal   = resenaExistente ? resenaExistente.calificacion : 0;
  var texto = resenaExistente ? (resenaExistente.texto || "") : "";

  var estrellasHtml = "";
  for (var i = 1; i <= 5; i++) {
    var activa = i <= cal ? " activa" : "";
    estrellasHtml +=
      '<span class="estrella' + activa + '" data-valor="' + i + '" ' +
      'onmouseover="resaltarEstrellas(' + i + ')" ' +
      'onmouseout="restaurarEstrellas()" ' +
      'onclick="seleccionarEstrella(' + i + ')">★</span>';
  }

  return `
    <div class="resena-form">
      <p class="form-label">Tu calificación:</p>
      <div class="estrellas-input">${estrellasHtml}</div>
      <textarea class="resena-textarea" id="texto-resena"
        placeholder="¿Qué te pareció esta película?">${texto}</textarea>
      <button class="btn-primary"
        onclick="enviarResena(${peliculaId})">
        ${resenaExistente ? "Guardar cambios" : "Publicar reseña"}
      </button>
    </div>
  `;
}

function htmlMiResena(resena, peliculaId) {
  return `
    <div class="resena-card propia">
      <div class="resena-header">
        <span class="resena-autor">Tú</span>
        <span class="resena-estrellas">${htmlEstrellas(resena.calificacion)}</span>
        <span class="resena-fecha">${resena.fecha}</span>
      </div>
      ${resena.texto ? `<p class="resena-texto">${resena.texto}</p>` : ""}
      <div class="resena-acciones">
        <button class="btn-resena" onclick="iniciarEdicion(${peliculaId})">Editar</button>
        <button class="btn-resena eliminar"
          onclick="confirmarEliminar(${peliculaId})">Eliminar</button>
      </div>
    </div>
  `;
}

function htmlResenaCard(resena) {
  return `
    <div class="resena-card">
      <div class="resena-header">
        <span class="resena-autor">${resena.autorNombre}</span>
        <span class="resena-estrellas">${htmlEstrellas(resena.calificacion)}</span>
        <span class="resena-fecha">${resena.fecha}</span>
      </div>
      ${resena.texto ? `<p class="resena-texto">${resena.texto}</p>` : ""}
    </div>
  `;
}

// ── RENDER PRINCIPAL ──────────────────────────────────────────────────

async function renderizarSeccionResenas(pelicula) {
  _peliculaResenas = pelicula;
  var usuario = obtenerUsuarioActivo();

  var resp = await llamarAPI("/resenas/pelicula/" + pelicula.id);
  var resenas = (resp && resp.ok && resp.data) ? resp.data : [];

  var promDiv = document.getElementById("promedio-resenas");
  if (promDiv) {
    if (resenas.length > 0) {
      var suma = 0;
      for (var i = 0; i < resenas.length; i++) suma += resenas[i].calificacion;
      var prom = (suma / resenas.length).toFixed(1);
      var n = resenas.length;
      promDiv.textContent = "★ " + prom + " (" + n + " reseña" + (n !== 1 ? "s" : "") + ")";
    } else {
      promDiv.textContent = "";
    }
  }

  // Separar mi reseña de las demás
  _miResenaActual = null;
  var miResena = null;
  var otras = [];
  for (var i = 0; i < resenas.length; i++) {
    if (usuario && resenas[i].usuarioId === usuario.id) {
      miResena = resenas[i];
      _miResenaActual = resenas[i];
    } else {
      otras.push(resenas[i]);
    }
  }

  var formDiv = document.getElementById("form-resena");
  if (!usuario) {
    formDiv.innerHTML =
      '<p class="cargando"><a href="Login.html" class="link-rojo">Inicia sesión</a>' +
      ' para dejar una reseña.</p>';
  } else if (miResena) {
    formDiv.innerHTML = htmlMiResena(miResena, pelicula.id);
  } else {
    calificacionSeleccionada = 0;
    formDiv.innerHTML = htmlFormulario(pelicula.id, null);
  }

  var listaDiv = document.getElementById("lista-resenas");
  if (otras.length === 0) {
    listaDiv.innerHTML = "";
  } else {
    var html = "";
    for (var i = 0; i < otras.length; i++) html += htmlResenaCard(otras[i]);
    listaDiv.innerHTML = html;
  }
}

// ── INTERACCIÓN CON ESTRELLAS ─────────────────────────────────────────

function seleccionarEstrella(valor) {
  calificacionSeleccionada = valor;
  actualizarEstrellas(valor);
}

function resaltarEstrellas(valor) {
  var estrellas = document.querySelectorAll(".estrella");
  for (var i = 0; i < estrellas.length; i++) {
    if (parseInt(estrellas[i].dataset.valor) <= valor) {
      estrellas[i].classList.add("activa");
    } else {
      estrellas[i].classList.remove("activa");
    }
  }
}

function restaurarEstrellas() { actualizarEstrellas(calificacionSeleccionada); }

function actualizarEstrellas(valor) {
  var estrellas = document.querySelectorAll(".estrella");
  for (var i = 0; i < estrellas.length; i++) {
    if (parseInt(estrellas[i].dataset.valor) <= valor) {
      estrellas[i].classList.add("activa");
    } else {
      estrellas[i].classList.remove("activa");
    }
  }
}

// ── ACCIONES ──────────────────────────────────────────────────────────

async function enviarResena(peliculaId) {
  if (calificacionSeleccionada === 0) {
    mostrarToast("Selecciona al menos una estrella.", "error");
    return;
  }
  var texto = document.getElementById("texto-resena").value.trim();
  var dto = {
    peliculaId:     peliculaId,
    tituloPelicula: _peliculaResenas ? _peliculaResenas.title : "Película",
    imagenPelicula: _peliculaResenas ? (_peliculaResenas.poster_path || null) : null,
    calificacion:   calificacionSeleccionada,
    texto:          texto || null
  };

  var resp = await llamarAPI("/resenas", { method: "POST", body: dto });
  if (!resp || !resp.ok) {
    mostrarToast(resp && resp.mensaje ? resp.mensaje : "No se pudo guardar la reseña.", "error");
    return;
  }
  renderizarSeccionResenas(_peliculaResenas);
}

function iniciarEdicion(peliculaId) {
  calificacionSeleccionada = _miResenaActual ? _miResenaActual.calificacion : 0;
  document.getElementById("form-resena").innerHTML =
    htmlFormulario(peliculaId, _miResenaActual);
  actualizarEstrellas(calificacionSeleccionada);
}

function confirmarEliminar(peliculaId) {
  mostrarConfirm("¿Eliminar tu reseña?", async function (ok) {
    if (!ok) return;
    var resp = await llamarAPI("/resenas/" + peliculaId, { method: "DELETE" });
    if (!resp || !resp.ok) {
      mostrarToast(resp && resp.mensaje ? resp.mensaje : "No se pudo eliminar.", "error");
      return;
    }
    renderizarSeccionResenas(_peliculaResenas);
  });
}
