using MediatR;
using Pillarboxed.Application.Common;
using Pillarboxed.Application.DTOs;
using Pillarboxed.Domain.Entities;
using Pillarboxed.Domain.Interfaces;
using System.Text.RegularExpressions;

namespace Pillarboxed.Application.Commands.Auth;

public record RegisterCommand(RegisterDto Dto) : IRequest<ApiResponse<AuthResponseDto>>;

public class RegisterCommandHandler(IUsuarioRepository repo, IJwtService jwt)
    : IRequestHandler<RegisterCommand, ApiResponse<AuthResponseDto>>
{
    public async Task<ApiResponse<AuthResponseDto>> Handle(RegisterCommand request, CancellationToken ct)
    {
        var dto = request.Dto;

        if (string.IsNullOrWhiteSpace(dto.Nombre) || string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            return ApiResponse<AuthResponseDto>.Error("Todos los campos son obligatorios.");

        if (!dto.Email.EndsWith("@pascualbravo.edu.co", StringComparison.OrdinalIgnoreCase))
            return ApiResponse<AuthResponseDto>.Error("Debes usar un correo institucional (@pascualbravo.edu.co).");

        if (await repo.ExisteEmailAsync(dto.Email))
            return ApiResponse<AuthResponseDto>.Error("Este correo ya está registrado.");

        var usuario = new Usuario
        {
            Nombre = dto.Nombre.Trim(),
            Email = dto.Email.Trim().ToLower(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            FechaRegistro = DateTime.UtcNow
        };

        var id = await repo.CrearAsync(usuario);
        usuario.Id = id;

        var token = jwt.GenerarToken(usuario);
        return ApiResponse<AuthResponseDto>.Exito(new AuthResponseDto(token, usuario.Id, usuario.Nombre, usuario.Email), "Registro exitoso.");
    }
}
