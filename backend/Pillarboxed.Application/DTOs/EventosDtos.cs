namespace Pillarboxed.Application.DTOs;
public record EventoDto(int Id, string Tipo, string TipoLabel, string Titulo, string? Descripcion, string Fecha, string? Hora, string? Lugar, string? Precio, bool EstaInscrito);
