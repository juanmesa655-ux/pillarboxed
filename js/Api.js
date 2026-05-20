// API.JS
// Todas las funciones que se comunican con TMDB.
// En Angular esto se convertiría en un Service.

async function obtenerPeliculasPopulares() {
  var url = CONFIG.BASE_URL + "/movie/popular?api_key=" + CONFIG.API_KEY + "&language=" + CONFIG.LANGUAGE;

  try {
    var respuesta = await fetch(url);

    // si el servidor respondió con error (401, 404, etc.) lo manejamos aquí
    // sin este chequeo, respuesta.json() falla con SyntaxError cuando
    // TMDB devuelve HTML en vez de JSON (por clave inválida, por ejemplo)
    if (!respuesta.ok) {
      console.log("Error de API:", respuesta.status, respuesta.statusText);
      return [];
    }

    var datos = await respuesta.json();
    return datos.results || [];
    // || [] protege si results viene undefined
  } catch (error) {
    console.log("Error al obtener peliculas", error);
    return [];
  }
}

async function obtenerDetallePelicula(id) {
  var url = CONFIG.BASE_URL + "/movie/" + id + "?api_key=" + CONFIG.API_KEY + "&language=" + CONFIG.LANGUAGE;

  try {
    var respuesta = await fetch(url);

    if (!respuesta.ok) {
      console.log("Error de API:", respuesta.status);
      return null;
    }

    var datos = await respuesta.json();
    return datos;
  } catch (error) {
    console.log("Error al obtener los detalles", error);
    return null;
  }
}

async function buscarPeliculas(query) {
  var url = CONFIG.BASE_URL + "/search/movie?api_key=" + CONFIG.API_KEY + "&language=" + CONFIG.LANGUAGE + "&query=" + encodeURIComponent(query);
  // encodeURIComponent convierte espacios y caracteres especiales para que la URL sea válida
  // sin esto "toy story" se enviaría como "toy story" y puede fallar

  try {
    var respuesta = await fetch(url);

    if (!respuesta.ok) {
      console.log("Error de API:", respuesta.status);
      return [];
    }

    var datos = await respuesta.json();
    return datos.results || [];
  } catch (error) {
    console.log("Error al buscar peliculas", error);
    return [];
  }
}

async function obtenerPeliculasSimilares(id) {
  var url = CONFIG.BASE_URL + "/movie/" + id + "/similar?api_key=" + CONFIG.API_KEY + "&language=" + CONFIG.LANGUAGE;

  try {
    var respuesta = await fetch(url);

    if (!respuesta.ok) {
      console.log("Error de API:", respuesta.status);
      return [];
    }

    var datos = await respuesta.json();
    return datos.results ? datos.results.slice(0, 6) : [];
  } catch (error) {
    console.log("Error al obtener similares", error);
    return [];
  }
}

async function obtenerPeliculasTopRated() {
  var url = CONFIG.BASE_URL + "/movie/top_rated?api_key=" + CONFIG.API_KEY + "&language=" + CONFIG.LANGUAGE;
  try {
    var respuesta = await fetch(url);
    if (!respuesta.ok) { console.log("Error de API:", respuesta.status); return []; }
    var datos = await respuesta.json();
    return datos.results || [];
  } catch (error) {
    console.log("Error al obtener top rated", error);
    return [];
  }
}

async function obtenerPeliculasEnCines() {
  var url = CONFIG.BASE_URL + "/movie/now_playing?api_key=" + CONFIG.API_KEY + "&language=" + CONFIG.LANGUAGE;
  try {
    var respuesta = await fetch(url);
    if (!respuesta.ok) { console.log("Error de API:", respuesta.status); return []; }
    var datos = await respuesta.json();
    return datos.results || [];
  } catch (error) {
    console.log("Error al obtener en cines", error);
    return [];
  }
}

async function obtenerPeliculasProximas() {
  var url = CONFIG.BASE_URL + "/movie/upcoming?api_key=" + CONFIG.API_KEY + "&language=" + CONFIG.LANGUAGE;
  try {
    var respuesta = await fetch(url);
    if (!respuesta.ok) { console.log("Error de API:", respuesta.status); return []; }
    var datos = await respuesta.json();
    return datos.results || [];
  } catch (error) {
    console.log("Error al obtener próximas", error);
    return [];
  }
}

async function obtenerCreditos(id) {
  var url = CONFIG.BASE_URL + "/movie/" + id + "/credits?api_key=" + CONFIG.API_KEY;

  try {
    var respuesta = await fetch(url);

    if (!respuesta.ok) {
      console.log("Error de API:", respuesta.status);
      return null;
    }

    var datos = await respuesta.json();
    return datos;
  } catch (error) {
    console.log("Error al obtener creditos:", error);
    return null;
  }
}
