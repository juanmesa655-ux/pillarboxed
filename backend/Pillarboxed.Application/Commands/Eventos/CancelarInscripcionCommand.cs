using MediatR;
using Pillarboxed.Application.Common;
using Pillarboxed.Domain.Interfaces;

namespace Pillarboxed.Application.Commands.Eventos;

public record CancelarInscripcionCommand(int UsuarioId, int EventoId) : IRequest<ApiResponse>;

public class CancelarInscripcionCommandHandler(IEventosRepository repo)
    : IRequestHandler<CancelarInscripcionCommand, ApiResponse>
{
    public async Task<ApiResponse> Handle(CancelarInscripcionCommand request, CancellationToken ct)
    {
        await repo.CancelarInscripcionAsync(request.UsuarioId, request.EventoId);
        return ApiResponse.Exito("Inscripción cancelada.");
    }
}
