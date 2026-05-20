using Dapper;
using Pillarboxed.Domain.Entities;
using Pillarboxed.Domain.Interfaces;
using Pillarboxed.Infrastructure.Data;

namespace Pillarboxed.Infrastructure.Repositories;

public class ForoRepository(SqlConnectionFactory factory) : IForoRepository
{
    public async Task<IEnumerable<Hilo>> GetHilosAsync()
    {
        using var conn = factory.CreateConnection();
        return await conn.QueryAsync<Hilo>(@"
            SELECT h.Id, h.UsuarioId, h.AutorNombre, h.Titulo, h.Texto, h.Fecha,
                   COUNT(r.Id) AS TotalRespuestas
            FROM Hilos h
            LEFT JOIN Respuestas r ON r.HiloId = h.Id
            GROUP BY h.Id, h.UsuarioId, h.AutorNombre, h.Titulo, h.Texto, h.Fecha
            ORDER BY h.Fecha DESC");
    }

    public async Task<Hilo?> GetHiloByIdAsync(int id)
    {
        using var conn = factory.CreateConnection();
        return await conn.QueryFirstOrDefaultAsync<Hilo>(
            "SELECT * FROM Hilos WHERE Id = @Id", new { Id = id });
    }

    public async Task<IEnumerable<Respuesta>> GetRespuestasAsync(int hiloId)
    {
        using var conn = factory.CreateConnection();
        return await conn.QueryAsync<Respuesta>(
            "SELECT * FROM Respuestas WHERE HiloId = @HiloId ORDER BY Fecha ASC",
            new { HiloId = hiloId });
    }

    public async Task<int> CrearHiloAsync(Hilo hilo)
    {
        using var conn = factory.CreateConnection();
        return await conn.ExecuteScalarAsync<int>(@"
            INSERT INTO Hilos (UsuarioId, AutorNombre, Titulo, Texto, Fecha)
            VALUES (@UsuarioId, @AutorNombre, @Titulo, @Texto, @Fecha);
            SELECT SCOPE_IDENTITY();", hilo);
    }

    public async Task EliminarHiloAsync(int id)
    {
        using var conn = factory.CreateConnection();
        await conn.ExecuteAsync("DELETE FROM Hilos WHERE Id = @Id", new { Id = id });
    }

    public async Task<int> CrearRespuestaAsync(Respuesta respuesta)
    {
        using var conn = factory.CreateConnection();
        return await conn.ExecuteScalarAsync<int>(@"
            INSERT INTO Respuestas (HiloId, UsuarioId, AutorNombre, Texto, Fecha)
            VALUES (@HiloId, @UsuarioId, @AutorNombre, @Texto, @Fecha);
            SELECT SCOPE_IDENTITY();", respuesta);
    }

    public async Task EliminarRespuestaAsync(int id, int usuarioId)
    {
        using var conn = factory.CreateConnection();
        await conn.ExecuteAsync(
            "DELETE FROM Respuestas WHERE Id = @Id AND UsuarioId = @UsuarioId",
            new { Id = id, UsuarioId = usuarioId });
    }
}
