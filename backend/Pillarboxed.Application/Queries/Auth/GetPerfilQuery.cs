using MediatR;
using Pillarboxed.Application.Common;
using Pillarboxed.Application.DTOs;
using Pillarboxed.Domain.Interfaces;

namespace Pillarboxed.Application.Queries.Auth;

public record GetPerfilQuery(int UsuarioId) : IRequest<ApiResponse<PerfilDto>>;

public class GetPerfilQueryHandler(IUsuarioRepository usuarioRepo, IWishlistRepository wishlistRepo, IVistasRepository vistasRepo, IResenasRepository resenasRepo)
    : IRequestHandler<GetPerfilQuery, ApiResponse<PerfilDto>>
{
    public async Task<ApiResponse<PerfilDto>> Handle(GetPerfilQuery request, CancellationToken ct)
    {
        var usuario = await usuarioRepo.GetByIdAsync(request.UsuarioId);
        if (usuario is null) return ApiResponse<PerfilDto>.Error("Usuario no encontrado.");

        var wishlist = await wishlistRepo.GetByUsuarioAsync(request.UsuarioId);
        var vistas = await vistasRepo.GetByUsuarioAsync(request.UsuarioId);
        var resenas = await resenasRepo.GetByUsuarioAsync(request.UsuarioId);

        return ApiResponse<PerfilDto>.Exito(new PerfilDto(
            usuario.Nombre, usuario.Email,
            wishlist.Count(), vistas.Count(), resenas.Count()));
    }
}
