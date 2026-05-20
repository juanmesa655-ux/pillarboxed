using Pillarboxed.Domain.Entities;
namespace Pillarboxed.Domain.Interfaces;
public interface IForoRepository
{
    Task<IEnumerable<Hilo>> GetHilosAsync();
    Task<Hilo?> GetHiloByIdAsync(int id);
    Task<IEnumerable<Respuesta>> GetRespuestasAsync(int hiloId);
    Task<int> CrearHiloAsync(Hilo hilo);
    Task EliminarHiloAsync(int id);
    Task<int> CrearRespuestaAsync(Respuesta respuesta);
    Task EliminarRespuestaAsync(int id, int usuarioId);
}
