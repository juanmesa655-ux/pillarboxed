using Dapper;
using Pillarboxed.Domain.Entities;
using Pillarboxed.Domain.Interfaces;
using Pillarboxed.Infrastructure.Data;

namespace Pillarboxed.Infrastructure.Repositories;

public class EventosRepository(SqlConnectionFactory factory) : IEventosRepository
{
    public async Task<IEnumerable<Evento>> GetAllAsync(int? usuarioId)
    {
        using var conn = factory.CreateConnection();
        return await conn.QueryAsync<Evento>(@"
            SELECT e.*,
                CASE WHEN @UsuarioId IS NOT NULL AND EXISTS (
                    SELECT 1 FROM Inscripciones i
                    WHERE i.EventoId = e.Id AND i.UsuarioId = @UsuarioId
                ) THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS EstaInscrito
            FROM Eventos e
            ORDER BY e.Fecha ASC",
            new { UsuarioId = usuarioId });
    }

    public async Task<bool> EstaInscritoAsync(int usuarioId, int eventoId)
    {
        using var conn = factory.CreateConnection();
        return await conn.ExecuteScalarAsync<bool>(
            "SELECT COUNT(1) FROM Inscripciones WHERE UsuarioId = @UsuarioId AND EventoId = @EventoId",
            new { UsuarioId = usuarioId, EventoId = eventoId });
    }

    public async Task InscribirseAsync(int usuarioId, int eventoId)
    {
        using var conn = factory.CreateConnection();
        await conn.ExecuteAsync(@"
            INSERT INTO Inscripciones (UsuarioId, EventoId, FechaInscripcion)
            VALUES (@UsuarioId, @EventoId, @FechaInscripcion)",
            new { UsuarioId = usuarioId, EventoId = eventoId, FechaInscripcion = DateTime.UtcNow });
    }

    public async Task CancelarInscripcionAsync(int usuarioId, int eventoId)
    {
        using var conn = factory.CreateConnection();
        await conn.ExecuteAsync(
            "DELETE FROM Inscripciones WHERE UsuarioId = @UsuarioId AND EventoId = @EventoId",
            new { UsuarioId = usuarioId, EventoId = eventoId });
    }

    public async Task<IEnumerable<Evento>> GetInscripcionesUsuarioAsync(int usuarioId)
    {
        using var conn = factory.CreateConnection();
        return await conn.QueryAsync<Evento>(@"
            SELECT e.*, CAST(1 AS BIT) AS EstaInscrito
            FROM Eventos e
            INNER JOIN Inscripciones i ON i.EventoId = e.Id
            WHERE i.UsuarioId = @UsuarioId
            ORDER BY e.Fecha ASC",
            new { UsuarioId = usuarioId });
    }
}
