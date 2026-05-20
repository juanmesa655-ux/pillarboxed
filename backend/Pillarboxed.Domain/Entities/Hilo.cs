namespace Pillarboxed.Domain.Entities;
public class Hilo
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public string AutorNombre { get; set; } = string.Empty;
    public string Titulo { get; set; } = string.Empty;
    public string? Texto { get; set; }
    public DateTime Fecha { get; set; }
    public int TotalRespuestas { get; set; }
}
