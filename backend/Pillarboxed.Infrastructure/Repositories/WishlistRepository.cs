using Dapper;
using Pillarboxed.Domain.Entities;
using Pillarboxed.Domain.Interfaces;
using Pillarboxed.Infrastructure.Data;

namespace Pillarboxed.Infrastructure.Repositories;

public class WishlistRepository(SqlConnectionFactory factory) : IWishlistRepository
{
    public async Task<IEnumerable<WishlistItem>> GetByUsuarioAsync(int usuarioId)
    {
        using var conn = factory.CreateConnection();
        return await conn.QueryAsync<WishlistItem>(
            "SELECT * FROM WishlistItems WHERE UsuarioId = @UsuarioId ORDER BY FechaAgregada DESC",
            new { UsuarioId = usuarioId });
    }

    public async Task<bool> ExisteAsync(int usuarioId, int peliculaId)
    {
        using var conn = factory.CreateConnection();
        return await conn.ExecuteScalarAsync<bool>(
            "SELECT COUNT(1) FROM WishlistItems WHERE UsuarioId = @UsuarioId AND PeliculaId = @PeliculaId",
            new { UsuarioId = usuarioId, PeliculaId = peliculaId });
    }

    public async Task AgregarAsync(WishlistItem item)
    {
        using var conn = factory.CreateConnection();
        await conn.ExecuteAsync(@"
            INSERT INTO WishlistItems (UsuarioId, PeliculaId, Titulo, Imagen, Calificacion, Anio, FechaAgregada)
            VALUES (@UsuarioId, @PeliculaId, @Titulo, @Imagen, @Calificacion, @Anio, @FechaAgregada)", item);
    }

    public async Task EliminarAsync(int usuarioId, int peliculaId)
    {
        using var conn = factory.CreateConnection();
        await conn.ExecuteAsync(
            "DELETE FROM WishlistItems WHERE UsuarioId = @UsuarioId AND PeliculaId = @PeliculaId",
            new { UsuarioId = usuarioId, PeliculaId = peliculaId });
    }
}
