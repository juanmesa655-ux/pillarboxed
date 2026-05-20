using MediatR;
using Pillarboxed.Application.Common;
using Pillarboxed.Domain.Interfaces;

namespace Pillarboxed.Application.Commands.Foro;

public record DeleteRespuestaCommand(int RespuestaId, int UsuarioId) : IRequest<ApiResponse>;

public class DeleteRespuestaCommandHandler(IForoRepository repo)
    : IRequestHandler<DeleteRespuestaCommand, ApiResponse>
{
    public async Task<ApiResponse> Handle(DeleteRespuestaCommand request, CancellationToken ct)
    {
        await repo.EliminarRespuestaAsync(request.RespuestaId, request.UsuarioId);
        return ApiResponse.Exito("Respuesta eliminada.");
    }
}
