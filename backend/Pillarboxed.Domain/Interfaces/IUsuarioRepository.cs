using Pillarboxed.Domain.Entities;
namespace Pillarboxed.Domain.Interfaces;
public interface IUsuarioRepository
{
    Task<Usuario?> GetByEmailAsync(string email);
    Task<Usuario?> GetByIdAsync(int id);
    Task<bool> ExisteEmailAsync(string email);
    Task<int> CrearAsync(Usuario usuario);
}
