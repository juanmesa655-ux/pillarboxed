namespace Pillarboxed.Application.DTOs;
public record HiloDto(int Id, int UsuarioId, string AutorNombre, string Titulo, string? Texto, string Fecha, int TotalRespuestas);
public record HiloDetalleDto(HiloDto Hilo, IEnumerable<RespuestaDto> Respuestas);
public record RespuestaDto(int Id, int UsuarioId, string AutorNombre, string Texto, string Fecha);
public record CrearHiloDto(string Titulo, string? Texto);
public record CrearRespuestaDto(string Texto);
