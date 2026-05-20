using Dapper;
using Pillarboxed.Domain.Entities;
using Pillarboxed.Domain.Interfaces;
using Pillarboxed.Infrastructure.Data;

namespace Pillarboxed.Infrastructure.Repositories;

public class UsuarioRepository(SqlConnectionFactory factory) : IUsuarioRepository
{
    public async Task<Usuario?> GetByEmailAsync(string email)
    {
        using var conn = factory.CreateConnection();
        return await conn.QueryFirstOrDefaultAsync<Usuario>(
            "SELECT * FROM Usuarios WHERE Email = @Email", new { Email = email });
    }

    public async Task<Usuario?> GetByIdAsync(int id)
    {
        using var conn = factory.CreateConnection();
        return await conn.QueryFirstOrDefaultAsync<Usuario>(
            "SELECT * FROM Usuarios WHERE Id = @Id", new { Id = id });
    }

    public async Task<bool> ExisteEmailAsync(string email)
    {
        using var conn = factory.CreateConnection();
        return await conn.ExecuteScalarAsync<bool>(
            "SELECT COUNT(1) FROM Usuarios WHERE Email = @Email", new { Email = email });
    }

    public async Task<int> CrearAsync(Usuario usuario)
    {
        using var conn = factory.CreateConnection();
        return await conn.ExecuteScalarAsync<int>(@"
            INSERT INTO Usuarios (Nombre, Email, PasswordHash, FechaRegistro)
            VALUES (@Nombre, @Email, @PasswordHash, @FechaRegistro);
            SELECT SCOPE_IDENTITY();", usuario);
    }
}
