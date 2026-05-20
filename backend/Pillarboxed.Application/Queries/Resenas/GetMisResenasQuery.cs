using MediatR;
using Pillarboxed.Application.Common;
using Pillarboxed.Application.DTOs;
using Pillarboxed.Domain.Interfaces;

namespace Pillarboxed.Application.Queries.Resenas;

public record GetMisResenasQuery(int UsuarioId) : IRequest<ApiResponse<IEnumerable<ResenaDto>>>;

public class GetMisResenasQueryHandler(IResenasRepository repo)
    : IRequestHandler<GetMisResenasQuery, ApiResponse<IEnumerable<ResenaDto>>>
{
    public async Task<ApiResponse<IEnumerable<ResenaDto>>> Handle(GetMisResenasQuery request, CancellationToken ct)
    {
        var items = await repo.GetByUsuarioAsync(request.UsuarioId);
        var dtos = items.Select(r => new ResenaDto(r.UsuarioId, r.AutorNombre, r.PeliculaId, r.TituloPelicula, r.ImagenPelicula, r.Calificacion, r.Texto, r.Fecha.ToString("yyyy-MM-dd")));
        return ApiResponse<IEnumerable<ResenaDto>>.Exito(dtos);
    }
}
