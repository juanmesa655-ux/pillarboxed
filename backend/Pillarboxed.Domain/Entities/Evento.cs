namespace Pillarboxed.Domain.Entities;
public class Evento
{
    public int Id { get; set; }
    public string Tipo { get; set; } = string.Empty;
    public string TipoLabel { get; set; } = string.Empty;
    public string Titulo { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public DateTime Fecha { get; set; }
    public string? Hora { get; set; }
    public string? Lugar { get; set; }
    public string? Precio { get; set; }
    public bool EstaInscrito { get; set; }
}
