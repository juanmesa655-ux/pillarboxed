//Aqui se guarda toda la configuracion de la API, para no repetirla en cada archivo.
// Al migrar a angular se convertira en un enviroment file

const CONFIG = {
  API_URL: "http://localhost:5000/api",
  // URL base del backend Pillarboxed

  API_KEY: "4a8ddce11917fc553ca4b1497b681a2c",
  //Clave de TMBD

  BASE_URL: "https://api.themoviedb.org/3",
  // Direccion base de la API
  // Todos los endpoints se construyen sobre esta

  IMAGE_URL: "https://image.tmdb.org/t/p/w500",
  // Posters de peliculas no vienen como iamgen directa
  // Vienen como un nombre de archivo.
  // Para ver la imagen se combina: IMAGE_URL + NOMBRE_DE_ARCHIVO

  LANGUAGE: "es-ES",
  // Pedimos datos en español
};
