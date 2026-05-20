using MediatR;
using Pillarboxed.Application.Common;
using Pillarboxed.Application.DTOs;
using Pillarboxed.Domain.Entities;
using Pillarboxed.Domain.Interfaces;

namespace Pillarboxed.Application.Commands.Vistas;

public record AddVistaCommand(int UsuarioId, VistaDto Dto) : IRequest<ApiResponse>;

public class AddVistaCommandHandler(IVistasRepository repo)
    : IRequestHandler<AddVistaCommand, ApiResponse>
{
    public async Task<ApiResponse> Handle(AddVistaCommand request, CancellationToken ct)
    {
        if (await repo.ExisteAsync(request.UsuarioId, request.Dto.PeliculaId))
            return ApiResponse.Error("Ya marcaste esta película como vista.");

        await repo.AgregarAsync(new Vista
        {
            UsuarioId = request.UsuarioId,
            PeliculaId = request.Dto.PeliculaId,
            Titulo = request.Dto.Titulo,
            Imagen = request.Dto.Imagen,
            Anio = request.Dto.Anio,
            FechaVista = DateTime.UtcNow
        });

        return ApiResponse.Exito("Película marcada como vista.");
    }
}
