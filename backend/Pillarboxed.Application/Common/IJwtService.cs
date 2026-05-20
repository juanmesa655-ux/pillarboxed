using Pillarboxed.Domain.Entities;
namespace Pillarboxed.Application.Common;
public interface IJwtService
{
    string GenerarToken(Usuario usuario);
    int? ObtenerUsuarioId(string token);
}
