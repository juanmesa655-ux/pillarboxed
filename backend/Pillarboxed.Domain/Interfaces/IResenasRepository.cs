using Pillarboxed.Domain.Entities;
namespace Pillarboxed.Domain.Interfaces;
public interface IResenasRepository
{
    Task<IEnumerable<Resena>> GetByPeliculaAsync(int peliculaId);
    Task<Resena?> GetByUsuarioYPeliculaAsync(int usuarioId, int peliculaId);
    Task<IEnumerable<Resena>> GetByUsuarioAsync(int usuarioId);
    Task CrearOActualizarAsync(Resena resena);
    Task EliminarAsync(int usuarioId, int peliculaId);
}
