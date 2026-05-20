namespace Pillarboxed.Domain.Entities;
public class Respuesta
{
    public int Id { get; set; }
    public int HiloId { get; set; }
    public int UsuarioId { get; set; }
    public string AutorNombre { get; set; } = string.Empty;
    public string Texto { get; set; } = string.Empty;
    public DateTime Fecha { get; set; }
}
