using MediatR;
using Pillarboxed.Application.Common;
using Pillarboxed.Domain.Interfaces;

namespace Pillarboxed.Application.Commands.Wishlist;

public record RemoveFromWishlistCommand(int UsuarioId, int PeliculaId) : IRequest<ApiResponse>;

public class RemoveFromWishlistCommandHandler(IWishlistRepository repo)
    : IRequestHandler<RemoveFromWishlistCommand, ApiResponse>
{
    public async Task<ApiResponse> Handle(RemoveFromWishlistCommand request, CancellationToken ct)
    {
        await repo.EliminarAsync(request.UsuarioId, request.PeliculaId);
        return ApiResponse.Exito("Película eliminada de tu lista.");
    }
}
