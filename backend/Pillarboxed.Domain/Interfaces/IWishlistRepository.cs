using Pillarboxed.Domain.Entities;
namespace Pillarboxed.Domain.Interfaces;
public interface IWishlistRepository
{
    Task<IEnumerable<WishlistItem>> GetByUsuarioAsync(int usuarioId);
    Task<bool> ExisteAsync(int usuarioId, int peliculaId);
    Task AgregarAsync(WishlistItem item);
    Task EliminarAsync(int usuarioId, int peliculaId);
}
