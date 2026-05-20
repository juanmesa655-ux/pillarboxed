// RECUPERAR.JS

// ── OJO (mostrar / ocultar contraseña) ────────────────────────────────
var SVG_OJO_ABIERTO = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
var SVG_OJO_CERRADO = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';

function togglePassword(inputId, boton) {
  var input = document.getElementById(inputId);
  if (input.type === "password") {
    input.type = "text";
    boton.innerHTML = SVG_OJO_CERRADO;
  } else {
    input.type = "password";
    boton.innerHTML = SVG_OJO_ABIERTO;
  }
}

// ── TOAST ─────────────────────────────────────────────────────────────
function mostrarToast(texto, tipo) {
  var toast = document.getElementById("toast");
  toast.textContent = texto;
  toast.className = "toast " + tipo + " visible";
  setTimeout(function () { toast.classList.remove("visible"); }, 3000);
}

// ── PASO 1: verificar correo ──────────────────────────────────────────
document.getElementById("formVerificar").addEventListener("submit", function (e) {
  e.preventDefault();

  var email = document.getElementById("emailRecuperar").value.trim();

  if (!email) {
    mostrarToast("Por favor ingresa tu correo.", "error");
    return;
  }

  if (!email.endsWith("@pascualbravo.edu.co")) {
    mostrarToast("Usa tu correo institucional (@pascualbravo.edu.co).", "error");
    return;
  }

  // La recuperación de contraseña por correo no está disponible aún.
  // Se muestra un mensaje informativo.
  mostrarToast("Contacta a soporte para recuperar tu contraseña.", "error");
});

// ── PASO 2: guardar nueva contraseña (no disponible) ──────────────────
document.getElementById("formNuevaPassword").addEventListener("submit", function (e) {
  e.preventDefault();
  mostrarToast("Esta función no está disponible.", "error");
});
