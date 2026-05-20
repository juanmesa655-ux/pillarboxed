using Dapper;
using Pillarboxed.Domain.Entities;
using Pillarboxed.Domain.Interfaces;
using Pillarboxed.Infrastructure.Data;

namespace Pillarboxed.Infrastructure.Repositories;

public class VistasRepository(SqlConnectionFactory factory) : IVistasRepository
{
    public async Task<IEnumerable<Vista>> GetByUsuarioAsync(int usuarioId)
    {
        using var conn = factory.CreateConnection();
        return await conn.QueryAsync<Vista>(
            "SELECT * FROM Vistas WHERE UsuarioId = @UsuarioId ORDER BY FechaVista DESC",
            new { UsuarioId = usuarioId });
    }

    public async Task<bool> ExisteAsync(int usuarioId, int peliculaId)
    {
        using var conn = factory.CreateConnection();
        return await conn.ExecuteScalarAsync<bool>(
            "SELECT COUNT(1) FROM Vistas WHERE UsuarioId = @UsuarioId AND PeliculaId = @PeliculaId",
            new { UsuarioId = usuarioId, PeliculaId = peliculaId });
    }

    public async Task AgregarAsync(Vista vista)
    {
        using var conn = factory.CreateConnection();
        await conn.ExecuteAsync(@"
            INSERT INTO Vistas (UsuarioId, PeliculaId, Titulo, Imagen, Anio, FechaVista)
            VALUES (@UsuarioId, @PeliculaId, @Titulo, @Imagen, @Anio, @FechaVista)", vista);
    }

    public async Task EliminarAsync(int usuarioId, int peliculaId)
    {
        using var conn = factory.CreateConnection();
        await conn.ExecuteAsync(
            "DELETE FROM Vistas WHERE UsuarioId = @UsuarioId AND PeliculaId = @PeliculaId",
            new { UsuarioId = usuarioId, PeliculaId = peliculaId });
    }
}
