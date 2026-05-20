namespace Pillarboxed.Domain.Entities;
public class Vista
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public int PeliculaId { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string? Imagen { get; set; }
    public string? Anio { get; set; }
    public DateTime FechaVista { get; set; }
}
