namespace Pillarboxed.Domain.Entities;
public class Resena
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public string AutorNombre { get; set; } = string.Empty;
    public int PeliculaId { get; set; }
    public string TituloPelicula { get; set; } = string.Empty;
    public string? ImagenPelicula { get; set; }
    public int Calificacion { get; set; }
    public string? Texto { get; set; }
    public DateTime Fecha { get; set; }
}
