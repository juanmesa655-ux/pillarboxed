// ── SLIDER DEL HERO ──────────────────────────────────────────────────
var slideActual = 0;
var slides = [];
var dots = [];
var intervaloSlider;

function irASlide(indice) {
  if (!slides.length) return;
  slides[slideActual].classList.remove("activo");
  if (dots[slideActual]) dots[slideActual].classList.remove("activo");

  slideActual = indice;
  if (slideActual >= slides.length) slideActual = 0;
  if (slideActual < 0) slideActual = slides.length - 1;

  slides[slideActual].classList.add("activo");
  if (dots[slideActual]) dots[slideActual].classList.add("activo");
}

function cambiarSlide(direccion) {
  irASlide(slideActual + direccion);
  reiniciarIntervalo();
}

function reiniciarIntervalo() {
  clearInterval(intervaloSlider);
  if (!slides.length) return;
  intervaloSlider = setInterval(function () {
    irASlide(slideActual + 1);
  }, 5000);
}

// Se llama desde App.js después de inyectar los slides dinámicamente
function inicializarSlider() {
  clearInterval(intervaloSlider);
  slides = Array.from(document.querySelectorAll(".hero-slide"));
  dots = Array.from(document.querySelectorAll(".slider-dot"));
  slideActual = 0;

  var sliderEl = document.getElementById("hero-slider");
  if (sliderEl) {
    sliderEl.onmouseenter = function () { clearInterval(intervaloSlider); };
    sliderEl.onmouseleave = reiniciarIntervalo;
  }

  slides.forEach(function (slide) {
    slide.addEventListener("click", function (e) {
      if (e.target.closest("button")) return;
      var id = slide.dataset.id;
      if (id) window.location.href = "Peliculas.html?id=" + id;
    });
  });

  reiniciarIntervalo();

  if (typeof actualizarBotonesSlider === "function") actualizarBotonesSlider();
}

// ── FILTROS POR GÉNERO ────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", function () {
  var filtros = document.querySelectorAll(".filtro");

  filtros.forEach(function (boton) {
    boton.addEventListener("click", function () {
      filtros.forEach(function (b) { b.classList.remove("activo"); });
      this.classList.add("activo");

      var filtroElegido = this.dataset.filtro;
      var tarjetas = document.querySelectorAll(".tarjeta-link");

      tarjetas.forEach(function (tarjeta) {
        var generoEl = tarjeta.querySelector(".tarjeta");
        if (!generoEl) return;
        var genero = generoEl.dataset.genero;

        if (filtroElegido === "todos" || genero === filtroElegido) {
          tarjeta.style.display = "block";
          setTimeout(function () {
            tarjeta.style.opacity = "1";
            tarjeta.style.transform = "scale(1)";
          }, 10);
        } else {
          tarjeta.style.opacity = "0";
          tarjeta.style.transform = "scale(0.95)";
          setTimeout(function () { tarjeta.style.display = "none"; }, 300);
        }
      });
    });
  });
});
