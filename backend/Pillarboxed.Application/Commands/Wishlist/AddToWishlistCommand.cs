using MediatR;
using Pillarboxed.Application.Common;
using Pillarboxed.Application.DTOs;
using Pillarboxed.Domain.Entities;
using Pillarboxed.Domain.Interfaces;

namespace Pillarboxed.Application.Commands.Wishlist;

public record AddToWishlistCommand(int UsuarioId, WishlistItemDto Dto) : IRequest<ApiResponse>;

public class AddToWishlistCommandHandler(IWishlistRepository repo)
    : IRequestHandler<AddToWishlistCommand, ApiResponse>
{
    public async Task<ApiResponse> Handle(AddToWishlistCommand request, CancellationToken ct)
    {
        if (await repo.ExisteAsync(request.UsuarioId, request.Dto.PeliculaId))
            return ApiResponse.Error("La película ya está en tu lista.");

        await repo.AgregarAsync(new WishlistItem
        {
            UsuarioId = request.UsuarioId,
            PeliculaId = request.Dto.PeliculaId,
            Titulo = request.Dto.Titulo,
            Imagen = request.Dto.Imagen,
            Calificacion = request.Dto.Calificacion,
            Anio = request.Dto.Anio,
            FechaAgregada = DateTime.UtcNow
        });

        return ApiResponse.Exito("Película agregada a tu lista.");
    }
}
