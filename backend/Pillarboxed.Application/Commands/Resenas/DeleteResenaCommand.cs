using MediatR;
using Pillarboxed.Application.Common;
using Pillarboxed.Domain.Interfaces;

namespace Pillarboxed.Application.Commands.Resenas;

public record DeleteResenaCommand(int UsuarioId, int PeliculaId) : IRequest<ApiResponse>;

public class DeleteResenaCommandHandler(IResenasRepository repo)
    : IRequestHandler<DeleteResenaCommand, ApiResponse>
{
    public async Task<ApiResponse> Handle(DeleteResenaCommand request, CancellationToken ct)
    {
        await repo.EliminarAsync(request.UsuarioId, request.PeliculaId);
        return ApiResponse.Exito("Reseña eliminada.");
    }
}
