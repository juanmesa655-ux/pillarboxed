using MediatR;
using Pillarboxed.Application.Common;
using Pillarboxed.Application.DTOs;
using Pillarboxed.Domain.Interfaces;

namespace Pillarboxed.Application.Commands.Auth;

public record LoginCommand(LoginDto Dto) : IRequest<ApiResponse<AuthResponseDto>>;

public class LoginCommandHandler(IUsuarioRepository repo, IJwtService jwt)
    : IRequestHandler<LoginCommand, ApiResponse<AuthResponseDto>>
{
    public async Task<ApiResponse<AuthResponseDto>> Handle(LoginCommand request, CancellationToken ct)
    {
        var dto = request.Dto;

        var usuario = await repo.GetByEmailAsync(dto.Email.Trim().ToLower());
        if (usuario is null || !BCrypt.Net.BCrypt.Verify(dto.Password, usuario.PasswordHash))
            return ApiResponse<AuthResponseDto>.Error("Correo o contraseña incorrectos.");

        var token = jwt.GenerarToken(usuario);
        return ApiResponse<AuthResponseDto>.Exito(new AuthResponseDto(token, usuario.Id, usuario.Nombre, usuario.Email));
    }
}
