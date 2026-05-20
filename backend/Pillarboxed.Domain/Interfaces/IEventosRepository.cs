using Pillarboxed.Domain.Entities;
namespace Pillarboxed.Domain.Interfaces;
public interface IEventosRepository
{
    Task<IEnumerable<Evento>> GetAllAsync(int? usuarioId);
    Task<bool> EstaInscritoAsync(int usuarioId, int eventoId);
    Task InscribirseAsync(int usuarioId, int eventoId);
    Task CancelarInscripcionAsync(int usuarioId, int eventoId);
    Task<IEnumerable<Evento>> GetInscripcionesUsuarioAsync(int usuarioId);
}
