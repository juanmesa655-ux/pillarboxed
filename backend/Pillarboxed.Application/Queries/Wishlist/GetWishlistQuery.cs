using MediatR;
using Pillarboxed.Application.Common;
using Pillarboxed.Application.DTOs;
using Pillarboxed.Domain.Interfaces;

namespace Pillarboxed.Application.Queries.Wishlist;

public record GetWishlistQuery(int UsuarioId) : IRequest<ApiResponse<IEnumerable<WishlistItemDto>>>;

public class GetWishlistQueryHandler(IWishlistRepository repo)
    : IRequestHandler<GetWishlistQuery, ApiResponse<IEnumerable<WishlistItemDto>>>
{
    public async Task<ApiResponse<IEnumerable<WishlistItemDto>>> Handle(GetWishlistQuery request, CancellationToken ct)
    {
        var items = await repo.GetByUsuarioAsync(request.UsuarioId);
        var dtos = items.Select(i => new WishlistItemDto(i.PeliculaId, i.Titulo, i.Imagen, i.Calificacion, i.Anio));
        return ApiResponse<IEnumerable<WishlistItemDto>>.Exito(dtos);
    }
}
