using MediatR;
using Pillarboxed.Application.Common;
using Pillarboxed.Domain.Interfaces;

namespace Pillarboxed.Application.Commands.Foro;

public record DeleteHiloCommand(int HiloId, int UsuarioId) : IRequest<ApiResponse>;

public class DeleteHiloCommandHandler(IForoRepository repo)
    : IRequestHandler<DeleteHiloCommand, ApiResponse>
{
    public async Task<ApiResponse> Handle(DeleteHiloCommand request, CancellationToken ct)
    {
        var hilo = await repo.GetHiloByIdAsync(request.HiloId);
        if (hilo is null) return ApiResponse.Error("Hilo no encontrado.");
        if (hilo.UsuarioId != request.UsuarioId) return ApiResponse.Error("No tienes permiso para eliminar este hilo.");

        await repo.EliminarHiloAsync(request.HiloId);
        return ApiResponse.Exito("Hilo eliminado.");
    }
}
