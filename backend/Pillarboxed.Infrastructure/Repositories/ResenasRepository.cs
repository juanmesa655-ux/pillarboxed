using Dapper;
using Pillarboxed.Domain.Entities;
using Pillarboxed.Domain.Interfaces;
using Pillarboxed.Infrastructure.Data;

namespace Pillarboxed.Infrastructure.Repositories;

public class ResenasRepository(SqlConnectionFactory factory) : IResenasRepository
{
    public async Task<IEnumerable<Resena>> GetByPeliculaAsync(int peliculaId)
    {
        using var conn = factory.CreateConnection();
        return await conn.QueryAsync<Resena>(
            "SELECT * FROM Resenas WHERE PeliculaId = @PeliculaId ORDER BY Fecha DESC",
            new { PeliculaId = peliculaId });
    }

    public async Task<Resena?> GetByUsuarioYPeliculaAsync(int usuarioId, int peliculaId)
    {
        using var conn = factory.CreateConnection();
        return await conn.QueryFirstOrDefaultAsync<Resena>(
            "SELECT * FROM Resenas WHERE UsuarioId = @UsuarioId AND PeliculaId = @PeliculaId",
            new { UsuarioId = usuarioId, PeliculaId = peliculaId });
    }

    public async Task<IEnumerable<Resena>> GetByUsuarioAsync(int usuarioId)
    {
        using var conn = factory.CreateConnection();
        return await conn.QueryAsync<Resena>(
            "SELECT * FROM Resenas WHERE UsuarioId = @UsuarioId ORDER BY Fecha DESC",
            new { UsuarioId = usuarioId });
    }

    public async Task CrearOActualizarAsync(Resena resena)
    {
        using var conn = factory.CreateConnection();
        await conn.ExecuteAsync(@"
            MERGE Resenas AS target
            USING (SELECT @UsuarioId AS UsuarioId, @PeliculaId AS PeliculaId) AS source
            ON target.UsuarioId = source.UsuarioId AND target.PeliculaId = source.PeliculaId
            WHEN MATCHED THEN
                UPDATE SET Calificacion = @Calificacion, Texto = @Texto, Fecha = @Fecha
            WHEN NOT MATCHED THEN
                INSERT (UsuarioId, AutorNombre, PeliculaId, TituloPelicula, ImagenPelicula, Calificacion, Texto, Fecha)
                VALUES (@UsuarioId, @AutorNombre, @PeliculaId, @TituloPelicula, @ImagenPelicula, @Calificacion, @Texto, @Fecha);",
            resena);
    }

    public async Task EliminarAsync(int usuarioId, int peliculaId)
    {
        using var conn = factory.CreateConnection();
        await conn.ExecuteAsync(
            "DELETE FROM Resenas WHERE UsuarioId = @UsuarioId AND PeliculaId = @PeliculaId",
            new { UsuarioId = usuarioId, PeliculaId = peliculaId });
    }
}
