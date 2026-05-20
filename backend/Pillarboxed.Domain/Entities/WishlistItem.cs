namespace Pillarboxed.Domain.Entities;
public class WishlistItem
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public int PeliculaId { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string? Imagen { get; set; }
    public decimal? Calificacion { get; set; }
    public string? Anio { get; set; }
    public DateTime FechaAgregada { get; set; }
}
