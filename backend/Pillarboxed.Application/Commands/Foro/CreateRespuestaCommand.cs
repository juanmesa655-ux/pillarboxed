using MediatR;
using Pillarboxed.Application.Common;
using Pillarboxed.Application.DTOs;
using Pillarboxed.Domain.Entities;
using Pillarboxed.Domain.Interfaces;

namespace Pillarboxed.Application.Commands.Foro;

public record CreateRespuestaCommand(int HiloId, int UsuarioId, string AutorNombre, CrearRespuestaDto Dto) : IRequest<ApiResponse>;

public class CreateRespuestaCommandHandler(IForoRepository repo)
    : IRequestHandler<CreateRespuestaCommand, ApiResponse>
{
    public async Task<ApiResponse> Handle(CreateRespuestaCommand request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Dto.Texto))
            return ApiResponse.Error("La respuesta no puede estar vacía.");

        var hilo = await repo.GetHiloByIdAsync(request.HiloId);
        if (hilo is null) return ApiResponse.Error("Hilo no encontrado.");

        await repo.CrearRespuestaAsync(new Respuesta
        {
            HiloId = request.HiloId,
            UsuarioId = request.UsuarioId,
            AutorNombre = request.AutorNombre,
            Texto = request.Dto.Texto.Trim(),
            Fecha = DateTime.UtcNow
        });

        return ApiResponse.Exito("Respuesta publicada.");
    }
}
