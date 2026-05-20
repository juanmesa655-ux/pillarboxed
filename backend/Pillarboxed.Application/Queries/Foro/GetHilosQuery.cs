using MediatR;
using Pillarboxed.Application.Common;
using Pillarboxed.Application.DTOs;
using Pillarboxed.Domain.Interfaces;

namespace Pillarboxed.Application.Queries.Foro;

public record GetHilosQuery : IRequest<ApiResponse<IEnumerable<HiloDto>>>;

public class GetHilosQueryHandler(IForoRepository repo)
    : IRequestHandler<GetHilosQuery, ApiResponse<IEnumerable<HiloDto>>>
{
    public async Task<ApiResponse<IEnumerable<HiloDto>>> Handle(GetHilosQuery request, CancellationToken ct)
    {
        var hilos = await repo.GetHilosAsync();
        var dtos = hilos.Select(h => new HiloDto(h.Id, h.UsuarioId, h.AutorNombre, h.Titulo, h.Texto, h.Fecha.ToString("yyyy-MM-dd"), h.TotalRespuestas));
        return ApiResponse<IEnumerable<HiloDto>>.Exito(dtos);
    }
}
