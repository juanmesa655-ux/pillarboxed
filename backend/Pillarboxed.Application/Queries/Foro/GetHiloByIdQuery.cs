using MediatR;
using Pillarboxed.Application.Common;
using Pillarboxed.Application.DTOs;
using Pillarboxed.Domain.Interfaces;

namespace Pillarboxed.Application.Queries.Foro;

public record GetHiloByIdQuery(int Id) : IRequest<ApiResponse<HiloDetalleDto>>;

public class GetHiloByIdQueryHandler(IForoRepository repo)
    : IRequestHandler<GetHiloByIdQuery, ApiResponse<HiloDetalleDto>>
{
    public async Task<ApiResponse<HiloDetalleDto>> Handle(GetHiloByIdQuery request, CancellationToken ct)
    {
        var hilo = await repo.GetHiloByIdAsync(request.Id);
        if (hilo is null) return ApiResponse<HiloDetalleDto>.Error("Hilo no encontrado.");

        var respuestas = await repo.GetRespuestasAsync(request.Id);
        var hiloDto = new HiloDto(hilo.Id, hilo.UsuarioId, hilo.AutorNombre, hilo.Titulo, hilo.Texto, hilo.Fecha.ToString("yyyy-MM-dd"), hilo.TotalRespuestas);
        var respuestaDtos = respuestas.Select(r => new RespuestaDto(r.Id, r.UsuarioId, r.AutorNombre, r.Texto, r.Fecha.ToString("yyyy-MM-dd")));

        return ApiResponse<HiloDetalleDto>.Exito(new HiloDetalleDto(hiloDto, respuestaDtos));
    }
}
