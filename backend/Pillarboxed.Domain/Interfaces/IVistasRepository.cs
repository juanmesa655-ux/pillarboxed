using Pillarboxed.Domain.Entities;
namespace Pillarboxed.Domain.Interfaces;
public interface IVistasRepository
{
    Task<IEnumerable<Vista>> GetByUsuarioAsync(int usuarioId);
    Task<bool> ExisteAsync(int usuarioId, int peliculaId);
    Task AgregarAsync(Vista vista);
    Task EliminarAsync(int usuarioId, int peliculaId);
}
