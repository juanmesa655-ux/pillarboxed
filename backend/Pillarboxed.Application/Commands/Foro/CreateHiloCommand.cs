using MediatR;
using Pillarboxed.Application.Common;
using Pillarboxed.Application.DTOs;
using Pillarboxed.Domain.Entities;
using Pillarboxed.Domain.Interfaces;

namespace Pillarboxed.Application.Commands.Foro;

public record CreateHiloCommand(int UsuarioId, string AutorNombre, CrearHiloDto Dto) : IRequest<ApiResponse<int>>;

public class CreateHiloCommandHandler(IForoRepository repo)
    : IRequestHandler<CreateHiloCommand, ApiResponse<int>>
{
    public async Task<ApiResponse<int>> Handle(CreateHiloCommand request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Dto.Titulo))
            return ApiResponse<int>.Error("El título es obligatorio.");

        var id = await repo.CrearHiloAsync(new Hilo
        {
            UsuarioId = request.UsuarioId,
            AutorNombre = request.AutorNombre,
            Titulo = request.Dto.Titulo.Trim(),
            Texto = request.Dto.Texto?.Trim(),
            Fecha = DateTime.UtcNow
        });

        return ApiResponse<int>.Exito(id, "Hilo creado.");
    }
}
