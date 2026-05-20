using MediatR;
using Pillarboxed.Application.Common;
using Pillarboxed.Application.DTOs;
using Pillarboxed.Domain.Interfaces;

namespace Pillarboxed.Application.Queries.Eventos;

public record GetEventosQuery(int? UsuarioId, string? Tipo) : IRequest<ApiResponse<IEnumerable<EventoDto>>>;

public class GetEventosQueryHandler(IEventosRepository repo)
    : IRequestHandler<GetEventosQuery, ApiResponse<IEnumerable<EventoDto>>>
{
    public async Task<ApiResponse<IEnumerable<EventoDto>>> Handle(GetEventosQuery request, CancellationToken ct)
    {
        var eventos = await repo.GetAllAsync(request.UsuarioId);
        var filtrados = string.IsNullOrWhiteSpace(request.Tipo)
            ? eventos
            : eventos.Where(e => e.Tipo == request.Tipo);

        var dtos = filtrados.Select(e => new EventoDto(e.Id, e.Tipo, e.TipoLabel, e.Titulo, e.Descripcion,
            e.Fecha.ToString("yyyy-MM-dd"), e.Hora, e.Lugar, e.Precio, e.EstaInscrito));

        return ApiResponse<IEnumerable<EventoDto>>.Exito(dtos);
    }
}
