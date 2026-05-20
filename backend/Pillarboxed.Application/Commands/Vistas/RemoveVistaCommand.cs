using MediatR;
using Pillarboxed.Application.Common;
using Pillarboxed.Domain.Interfaces;

namespace Pillarboxed.Application.Commands.Vistas;

public record RemoveVistaCommand(int UsuarioId, int PeliculaId) : IRequest<ApiResponse>;

public class RemoveVistaCommandHandler(IVistasRepository repo)
    : IRequestHandler<RemoveVistaCommand, ApiResponse>
{
    public async Task<ApiResponse> Handle(RemoveVistaCommand request, CancellationToken ct)
    {
        await repo.EliminarAsync(request.UsuarioId, request.PeliculaId);
        return ApiResponse.Exito("Película desmarcada.");
    }
}
