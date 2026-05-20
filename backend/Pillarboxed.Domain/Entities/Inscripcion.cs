namespace Pillarboxed.Domain.Entities;
public class Inscripcion
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public int EventoId { get; set; }
    public DateTime FechaInscripcion { get; set; }
}
