using MediatR;
using Pillarboxed.Application.Common;
using Pillarboxed.Domain.Interfaces;

namespace Pillarboxed.Application.Commands.Eventos;

public record InscribirseCommand(int UsuarioId, int EventoId) : IRequest<ApiResponse>;

public class InscribirseCommandHandler(IEventosRepository repo)
    : IRequestHandler<InscribirseCommand, ApiResponse>
{
    public async Task<ApiResponse> Handle(InscribirseCommand request, CancellationToken ct)
    {
        if (await repo.EstaInscritoAsync(request.UsuarioId, request.EventoId))
            return ApiResponse.Error("Ya estás inscrito en este evento.");

        await repo.InscribirseAsync(request.UsuarioId, request.EventoId);
        return ApiResponse.Exito("Inscripción realizada.");
    }
}
