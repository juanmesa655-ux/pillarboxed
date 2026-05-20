using MediatR;
using Pillarboxed.Application.Common;
using Pillarboxed.Application.DTOs;
using Pillarboxed.Domain.Interfaces;

namespace Pillarboxed.Application.Queries.Vistas;

public record GetVistasQuery(int UsuarioId) : IRequest<ApiResponse<IEnumerable<VistaDto>>>;

public class GetVistasQueryHandler(IVistasRepository repo)
    : IRequestHandler<GetVistasQuery, ApiResponse<IEnumerable<VistaDto>>>
{
    public async Task<ApiResponse<IEnumerable<VistaDto>>> Handle(GetVistasQuery request, CancellationToken ct)
    {
        var items = await repo.GetByUsuarioAsync(request.UsuarioId);
        var dtos = items.Select(i => new VistaDto(i.PeliculaId, i.Titulo, i.Imagen, i.Anio));
        return ApiResponse<IEnumerable<VistaDto>>.Exito(dtos);
    }
}
