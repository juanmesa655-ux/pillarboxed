namespace Pillarboxed.Application.DTOs;
public record ResenaDto(int UsuarioId, string AutorNombre, int PeliculaId, string TituloPelicula, string? ImagenPelicula, int Calificacion, string? Texto, string Fecha);
public record CrearResenaDto(int PeliculaId, string TituloPelicula, string? ImagenPelicula, int Calificacion, string? Texto);
