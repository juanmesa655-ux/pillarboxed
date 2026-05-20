using MediatR;
using Pillarboxed.Application.Common;
using Pillarboxed.Application.DTOs;
using Pillarboxed.Domain.Entities;
using Pillarboxed.Domain.Interfaces;

namespace Pillarboxed.Application.Commands.Resenas;

public record CreateResenaCommand(int UsuarioId, string AutorNombre, CrearResenaDto Dto) : IRequest<ApiResponse>;

public class CreateResenaCommandHandler(IResenasRepository repo)
    : IRequestHandler<CreateResenaCommand, ApiResponse>
{
    public async Task<ApiResponse> Handle(CreateResenaCommand request, CancellationToken ct)
    {
        if (request.Dto.Calificacion < 1 || request.Dto.Calificacion > 5)
            return ApiResponse.Error("La calificación debe ser entre 1 y 5.");

        await repo.CrearOActualizarAsync(new Resena
        {
            UsuarioId = request.UsuarioId,
            AutorNombre = request.AutorNombre,
            PeliculaId = request.Dto.PeliculaId,
            TituloPelicula = request.Dto.TituloPelicula,
            ImagenPelicula = request.Dto.ImagenPelicula,
            Calificacion = request.Dto.Calificacion,
            Texto = request.Dto.Texto,
            Fecha = DateTime.UtcNow
        });

        return ApiResponse.Exito("Reseña guardada.");
    }
}
