// Logica de la página de eventos (Eventos.html)

var filtroActivo = "todos";

// ── INSCRIPCIONES ─────────────────────────────────────────────────────

async function toggleInscripcion(eventoId) {
  var usuario = obtenerUsuarioActivo();
  if (!usuario) {
    window.location.href = "Login.html";
    return;
  }

  var btn = document.querySelector('[data-evento-id="' + eventoId + '"]');
  var estaInscrito = btn && btn.classList.contains("inscrito");

  var resp;
  if (estaInscrito) {
    resp = await llamarAPI("/eventos/" + eventoId + "/inscribirse", { method: "DELETE" });
  } else {
    resp = await llamarAPI("/eventos/" + eventoId + "/inscribirse", { method: "POST" });
  }

  if (!resp || !resp.ok) {
    mostrarToast(resp && resp.mensaje ? resp.mensaje : "No se pudo procesar la solicitud.", "error");
    return;
  }

  if (btn) {
    if (estaInscrito) {
      btn.textContent = "Inscribirse";
      btn.classList.remove("inscrito");
    } else {
      btn.textContent = "✓ Inscrito";
      btn.classList.add("inscrito");
    }
  }
}

// ── RENDER ────────────────────────────────────────────────────────────

async function renderizarEventos() {
  var contenedor = document.getElementById("lista-eventos");
  contenedor.innerHTML = '<p class="eventos-vacio">Cargando eventos...</p>';

  var query = filtroActivo !== "todos" ? "?tipo=" + filtroActivo : "";
  var resp = await llamarAPI("/eventos" + query);

  if (!resp || !resp.ok) {
    contenedor.innerHTML = '<p class="eventos-vacio">No se pudieron cargar los eventos. Verifica que el servidor esté activo.</p>';
    return;
  }

  var eventos = resp.data || [];

  if (eventos.length === 0) {
    contenedor.innerHTML = '<p class="eventos-vacio">No hay eventos en esta categoría.</p>';
    return;
  }

  var hoy = new Date().toISOString().split("T")[0];
  var proximos = [];
  var pasados  = [];
  for (var i = 0; i < eventos.length; i++) {
    if (eventos[i].fecha >= hoy) proximos.push(eventos[i]);
    else pasados.push(eventos[i]);
  }

  var html = "";
  for (var i = 0; i < proximos.length; i++) html += htmlEventoCard(proximos[i], false);
  if (pasados.length > 0) {
    html += '<p class="eventos-pasados-label">Eventos pasados</p>';
    for (var i = 0; i < pasados.length; i++) html += htmlEventoCard(pasados[i], true);
  }

  contenedor.innerHTML = html;
}

function htmlEventoCard(evento, pasado) {
  var fechaFormateada = formatearFecha(evento.fecha);

  return `
    <div class="evento-card${pasado ? " pasado" : ""}">
      <div class="evento-card-top">
        <span class="evento-badge tipo-${evento.tipo}">${evento.tipoLabel}</span>
        <span class="evento-fecha-badge">${fechaFormateada}</span>
      </div>
      <h3 class="evento-titulo">${evento.titulo}</h3>
      <p class="evento-descripcion">${evento.descripcion || ""}</p>
      <div class="evento-detalles">
        <span class="evento-detalle">
          <span class="evento-detalle-label">Lugar</span>
          ${evento.lugar || ""}
        </span>
        <span class="evento-detalle">
          <span class="evento-detalle-label">Hora</span>
          ${evento.hora || ""}
        </span>
        <span class="evento-detalle">
          <span class="evento-detalle-label">Precio</span>
          ${evento.precio || ""}
        </span>
      </div>
      ${pasado
        ? '<p class="evento-finalizado">Evento finalizado</p>'
        : `<button class="btn-inscripcion${evento.estaInscrito ? " inscrito" : ""}"
             data-evento-id="${evento.id}"
             onclick="toggleInscripcion(${evento.id})">
             ${evento.estaInscrito ? "✓ Inscrito" : "Inscribirse"}
           </button>`
      }
    </div>
  `;
}

function formatearFecha(fechaISO) {
  var meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  var partes = fechaISO.split("-");
  var dia  = parseInt(partes[2]);
  var mes  = meses[parseInt(partes[1]) - 1];
  var anio = partes[0];
  return dia + " " + mes + " " + anio;
}

// ── FILTROS ───────────────────────────────────────────────────────────

function configurarFiltros() {
  var botones = document.querySelectorAll(".filtro-evento");
  for (var i = 0; i < botones.length; i++) {
    botones[i].addEventListener("click", function () {
      document.querySelector(".filtro-evento.activo").classList.remove("activo");
      this.classList.add("activo");
      filtroActivo = this.dataset.filtro;
      renderizarEventos();
    });
  }
}

// ── INICIO ────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", function () {
  configurarFiltros();
  renderizarEventos();
});
